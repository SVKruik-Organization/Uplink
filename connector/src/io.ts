import { Channel, Message } from "amqplib";
import { exec } from "shelljs";
import { TaskHandler, UplinkExchanges, UplinkExchangeTypes, UplinkMessage, UplinkRoutingKeys } from "../types";
import { logData, logError } from "@svkruik/sk-platform-formatters";
import { getUplinkConnection } from "./connection";

let retries: number = 0;

/**
 * Mounts the Uplink connector to listen for incoming messages.
 * Handles "Deploy" by default.
 * 
 * @param taskHandler Additional handling for other received tasks.
 * @param options Configuration options for mounting.
 * @param options.allowedRetries Number of allowed retries when mounting fails. Default is 3.
 * @param options.deployTaskOptOut If true, the "Deploy" task will not trigger deployment script execution.
 * @throws Will throw an error when the mounting fails after 3 retries.
 */
export async function mountUplink(taskHandler: TaskHandler | null = null, options?: {
    allowedRetries?: number,
    deployTaskOptOut?: boolean
}): Promise<void> {
    try {
        const channel: Channel | null = await getUplinkConnection();
        const exchangeName: string | undefined = process.env.UPLINK_EXCHANGE;;
        const routingKey: string | undefined = process.env.UPLINK_ROUTING_KEY;
        if (!channel) throw new Error("Uplink connection missing.");
        if (!exchangeName) throw new Error("Uplink exchange name missing.");
        if (!routingKey) throw new Error("Uplink routing key missing.");

        channel.assertExchange(exchangeName, "direct", { durable: false });
        const queue = await channel.assertQueue("", { exclusive: true });
        await channel.bindQueue(queue.queue, exchangeName, routingKey);

        // Listen
        channel.consume(queue.queue, (message: Message | null) => {
            if (message) {
                const messageContent: UplinkMessage = JSON.parse(message.content.toString());
                channel.ack(message);

                switch (messageContent.task) {
                    case "Deploy":
                        if (process.env.NODE_ENV === "production" && !options?.deployTaskOptOut) {
                            logData(`Received new deployment task from ${messageContent.sender}. Running deployment script.`, "alert");
                            exec("bash deploy.sh");
                        }
                        break;
                    default:
                        if (taskHandler) taskHandler(messageContent);
                        break;
                }
            }
        }, {
            noAck: false
        });
    } catch (error: any) {
        retries += 1;
        if (retries < (options?.allowedRetries || 3)) {
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
 * @param exchange The name of the exchange to publish to.
 * @param exchangeType The type of exchange (choose a valid RabbitMQ type)
 * @param exchangeKey The routing key of the exchange
 * @param payload The data to send
 */
export async function sendUplink(exchange: UplinkExchanges, exchangeType: UplinkExchangeTypes, exchangeKey: UplinkRoutingKeys, payload: UplinkMessage): Promise<void> {
    try {
        const channel: Channel | null = await getUplinkConnection();
        if (!channel) throw new Error("Uplink connection missing.");
        channel.assertExchange(exchange, exchangeType, { durable: false });
        channel.publish(exchange, exchangeKey, Buffer.from(JSON.stringify(payload)));
        logData(`Sent Uplink message from '${payload.sender}' to '${payload.recipient}' for reason '${payload.reason}'`, "info");
    } catch (error: any) {
        logError(error);
    }
}