'use strict';

const axios = require('axios');
const https = require('https');
const config = require('./config');

// Build the Basic Auth header once
const authHeader = Buffer.from(
  `${config.jira.email}:${config.jira.apiToken}`
).toString('base64');

const headers = {
  Authorization: `Basic ${authHeader}`,
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

// Corporate networks often use custom SSL certificates that Node.js doesn't
// trust by default. This agent disables certificate verification for internal
// Jira calls only — safe for a private PoC tool behind a company firewall.
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const BASE = config.jira.baseUrl;

/**
 * Search Jira issues updated within the last N hours using JQL.
 * Handles pagination via nextPageToken.
 *
 * Postman equivalent:
 *   GET {{JIRA_BASE_URL}}/rest/api/3/search/jql
 *   Params: jql=project=DEV AND updated>="-1h" ORDER BY updated DESC
 *           fields=summary,reporter,assignee,status
 *           maxResults=50
 *   Auth: Basic Auth (email + api token)
 *
 * @param {number} hours - How many hours back to search
 * @returns {Promise<Array>} - Array of Jira issue objects
 */
async function searchRecentIssues(hours = 1) {
  const jql = `project = ${config.jira.project} AND updated >= "-${hours}h" ORDER BY updated DESC`;
  const allIssues = [];
  let nextPageToken = undefined;

  do {
    const params = {
      jql,
      fields: 'summary,reporter,assignee,status,comment',
      maxResults: 50,
    };
    if (nextPageToken) params.nextPageToken = nextPageToken;

    const response = await axios.get(`${BASE}/rest/api/3/search/jql`, {
      headers,
      params,
      httpsAgent,
    });

    const data = response.data;
    allIssues.push(...(data.issues || []));
    nextPageToken = data.nextPageToken || null;
  } while (nextPageToken);

  return allIssues;
}

/**
 * Fetch all comments for a specific Jira issue.
 *
 * Postman equivalent:
 *   GET {{JIRA_BASE_URL}}/rest/api/3/issue/DEV-123/comment
 *   Params: maxResults=50&orderBy=-created
 *   Auth: Basic Auth
 *
 * @param {string} issueKey - e.g. "DEV-123"
 * @returns {Promise<Array>} - Array of comment objects
 */
async function getComments(issueKey) {
  const response = await axios.get(
    `${BASE}/rest/api/3/issue/${issueKey}/comment`,
    {
      headers,
      params: { maxResults: 50, orderBy: '-created' },
      httpsAgent,
    }
  );
  return response.data.comments || [];
}

/**
 * Fetch a single Jira issue by its key.
 *
 * Postman equivalent:
 *   GET {{JIRA_BASE_URL}}/rest/api/3/issue/DEV-57151
 *   Params: fields=summary,reporter,assignee,status,comment
 *   Auth: Basic Auth
 *
 * @param {string} issueKey - e.g. "DEV-57151"
 * @returns {Promise<Object>} - Jira issue object
 */
async function getIssue(issueKey) {
  const response = await axios.get(`${BASE}/rest/api/3/issue/${issueKey}`, {
    headers,
    params: { fields: 'summary,reporter,assignee,status' },
    httpsAgent,
  });
  return response.data;
}

/**
 * Fetch user profile info by accountId.
 *
 * Postman equivalent:
 *   GET {{JIRA_BASE_URL}}/rest/api/3/user?accountId=abc123
 *   Auth: Basic Auth
 *
 * @param {string} accountId
 * @returns {Promise<Object>} - User object { displayName, emailAddress, ... }
 */
async function getUserInfo(accountId) {
  const response = await axios.get(`${BASE}/rest/api/3/user`, {
    headers,
    params: { accountId },
    httpsAgent,
  });
  return response.data;
}

module.exports = { searchRecentIssues, getComments, getIssue, getUserInfo };
