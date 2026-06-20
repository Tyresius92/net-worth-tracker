# End-of-Life Monitoring and Vulnerability Patching Policy

## Purpose

Ensure that The Ledger runs on supported, actively maintained software and that disclosed vulnerabilities are remediated within a defined timeframe.

## Scope

All runtime software, frameworks, and dependencies used by The Ledger application and its build/deploy pipeline.

## EOL Monitoring

The following key runtime components are actively tracked for end-of-life status:

| Component | Current version | EOL date         | Source                                                 |
| --------- | --------------- | ---------------- | ------------------------------------------------------ |
| Node.js   | 22 LTS          | April 2027       | [endoflife.date/nodejs](https://endoflife.date/nodejs) |
| SQLite    | 3.x             | No planned EOL   | [sqlite.org](https://www.sqlite.org)                   |
| macOS     | Sequoia (15.x)  | ~Sep 2027 (est.) | [endoflife.date/macos](https://endoflife.date/macos)   |

[endoflife.date](https://endoflife.date) is the canonical reference for EOL timelines. Versions are upgraded before they reach EOL rather than after.

When a new LTS version of Node.js is released (typically every October), the upgrade is evaluated and scheduled before the current version exits active support. The `.nvmrc` file and `package.json` `engines` field are updated as part of the upgrade.

## Vulnerability Patching SLA

Vulnerabilities are identified through two automated mechanisms:

- **Dependabot** monitors npm and GitHub Actions dependencies continuously and opens pull requests when vulnerabilities are disclosed.
- **npm audit** runs in CI on every push and pull request, blocking deploys on high or critical severity findings.

Once a vulnerability is identified, it must be patched (dependency updated and deployed) within the following timeframes, based on the CVSS severity rating from the advisory:

| Severity        | Timeframe |
| --------------- | --------- |
| Critical / High | 30 days   |
| Medium          | 90 days   |
| Low             | 180 days  |

## Review Cadence

This policy is reviewed when tooling, infrastructure, or runtime versions change.
