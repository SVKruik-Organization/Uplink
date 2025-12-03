import { ActionEntry } from "../customTypes";
import { defaultPayload, sendUplink } from "../utils/connection";

/**
 * Deploys the personal portfolio website.
 * 
 * @param body The body of the action entry
 */
export async function pushPortfolio(body: ActionEntry): Promise<void> {
    await sendUplink("unicast-misc", "direct", "Portfolio", {
        recipient: "Portfolio-Website/server",
        content: body.payload,
        ...defaultPayload
    });
}