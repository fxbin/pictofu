# PicTofu Production Operator Handoff

Use this only after the launch-readiness PR is merged and its final CI is green.

## 1. Vercel read/preflight

Target:
- GitHub repository: `fxbin/pictofu`
- Vercel team: `fxbin` (`team_aa9uWwkGEP2RqX6gXCD7wMe1`)
- production domain: `pictofu.com`

In Vercel, import the existing GitHub repository into the resolved `fxbin` team.

Continue only if the imported project is clearly named `pictofu` and points to `fxbin/pictofu` with production branch `main`.

STOP if an existing project with the same name points to another repository or account.

## 2. Environment variables

Configure only values you own locally in the provider UI. Never paste secrets into Issues, PRs, or chat.

Optional analytics variables:

```text
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

If GA4 is not ready, leave analytics disabled rather than inventing an ID.

## 3. Deploy and domain

Deploy `main`, then bind both:
- `pictofu.com`
- optional `www.pictofu.com` redirecting to the canonical host

STOP if Vercel requests unrelated DNS changes or another project already owns the domain.

## 4. Return non-secret evidence

Return only:
- Vercel project name and project ID
- production deployment URL / deployment ID
- whether `pictofu.com` is verified and active
- whether home, `/online-photobooth`, `/korean-photobooth`, `/booth` load successfully
- whether GA test events arrive if analytics was enabled

The automated workflow resumes at provider read-back verification, not at deployment assumption.
