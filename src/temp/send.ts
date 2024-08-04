import amqp from "amqplib/callback_api";
import dotenv from "dotenv";
import { log } from "../utils/logger";
import { getConnectionOptions } from "../utils/auth";
import { UplinkMessage } from "../customTypes";
dotenv.config();
const queue: string | undefined = process.env.AMQP_MAIN_QUEUE;
if (!queue) throw new Error("AQMP queue name missing.");

amqp.connect(getConnectionOptions(), (error0, connection) => {
    if (error0) throw error0;

    connection.createChannel((error1, channel) => {
        // Setup
        if (error1) throw error1;
        channel.assertQueue(queue, { durable: false });
        channel.assertExchange("bot-exchange", "direct", { durable: false });

        // Send
        const payload: UplinkMessage = {
            sender: "Uplink/send",
            recipient: "Discord-Bots/Stelleri",
            trigger_source: "Manual",
            reason: "Testing I/O",
            task: "log",
            content: "Hello there Stelleri!",
            timestamp: new Date()
        };
        channel.publish("bot-exchange", "Stelleri", Buffer.from(JSON.stringify(payload)));
        log(`Sent Uplink message from '${payload.sender}' to '${payload.recipient}' for '${payload.reason}'`, "info");

        // Exit
        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    });
});