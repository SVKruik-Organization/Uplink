export namespace Connection {
    export async function getUplinkConnection(): Promise<amqp.Channel | null>;
    export function getConnectionOptions(): Options.Connect;
}

export namespace IO {
    export async function mountUplink(taskHandler: TaskHandler | null = null, options?: {
        allowedRetries?: number,
        deployTaskOptOut?: boolean
    }): Promise<void>
    export async function sendUplink(exchange: UplinkExchanges, exchangeType: UplinkExchangeTypes, exchangeKey: UplinkRoutingKeys, payload: UplinkMessage): Promise<void>;
}

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

