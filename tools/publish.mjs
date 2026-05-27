import { execFileSync } from "node:child_process";

function run(command, args) {
  return execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

run("node", ["tools/refresh-from-local.mjs"]);

const status = run("git", ["status", "--short"]);
if (!status) {
  console.log("No dashboard changes to publish.");
  process.exit(0);
}

run("git", ["add", "."]);
run("git", ["commit", "-m", `Sync AI work dashboard ${new Date().toISOString().slice(0, 10)}`]);
run("git", ["push"]);

console.log("Published dashboard changes to GitHub Pages.");

