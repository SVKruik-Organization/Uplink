import amqp, { Options } from "amqplib";

// Connection
export async function getUplinkConnection(envLocationOverwrite?: {
    host?: string,
    port?: string,
    username?: string,
    password?: string
}): Promise<amqp.Channel | null>;
export function getConnectionOptions(envLocationOverwrite?: {
    host?: string,
    port?: string,
    username?: string,
    password?: string
}): Options.Connect;

// I/O
export function mountUplink(taskHandler?: TaskHandler, options?: {
    allowedRetries?: number,
    deployTaskOptOut?: boolean
}, envLocationOverwrite?: {
    host?: string,
    port?: string,
    username?: string,
    password?: string
    exchangeName?: string,
    routingKey?: string
}): Promise<void>;
export function sendUplink(exchangeOptions: {
    name: UplinkExchanges,
    type: UplinkExchangeTypes,
    router: UplinkRoutingKeys
}, payload: UplinkMessage, envLocationOverwrite?: {
    host?: string,
    port?: string,
    username?: string,
    password?: string
}): Promise<void>;

// Types
export type UplinkMessage = {
    "sender": string,
    "recipient": string,
    "triggerSource": string,
    "reason": string,
    "task": string,
    "content": string,
    "timestamp": Date
}
export type TaskHandler = (messageContent: UplinkMessage) => void;
export type UplinkExchanges =
    "unicast-products"
    | "unicast-services"
    | "unicast-misc"
    | "unicast-bots"
    | "broadcast-bots"
    | "broadcast-global";
export type UplinkExchangeTypes = "direct" | "topic" | "headers" | "fanout" | "match";
export type UplinkRoutingKeys =
    // unicast-products
    | "Platform"
    | "Docs"
    | "Overway"
    | "Administrator"

    // unicast-services

    // unicast-bots
    | "Apricaria"
    | "Apricaria CE"
    | "Stelleri"
    | "Ispidina"
    | "Interpres"

    // unicast-misc
    | "Portfolio"

    // Broadcasts
    | ""