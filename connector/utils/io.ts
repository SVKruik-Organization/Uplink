import { Channel, Message } from "amqplib";
import { exec } from "shelljs";
import { TaskHandler, UplinkExchanges, UplinkExchangeTypes, UplinkMessage, UplinkRoutingKeys } from "../types";
import { logData, logError } from "@svkruik/sk-platform-formatters";
import { getUplinkConnection } from "./connection";

let retries: number = 0;

/**
 * Mounts the Uplink connector to listen for incoming messages.
 * Handles "Deploy" by default, but can be disabled and/or extended.
 * 
 * @param taskHandler Additional handling for other received tasks.
 * @param options Configuration options for mounting.
 * @param envLocationOverwrite Optional overwrite for environment variables. Used for frontend environments where env vars are not directly accessible.
 * @throws Will throw an error when the mounting fails after 3 retries.
 */
export async function mountUplink(taskHandler?: TaskHandler, options?: {
    allowedRetries?: number,
    deployTaskOptOut?: boolean
}, envLocationOverwrite?: {
    host?: string,
    port?: string,
    username?: string,
    password?: string,
    exchangeName?: string,
    routingKey?: string
}): Promise<void> {
    try {
        const channel: Channel | null = await getUplinkConnection(envLocationOverwrite);
        const exchangeName: string | undefined = envLocationOverwrite?.exchangeName ?? process.env.UPLINK_EXCHANGE;
        const routingKey: string | undefined = envLocationOverwrite?.routingKey ?? process.env.UPLINK_ROUTING_KEY;
        if (!channel) throw new Error("Uplink connection missing. Cannot mount connector.");
        if (!exchangeName) throw new Error("Uplink exchange name missing. Add 'UPLINK_EXCHANGE' to your environment variables.");
        if (!routingKey) throw new Error("Uplink routing key missing. Add 'UPLINK_ROUTING_KEY' to your environment variables.");

        channel.assertExchange(exchangeName, "direct", { durable: false });
        const queue = await channel.assertQueue("", { exclusive: true });
        await channel.bindQueue(queue.queue, exchangeName, routingKey);

        // Listen
        channel.consume(queue.queue, (message: Message | null) => {
            if (message) {
                const messageContent: UplinkMessage = JSON.parse(message.content.toString());
                channel.ack(message);
                logData(`Received Uplink message from '${messageContent.sender}' for reason '${messageContent.reason}'`, "info");

                switch (messageContent.task) {
                    case "Deploy":
                        if (process.env.NODE_ENV === "production" && !(options?.deployTaskOptOut))
                            exec("bash deploy.sh");
                        break;
                    default:
                        logData(`No default handler for task '${messageContent.task}'. Passing to custom handler if available.`, "info");
                        break;
                }

                if (taskHandler) return taskHandler(messageContent);
            }
        }, {
            noAck: false
        });

        logData(`Uplink connector mounted on exchange '${exchangeName}' with routing key '${routingKey}'.`, "info");
    } catch (error: any) {
        retries += 1;
        if (retries < (options?.allowedRetries || 2)) {
            logData(`Mounting Uplink connector failed. Retrying ${retries}/3...`, "warning");
            return await mountUplink(taskHandler, options);
        }
        retries = 0;
        logData("Mounting Uplink connector failed after maximum retries.", "warning");
        logError(error);
    }
}

/**
 * Publish a message on a RabbitMQ exchange.
 * 
 * @param exchangeOptions Options for the exchange to publish the message to.
 * @param payload The Uplink message payload.
 * @param envLocationOverwrite Optional overwrite for environment variables. Used for frontend environments where env vars are not directly accessible.
 */
export async function sendUplink(exchangeOptions: {
    name: UplinkExchanges,
    type: UplinkExchangeTypes,
    router: UplinkRoutingKeys
}, payload: UplinkMessage, envLocationOverwrite?: {
    host?: string,
    port?: string,
    username?: string,
    password?: string
}): Promise<void> {
    try {
        const channel: Channel | null = await getUplinkConnection(envLocationOverwrite);
        if (!channel) throw new Error("Uplink connection missing. Cannot send message.");
        channel.assertExchange(exchangeOptions.name, exchangeOptions.type, { durable: false });
        channel.publish(exchangeOptions.name, exchangeOptions.router, Buffer.from(JSON.stringify(payload)));
        logData(`Sent Uplink message from '${payload.sender}' to '${payload.recipient}' for reason '${payload.reason}'`, "info");
    } catch (error: any) {
        logError(error);
    }
}