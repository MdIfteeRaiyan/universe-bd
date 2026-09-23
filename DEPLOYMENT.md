# CampusChoice BD deployment

## Push with PowerShell

Open the extracted project folder, right-click inside it, choose **Open in Terminal**, then run:

```powershell
git init
git add .
git commit -m "Release CampusChoice BD"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the example repository address with the HTTPS address copied from your GitHub repository.

If the repository is already connected, use this shorter update flow:

```powershell
git add .
git commit -m "Update CampusChoice BD"
git push
```

If `origin` already exists but points to the wrong repository:

```powershell
git remote set-url origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

## Deploy on Vercel

1. Sign in to Vercel and select **Add New → Project**.
2. Import the GitHub repository you pushed.
3. Keep **Framework Preset: Next.js**.
4. Leave Root Directory as `./` and keep the default build settings.
5. Select **Deploy**.
6. After the first deployment, open the Vercel project and enable **Web Analytics** and **Speed Insights**.

No environment variables are required for the site to work. These optional variables enable launch services:

- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`: verification token supplied by Google Search Console.
- `NEXT_PUBLIC_FEEDBACK_EMAIL`: destination used by the profile correction form. If omitted, reports are copied locally instead of sent.

Later GitHub pushes will trigger Vercel deployments automatically.

## Verify before publishing

```powershell
npm install
npm run release:check
```

The GitHub workflow also runs the same release checks after every push and pull request.

## If Vercel shows an older version

Open the Vercel project and select **Deployments**. The newest deployment should show the same commit message as GitHub. If it does not, open the newest GitHub-connected deployment and select **Redeploy** without using the previous build cache.
