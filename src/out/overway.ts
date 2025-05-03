import { ActionEntry } from "../customTypes";
import { sendUplink } from "../utils/connection";

/**
 * Deploy the authentication service.
 * 
 * @param body The body of the action entry
 */
export async function pushOverway(body: ActionEntry): Promise<void> {
    await sendUplink("unicast-services", "direct", "Overway", {
        sender: "Uplink/Integrations",
        recipient: "Overway",
        triggerSource: "GitHub Actions",
        reason: "GitHub Actions Push Event",
        task: "Deploy",
        content: body.payload,
        timestamp: new Date()
    });
}