// src/githubApi.js

const GITHUB_API_BASE = "https://api.github.com";

export const fetchPullRequests = async (owner, repo) => {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=all`
  );
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
  return response.json();
};
