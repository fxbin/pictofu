# Search Console Handoff

Current runtime has no connected Search Console action, so setup is an operator task.

After `pictofu.com` serves the intended production build:

1. Add or verify the `pictofu.com` property in Google Search Console.
2. Verify ownership using the DNS/provider method you control.
3. Submit `https://pictofu.com/sitemap.xml`.
4. Inspect the home page plus `/online-photobooth` and `/korean-photobooth`.
5. STOP if Search Console reports a different canonical host, blocked robots policy, or ownership conflict.

Return only non-secret status:
- property verified: yes/no
- sitemap accepted: yes/no/pending
- representative URL inspection status

Do not paste DNS tokens or verification secrets into GitHub or chat.
