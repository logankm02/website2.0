# Website 2.0

React + Vite + Tailwind CSS personal portfolio site, deployed to Cloudflare Pages.

## Deploying

Build and deploy with Wrangler (must be run in an interactive terminal — Claude cannot auth):

```
npm run build && wrangler pages deploy dist
```

If Wrangler is authed to the wrong account:
```
wrangler logout
wrangler login
```
Then re-run the deploy command.

The site is **not** on GitHub Pages — ignore the `gh-pages` script in package.json.
