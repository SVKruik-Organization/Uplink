import amqp from "amqplib/callback_api";
import dotenv from "dotenv";
import { log } from "../utils/logger";
import { getConnectionOptions } from "../utils/auth";
dotenv.config();
const queue: string | undefined = process.env.AMQP_TASK_QUEUE;
if (!queue) throw new Error("AQMP queue name missing.");

amqp.connect(getConnectionOptions(), (error0, connection) => {
    if (error0) throw error0;

    connection.createChannel((error1, channel) => {
        if (error1) throw error1;
        channel.assertQueue(queue, {
            durable: true
        });

        // Send
        const message: string = "Hello Uplink Task!...5";
        channel.sendToQueue(queue, Buffer.from(message), {
            persistent: true
        });

        log(`Sent message: || ${message} ||`, "info");

        // Exit
        setTimeout(() => {
            connection.close();
            process.exit(0);
        }, 500);
    });
});