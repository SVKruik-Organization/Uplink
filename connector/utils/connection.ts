import amqp, { Options } from "amqplib";
import { Channel } from "amqplib";
import { logError } from "@svkruik/sk-platform-formatters";

let channel: Channel | null = null;

/**
 * Gets the existing or creates a new channel for working with Uplink.
 * 
 * @param envLocationOverwrite Optional overwrite for environment variables. Used for frontend environments where env vars are not directly accessible.
 * @returns The RabbitMQ Channel
 */
export async function getUplinkConnection(envLocationOverwrite?: {
    host?: string,
    port?: string,
    username?: string,
    password?: string
}): Promise<amqp.Channel | null> {
    try {
        if (channel) return channel;
        channel = await (await amqp.connect(getConnectionOptions(envLocationOverwrite))).createChannel();
    } catch (error: any) {
        logError(error);
    } finally {
        return channel;
    }
}

/**
 * Constructs the connection options for AMQP connection from environment variables.
 * 
 * @param envLocationOverwrite Optional overwrite for environment variables. Used for frontend environments where env vars are not directly accessible.
 * @returns The connection options.
 * @throws Will throw an error if any required environment variable is missing.
 */
export function getConnectionOptions(envLocationOverwrite?: {
    host?: string,
    port?: string,
    username?: string,
    password?: string
}): Options.Connect {
    if (!process.env.UPLINK_HOST && !envLocationOverwrite?.host) throw new Error("AQMP host missing.");
    if (!process.env.UPLINK_PORT && !envLocationOverwrite?.port) throw new Error("AQMP port missing.");
    if (!process.env.UPLINK_USERNAME && !envLocationOverwrite?.username) throw new Error("AQMP username missing.");
    if (!process.env.UPLINK_PASSWORD && !envLocationOverwrite?.password) throw new Error("AQMP password missing.");

    return {
        "protocol": "amqp",
        "hostname": envLocationOverwrite?.host ?? process.env.UPLINK_HOST,
        "port": parseInt(envLocationOverwrite?.port ?? process.env.UPLINK_PORT as string),
        "username": envLocationOverwrite?.username ?? process.env.UPLINK_USERNAME,
        "password": envLocationOverwrite?.password ?? process.env.UPLINK_PASSWORD
    }
}