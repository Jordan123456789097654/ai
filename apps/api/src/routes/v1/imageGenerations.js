/**
 * OpenAI-compatible Image Generation route (`POST /v1/images/generations`)
 */
export default async function imageGenerationsRoute(fastify) {
  fastify.post("/v1/images/generations", async (request, reply) => {
    const {
      prompt,
      n = 1,
      size = "1024x1024",
      response_format = "url",
      style = "vivid",
    } = request.body || {};

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return reply.status(400).send({
        error: {
          message: "'prompt' is required and must be a non-empty string.",
          type: "invalid_request_error",
          param: "prompt",
          code: "missing_required_parameter",
        },
      });
    }

    const count = Math.min(Math.max(parseInt(n, 10) || 1, 1), 4);
    const [widthStr, heightStr] = (size || "1024x1024").split("x");
    const width = parseInt(widthStr, 10) || 1024;
    const height = parseInt(heightStr, 10) || 1024;

    const data = [];

    for (let i = 0; i < count; i++) {
      const seedStr = `${prompt}-${i}-${style}-${Date.now()}`;
      const hue1 = Math.abs(hashString(seedStr)) % 360;
      const hue2 = (hue1 + 140) % 360;
      const accentHue = (hue1 + 220) % 360;

      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 800 800">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="hsl(${hue1}, 75%, 12%)" />
      <stop offset="50%" stop-color="hsl(${hue2}, 80%, 18%)" />
      <stop offset="100%" stop-color="hsl(${accentHue}, 85%, 8%)" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="hsl(${accentHue}, 90%, 60%)" stop-opacity="0.4" />
      <stop offset="100%" stop-color="hsl(${hue1}, 90%, 10%)" stop-opacity="0" />
    </radialGradient>
    <filter id="blurFilter">
      <feGaussianBlur stdDeviation="40" />
    </filter>
  </defs>
  <rect width="800" height="800" fill="url(#bg)" />
  <circle cx="400" cy="350" r="280" fill="url(#glow)" />
  <circle cx="300" cy="250" r="140" fill="hsl(${hue1}, 80%, 55%)" opacity="0.25" filter="url(#blurFilter)" />
  <circle cx="520" cy="450" r="160" fill="hsl(${hue2}, 85%, 60%)" opacity="0.3" filter="url(#blurFilter)" />
  <g fill="none" stroke="hsl(${accentHue}, 90%, 75%)" stroke-width="2" opacity="0.6">
    <polygon points="400,180 550,480 250,480" />
    <circle cx="400" cy="380" r="100" />
    <line x1="200" y1="600" x2="600" y2="600" stroke-dasharray="10 10" />
  </g>
  <rect x="40" y="700" width="720" height="60" rx="10" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.15)" />
  <text x="60" y="735" font-family="sans-serif" font-size="18" font-weight="bold" fill="#00E5FF">KYRO AI IMAGE GENERATOR</text>
  <text x="60" y="755" font-family="sans-serif" font-size="12" fill="#E2E8F0" opacity="0.9">Prompt: "${escapeXml(prompt.slice(0, 75))}${prompt.length > 75 ? "..." : ""}"</text>
</svg>`;

      const base64Svg = Buffer.from(svgContent).toString("base64");
      const dataUrl = `data:image/svg+xml;base64,${base64Svg}`;

      if (response_format === "b64_json") {
        data.push({ b64_json: base64Svg, revised_prompt: prompt });
      } else {
        data.push({ url: dataUrl, revised_prompt: prompt });
      }
    }

    return reply.send({
      created: Math.floor(Date.now() / 1000),
      data,
    });
  });
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}
