---
name: tracking
description: Use when the user wants to track their work in Linear: what is assigned to me, what is next by priority, the status of an issue, or logging a follow-up (creating or updating an issue). Uses the bundled Linear MCP tools.
---

# LeCharge work tracking (Linear)

The `lecharge-core` plugin connects Linear through its MCP server. The Linear tools
(`mcp__linear-server__*`) appear automatically once the plugin is enabled. The first time,
Linear opens a browser to sign in (OAuth); after that it is remembered. Everything a rep
can see or change is scoped to their own Linear permissions. (No `allowed-tools` list here
on purpose, restricting it would block the Linear MCP tools this skill needs.)

Follow the LeCharge brand rules from `using-lecharge`: answer in Spanish, never use an em dash.

## LeCharge Linear conventions (apply these when filing or updating)

Teams:
- Operations (key OPS), Commercial (key COM), Dev (key DEV).
- Right now only the auto-created "LeCharge" team (key LEC) exists and is being renamed to
  Dev, so treat LEC as DEV for now. OPS and COM may not exist yet: if the target team is
  missing, file in DEV (LEC) and say so, do not invent a team.

Labels (workspace-wide, keep light): `landing`, `marketplace`, `infra`, plus Linear defaults
`Feature` and `Bug`. Apply the label that matches the work (marketplace work to `marketplace`,
landing work to `landing`, infra/CI to `infra`) plus `Feature` or `Bug` as fits.

Projects: "Landing Page" and "Marketplace" (both under Dev today; Commercial are the primary
users of Marketplace). Attach each issue to the project it belongs to. A cross-team initiative
(for example a "Chint rollout") is ONE project linked to OPS + COM + DEV, with issues in each
team and blocks / blocked-by relations for the handoffs between them.

Reference: the full conventions live in the Linear document "Linear base guidelines" (Dev team).
The marketplace architecture work is tracked under issue LEC-7.

## What you can help with

- "Que tengo asignado?": list issues assigned to the current user.
- "Que sigue?": list open issues by priority / next up, for the user or their team.
- "Estado de <issue>": look up an issue and summarize status, assignee, priority.
- "Registra un seguimiento": create an issue in the right team, with the right label and
  project (see conventions above), confirming the details in Spanish before creating.
- "Marca como listo" / status change: update an issue's state, after confirming.

## How to behave

1. Prefer the Linear MCP tools for anything about issues; do not guess issue data. Look up the
   real team, label, and project ids with the list tools before creating or updating.
2. For any change (create, update, comment, state change), restate what you are about to do in
   Spanish, including the team, label, and project, and get a yes before calling the write tool.
3. Summarize results as a short Spanish list: issue name, status, priority, who owns it.
4. If Linear is not connected yet, tell the user to enable the plugin and complete the Linear
   sign-in, then retry.
