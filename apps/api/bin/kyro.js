#!/usr/bin/env node

/**
 * Kyro AI Command-Line Interface (kyro-cli)
 * Usage:
 *   npx kyro "Explain this code"
 *   kyro chat "Build a REST API server"
 *   cat file.js | kyro "Refactor this code to TypeScript"
 */

import http from "http";
import https from "https";

const KYRO_API_URL = process.env.KYRO_API_URL || "https://kyro-api-auou.onrender.com";
const KYRO_API_KEY = process.env.KYRO_API_KEY || "";

const args = process.argv.slice(2);
const command = args[0] || "help";

if (command === "help" || args.length === 0) {
  console.log(`
┌────────────────────────────────────────────────────────┐
│                   Kyro AI CLI Tool                     │
└────────────────────────────────────────────────────────┘

Usage:
  kyro chat <prompt>           Send a chat prompt to Kyro AI
  kyro refactor <file>         Refactor local file to TypeScript/Clean Code
  kyro models                  List available inference models
  cat log.txt | kyro "Explain" Pipe stdin to Kyro AI

Options:
  --model <name>               Model choice (kyro-coder-pro, kyro-ultra-70b, kyro-flash-8b)
  --key <api_key>              Kyro API Key (or set KYRO_API_KEY env var)
`);
  process.exit(0);
}

let promptText = args.join(" ");

if (!process.stdin.isTTY) {
  let stdinData = "";
  process.stdin.on("data", (chunk) => { stdinData += chunk; });
  process.stdin.on("end", () => {
    executePrompt(`${promptText}\n\n[Input Code / Context]:\n${stdinData}`);
  });
} else {
  executePrompt(promptText);
}

function executePrompt(prompt) {
  const model = args.includes("--model") ? args[args.indexOf("--model") + 1] : "kyro-coder-pro";
  console.log(`\n\x1b[36m[Kyro AI CLI]\x1b[0m Sending prompt to ${model}...\n`);

  const payload = JSON.stringify({
    model,
    messages: [
      { role: "system", content: "You are Kyro AI CLI assistant. Provide clean, concise code and terminal responses." },
      { role: "user", content: prompt }
    ],
    stream: false
  });

  const url = new URL(`${KYRO_API_URL}/v1/chat/completions`);
  const client = url.protocol === "https:" ? https : http;

  const req = client.request(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
      ...(KYRO_API_KEY ? { Authorization: `Bearer ${KYRO_API_KEY}` } : {})
    }
  }, (res) => {
    let body = "";
    res.on("data", (chunk) => { body += chunk; });
    res.on("end", () => {
      try {
        const data = JSON.parse(body);
        if (data.choices && data.choices[0]?.message?.content) {
          console.log(data.choices[0].message.content);
        } else if (data.error) {
          console.error(`\x1b[31m[Error]\x1b[0m ${data.error.message}`);
        } else {
          console.log(body);
        }
      } catch (e) {
        console.log(body);
      }
    });
  });

  req.on("error", (err) => {
    console.error(`\x1b[31m[Connection Error]\x1b[0m ${err.message}`);
  });

  req.write(payload);
  req.end();
}
