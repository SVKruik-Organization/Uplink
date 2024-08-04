import amqp from "amqplib/callback_api";
import dotenv from "dotenv";
import { log } from "../utils/logger";
import { getConnectionOptions } from "../utils/auth";
dotenv.config();
const queue: string | undefined = process.env.AMQP_MAIN_QUEUE;
if (!queue) throw new Error("AQMP queue name missing.");

amqp.connect(getConnectionOptions(), (error0, connection) => {
    if (error0) throw error0;

    connection.createChannel((error1, channel) => {
        if (error1) throw error1;
        channel.assertQueue(queue, {
            durable: false
        });

        // Listen
        log(`Listening on queue: || ${queue} ||`, "info");
        channel.consume(queue, (msg) => {
            if (msg) log(`New message received: || ${msg.content.toString()} ||`, "info");
        }, {
            noAck: true
        });
    });
});