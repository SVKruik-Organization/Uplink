import { Options } from "amqplib";
import dotenv from "dotenv";
dotenv.config();
const host: string | undefined = process.env.AMQP_HOST;
if (!host) throw new Error("AQMP host URL missing.");

export function getConnectionOptions(): Options.Connect {
    return {
        "protocol": "amqp",
        "hostname": process.env.AMQP_HOST,
        "port": parseInt(process.env.AMQP_PORT as string),
        "username": process.env.AMQP_USERNAME,
        "password": process.env.AMQP_PASSWORD
    }
}