import { logError } from "@svkruik/sk-platform-formatters";
import { FastifyReply } from "fastify";

/**
 * Formats a backend error to be sent as an API response.
 * 
 * @param error The error to handle.
 * @param reply The Fastify reply object.
 * @returns Formatted Fastify reply with the error message.
 */
export function formatApiError(error: any, reply: FastifyReply): FastifyReply {
    const statusCode = error?.cause?.statusCode || (() => { logError(error); return 500; })();
    const internalErrorMessage = "Something went wrong on our end. Please try again later.";
    const formattedErrorMessage = statusCode === 500 ? internalErrorMessage : error?.message || internalErrorMessage;
    return reply.code(statusCode > 1000 ? statusCode - 1000 : statusCode).send({ message: formattedErrorMessage });
}