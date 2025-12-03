import { logData } from "@svkruik/sk-platform-formatters";
import shell from "shelljs";

/**
 * Deploys this AMQP API.
 * 
 * @param body The body of the action entry
 */
export function pushUplink(): void {
    if (process.platform === "linux") {
        logData("Received new deployment task. Running deployment script.", "info");
        shell.exec("bash deploy.sh");
    } else logData("Received new deployment task. Invalid OS, skipping.", "warning");
}