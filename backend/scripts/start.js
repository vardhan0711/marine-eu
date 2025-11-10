import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
// this is the temperary commit to fix the issue with the backend build
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

if (isDev) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const devArgs = ["run", "dev"];
  if (forwardArgs.length > 0) {
    devArgs.push("--", ...forwardArgs);
  }
  run(npmCommand, devArgs, { shell: process.platform === "win32" });
} else {
  const serverPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "dist",
    "infrastructure",
    "server",
    "index.js",
  );

  if (!existsSync(serverPath)) {
    console.error(
      [
        "Backend build output not found at:",
        `  ${serverPath}`,
        "",
        "Run `npm run build` first or use `npm start dev` for development.",
      ].join("\n"),
    );
    process.exit(1);
  }

  run(process.execPath, [serverPath, ...forwardArgs]);
}

