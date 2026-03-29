# CyberGuard Agent

> An AI-powered cybersecurity agent built on the gitagent standard

## What It Does
CyberGuard is a multi-skill security AI agent that can:
- **Scan** URLs, IPs, and domains for known vulnerabilities
- **Analyze** threat intelligence and Indicators of Compromise (IOCs)
- **Audit** source code for OWASP Top 10 vulnerabilities
- **Generate** professional security reports in Markdown

## Built With
- [gitagent](https://github.com/open-gitagent) standard
- [gitclaw](https://github.com/open-gitagent/gitclaw) runtime
- [clawless](https://github.com/open-gitagent/clawless) for phone/browser deployment
- Claude AI (claude-haiku-4-5) backbone

## Run Locally
```bash
npm install
npm start
```

## Run in Browser / Phone
```bash
npm install clawless
npx clawless serve
```
Then open the URL on any device including your phone.

## Validate Agent
```bash
npx gitagent validate
npx gitagent info
```

## Skills
| Skill | Description |
|-------|-------------|
| vuln-scanner | HTTP header checks, SSL/TLS, CVE matching |
| threat-intel | IOC analysis, MITRE ATT&CK mapping |
| code-auditor | OWASP Top 10 static analysis |
| reporter | Professional report generation |

## Architecture
This agent follows the gitagent specification:
- `agent.yaml` — manifest and model config
- `SOUL.md` — agent identity and values
- `RULES.md` — ethical constraints
- `skills/` — capability modules
- `tools/` — YAML tool schemas
