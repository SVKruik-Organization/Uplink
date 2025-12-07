import { sendUplink, UplinkExchanges, UplinkExchangeTypes, UplinkRoutingKeys } from '@svkruik/sk-uplink-connector';
import { logData, logError } from '@svkruik/sk-platform-formatters';
import Fastify, { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import dotenv from "dotenv";
import { formatApiError } from './utils/format';
import { ActionEntry } from './customTypes';
dotenv.config();
const fastify = Fastify();

// Environment Variable Checks
if (!process.env.REST_PORT || !process.env.REST_DEPLOYMENT_TOKEN) {
    logError("Missing configuration in environment variables.");
    process.exit(1);
}

// Downstream Handlers
import { pushSkBots, releaseSkBots } from './out/sk-bots';
import { pushSkPlatform } from './out/sk-platform';
import { pushPortfolio } from './out/portfolio';
import { pushSkOverway } from './out/sk-overway';
import { pushUplink } from './out/uplink';
import { pushDispatch } from './out/dispatch';

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
        reply.send({ message: "Received 2511.5" });
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
                    await pushSkOverway(body);
                    break;
                case "Dispatch":
                    await pushDispatch(body);
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
        return formatApiError(error, reply);
    }
});

// Inject an Uplink Message
fastify.post("/inject", {
    schema: {
        body: {
            type: "object",
            properties: {
                exchange: {
                    required: ["name", "type", "router"],
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        type: { type: "string" },
                        router: { type: "string" }
                    },
                },
                payload: {
                    required: ["recipient", "sender", "reason", "task"],
                    type: "object",
                    properties: {
                        content: { type: "object" },
                        recipient: { type: "string" },
                        sender: { type: "string" },
                        reason: { type: "string" },
                        task: { type: "string" }
                    },
                },
            }
        }
    }
}, async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
        // Body Validation
        const body = request.body as {
            exchange: { name: UplinkExchanges; type: UplinkExchangeTypes; router: UplinkRoutingKeys; },
            payload: { content?: object; recipient: string; sender: string; reason: string; task: string; }
        };
        if (!(body.exchange.name satisfies UplinkExchanges) ||
            !(body.exchange.type satisfies UplinkExchangeTypes) ||
            !(body.exchange.router satisfies UplinkRoutingKeys)) {
            throw new Error("Exchange configuration parameters are invalid.", {
                cause: { statusCode: 1500 },
            });
        }
        const content = body.payload.content ? (typeof body.payload.content === "string" ? body.payload.content : JSON.stringify(body.payload.content)) : "";

        await sendUplink({
            ...body.exchange
        }, {
            "sender": body.payload.sender,
            "recipient": body.payload.recipient,
            "triggerSource": "Uplink/Injection",
            "reason": body.payload.reason,
            "task": body.payload.task,
            "content": content,
            "timestamp": new Date()
        });
        return reply.send({ message: `Sent Uplink message from '${body.payload.sender}' to '${body.payload.recipient}' with task '${body.payload.task}'.` });
    } catch (error: any) {
        return formatApiError(error, reply);
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
fastify.listen({ port: parseInt(process.env.REST_PORT) })
    .then(() => logData(`Uplink API server listening on port ${process.env.REST_PORT}`, "info"))
    .catch((error) => logError(error));