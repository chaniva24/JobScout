# JobScout Australia

A fast, mobile-friendly Australian job board for casual, internship, graduate and part-time roles. It is a static site designed for GitHub Pages. A scheduled workflow refreshes listings from Adzuna without exposing API credentials in the browser.

## Publish on GitHub Pages

1. Create an empty GitHub repository and upload this project's contents to its root.
2. Create a free Adzuna developer account and obtain an Application ID and key.
3. In the repository, open **Settings → Secrets and variables → Actions** and create `ADZUNA_APP_ID` and `ADZUNA_APP_KEY`.
4. Open **Settings → Pages** and choose **GitHub Actions** as the source.
5. Open **Actions → Update job listings → Run workflow**. The workflow refreshes jobs every six hours and deploys the site.

Until the secrets are configured, the included demonstration listings keep the interface usable.

## Local preview

Run `python3 -m http.server 8000`, then visit `http://localhost:8000`.

## Notes

- Listings link to the source site; JobScout does not accept applications itself.
- Adzuna usage is subject to its API terms and quotas.
- Adjust the search terms or result limit in `scripts/fetch-jobs.mjs`.
