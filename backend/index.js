import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";



dotenv.config({ path: "./.env" });
console.log("KEY CHECK:", process.env.GEMINI_API_KEY); // add this line

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
    console.log("KEY:", process.env.OPENROUTER_API_KEY);
    console.log("Key preview:", ""?.substring(0, 20));
    console.log("Last user message:", lastUserMessage);
    console.log("Detected skill:", detectedSkill);

const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "mistral-small-latest",
    messages: [{ role: "system", content: systemPrompt }, ...userMessages]
  })
});

const data = await response.json();
console.log("Mistral response:", JSON.stringify(data).substring(0, 400));

if (data.error) {
  console.error("Mistral error:", data.error);
  return res.json({ reply: `⚠️ API Error: ${data.error.message}` });
}

const reply = data?.choices?.[0]?.message?.content || "⚠️ No response.";

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
