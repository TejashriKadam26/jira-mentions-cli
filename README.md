# 🔔 Jira Mentions CLI Tool

> **PoC** — Node.js CLI that scans Jira issues and detects when UI Dev team members are **@mentioned** in comments, displaying results in a color-coded terminal output.

---

## 📌 What This Tool Does

- Connects to Jira Cloud via **REST API v3**
- Searches recently updated issues using **JQL**
- Fetches comments and parses **ADF (Atlassian Document Format)** to find `@mention` nodes
- Filters mentions to your configured **team members**
- Prints results in color-coded terminal output

---

## 🛠️ Tech Stack

| Package | Purpose |
|---------|---------|
| Node.js (v18+) | Runtime |
| axios | HTTP calls to Jira REST API |
| dotenv | Load credentials from `.env` |
| yargs | CLI command & argument parsing |
| chalk | Colored terminal output |

---

## 🚀 Setup Guide (Step by Step)

### Step 1 — Prerequisites

Make sure you have **Node.js v18 or higher** installed.

```bash
node --version   # should print v18.x.x or higher
npm --version    # should print 8.x.x or higher
```

If not installed, download from: https://nodejs.org

---

### Step 2 — Clone the Repository

```bash
git clone https://github.com/TejashriKadam26/jira-mentions-cli.git
cd jira-mentions-cli
```

---

### Step 3 — Install Dependencies

```bash
npm install
```

This installs: `axios`, `chalk`, `dotenv`, `yargs`

---

### Step 4 — Generate Your Jira API Token

> ⚠️ You need a **personal API token** — your Jira password will NOT work.

1. Open this URL in your browser:
   ```
   https://id.atlassian.com/manage-profile/security/api-tokens
   ```
2. Log in with the same email you use for Jira
3. Click **"Create API token"**
4. Enter a label: `jira-mentions-cli`
5. Click **"Create"**
6. **Copy the token immediately** — it is shown only once!

---

### Step 5 — Create Your `.env` File

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

Then open `.env` and fill in your values:

```env
# Jira Configuration
JIRA_BASE_URL=https://rib-40.atlassian.net
JIRA_EMAIL=your.email@rib-software.com
JIRA_API_TOKEN=your_api_token_here

# Jira project key to scan
JIRA_PROJECT=DEV

# Comma-separated Jira accountIds of team members to track
TEAM_ACCOUNT_IDS=accountId1,accountId2,accountId3

# Optional: Microsoft Teams Webhook (Phase 2)
TEAMS_WEBHOOK_URL=
```

#### 🔍 How to find a team member's `accountId`

1. Open Postman
2. Run: `GET https://rib-40.atlassian.net/rest/api/3/user/search?query=Name`
   - Auth: Basic Auth → Username: your email, Password: your API token
3. Copy the `accountId` from the response

OR run the lookup script (after setup):
```bash
node -e "
const https = require('https');
const axios = require('axios');
require('dotenv').config();
const auth = Buffer.from(process.env.JIRA_EMAIL+':'+process.env.JIRA_API_TOKEN).toString('base64');
const agent = new https.Agent({ rejectUnauthorized: false });
axios.get(process.env.JIRA_BASE_URL+'/rest/api/3/user/search',{
  headers:{Authorization:'Basic '+auth},
  params:{query:'Name Here'},
  httpsAgent: agent
}).then(r=>r.data.forEach(u=>console.log(u.accountId, '=', u.displayName)));
"
```

---

### Step 6 — Verify API Connection (Postman)

Before running the CLI, verify your credentials work in Postman:

1. Open Postman
2. **Settings → General → SSL Certificate Verification → OFF** (corporate network fix)
3. New request:
   - **Method:** `GET`
   - **URL:** `https://rib-40.atlassian.net/rest/api/3/myself`
   - **Authorization tab → Basic Auth**
     - Username: your Jira email
     - Password: your API token
4. Click **Send**

✅ If you get `200 OK` with your profile — you're ready to run the CLI.

---

### Step 7 — Run the CLI

```bash
# Scan last 1 hour for team mentions
node index.js mentions --hours 1

# Scan last 24 hours
node index.js mentions --hours 24

# Check a specific ticket (great for testing)
node index.js check-issue --key DEV-57151

# Show ALL mentions in a ticket (debug mode)
node index.js check-issue --key DEV-57151 --all

# Show help
node index.js --help
```

---

## 📊 Expected Output

When you run `node index.js mentions --hours 1`, you'll see colored output like this:

### Real Example Output

```
🔍 Scanning Jira [DEV] — last 1 hour(s)
────────────────────────────────────────────────────────────
   Found 25 recently updated issue(s). Checking comments...

────────────────────────────────────────────────────────────
🎫 Ticket : DEV-72148  |  Status: In Progress
   Title   : [PoC] Dummy Ticket for Jira Mention API Testing & Validation
   Reporter: Tejashri Kadam

💬 Comment by: Tejashri Kadam  (2026-07-02T06:58:59.504+0000)
   Mentioned : @Michael Alisch
   Message   : @Michael Alisch
This is a CLI-based PoC. It can be verified by running node index.js check-issue --key <KNOWN_ISSUE_KEY> against a known Jira issue with comments containing @mentions, or node index.js mentions --hours <N> to scan recent Jira comments.
I will also demonstrate this during the demo.
────────────────────────────────────────────────────────────

✅ Found 1 Jira comment(s) where UI team members were mentioned.
```

---

### 💡 Understanding the Output

| Part | Meaning |
|------|---------|
| **🔍 Scanning Jira [DEV]** | Scan started for DEV project |
| **Found 25 recently updated** | Found 25 issues changed in last 1 hour |
| **🎫 Ticket: DEV-72148** | Issue key and current status |
| **Title** | Ticket summary (PoC ticket for testing) |
| **Reporter** | Who created the ticket (Tejashri Kadam) |
| **💬 Comment by: Tejashri Kadam** | Who wrote the comment and timestamp |
| **Mentioned: @Michael Alisch** | Team member tagged in this comment |
| **Message** | The actual comment text extracted from Jira's ADF JSON format |
| **✅ Found 1 comment(s)** | Total comments found where your team members were mentioned |

---

### What This Proves

This real output demonstrates:
- ✅ **ADF Parsing Works:** Correctly extracted the comment from Jira's internal JSON format
- ✅ **Mention Detection Works:** Found @Michael Alisch mention correctly
- ✅ **Team Filtering Works:** Only showed mentions of configured team members
- ✅ **Message Extraction Works:** Displayed the actual comment text to the user
- ✅ **Real Data:** Tested against actual DEV-72148 ticket
- ✅ **CLI Works:** Command executed successfully with formatted output

---

## ⏱️ Time Range Reference

| Time Range | Command |
|------------|---------|
| Last 1 hour | `node index.js mentions --hours 1` |
| Last 6 hours | `node index.js mentions --hours 6` |
| Last 1 day | `node index.js mentions --hours 24` |
| Last 2 days | `node index.js mentions --hours 48` |
| Last 1 week | `node index.js mentions --hours 168` |
| Last 1 month | `node index.js mentions --hours 720` |

---

## 📁 Project Structure

```
jira-mentions-cli/
├── index.js              ← CLI entry point (2 commands)
├── package.json          ← Dependencies & scripts
├── .env                  ← Your credentials (DO NOT COMMIT)
├── .env.example          ← Template — copy this to .env
├── .gitignore            ← Excludes .env and node_modules
└── src/
    ├── config.js         ← Loads .env, validates credentials
    ├── jiraService.js    ← All Jira REST API calls
    ├── mentionParser.js  ← ADF JSON parser + team filter
    └── reporter.js       ← Chalk colored terminal output
```

---

## 🔌 API Endpoints Used

| API | Endpoint | Purpose |
|-----|----------|---------|
| Search Issues | `GET /rest/api/3/search/jql` | Find recently updated tickets |
| Get Comments | `GET /rest/api/3/issue/{key}/comment` | Fetch all comments |
| Get Issue | `GET /rest/api/3/issue/{key}` | Fetch ticket details |
| Get User | `GET /rest/api/3/user?accountId=...` | Look up user by ID |

---

## 🐛 Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `unable to get local issuer certificate` | Corporate SSL proxy | Already handled in code — no action needed |
| `401 Unauthorized` | Wrong email or token | Regenerate token at `id.atlassian.com/manage-profile/security/api-tokens` |
| `Missing required environment variables` | `.env` not filled | Open `.env` and add `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN` |
| `0 issues found` | No recent activity | Try `--hours 48` or `--hours 168` |
| `0 mentions found` | AccountIds not matching | Run `check-issue --key DEV-XXXX --all` to see all raw mentions |
| `Cannot find module` | Dependencies not installed | Run `npm install` |
| Postman `SSL Error` | Corporate network | Settings → SSL Certificate Verification → OFF |

---

## 🔐 Security Notes

- **Never commit `.env`** — it is already in `.gitignore`
- Use `JIRA_API_TOKEN` (not your Atlassian account password)
- The SSL bypass (`rejectUnauthorized: false`) is safe for internal corporate tools

---

## 🗺️ Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| Phase 1 | CLI — Scan Jira for @mentions | ✅ Complete |
| Phase 2 | Send alerts to Microsoft Teams | 📅 Planned |
| Phase 3 | Scheduled hourly scans (node-cron) | 📅 Planned |
| Phase 4 | AI-generated reply suggestions | 📅 Planned |