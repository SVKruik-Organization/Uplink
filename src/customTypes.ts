// Uplink Network Payload
export type UplinkMessage = {
    "sender": string,
    "recipient": string,
    "trigger_source": string,
    "reason": string,
    "task": string,
    "content": string,
}