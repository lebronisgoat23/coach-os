# Vitrion iKala Sales Case Study

## One-line Positioning

Vitrion is a health decision-support MVP that demonstrates product thinking, AI safety boundaries, growth analytics, and hands-on GCP deployment.

## Resume Version

Personal Project | Vitrion / Coach OS - AI Health Decision Support Web App

- Built and deployed a Next.js health decision-support MVP that converts daily check-ins into structured observations, deterministic issues, and coach-reviewable recommendations.
- Implemented production deployment on Google Cloud Run using Docker, Artifact Registry, Cloud Build, IAM, and GitHub-triggered CI/CD.
- Added growth analytics instrumentation for signup intent, onboarding completion, first check-in, recommendation view, coach decision, and return visit events.
- Added Cloud Run operational readiness with `/api/healthz`, structured JSON logs, and Cloud Logging-compatible event payloads.
- Created 20 golden test cases to validate issue detection behavior and prevent recommendation regressions.

## Interview Talk Track

I did not just build a front-end demo. I turned a product hypothesis into a live cloud-deployed case study. The app has a user funnel, structured analytics events, a deterministic decision engine, coach approval workflow, health checks, Docker-based deployment, and GitHub-triggered CI/CD on GCP.

For a cloud or AI solution sales role, the value is that I can explain the business outcome to customers while also understanding the deployment and maintenance concerns that engineers and solution architects care about.

## GCP Proof Points

- Cloud Run hosts the standalone Next.js container.
- Docker makes the build reproducible.
- Artifact Registry stores tagged images.
- Cloud Build builds, pushes, and deploys from GitHub.
- IAM service account permissions were configured for build and deploy.
- Cloud Logging receives structured growth and ops logs.
- `/api/healthz` provides a simple production readiness endpoint.
- Secret Manager provides the server-only `ANALYTICS_EVENT_SALT` used to hash analytics identifiers before logs are written.

## Growth / MarTech Proof Points

- Signup intent measures top-of-funnel demand.
- Onboarding completion measures activation quality.
- First check-in measures the first value-producing action.
- Recommendation view measures the first decision-support moment.
- Coach decision measures acceptance, edit, and reject behavior.
- Return visit is the foundation for D1 and D7 retention.

## Next Dashboard

Recommended Looker Studio cards after exporting Cloud Logging events to BigQuery:

- Visitor -> onboarding completion conversion.
- Onboarding completion -> first check-in conversion.
- First check-in -> recommendation viewed conversion.
- Recommendation approve / edit / reject split.
- D1 and D7 return visit cohorts.
- API event volume and error rate.

## BigQuery Smoke Query

```sql
SELECT
  timestamp,
  jsonPayload.message AS message,
  jsonPayload.eventfamily AS event_family,
  jsonPayload.event.eventname AS event_name,
  jsonPayload.event.route AS route,
  jsonPayload.event.sessionidhash AS session_hash,
  jsonPayload.latencyms AS latency_ms
FROM `project-3cfc2037-b798-4b79-993.vitrion_growth_ops.run_googleapis_com_stdout`
ORDER BY timestamp DESC
LIMIT 10;
```

## Current GCP Resources

- Project ID: `project-3cfc2037-b798-4b79-993`
- Cloud Run service: `coach-os`
- Region: `asia-east1`
- Secret Manager secret: `vitrion-analytics-salt`
- BigQuery dataset: `vitrion_growth_ops`
- Logging sink: `vitrion-growth-events-to-bigquery`
