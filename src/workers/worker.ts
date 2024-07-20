import amqp, { Message } from "amqplib/callback_api";
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
        channel.prefetch(5);

        // Listen
        log(`Listening on queue: || ${queue} ||`, "info");
        channel.consume(queue, (message: Message | null) => {
            if (message) {
                const weight: number = parseInt(message.content.toString().split("...")[1]);
                log(`New message: || ${message.fields.consumerTag}@${weight} ||`, "info");
                setTimeout(() => {
                    log(`New task complete: || ${message.fields.consumerTag}@${weight} ||`, "info");
                    channel.ack(message);
                }, weight * 1000);
            }
        }, {
            noAck: false
        });
    });
});