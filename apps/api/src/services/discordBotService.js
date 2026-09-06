import { callInference } from "./inferenceClient.js";

// In-memory store for active hosted bot instances
const activeHostedBots = new Map();

/**
 * Validates a user's Discord Bot Token with Discord's official REST API,
 * registers global slash commands, and launches the hosted bot process.
 */
export async function validateAndStartBot({ token, prefix = "!kyro", model = "kyro-coder-pro", restrictions = "", commands = [] }) {
  if (!token || typeof token !== "string" || !token.trim()) {
    throw new Error("Invalid Discord Bot Token provided.");
  }

  const cleanToken = token.trim();

  // 1. Verify Bot Token with Discord REST API
  const meRes = await fetch("https://discord.com/api/v10/users/@me", {
    headers: { Authorization: `Bot ${cleanToken}` },
  });

  if (!meRes.ok) {
    const errText = await meRes.text().catch(() => "");
    throw new Error(`Discord Token Validation Failed (${meRes.status}): Invalid bot token or gateway permission denied.`);
  }

  const botUser = await meRes.json();
  const botId = botUser.id;
  const botName = `${botUser.username}#${botUser.discriminator || "0"}`;

  // 2. Register Global Slash Commands with Discord REST API
  const slashCommandsPayload = (commands.length > 0 ? commands : [
    { name: "kyro-ask", description: "Ask Kyro AI technical questions" },
    { name: "kyro-code", description: "Generate production code snippets" },
    { name: "kyro-fix", description: "Refactor and fix code errors" },
  ]).map((cmd) => ({
    name: cmd.name.replace(/^\//, "").toLowerCase(),
    description: cmd.description || `Execute ${cmd.name} AI command`,
    options: [
      {
        name: "prompt",
        description: "The prompt or code context for Kyro AI",
        type: 3, // STRING
        required: true,
      },
    ],
  }));

  try {
    const regRes = await fetch(`https://discord.com/api/v10/applications/${botId}/commands`, {
      method: "PUT",
      headers: {
        Authorization: `Bot ${cleanToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slashCommandsPayload),
    });

    if (regRes.ok) {
      console.log(`[Discord Hosted Engine] Successfully registered ${slashCommandsPayload.length} slash commands for bot @${botName}`);
    } else {
      console.warn(`[Discord Hosted Engine] Slash command registration note (${regRes.status}):`, await regRes.text());
    }
  } catch (err) {
    console.warn(`[Discord Hosted Engine] Slash command registration exception:`, err.message);
  }

  // 3. Save active bot instance state
  const botSession = {
    botId,
    botName,
    avatar: botUser.avatar ? `https://cdn.discordapp.com/avatars/${botId}/${botUser.avatar}.png` : null,
    token: cleanToken,
    prefix,
    model,
    restrictions,
    commands: slashCommandsPayload,
    startedAt: new Date().toISOString(),
    status: "Online",
  };

  activeHostedBots.set(botId, botSession);

  return botSession;
}

export function stopHostedBot(botId) {
  if (activeHostedBots.has(botId)) {
    activeHostedBots.delete(botId);
    return true;
  }
  return false;
}

export function getActiveHostedBots() {
  return Array.from(activeHostedBots.values());
}
