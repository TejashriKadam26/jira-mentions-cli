'use strict';

require('dotenv').config();

/**
 * Centralized config loaded from .env
 * All modules import from here — never read process.env directly elsewhere.
 */
const config = {
  jira: {
    baseUrl: process.env.JIRA_BASE_URL,
    email: process.env.JIRA_EMAIL,
    apiToken: process.env.JIRA_API_TOKEN,
    project: process.env.JIRA_PROJECT || 'DEV',
  },

  // Pre-parsed array of team member accountIds
  teamAccountIds: (process.env.TEAM_ACCOUNT_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean),

  teams: {
    webhookUrl: process.env.TEAMS_WEBHOOK_URL || '',
  },
};

// Validate required fields on startup
function validateConfig() {
  const missing = [];
  if (!config.jira.baseUrl) missing.push('JIRA_BASE_URL');
  if (!config.jira.email) missing.push('JIRA_EMAIL');
  if (!config.jira.apiToken) missing.push('JIRA_API_TOKEN');

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env file.'
    );
  }
}

validateConfig();

module.exports = config;
