import { ActionEntry } from "../customTypes";
import { sendUplink } from "../utils/connection";

/**
 * Deploys the DJ Open Source project.
 * 
 * @param body The body of the action entry
 */
export async function pushDjOpenSource(body: ActionEntry): Promise<void> {
    await sendUplink("unicast-misc", "direct", "dj-open-source", {
        sender: "Uplink/Integrations",
        recipient: "DJ-Open-Source/server",
        triggerSource: "GitHub Actions",
        reason: "GitHub Actions Push Event",
        task: "Deploy",
        content: body.payload,
        timestamp: new Date()
    });
}