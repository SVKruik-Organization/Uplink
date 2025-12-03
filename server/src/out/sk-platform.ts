import { ActionEntry, deployPayload } from "../customTypes";
import { sendUplink } from "@svkruik/sk-uplink-connector";

/**
 * Deploys the SK Platform components.
 * 
 * @param body The body of the action entry
 */
export async function pushSkPlatform(body: ActionEntry): Promise<void> {
    await sendUplink({
        "name": "unicast-products",
        "type": "direct",
        "router": "Platform"
    }, {
        recipient: "SK-Platform/frontend",
        content: body.payload,
        ...deployPayload
    });

    await sendUplink({
        "name": "unicast-products",
        "type": "direct",
        "router": "Docs"
    }, {
        recipient: "SK-Platform/docs",
        content: body.payload,
        ...deployPayload
    });
}