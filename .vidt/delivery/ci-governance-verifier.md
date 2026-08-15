# CI governance verifier — Issue #34

Status: `pass_with_watch`

## Worker change

- Added workflow-level `concurrency` to `.github/workflows/ci.yml`.
- Group key is scoped by workflow plus PR number, falling back to branch ref for push events.
- Enabled `cancel-in-progress: true`.
- Kept the complete Node 24 verification job: install, lint, typecheck, production build.
- Kept `timeout-minutes: 12`.
- Did not add path-based skips.

## Independent verification lens

- GitHub Actions documentation confirms workflow-level `concurrency` can use dynamic context expressions and `cancel-in-progress: true` to replace older pending/running work in the same group.
- Including `github.workflow` prevents this workflow from unintentionally cancelling other workflows that might later use a similar ref-based key.
- Using `github.event.pull_request.number || github.ref` gives repeated runs for one PR a stable key while push runs fall back to the branch ref.
- `package-lock.json` is not yet present on `dev`, so switching to `npm ci` or enabling lockfile-backed npm caching in this slice would either conflict with PR #24 or create an inconsistent dependency policy. Phase B remains intentionally deferred.

## Runtime evidence

- First run created with the concurrency-aware workflow: run `31888722754` (#67), initially `pending`.
- This verifier commit intentionally creates a second run on the same PR. Expected behavior: the older concurrency-aware run is superseded/cancelled, while the newest run remains eligible to execute the full verification job.

## Remaining gates

- Observe the superseded-run state transition.
- Latest Node 24 CI must complete green before PR #29 merges.
- After `package-lock.json` reaches `dev`, implement Issue #34 Phase B (`npm ci` + npm cache) as a follow-up change.
