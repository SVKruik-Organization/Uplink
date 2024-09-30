import Fastify, { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import dotenv from "dotenv";
import { log, logError } from './utils/logger';
import { ActionEntry } from './customTypes';
import { getConnection, sendUplink } from './utils/connection';
import { Channel } from 'amqplib';
dotenv.config();
const fastify = Fastify();

// Authorization & Logging
fastify.addHook("preHandler", (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
    const authorization = request.headers.authorization;
    if (!authorization || authorization.split(" ")[1] !== process.env.REST_DEPLOYMENT_TOKEN) return reply.code(401).send();
    log(`API Request || Agent: ${request.headers["user-agent"]} || ${request.method} ${request.url} || Body: ${request.body ? `(100 char limit) ${JSON.stringify(request.body).slice(0, 100)}` : "None"}`, "info");
    done();
});

// GitHub Actions
fastify.post("/actions", async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
        // Setup
        reply.send({ message: "Received" });
        const body: ActionEntry = request.body as ActionEntry;
        const channel: Channel | null = await getConnection();
        if (!channel) return;

        // Sending Downstream
        switch (body.type) {
            case "push":
                if (body.repository === "SK-Bots") {
                    await sendUplink("broadcast-bots", "fanout", "", {
                        sender: "Uplink/Integrations",
                        recipient: "SK-Bots/*",
                        triggerSource: "GitHub Actions",
                        reason: "GitHub Actions Push Event",
                        task: "Deploy",
                        content: body.payload,
                        timestamp: new Date()
                    });
                } else if (body.repository === "SK-Platform") {
                    await sendUplink("unicast-products", "direct", "platform", {
                        sender: "Uplink/Integrations",
                        recipient: "SK-Platform/frontend",
                        triggerSource: "GitHub Actions",
                        reason: "GitHub Actions Push Event",
                        task: "Deploy",
                        content: body.payload,
                        timestamp: new Date()
                    });
                } else if (body.repository === "SK-Metrics") {
                    await sendUplink("unicast-products", "direct", "metrics", {
                        sender: "Uplink/Integrations",
                        recipient: "SK-Metrics/frontend",
                        triggerSource: "GitHub Actions",
                        reason: "GitHub Actions Push Event",
                        task: "Deploy",
                        content: body.payload,
                        timestamp: new Date()
                    });
                } else if (body.repository === "Portfolio-Website") {
                    await sendUplink("unicast-misc", "direct", "portfolio", {
                        sender: "Uplink/Integrations",
                        recipient: "Portfolio-Website/server",
                        triggerSource: "GitHub Actions",
                        reason: "GitHub Actions Push Event",
                        task: "Deploy",
                        content: body.payload,
                        timestamp: new Date()
                    });
                } else if (body.repository === "Overway") {
                    await sendUplink("unicast-services", "direct", "Overway", {
                        sender: "Uplink/Integrations",
                        recipient: "Overway",
                        triggerSource: "GitHub Actions",
                        reason: "GitHub Actions Push Event",
                        task: "Deploy",
                        content: body.payload,
                        timestamp: new Date()
                    });
                }
                break;
            case "release":
                if (body.repository === "SK-Bots") {
                    await sendUplink("unicast-bots", "direct", "Apricaria", {
                        sender: "Uplink/Integrations",
                        recipient: "SK-Bots/Apricaria",
                        triggerSource: "GitHub Actions",
                        reason: "GitHub Actions Release Event",
                        task: "Broadcast",
                        content: body.payload,
                        timestamp: new Date()
                    });
                }
                break;
            default:
                break;
        }
    } catch (error: any) {
        logError(error);
    }
});

// Default Endpoint
fastify.get("*", async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    reply.send({ message: "SK Uplink API" });
});
fastify.post("*", async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    reply.send({ message: "SK Uplink API" });
});

// Start
fastify.listen({ port: parseInt(process.env.REST_PORT as string) })
    .then(() => {
        log(`Uplink API server listening on port ${process.env.REST_PORT}`, "info");
    }).catch((error) => {
        fastify.log.error(error);
        process.exit(1);
    });