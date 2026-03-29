---
name: code-auditor
description: "Static security analysis checking for OWASP Top 10 vulnerabilities and hardcoded secrets"
allowed-tools: Bash Read Write
---

# Code Security Auditor Skill

## Purpose
Review source code for security vulnerabilities before deployment.

## Steps
1. Accept a file path or code snippet
2. Detect programming language
3. Scan for OWASP Top 10 issues
4. Detect hardcoded secrets and API keys
5. Find injection vulnerabilities
6. Return security score and prioritized findings
