import amqp, { Options } from "amqplib";
import { Channel } from "amqplib";
import { logError } from "@svkruik/sk-platform-formatters";

let channel: Channel | null = null;


/**
 * Gets the existing or creates a new channel for working with Uplink.
 * 
 * @returns The RabbitMQ Channel
 */
export async function getUplinkConnection(): Promise<amqp.Channel | null> {
    try {
        if (channel) return channel;
        channel = await (await amqp.connect(getConnectionOptions())).createChannel();
    } catch (error: any) {
        logError(error);
    } finally {
        return channel;
    }
}

/**
 * Constructs the connection options for AMQP connection from environment variables.
 * 
 * @returns The connection options.
 * @throws Will throw an error if any required environment variable is missing.
 */
export function getConnectionOptions(): Options.Connect {
    if (!process.env.UPLINK_HOST) throw new Error("AQMP host missing.");
    if (!process.env.UPLINK_PORT) throw new Error("AQMP port missing.");
    if (!process.env.UPLINK_USERNAME) throw new Error("AQMP username missing.");
    if (!process.env.UPLINK_PASSWORD) throw new Error("AQMP password missing.");

    return {
        "protocol": "amqp",
        "hostname": process.env.UPLINK_HOST,
        "port": parseInt(process.env.UPLINK_PORT as string),
        "username": process.env.UPLINK_USERNAME,
        "password": process.env.UPLINK_PASSWORD
    }
}