import shell from "shelljs";
import { log } from "../utils/logger";

/**
 * Deploys this AMQP API.
 * 
 * @param body The body of the action entry
 */
export function pushUplink(): void {
    if (process.platform === "linux") {
        log("Received new deploy task. Running Documentation deployment script.", "info");
        shell.exec("bash deploy.sh");
    } else log("Received new deploy task. Invalid OS, skipping.", "warn");
}