import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const devArgIndex = args.findIndex(
  (arg) => arg === "dev" || arg === "--dev" || arg === "development",
);
const isDev = devArgIndex !== -1;

const forwardArgs = isDev
  ? args.slice(devArgIndex + 1).filter((arg) => arg !== "--")
  : args.filter((arg) => arg !== "--");

const run = (command, commandArgs, options = {}) => {
  const child = spawn(command, commandArgs, {
    stdio: "inherit",
    env: process.env,
    ...options,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    } else {
      process.exit(code ?? 0);
    }
  });
};

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

if (isDev) {
  const devArgs = ["run", "dev"];
  if (forwardArgs.length > 0) {
    devArgs.push("--", ...forwardArgs);
  }
  run(npmCommand, devArgs, { shell: process.platform === "win32" });
} else {
  const projectRoot = path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.join(projectRoot, "..", "dist");

  if (!existsSync(distPath)) {
    console.error(
      [
        "Frontend build output not found at:",
        `  ${distPath}`,
        "",
        "Run `npm run build` first or use `npm start dev` for development.",
      ].join("\n"),
    );
    process.exit(1);
  }

  const previewArgs = ["run", "preview"];
  if (forwardArgs.length > 0) {
    previewArgs.push("--", ...forwardArgs);
  }
  run(npmCommand, previewArgs, { shell: process.platform === "win32" });
}

