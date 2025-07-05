// src/GitHubPRList.js

import React from "react";

const GitHubPRList = ({ pullRequests }) => {
  if (!pullRequests || pullRequests.length === 0) return null;

  return (
    <div
      style={{
        marginTop: "40px",
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "10px",
      }}
    >
      <h2>GitHub Pull Requests</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {pullRequests.map((pr) => (
          <li key={pr.id} style={{ marginBottom: "15px" }}>
            <a
              href={pr.html_url}
              target="_blank"
              rel="noreferrer"
              style={{ fontWeight: "bold" }}
            >
              #{pr.number}: {pr.title}
            </a>
            <div>
              Status: <strong>{pr.state}</strong> | Merged:{" "}
              {pr.merged_at ? "✅ Yes" : "❌ No"}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GitHubPRList;
