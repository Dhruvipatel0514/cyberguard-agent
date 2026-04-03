import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------
// Load agent identity files
// ---------------------------
const loadFile = (filename) => {
  const filePath = path.join(__dirname, filename); // keep files in backend folder
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : "";
};

const SOUL = loadFile("SOUL.md");
const RULES = loadFile("RULES.md");

// ---------------------------
// Middleware
// ---------------------------
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, ".."))); // serve frontend

// ---------------------------
// Chat history
// ---------------------------
const HISTORY_FILE = path.join(__dirname, "chat-history.json");

const loadHistory = () => {
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf-8"));
    } catch {
      return [];
    }
  }
  return [];
};

const saveHistory = (history) => {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
};

// ---------------------------
// Skill detection
// ---------------------------
function detectSkill(userInput) {
  const text = userInput.toLowerCase();

  if (text.includes("scan") || text.includes("http") || text.includes("url")) return "vuln-scanner";
  if (text.includes("ip") || text.includes("ioc") || text.match(/\b\d{1,3}(\.\d{1,3}){3}\b/)) return "threat-intel";
  if (text.includes("code") || text.includes("audit") || text.includes("function") || text.includes("script")) return "code-auditor";
  if (text.includes("report")) return "reporter";
  if (text.includes("generate script") || text.includes("monitor") || text.includes("detect")) return "defensive-scripting";

  // Default for normal questions
  return "general";
}

// ---------------------------
// API: Get chat history
// ---------------------------
app.get("/api/history", (req, res) => {
  res.json(loadHistory());
});

// ---------------------------
// API: Chat endpoint
// ---------------------------
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || messages.length === 0) {
    return res.json({ reply: "No messages provided" });
  }

  // Load previous history
  const history = loadHistory();
  history.push(...messages);

  try {
    const lastUserMessage = messages[messages.length - 1].content;
    const detectedSkill = detectSkill(lastUserMessage);

    // System prompt for AI
   let systemPrompt = `
${SOUL}

${RULES}

You are CyberGuard — an advanced cybersecurity AI agent.

CRITICAL INSTRUCTIONS:
- Answer all cybersecurity questions clearly and professionally.
- Provide definitions, explanations, and best practices when asked.
- Avoid giving instructions for illegal hacking or exploitation.
`;

if (detectedSkill !== "general") {
  systemPrompt += `

DETECTED SKILL: ${detectedSkill}

FORMATTING RULES:

[VULN-SCANNER]
TARGET:
FINDING #:
Severity:
Title:
Description:
Impact:
Remediation:
Reference:
RISK SCORE:

[THREAT-INTEL]
IOC:
TYPE:
THREAT SCORE:
VERDICT:
ANALYSIS:
MITRE ATT&CK:
ASSOCIATED THREATS:
RECOMMENDED ACTIONS:

[CODE-AUDITOR]
FINDING #:
Severity:
CWE:
Vulnerable Code:
Secure Fix:
SECURITY SCORE:

[REPORTER]
Executive Summary
Risk Overview
Findings
Remediation Roadmap

[DEFENSIVE-SCRIPTING]
SCRIPT TYPE:
PURPOSE:
SCRIPT:
HOW IT WORKS:
SECURITY NOTE:

- Use ONLY the format of the detected skill
- Never mix formats
`;
}
    // Call OpenRouter / Claude API
    const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "CyberGuard Agent"
      },
      body: JSON.stringify({
  model: "anthropic/claude-haiku-4-5",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: lastUserMessage }
  ]
})
    });

    const data = await apiResponse.json();

let reply = data?.completion || data?.choices?.[0]?.message?.content || "⚠️ AI did not return a response. Try again.";    // Save AI reply
    history.push({ role: "assistant", content: reply });
    saveHistory(history);

    res.json({ reply });

  } catch (err) {
    console.error(err);
    if (err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") {
      return res.status(500).json({ reply: "🌐 Network Error: Unable to connect to AI service." });
    }
    res.status(500).json({ reply: "⚠️ Unexpected server error occurred." });
  }
});

// ---------------------------
// Start server
// ---------------------------
app.listen(PORT, () => {
  console.log(`🚀 CyberGuard running at http://localhost:${PORT}`);
});