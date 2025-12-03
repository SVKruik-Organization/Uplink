import { ActionEntry, deployPayload } from "../customTypes";
import { sendUplink } from "@svkruik/sk-uplink-connector";

/**
 * Deploys the personal portfolio website.
 * 
 * @param body The body of the action entry
 */
export async function pushPortfolio(body: ActionEntry): Promise<void> {
    await sendUplink({
        "name": "unicast-misc",
        "type": "direct",
        "router": "Portfolio"
    }, {
        recipient: "Portfolio-Website/server",
        content: body.payload,
        ...deployPayload
    });
}