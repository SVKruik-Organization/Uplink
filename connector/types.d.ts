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
    "unicast-products" // Specific to products
    | "unicast-services" // Specific to services
    | "unicast-misc" // Specific to miscellaneous services/products
    | "unicast-bots" // Specific to a SK Bot
    | "broadcast-bots" // Broadcast to all SK Bots
    | "broadcast-global"; // Broadcast to all services/products/SK Bots
export type UplinkExchangeTypes = "direct" | "topic" | "headers" | "fanout" | "match";
export type UplinkRoutingKeys =
    // unicast-products
    | "Commander"
    | "Platform"
    | "Overway"
    | "Administrator"
    | "Docs"
    | "Horizon"

    // unicast-services
    | "Uplink"
    | "Amplify"
    | "Lumen"
    | "Monitor"
    | "Pivot"
    | "Lexicon"
    | "Orbit"
    | "Flare"
    | "Tempo"
    | "Forge"
    | "Dispatch"
    | "Render"

    // unicast-misc
    | "Portfolio"

    // unicast-bots
    | "Apricaria"
    | "Apricaria CE"
    | "Stelleri"
    | "Ispidina"
    | "Interpres"

    // Universal Broadcasts
    | ""