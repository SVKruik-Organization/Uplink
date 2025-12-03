import { ActionEntry } from "../customTypes";
import { defaultPayload, sendUplink } from "../utils/connection";

/**
 * Deploy the authentication service.
 * 
 * @param body The body of the action entry
 */
export async function pushOverway(body: ActionEntry): Promise<void> {
    await sendUplink("unicast-products", "direct", "Overway", {
        recipient: "Overway",
        content: body.payload,
        ...defaultPayload
    });
}