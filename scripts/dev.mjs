import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextCli = require.resolve("next/dist/bin/next");
const forwardedArgs = process.argv.slice(2);
const nextArgs = ["dev"];

for (let index = 0; index < forwardedArgs.length; index += 1) {
  const argument = forwardedArgs[index];

  if (argument === "--host") {
    nextArgs.push("--hostname");
    if (forwardedArgs[index + 1]) {
      nextArgs.push(forwardedArgs[index + 1]);
      index += 1;
    }
    continue;
  }

  if (argument === "--strictPort") continue;
  nextArgs.push(argument);
}

const child = spawn(process.execPath, [nextCli, ...nextArgs], {
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
