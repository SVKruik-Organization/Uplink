// GitHub Actions Request
export type ActionEntry = {
    "type": "push" | "release",
    "repository": string,
    "payload": string
}

// Common Deploy Payload
export const deployPayload = {
    sender: "Uplink/Integrations",
    triggerSource: "GitHub Actions",
    reason: "GitHub Actions Push Event",
    task: "Deploy",
    timestamp: new Date()
};