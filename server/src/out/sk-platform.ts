import { ActionEntry } from "../customTypes";
import { defaultPayload, sendUplink } from "../utils/connection";

/**
 * Deploys the SK Platform components.
 * 
 * @param body The body of the action entry
 */
export async function pushSkPlatform(body: ActionEntry): Promise<void> {
    await sendUplink("unicast-products", "direct", "Platform", {
        recipient: "SK-Platform/frontend",
        content: body.payload,
        ...defaultPayload
    });

    await sendUplink("unicast-products", "direct", "Docs", {
        recipient: "SK-Platform/docs",
        content: body.payload,
        ...defaultPayload
    });
}