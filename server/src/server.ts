import Fastify, { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import dotenv from "dotenv";
import { ActionEntry } from './customTypes';
dotenv.config();
const fastify = Fastify();

// Downstream Handlers
import { pushSkBots, releaseSkBots } from './out/sk-bots';
import { pushSkPlatform } from './out/sk-platform';
import { pushPortfolio } from './out/portfolio';
import { pushOverway } from './out/overway';
import { pushUplink } from './out/uplink';
import { logData, logError } from '@svkruik/sk-platform-formatters';

// Authorization & Logging
fastify.addHook("preHandler", (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
    const authorization = request.headers.authorization;
    if (!authorization || authorization.split(" ")[1] !== process.env.REST_DEPLOYMENT_TOKEN) return reply.code(401).send();
    logData(`API Request || Agent: ${request.headers["user-agent"]} || ${request.method} ${request.url} || Body: ${request.body ? `(100 char limit) ${JSON.stringify(request.body).slice(0, 100)}` : "None"}`, "info");
    return done();
});

// GitHub Actions
fastify.post("/actions", async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
        // Setup
        reply.send({ message: "Received 2511.2" });
        const body: ActionEntry = request.body as ActionEntry;
        if (!body) return;

        // Sending Downstream

        // Used for deploying the product when a push event is received.
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
                case "Uplink":
                    pushUplink();
                    break;
                default:
                    logData(`Received unsupported ${body.type} event from ${body.repository} repository.`, "warning");
                    break;
            }

            // Used for broadcasting messages when a new release is created.
        } else if (body.type === "release") {
            switch (body.repository) {
                case "SK-Bots":
                    await releaseSkBots(body);
                    break;
                default:
                    logData(`Received unsupported ${body.type} event from ${body.repository} repository.`, "warning");
                    break;
            }
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
    .then(() => logData(`Uplink API server listening on port ${process.env.REST_PORT}`, "info"))
    .catch((error) => logError(error));