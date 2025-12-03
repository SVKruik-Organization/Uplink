import { ActionEntry } from "../customTypes";
import { defaultPayload, sendUplink } from "../utils/connection";

/**
 * Deploys the SK Bots.
 * 
 * @param body The body of the action entry
 */
export async function pushSkBots(body: ActionEntry): Promise<void> {
    await sendUplink("broadcast-bots", "fanout", "", {
        recipient: "SK-Bots/*",
        content: body.payload,
        ...defaultPayload
    });
}

/**
 * Sends a release/changelog message in a dedicated Discord channel.
 * 
 * @param body The body of the action entry
 */
export async function releaseSkBots(body: ActionEntry): Promise<void> {
    await sendUplink("unicast-bots", "direct", "Apricaria", {
        recipient: "SK-Bots/Apricaria",
        content: body.payload,
        ...defaultPayload
    });
}