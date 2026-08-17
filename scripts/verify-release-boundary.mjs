import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const workflowDir = path.join(root, ".github", "workflows");
const workflowFiles = (await readdir(workflowDir)).filter((name) => /\.ya?ml$/i.test(name));

const violations = [];
for (const file of workflowFiles) {
  const source = await readFile(path.join(workflowDir, file), "utf8");
  if (/contents\s*:\s*write/i.test(source)) violations.push(`${file}: grants contents: write`);
  if (/\bgit\s+push\b/i.test(source)) violations.push(`${file}: executes git push`);
  if (/HEAD\s*:\s*main/i.test(source)) violations.push(`${file}: explicitly pushes HEAD to main`);
}

assert.deepEqual(
  violations,
  [],
  `Release boundary violation(s):\n${violations.map((item) => `- ${item}`).join("\n")}\nGitHub Actions may verify/build/deploy, but must not mutate application code and push it to main.`,
);

console.log(`Release boundary passed across ${workflowFiles.length} workflow file(s).`);
