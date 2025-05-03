import { ActionEntry } from "../customTypes";
import { sendUplink } from "../utils/connection";

/**
 * Deploys the SK Bots.
 * 
 * @param body The body of the action entry
 */
export async function pushSkBots(body: ActionEntry): Promise<void> {
    await sendUplink("broadcast-bots", "fanout", "", {
        sender: "Uplink/Integrations",
        recipient: "SK-Bots/*",
        triggerSource: "GitHub Actions",
        reason: "GitHub Actions Push Event",
        task: "Deploy",
        content: body.payload,
        timestamp: new Date()
    });
}

/**
 * Sends a release/changelog message in a dedicated Discord channel.
 * 
 * @param body The body of the action entry
 */
export async function releaseSkBots(body: ActionEntry): Promise<void> {
    await sendUplink("unicast-bots", "direct", "Apricaria", {
        sender: "Uplink/Integrations",
        recipient: "SK-Bots/Apricaria",
        triggerSource: "GitHub Actions",
        reason: "GitHub Actions Release Event",
        task: "Broadcast",
        content: body.payload,
        timestamp: new Date()
    });
}