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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadFile = (filename) => {
  const filePath = path.join(__dirname, filename);
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf-8") : "";
};

const SOUL = loadFile("SOUL.md");
const RULES = loadFile("RULES.md");

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..")));

const HISTORY_FILE = path.join(__dirname, "chat-history.json");

const loadHistory = () => {
  if (fs.existsSync(HISTORY_FILE)) {
    try { return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf-8")); }
    catch { return []; }
  }
  return [];
};

const saveHistory = (history) => {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
};

function detectSkill(userInput) {
  const text = userInput.toLowerCase();
  if (text.includes("scan") || text.includes("http") || text.includes("url")) return "vuln-scanner";
  if (text.includes("ip") || text.includes("ioc") || text.match(/\b\d{1,3}(\.\d{1,3}){3}\b/)) return "threat-intel";
  if (text.includes("code") || text.includes("audit") || text.includes("function")) return "code-auditor";
  if (text.includes("report")) return "reporter";
  if (text.includes("script") || text.includes("monitor") || text.includes("detect")) return "defensive-scripting";
  return "general";
}

app.get("/api/history", (req, res) => {
  res.json(loadHistory());
});

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || messages.length === 0) {
    return res.json({ reply: "No messages provided" });
  }

  const userMessages = messages.filter(m => m.role !== "system");
  const lastUserMessage = userMessages.filter(m => m.role === "user").pop()?.content || "";
  const detectedSkill = detectSkill(lastUserMessage);

  let systemPrompt = `${SOUL}\n\n${RULES}\n\nYou are CyberGuard — an advanced cybersecurity AI agent.\n\nCRITICAL INSTRUCTIONS:\n- Answer all cybersecurity questions clearly and professionally.\n- Provide definitions, explanations, and best practices when asked.\n- Avoid giving instructions for illegal hacking or exploitation.\n`;

  if (detectedSkill !== "general") {
    systemPrompt += `\nDETECTED SKILL: ${detectedSkill}\n\nFORMATTING RULES:\n\n[VULN-SCANNER]\nTARGET:\nFINDING #:\nSeverity:\nTitle:\nDescription:\nImpact:\nRemediation:\nReference:\nRISK SCORE:\n\n[THREAT-INTEL]\nIOC:\nTYPE:\nTHREAT SCORE:\nVERDICT:\nANALYSIS:\nMITRE ATT&CK:\nASSOCIATED THREATS:\nRECOMMENDED ACTIONS:\n\n[CODE-AUDITOR]\nFINDING #:\nSeverity:\nCWE:\nVulnerable Code:\nSecure Fix:\nSECURITY SCORE:\n\n[REPORTER]\nExecutive Summary\nRisk Overview\nFindings\nRemediation Roadmap\n\n[DEFENSIVE-SCRIPTING]\nSCRIPT TYPE:\nPURPOSE:\nSCRIPT:\nHOW IT WORKS:\nSECURITY NOTE:\n\n- Use ONLY the format of the detected skill\n- Never mix formats\n`;
  }

  try {
    console.log("Calling OpenRouter...");
    console.log("Key preview:", "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"?.substring(0, 20));
    console.log("Last user message:", lastUserMessage);
    console.log("Detected skill:", detectedSkill);

    const apiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${"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"}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "CyberGuard Agent"
      },
      body: JSON.stringify({
        model: "anthropic/claude-haiku-4.5",
        max_tokens: 1500,
        messages: [
          { role: "system", content: systemPrompt },
          ...userMessages
        ]
      })
    });

    const data = await apiResponse.json();
    console.log("OpenRouter response:", JSON.stringify(data).substring(0, 400));

    if (data.error) {
      console.error("OpenRouter error:", data.error);
      return res.json({ reply: `⚠️ API Error: ${data.error.message}` });
    }

    const reply = data?.choices?.[0]?.message?.content || "⚠️ AI did not return a response. Try again.";

    const history = loadHistory();
    history.push({ role: "user", content: lastUserMessage });
    history.push({ role: "assistant", content: reply });
    saveHistory(history);

    res.json({ reply });

  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ reply: "⚠️ Server error: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 CyberGuard running at http://localhost:${PORT}`);
});