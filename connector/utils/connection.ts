import amqp, { Options } from "amqplib";
import { Channel } from "amqplib";
import { logError } from "@svkruik/sk-platform-formatters";
import { envLocationOverwrite } from "../types";

let channel: Channel | null = null;

/**
 * Gets the existing or creates a new channel for working with Uplink.
 * 
 * @param envLocationOverwrite Optional overwrite for environment variables. Used for frontend environments where env vars are not directly accessible.
 * @returns The RabbitMQ Channel
 */
export async function getUplinkConnection(envLocationOverwrite?: envLocationOverwrite): Promise<amqp.Channel | null> {
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
export function getConnectionOptions(envLocationOverwrite?: envLocationOverwrite): Options.Connect {
    const uplinkHost = envLocationOverwrite?.host ?? process.env.UPLINK_HOST;
    const uplinkPort = envLocationOverwrite?.port ?? process.env.UPLINK_PORT;
    const uplinkUsername = envLocationOverwrite?.username ?? process.env.UPLINK_USERNAME;
    const uplinkPassword = envLocationOverwrite?.password ?? process.env.UPLINK_PASSWORD;

    if (!uplinkHost)
        throw new Error("Uplink host missing. Add 'UPLINK_HOST' to your environment variables.");

    if (!uplinkPort)
        throw new Error("Uplink port missing. Add 'UPLINK_PORT' to your environment variables.");

    if (!uplinkUsername)
        throw new Error("Uplink username missing. Add 'UPLINK_USERNAME' to your environment variables.");

    if (!uplinkPassword)
        throw new Error("Uplink password missing. Add 'UPLINK_PASSWORD' to your environment variables.");

    return {
        "protocol": "amqp",
        "hostname": uplinkHost,
        "port": parseInt(uplinkPort as string),
        "username": uplinkUsername,
        "password": uplinkPassword
    }
}