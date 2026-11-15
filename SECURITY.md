# Security policy

## Report privately

**Never open a public issue, discussion or pull request for a security problem.**

Report it through GitHub's private vulnerability reporting:
**[Report a vulnerability](https://github.com/nepal-dev-com/docs.nepal-dev.com/security/advisories/new)**
(the repository's *Security* tab, then *Report a vulnerability*). Only the maintainer sees the report.

If that page is not available to you, contact the maintainer,
[@puncoz](https://github.com/puncoz), through the contact on that GitHub profile, and say only that
you have a security report. Share the details once a private channel is agreed.

## What to report

- A vulnerability in the site or its build: for example a way to run script on a page, to read
  something the site should not serve, or to change what is published.
- **Private content on a public surface**: a secret, token, internal hostname, client name,
  personal data, or anything from a private project, on a page, in the search results, in
  `llms.txt` or `llms-full.txt`, in a page's Markdown, in a share image or in a diagram.
- A secret committed to this repository.

Report leaked content **at once**, even if you are unsure. Published is permanent: a page that was
served, indexed or crawled cannot be recalled, so the only remedy is to remove it and rotate
whatever it exposed, quickly.

## What to include

- What it is, and where: the address, file or commit.
- How it could be used.
- A fix, if you have one.

Do not include the secret itself or the private content. Point to where it is.

## What happens next

The maintainer acknowledges the report, confirms it, fixes it, and credits you if you wish. Data
exposure and unauthorised access are fixed first. Findings stay out of the public documentation
until they are fixed.

This project is maintained by volunteers and makes no promise of response times.

## Supported versions

Only what is deployed from `main` at [docs.nepal-dev.com](https://docs.nepal-dev.com) is supported.
There are no released versions of the site itself.

## More

The threat model, data classification, secrets inventory and audit checklist are in
[`content/docs/maintainer-guide/security/`](content/docs/maintainer-guide/security/index.mdx).
