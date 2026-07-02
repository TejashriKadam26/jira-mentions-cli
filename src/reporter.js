'use strict';

// chalk v5+ is ESM-only; chalk v4 is CJS — our package.json uses chalk ^5
// We use a dynamic import to support ESM chalk in a CJS project
let chalk;
async function getChalk() {
  if (!chalk) {
    chalk = (await import('chalk')).default;
  }
  return chalk;
}

const DIVIDER = '─'.repeat(60);

/**
 * Print a single mention result to the terminal with colors.
 *
 * Expected output:
 * ────────────────────────────────────────────────────────────
 * 🎫 Ticket : DEV-56136  |  Status: In Progress
 *    Title  : Fix Login Issue
 *    Reporter: John Doe
 *
 * 💬 Comment by: Alex Smith  (2024-06-04T10:30:00.000Z)
 *    Mentioned : @Tejashri Kadam
 *    Message   : @Tejashri Could you review this issue?
 * ────────────────────────────────────────────────────────────
 *
 * @param {Object} issue        - Jira issue object
 * @param {Object} comment      - Jira comment object
 * @param {Array}  teamMentions - Filtered team member mentions
 * @param {string} message      - Plain text of the comment
 */
async function printMention(issue, comment, teamMentions, message) {
  const c = await getChalk();

  const ticketKey = issue.key;
  const title = issue.fields?.summary || '(no title)';
  const reporter = issue.fields?.reporter?.displayName || 'Unknown';
  const status = issue.fields?.status?.name || 'Unknown';
  const commentAuthor = comment.author?.displayName || 'Unknown';
  const commentTime = comment.updated || comment.created || '';
  const mentioned = teamMentions.map((m) => m.displayName).join(', ');

  console.log(c.gray(DIVIDER));
  console.log(
    c.bold.cyan(`🎫 Ticket : ${ticketKey}`) +
      c.gray(`  |  Status: `) +
      c.yellow(status)
  );
  console.log(c.white(`   Title   : ${title}`));
  console.log(c.gray(`   Reporter: ${reporter}`));
  console.log('');
  console.log(
    c.bold.green(`💬 Comment by: ${commentAuthor}`) +
      c.gray(`  (${commentTime})`)
  );
  console.log(c.magenta(`   Mentioned : ${mentioned}`));
  console.log(c.white(`   Message   : ${message}`));
}

/**
 * Print a summary header for the scan.
 */
async function printHeader(hours, project) {
  const c = await getChalk();
  console.log('');
  const timeRange = hours ? `last ${hours} hour(s)` : 'all time';
  console.log(c.bold.blue(`🔍 Scanning Jira [${project}] — ${timeRange}`));
  console.log(c.gray(DIVIDER));
}

/**
 * Print a summary footer.
 */
async function printSummary(count) {
  const c = await getChalk();
  console.log(c.gray(DIVIDER));
  if (count === 0) {
    console.log(c.yellow('✅ No Jira comments mentioning UI team members were found in the selected time range.'));
  } else {
    console.log(c.bold.green(`✅ Found ${count} Jira comment(s) where UI team members were mentioned.`));
  }
  console.log('');
}

module.exports = { printMention, printHeader, printSummary };
