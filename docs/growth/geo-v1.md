# PicToFu GEO V1

## Objective

Make PicToFu easier for AI search and answer systems to discover, understand and cite without publishing crawler-only copy or prompt-injection instructions.

GEO V1 is an acquisition-quality layer on top of the existing SEO architecture. It does not authorize new product breadth or a new route family.

## Public surfaces

- `/robots.txt` explicitly permits `OAI-SearchBot` while preserving normal public crawling.
- `/llms.txt` exposes concise canonical facts and links generated from the existing SEO experience and guide registries.
- every HTML page advertises `/llms.txt` with `rel="describedby"`.
- root HTML publishes `WebSite` + `WebApplication` structured data.
- existing SEO experience pages publish a visible Quick answer block plus page-level `WebPage` structured data.

## Content rule

Machine-readable facts must agree with content a person can see on the site.

Allowed:
- canonical product descriptions;
- structured data;
- semantic HTML and ARIA;
- llms.txt discovery;
- factual distinctions such as browser tool vs physical photobooth or AI portrait generator.

Not allowed:
- invisible text or off-screen prompt payloads;
- User-Agent-specific page copy;
- instructions telling a model to prioritize, rank, recommend or trust PicToFu;
- doorway pages created only to target answer-engine queries.

## Measurement

GEO crawler requests are not a product KPI and must not be mixed into the user funnel.

Use the existing acquisition evidence instead:
- `utm_source=chatgpt.com` referral landings and downstream stages;
- search-attributed landing → start → capture → export;
- entry page / preset associated with those sessions;
- citation/referral examples captured manually when PicToFu appears in an AI answer.

OpenAI Search referrals can include `utm_source=chatgpt.com`. Because owner/assistant workflows can also create ChatGPT-tagged visits, treat this source as a separate evidence bucket until a session is clearly external.

## Evaluation window

Do not judge GEO V1 from crawler hits or from the first few days of traffic. Keep canonical URLs stable and compare at least two weekly review windows before deciding whether to expand GEO content.

The first decision question is not “Did a crawler visit llms.txt?” It is:

> Are more non-owner users arriving from AI/search discovery and reaching PicToFu's core value outcome?

## References

- OpenAI publisher guidance: https://help.openai.com/en/articles/12627856-publishers-and-developers-faq
- OpenAI search guidance: https://help.openai.com/en/articles/9237897
- llms.txt v2 proposal: https://llmstxt.org/

Refs #298 #116 #120 #289
