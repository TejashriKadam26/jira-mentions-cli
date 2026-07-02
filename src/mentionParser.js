'use strict';

const config = require('./config');

/**
 * Recursively walk an ADF (Atlassian Document Format) node tree
 * and extract all @mention nodes.
 *
 * Jira stores comment content as ADF JSON. A mention looks like:
 * { "type": "mention", "attrs": { "id": "accountId123", "text": "@Tejashri Kadam" } }
 *
 * @param {Object} adfNode - Root ADF node (comment.body)
 * @param {Array}  mentions - Accumulator (used in recursion)
 * @returns {Array<{ accountId: string, displayName: string }>}
 */
function extractMentions(adfNode, mentions = []) {
  if (!adfNode) return mentions;

  if (adfNode.type === 'mention') {
    mentions.push({
      accountId: adfNode.attrs?.id || '',
      displayName: adfNode.attrs?.text || '',
    });
  }

  // Recursively walk all child nodes
  (adfNode.content || []).forEach((child) => extractMentions(child, mentions));

  return mentions;
}

/**
 * Extract plain text from an ADF node (for displaying the comment message).
 *
 * @param {Object} adfNode
 * @returns {string}
 */
function extractText(adfNode) {
  if (!adfNode) return '';

  if (adfNode.type === 'text') {
    return adfNode.text || '';
  }
  if (adfNode.type === 'mention') {
    return adfNode.attrs?.text || '';
  }
  if (adfNode.type === 'hardBreak') {
    return '\n';
  }

  return (adfNode.content || []).map(extractText).join('');
}

/**
 * Filter a list of mentions to only include team members
 * defined in TEAM_ACCOUNT_IDS (.env).
 *
 * @param {Array<{ accountId: string, displayName: string }>} mentions
 * @returns {Array<{ accountId: string, displayName: string }>}
 */
function filterTeamMentions(mentions) {
  return mentions.filter((m) => config.teamAccountIds.includes(m.accountId));
}

/**
 * Check if a comment was posted by an automation/bot (not a real user).
 * Automation accounts have accountType = "app".
 *
 * @param {Object} comment - Jira comment object
 * @returns {boolean}
 */
function isAutomationComment(comment) {
  return comment?.author?.accountType === 'app';
}

module.exports = {
  extractMentions,
  extractText,
  filterTeamMentions,
  isAutomationComment,
};
