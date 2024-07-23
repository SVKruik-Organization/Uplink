import Fastify, { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import dotenv from "dotenv";
import { log } from './utils/logger';
import { ValidatedRequest } from './customTypes';
dotenv.config();
const fastify = Fastify();

fastify.addHook("preHandler", (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
    log(`API Request || Agent: ${request.headers["user-agent"]} || ${request.method} ${request.url} || Content Type: ${request.headers["content-type"]}`, "info");
    done();
});

fastify.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    return { message: "Hello world!" }
});

fastify.route({
    method: "GET",
    url: "/validated",
    schema: {
        querystring: {
            type: "object",
            properties: {
                name: { type: "string" }
            },
            required: ["name"],
        }
    },
    preHandler: (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
        done();
    },
    handler: (request: FastifyRequest, reply: FastifyReply) => {
        const { name } = request.query as ValidatedRequest;
        reply.send({ message: `Hello ${name}!` });
    }
});


fastify.listen({ port: parseInt(process.env.REST_PORT as string) })
    .then(() => {
        log(`Uplink API server listening on port ${process.env.REST_PORT}`, "info");
    }).catch((error) => {
        fastify.log.error(error);
        process.exit(1);
    });