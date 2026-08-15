# PicTofu Release Gate

The current release evidence matrix lives at `release-readiness.md`.

The v0.1 release decision is intentionally fail-closed:

- repository CI green alone is insufficient;
- Vercel project/deployment/domain identity must be read back;
- camera and export/share physical-browser gates from Issues #2/#3 must be satisfied;
- Search Console setup must be completed or explicitly accepted as a post-ship non-blocker by the owner.

Until those conditions are met, the semantic release verdict is `HOLD`.
