import { ActionEntry, deployPayload } from "../customTypes";
import { sendUplink } from "@svkruik/sk-uplink-connector";

/**
 * Deploys the SK Bots.
 * 
 * @param body The body of the action entry
 */
export async function pushSkBots(body: ActionEntry): Promise<void> {
    await sendUplink({
        "name": "broadcast-bots",
        "type": "fanout",
        "router": ""
    }, {
        recipient: "SK-Bots/*",
        content: body.payload,
        ...deployPayload
    });
}

/**
 * Sends a release/changelog message in a dedicated Discord channel.
 * 
 * @param body The body of the action entry
 */
export async function releaseSkBots(body: ActionEntry): Promise<void> {
    await sendUplink({
        "name": "unicast-bots",
        "type": "direct",
        "router": "Apricaria"
    }, {
        recipient: "SK-Bots/Apricaria",
        content: body.payload,
        ...deployPayload
    });
}