import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const commands = [
  ["npm", ["run", "export:github:bootstrap"]],
  ["npm", ["run", "export:ops:report"]],
  ["npm", ["run", "export:handoff:bundle"]],
];

const results = [];

for (const [cmd, args] of commands) {
  const { stdout } = await execFileAsync(cmd, args, {
    cwd: process.cwd(),
  });
  results.push({
    command: [cmd, ...args].join(" "),
    output: stdout.trim(),
  });
}

console.log(
  JSON.stringify(
    {
      ok: true,
      results,
    },
    null,
    2,
  ),
);
