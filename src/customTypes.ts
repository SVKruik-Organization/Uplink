// Uplink Network Payload
export type UplinkMessage = {
    "sender": string,
    "recipient": string,
    "triggerSource": string,
    "reason": string,
    "task": string,
    "content": string,
    "timestamp": Date
}

// GitHub Actions Request
export type ActionEntry = {
    "type": string,
    "repository": string,
    "payload": string
}