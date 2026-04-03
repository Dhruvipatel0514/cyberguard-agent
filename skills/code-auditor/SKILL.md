---
name: code-auditor
description: "Performs secure code review with vulnerability detection and fixes"
allowed-tools: Read Write
---

[CODE-AUDITOR]

FINDING #1
Severity: CRITICAL
CWE: CWE-89 (SQL Injection)
Vulnerable Code:
query = "SELECT * FROM users WHERE id=" + user_input

Secure Fix:
query = "SELECT * FROM users WHERE id = %s"
cursor.execute(query, (user_input,))

--------------------------------------------------

FINDING #2
Severity: CRITICAL
CWE: CWE-78 (Command Injection)
Vulnerable Code:
os.system("ping " + user_input)

Secure Fix:
import subprocess
subprocess.run(["ping", user_input])

--------------------------------------------------

FINDING #3
Severity: HIGH
CWE: CWE-798 (Hardcoded Credentials)
Vulnerable Code:
password = "admin123"

Secure Fix:
Use environment variables:
password = os.getenv("APP_PASSWORD")

--------------------------------------------------

SECURITY SUMMARY

Total Findings: 3
Critical: 2
High: 1
Medium: 0
Low: 0

FINAL SECURITY SCORE: 15/100 ⚠️