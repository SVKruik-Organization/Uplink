import { ActionEntry, deployPayload } from "../customTypes";
import { sendUplink } from "@svkruik/sk-uplink-connector";

/**
 * Deploys the mailing service.
 * 
 * @param body The body of the action entry
 */
export async function pushDispatch(body: ActionEntry): Promise<void> {
    await sendUplink({
        "name": "unicast-services",
        "type": "direct",
        "router": "Dispatch"
    }, {
        recipient: "Dispatch",
        content: body.payload,
        ...deployPayload
    });
}