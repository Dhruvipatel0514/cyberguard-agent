---
name: vuln-scanner
description: "Scans URLs, domains, and IPs for vulnerabilities and CVEs"
allowed-tools: Bash Read Write
---

# Vulnerability Scanner Skill

## Purpose
Perform vulnerability identification on a given target.

## Steps
1. Confirm the user owns the target
2. Check HTTP security headers
3. Check SSL/TLS configuration
4. Cross-reference CVEs
5. Output findings with severity and remediation
