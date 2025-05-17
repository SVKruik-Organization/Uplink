import { ActionEntry } from "../customTypes";
import { sendUplink } from "../utils/connection";

/**
 * Deploys the TSE Rabbit website.
 * 
 * @param body The body of the action entry
 */
export async function pushRabbit(body: ActionEntry): Promise<void> {
    await sendUplink("unicast-products", "direct", "Rabbit", {
        sender: "Uplink/Integrations",
        recipient: "Rabbit/support",
        triggerSource: "GitLab CI/CD",
        reason: "GitLab CI/CD Deploy Event",
        task: "Deploy",
        content: body.payload,
        timestamp: new Date()
    });
}

/**
 * Updates the TSE Rabbit Search Index.
 * 
 * @param body The body of the action entry
 */
export async function searchRabbit(body: ActionEntry): Promise<void> {
    await sendUplink("unicast-products", "direct", "Rabbit", {
        sender: "Uplink/Integrations",
        recipient: "Rabbit/main",
        triggerSource: "GitLab CI/CD",
        reason: "GitLab CI/CD Search Event",
        task: "Search",
        content: body.payload,
        timestamp: new Date()
    });
}