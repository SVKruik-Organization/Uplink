import { ActionEntry } from "../customTypes";
import { sendUplink } from "../utils/connection";

/**
 * Deploys the SK Platform components.
 * 
 * @param body The body of the action entry
 */
export async function pushSkPlatform(body: ActionEntry): Promise<void> {
    await sendUplink("unicast-products", "direct", "platform", {
        sender: "Uplink/Integrations",
        recipient: "SK-Platform/frontend",
        triggerSource: "GitHub Actions",
        reason: "GitHub Actions Push Event",
        task: "Deploy",
        content: body.payload,
        timestamp: new Date()
    });
}