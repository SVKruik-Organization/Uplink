import Fastify, { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import dotenv from "dotenv";
import { log, logError } from './utils/logger';
import { ActionEntry } from './customTypes';
import { getConnection } from './utils/connection';
import { Channel } from 'amqplib';
dotenv.config();
const fastify = Fastify();

// Outbound Handlers
import { pushSkBots, releaseSkBots } from './out/sk-bots';
import { pushSkPlatform } from './out/sk-platform';
import { pushPortfolio } from './out/portfolio';
import { pushOverway } from './out/overway';
import { pushRabbit } from './out/rabbit';
import { pushUplink } from './out/uplink';

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
        reply.send({ message: "Received 2505" });
        const body: ActionEntry = request.body as ActionEntry;
        const channel: Channel | null = await getConnection();
        if (!channel || !body) return;

        // Sending Downstream
        if (body.type === "push") {
            switch (body.repository) {
                case "SK-Bots":
                    await pushSkBots(body);
                    break;
                case "SK-Platform":
                    await pushSkPlatform(body);
                    break;
                case "Portfolio-Website":
                    await pushPortfolio(body);
                    break;
                case "Overway":
                    await pushOverway(body);
                    break;
                case "Rabbit":
                    await pushRabbit(body);
                    break;
                case "Uplink":
                    pushUplink();
                    break;
                default:
                    log(`Received invalid ${body.type} event from ${body.repository} repository.`, "info");
                    break;
            }
        } else switch (body.repository) {
            case "SK-Bots":
                await releaseSkBots(body);
                break;
            default:
                log(`Received invalid ${body.type} event from ${body.repository} repository.`, "info");
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