import Fastify, { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import dotenv from "dotenv";
import { log } from './utils/logger';
dotenv.config();
const fastify = Fastify();

// Authorization & Logging
fastify.addHook("onRequest", (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
    const authorization = request.headers.authorization;
    if (!authorization || authorization.split(" ")[1] !== process.env.REST_DEPLOYMENT_TOKEN) return reply.code(401).send();
    log(`API Request || Agent: ${request.headers["user-agent"]} || ${request.method} ${request.url} || Content Type: ${request.headers['content-type']} || Origin: ${request.headers.origin}`, "info");
    done();
});

// Default Endpoint
fastify.get("/", (_request: FastifyRequest, reply: FastifyReply): void => {
    reply.send({ message: "Uplink Default Endpoint" });
});

// GitHub Actions
fastify.post("/actions", (request: FastifyRequest, reply: FastifyReply): void => {
    reply.send({ message: "Received" });
    console.log(request.body);
});

// Start
fastify.listen({ port: parseInt(process.env.REST_PORT as string) })
    .then(() => {
        log(`Uplink API server listening on port ${process.env.REST_PORT}`, "info");
    }).catch((error) => {
        fastify.log.error(error);
        process.exit(1);
    });