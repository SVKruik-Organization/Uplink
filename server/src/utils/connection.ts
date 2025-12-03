import amqp from "amqplib";
import dotenv from "dotenv";
import { getConnectionOptions } from "./auth";
import { Channel } from "amqplib";
import { UplinkMessage } from "../customTypes";
import { logData, logError } from "@svkruik/sk-platform-formatters";
dotenv.config();

let channel: Channel | null = null;
async function createConnection(): Promise<void> {
    try {
        const connection = await (await amqp.connect(getConnectionOptions())).createChannel();
        channel = connection;
    } catch (error: any) {
        logError(error);
    }
}

/**
 * Gets the existing or creates a new channel for working with Uplink.
 * @returns The RabbitMQ Channel
 */
export async function getConnection(): Promise<amqp.Channel | null> {
    if (!channel) await createConnection();
    return channel;
}

/**
 * Publish a message on a RabbitMQ exchange.
 * @param exchange The name of the exchange to publish to.
 * @param exchangeType The type of exchange (choose a valid RabbitMQ type)
 * @param exchangeKey The routing key of the exchange
 * @param payload The data to send
 */
export async function sendUplink(exchange: string, exchangeType: string, exchangeKey: string, payload: UplinkMessage): Promise<void> {
    try {
        const channel: Channel | null = await getConnection();
        if (!channel) throw new Error("Uplink connection missing.");
        channel.assertExchange(exchange, exchangeType, { durable: false });
        channel.publish(exchange, exchangeKey, Buffer.from(JSON.stringify(payload)));
        logData(`Sent Uplink message from '${payload.sender}' to '${payload.recipient}' for reason '${payload.reason}'`, "info");
    } catch (error: any) {
        logError(error);
    }
}

export const defaultPayload = {
    sender: "Uplink/Integrations",
    triggerSource: "GitHub Actions",
    reason: "GitHub Actions Push Event",
    task: "Deploy",
    timestamp: new Date()
}