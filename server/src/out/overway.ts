import { ActionEntry, deployPayload } from "../customTypes";
import { sendUplink } from "@svkruik/sk-uplink-connector";

/**
 * Deploy the authentication service.
 * 
 * @param body The body of the action entry
 */
export async function pushOverway(body: ActionEntry): Promise<void> {
    await sendUplink({
        "name": "unicast-products",
        "type": "direct",
        "router": "Overway"
    }, {
        recipient: "Overway",
        content: body.payload,
        ...deployPayload
    });
}