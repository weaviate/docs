# Weaviate Cloud console capture — 2026-09-17, dark theme (console is dark-only per Ivan)

Viewport 1538×784 (Retina JPEG). Org: Weaviate Docs. Free cluster: mcp-testing (daf4e2f1).
No callout annotations (no ImageMagick on this machine). Shot IDs refer to the review's
screenshot shot list; "gf" = frames matching the recording scripts.

| File | Shows | Maps to |
|---|---|---|
| overview-landing.jpg / overview-landing-loaded.jpg | Overview page after login: banner, Database + Engram cards, org line | gf1-1, gf3-1; new Overview docs section |
| S1-user-menu.jpg | User menu open, top-right (Account Settings, Logout) | S-1 → weaviate-cloud-enable-mfa.png context |
| S2-account-mfa.jpg | /account: MFA section, Enable MFA, status Disabled | S-2 → weaviate-cloud-mfa.png |
| S9-org-settings-actions.jpg | Org Settings inline on Overview + Leave/Delete blocked states | S-9 → weaviate-cloud-organization-settings.png; gf6-7/8 |
| dashboard-top.jpg | Free-cluster Dashboard: header, How to connect, Upgrade to Shared, update banner (v1.39.4), Object count + Endpoint health tiles, Endpoints | gf1-10, gf4-4 |
| cluster-selector-open.jpg | CLUSTER selector dropdown: search, FREE/SHARED badges, Create cluster | gf4-3 |
| dashboard-endpoints-apikeys-roles.jpg | API Keys empty state ("no API keys… yet") + Roles table (admin/viewer) | gf2-2, gf8-1 |
| S12-optimization-footer.jpg | Optimization profiles (Cost=HFRESH·AUTO current, Perf=HNSW·RQ-8 Shared-only) + footer: version 1.39.3 · AWS · eu-central-1 · Product Free · Deployment Shared | S-12, S-5 |
| S4-advanced-config-modules-top.jpg / S4-active-modules-bottom.jpg | Advanced configuration (Enable MCP Read-Only, auto schema, CORS) + full Active modules list | S-4 → weaviate-cloud-available-modules.png |
| S5-profile-advanced-lowres.jpg | Profile + advanced config in one viewport (615px only) | S-5 alt |
| S11-create-form-quota.jpg | Create-cluster form, Free selected: quota panel (100k obj · 1 collection · 3 tenants · 2k embed/day · 1k QA/mo), enforced profile note | S-11 |
| create-form-advanced-aws-region.jpg | "Free tier clusters run on AWS. Select your preferred AWS region below." | FAQ provider fix evidence |
| howto-connect-sdks.jpg | How-to-connect modal: Client SDKs tab (Py/TS/Go/Java, env vars) | gf2-9/10 |
| howto-connect-mcp.jpg | How-to-connect modal: MCP tab (claude mcp add + headers) | MCP availability evidence |
| S6-S7-embeddings-models.jpg | Embeddings page: toggle ON + three model cards (ColModernVBERT query limit 8,092) | S-6, S-7 |
| S8-model-evaluation.jpg | Model Evaluation Preview card, 5 free evals/month, Launch In Console | S-8 |
| S13-agents-plan.jpg | Agents page: Enable Agents ON, QA card, plan 0/1,000, resets 10/01/2026 | S-13 |
| free-cluster-paused-lowres.jpg | Paused free cluster: "We'll delete it on 10/3/2026 if it stays paused" | free-lifecycle evidence (decisions task) |
| apikey-dialog-filled-lowres.jpg / apikey-reveal-lowres.jpg / apikey-delete-confirm-lowres.jpg | Create API Key dialog (scope copy, charset, roles), reveal ("only time shown"), typed delete confirmation | gf2-4..7, gf7 (615px refs; key deleted, secret dead) |
| org-dropdown-lowres.jpg | ORGANIZATION dropdown: 3 orgs, Add new organization, Organization settings | gf6-1 (615px ref) |

Not captured: S-3 (MFA QR dialog — enrollment on Ivan's real account, skipped deliberately),
S-10 (billing — no billing section found on Overview/org settings/dropdown; needs Ivan to point
at it). Raw unrenamed frames in ../, including intermediate states.
