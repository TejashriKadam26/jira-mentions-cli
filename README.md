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

## �️ Tech Stack

| Package | Purpose |
|---------|---------|
| Node.js (v18+) | Runtime |
| axios | HTTP calls to Jira REST API |
| dotenv | Load credentials from `.env` |
| yargs | CLI command & argument parsing |
| chalk | Colored terminal output |

---

## �🚀 Setup Guide (Step by Step)

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

Ask your Jira admin for the accountId, or check the Jira user directory link (format: `https://rib-40.atlassian.net/people/accountId`).

Example: `712020:ad5611d3-7394-4523-a092-6269cc8effe6`

---

### Step 6 — Run the CLI

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

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| `401 Unauthorized` | Check email & token in `.env` |
| `Missing environment variables` | Fill all required fields in `.env` |
| `0 mentions found` | Try `--hours 48` or `--hours 168` |
| `Cannot find module` | Run `npm install` |

## 🔐 Security

- ✅ `.env` is in `.gitignore` (never committed)
- ✅ Use API token (not your password)

---

## � File Structure

```
jira-mentions-cli/
├── index.js              ← CLI entry point (yargs)
├── package.json          ← Dependencies
├── .env.example          ← Template for credentials
├── .gitignore            ← Excludes .env & node_modules
└── src/
    ├── config.js         ← Environment setup
    ├── jiraService.js    ← Jira API client
    ├── mentionParser.js  ← ADF parser
    └── reporter.js       ← Terminal output
```

---

## �🗺️ Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| Phase 1 | CLI — Scan Jira for @mentions | ✅ Complete |
| Phase 2 | Send alerts to Microsoft Teams | 📅 Planned |
| Phase 3 | Scheduled hourly scans (node-cron) | 📅 Planned |
| Phase 4 | AI-generated reply suggestions | 📅 Planned |