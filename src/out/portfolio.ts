import { ActionEntry } from "../customTypes";
import { sendUplink } from "../utils/connection";

/**
 * Deploys the personal portfolio website.
 * 
 * @param body The body of the action entry
 */
export async function pushPortfolio(body: ActionEntry): Promise<void> {
    await sendUplink("unicast-misc", "direct", "portfolio", {
        sender: "Uplink/Integrations",
        recipient: "Portfolio-Website/server",
        triggerSource: "GitHub Actions",
        reason: "GitHub Actions Push Event",
        task: "Deploy",
        content: body.payload,
        timestamp: new Date()
    });
}