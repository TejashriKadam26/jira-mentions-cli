'use strict';

const yargs = require('yargs');
const config = require('./src/config');
const { searchRecentIssues, getComments, getIssue } = require('./src/jiraService');
const {
  extractMentions,
  extractText,
  filterTeamMentions,
  isAutomationComment,
} = require('./src/mentionParser');
const { printMention, printHeader, printSummary } = require('./src/reporter');

/**
 * Check a specific Jira issue for ALL @mentions in its comments.
 * Useful for backward testing with known tickets like DEV-57151.
 *
 * Use --all flag to show every mention regardless of TEAM_ACCOUNT_IDS.
 *
 * @param {string}  issueKey - e.g. "DEV-57151"
 * @param {boolean} showAll  - if true, show all mentions, not just team members
 */
async function runIssueCheck(issueKey, showAll) {
  const c_chalk = await (async () => (await import('chalk')).default)();

  console.log('');
  console.log(c_chalk.bold.blue(`🔍 Checking specific issue: ${issueKey}`));
  if (showAll) {
    console.log(c_chalk.gray('   Mode: ALL mentions (ignoring TEAM_ACCOUNT_IDS filter)'));
  } else {
    console.log(c_chalk.gray(`   Mode: Team members only (${config.teamAccountIds.length} IDs configured)`));
  }
  console.log(c_chalk.gray('─'.repeat(60)));

  let mentionCount = 0;

  try {
    // 1. Fetch the issue metadata
    const issue = await getIssue(issueKey);

    // 2. Fetch all comments for this issue
    const comments = await getComments(issueKey);
    console.log(`   Found ${comments.length} comment(s) on ${issueKey}. Scanning for mentions...\n`);

    for (const comment of comments) {
      // Skip bot/automation comments
      if (isAutomationComment(comment)) continue;

      // Parse ADF body for @mentions
      const allMentions = extractMentions(comment.body);

      if (allMentions.length === 0) continue;

      // Apply team filter unless --all flag is set
      const targetMentions = showAll ? allMentions : filterTeamMentions(allMentions);

      if (targetMentions.length === 0) continue;

      const message = extractText(comment.body);
      await printMention(issue, comment, targetMentions, message);
      mentionCount++;
    }
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    if (err.response) {
      console.error(`   HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`);
    }
    process.exit(1);
  }

  await printSummary(mentionCount);
}

/**
 * Core orchestration function.
 * 1. JQL search for recently updated issues
 * 2. Fetch comments per issue
 * 3. Filter comments by age (created within the specified hours)
 * 4. Parse ADF mentions from each comment
 * 5. Filter to team members only
 * 6. Print results
 */
async function runMentionCheck(hours) {
  await printHeader(hours, config.jira.project);

  let mentionCount = 0;
  const cutoffTime = hours ? new Date(Date.now() - hours * 60 * 60 * 1000) : null;

  try {
    const issues = await searchRecentIssues(hours);
    console.log(`   Found ${issues.length} recently updated issue(s). Checking comments...\n`);

    for (const issue of issues) {
      let comments;
      try {
        comments = await getComments(issue.key);
      } catch (err) {
        console.warn(`   ⚠️  Could not fetch comments for ${issue.key}: ${err.message}`);
        continue;
      }

      for (const comment of comments) {
        // Skip bot/automation comments
        if (isAutomationComment(comment)) continue;

        // Filter comments by creation/update time to only include recent ones
        const commentTime = new Date(comment.updated || comment.created);
        if (cutoffTime && commentTime < cutoffTime) continue;

        // Parse ADF body for @mentions
        const allMentions = extractMentions(comment.body);

        // Keep only mentions of our team members
        const teamMentions = filterTeamMentions(allMentions);

        if (teamMentions.length === 0) continue;

        // Extract plain text for display
        const message = extractText(comment.body);

        await printMention(issue, comment, teamMentions, message);
        mentionCount++;
      }
    }
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    if (err.response) {
      console.error(`   HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`);
    }
    process.exit(1);
  }

  await printSummary(mentionCount);
}

// ─── CLI Setup ────────────────────────────────────────────────
// eslint-disable-next-line no-unused-expressions
yargs(process.argv.slice(2))
  .scriptName('jira-mentions')
  .usage('$0 <command> [options]')

  .command(
    'mentions',
    'List Jira @mentions for team members in recent issues',
    (y) => {
      y.option('hours', {
        alias: 'h',
        type: 'number',
        describe: 'How many hours back to scan (e.g. 1, 4, 24). Omit to show all mentioned comments',
      });
    },
    async (argv) => {
      await runMentionCheck(argv.hours);
    }
  )

  .command(
    'check-issue',
    'Check a specific Jira issue for @mentions (great for backward testing)',
    (y) => {
      y.option('key', {
        alias: 'k',
        type: 'string',
        demandOption: true,
        describe: 'Jira issue key to inspect (e.g. DEV-57151)',
      });
      y.option('all', {
        alias: 'a',
        type: 'boolean',
        default: false,
        describe: 'Show ALL @mentions, not just team members',
      });
    },
    async (argv) => {
      await runIssueCheck(argv.key, argv.all);
    }
  )

  .demandCommand(1, 'Please specify a command. Try: node index.js check-issue --key DEV-57151')
  .help()
  .alias('help', '?')
  .argv;
