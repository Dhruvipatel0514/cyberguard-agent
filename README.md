# 🛡️ CyberGuard — AI-Powered Cybersecurity Agent

> Built for the GitAgent Hackathon | gitagent standard v0.1.0

CyberGuard is an advanced AI cybersecurity agent for vulnerability scanning, threat intelligence, code auditing, and defensive scripting.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm
- An Anthropic or OpenRouter API key

### 1. Clone the repo
git clone https://github.com/Dhruvipatel0514/cyberguard-agent.git
cd cyberguard-agent

### 2. Install dependencies
npm install

### 3. Set up your API key
Create a .env file in the backend/ folder:
ANTHROPIC_API_KEY=your_api_key_here

### 4. Start the agent
node backend/index.js

### 5. Open the UI
Open index.html in your browser or go to http://localhost:3000

---

## 🧠 Skills

| Skill | What it does |
|---|---|
| vuln-scanner | Scan a website URL for vulnerabilities |
| threat-intel | Analyze a suspicious IP address |
| code-auditor | Audit code for OWASP security issues |
| reporter | Generate a full security report |
| defensive-scripting | Generate defensive security scripts |

---

## 🤖 Run via gitclaw (gitagent standard)

npm install -g gitclaw
gitclaw run .

---

## ✅ Validate the agent

npx gitagent validate
npx gitagent info

---

## 📁 Project Structure

cyberguard-agent/
├── agent.yaml          # Agent manifest
├── SOUL.md             # Agent personality and identity
├── RULES.md            # Agent rules and boundaries
├── skills/
│   ├── vuln-scanner/
│   ├── threat-intel/
│   ├── code-auditor/
│   ├── reporter/
│   └── defensive-scripting/
├── tools/
│   ├── http-headers.yaml
│   └── ioc-analyzer.yaml
└── backend/
    └── index.js

