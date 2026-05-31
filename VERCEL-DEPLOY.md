# Vercel Deployment Guide -- Claim Status Radar

## 1. Connect the Repo

1. Go to https://vercel.com/dashboard
2. Click **Add New Project**
3. Import your GitHub repo
4. Framework Preset will auto-detect **Next.js** -- leave it
5. Build command: `bun run build` (auto-detected)
6. Output directory: leave default (`.next`)
7. **Do not deploy yet** -- set env vars first (Step 2)

## 2. Set Environment Variables

In the Vercel project settings, go to **Settings > Environment Variables** and add:

| Variable | Value | Notes |
|----------|-------|-------|
| `AUTH_USERNAME` | `admin` | Or whatever you want for demos |
| `AUTH_PASSWORD` | `your_password` | Or whatever you want for demos |
| `NEXT_PUBLIC_APP_ENV` | `mock` | Use `mock` for demos, `sandbox` if you want live probes |
| `OPTUM_CLIENT_ID` | *(your Optum client ID)* | Only needed for sandbox mode |
| `OPTUM_CLIENT_SECRET` | *(your Optum client secret)* | Only needed for sandbox mode |
| `OPTUM_AUTH_URL` | *(your Optum auth endpoint)* | Only needed for sandbox mode |
| `OPTUM_ELIGIBILITY_URL` | *(your Optum eligibility endpoint)* | Only needed for sandbox mode |
| `OPTUM_PROVIDER_TAX_ID` | *(your provider tax ID)* | Only needed for sandbox mode |
| `ANTHROPIC_API_KEY` | *(your Anthropic API key)* | Only needed for sandbox/production |

**For mock-mode-only deployment, you only need these three:**
- `AUTH_USERNAME`
- `AUTH_PASSWORD`
- `NEXT_PUBLIC_APP_ENV` = `mock`

All other variables can be left blank. The app runs entirely on fixture data in mock mode.

## 3. Deploy

Click **Deploy**. Build takes about 30 seconds. Vercel gives you a URL like `claim-status-radar-xxxx.vercel.app`.

## 4. Custom Domain (Optional)

1. Go to **Settings > Domains**
2. Add your custom domain
3. Vercel will show DNS records to add:
   - If using a subdomain: add a **CNAME** record pointing to `cname.vercel-dns.com`
   - If using apex domain: add an **A** record pointing to `76.76.21.21`
4. Wait for DNS propagation (usually under 5 minutes with Cloudflare, up to 48 hours elsewhere)
5. Vercel auto-provisions SSL

## 5. Redeployment

Any push to `main` triggers an automatic redeployment. No manual steps needed.

To manually redeploy (e.g., after changing env vars):
1. Go to the project in Vercel dashboard
2. Click **Deployments** tab
3. Click the three-dot menu on the latest deployment
4. Click **Redeploy**

Changing environment variables alone does **not** trigger a redeploy. You must redeploy manually or push a commit after changing env vars.

## 6. Switching Modes on Vercel

To switch between mock and sandbox on the deployed app:

**Option A -- Runtime toggle (no redeploy):**
The mode toggle button in the header lets users switch between Mock and Sandbox at runtime. This works without any env var changes.

**Option B -- Change the default mode:**
1. Go to **Settings > Environment Variables**
2. Change `NEXT_PUBLIC_APP_ENV` from `mock` to `sandbox` (or vice versa)
3. Redeploy (env var changes require a redeploy to take effect)

For demos, keep `NEXT_PUBLIC_APP_ENV=mock` as the default. The runtime toggle handles the rest.

## 7. Troubleshooting

**Build fails:**
- Check that no env vars have trailing whitespace or quotes in Vercel
- Run `bun run build` locally to reproduce

**Login doesn't work:**
- Verify `AUTH_USERNAME` and `AUTH_PASSWORD` are set in Vercel env vars
- Redeploy after adding/changing env vars

**Sandbox mode shows no diagnostic data:**
- Verify all Optum env vars are set (`OPTUM_CLIENT_ID`, `OPTUM_CLIENT_SECRET`, `OPTUM_AUTH_URL`, `OPTUM_ELIGIBILITY_URL`)
- Verify `ANTHROPIC_API_KEY` is set
- Check Vercel function logs: **Deployments > (latest) > Functions** tab

**Checking logs:**
- Vercel dashboard: **Deployments > (latest) > Logs**
- Or use Vercel CLI: `vercel logs <your-domain>`
