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
4. Enter a label: `APItoken1_name`
5. Click **"Create"**
6. **Copy the token immediately** — it is shown only once!

---

### Step 5 — Create Your `.env` File

Copy `.env.example` to `.env`, then fill in your Jira details like below.

# Jira Configuration
JIRA_BASE_URL=https://your-org.atlassian.net
JIRA_EMAIL=your.email@company.com
JIRA_API_TOKEN=your_api_token_here

# Jira project key to scan
JIRA_PROJECT=DEV

# Comma-separated Jira accountIds of team members to track
TEAM_ACCOUNT_IDS=accountId1,accountId2,accountId3


#### 🔍 How to find a team member's `accountId`

- Go to Jira user directory: `https://your-org.atlassian.net/people`
- Find the user's profile
- Click on the user's name
- The URL will be in this format: `https://your-org.atlassian.net/people/accountId`
URL Example: `https://your-org.atlassian.net/people/712020:ad5611d3-7394-4523-a092-6269cc8effe6`
accountId Example: `712020:ad5611d3-7394-4523-a092-6269cc8effe6`

---

### Step 6 — Run the CLI

```bash
# Scan recent mentions (set your own time range in hours)
node index.js mentions --hours <number_of_hours>

# Check a specific ticket (configured team members only)
node index.js check-issue --key <ISSUE_KEY>

# Check all mentions in a specific ticket
node index.js check-issue --key <ISSUE_KEY> --all

# Show help
node index.js --help
```

> **Note:** `--hours` is always in hours.  
> Example: `24 = 1 day`, `48 = 2 days`, `168 = 7 days (1 week)`.

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


## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| `401 Unauthorized` | Check email & token in `.env` |
| `Missing environment variables` | Fill all required fields in `.env` |
| `0 mentions found` | Try `--hours 48` or `--hours 168` |
| `Cannot find module` | Run `npm install` |

---


## �🗺️ Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| Phase 1 | CLI — Scan Jira for @mentions | ✅ Complete |
| Phase 2 | Send alerts to Microsoft Teams | 📅 Planned |
| Phase 3 | Scheduled hourly scans (node-cron) | 📅 Planned |
| Phase 4 | AI-generated reply suggestions | 📅 Planned |