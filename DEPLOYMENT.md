# UniVerse BD deployment

## 1. Extract and open the project

Extract `UniVerse-BD-Vercel-ready.zip`, open the extracted folder, then right-click inside the folder and choose **Open in Terminal**. Confirm PowerShell is selected.

## 2. Check the site locally

```powershell
npm install
npm run build
npm run dev
```

Open `http://localhost:3000`. Press `Ctrl+C` in PowerShell when the check is finished.

## 3. Push to a new GitHub repository

Create an empty GitHub repository without a README, licence, or `.gitignore`. Then run:

```powershell
git init
git add .
git commit -m "Release UniVerse BD"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the example repository address with the HTTPS address copied from GitHub.

## 4. Update an existing GitHub repository

If the repository is already connected, use:

```powershell
git add .
git commit -m "Update UniVerse BD"
git push origin main
```

If PowerShell says there is nothing to commit, the same version is already committed.

## 5. Deploy on Vercel

1. Sign in to Vercel and choose **Add New > Project**.
2. Import the GitHub repository.
3. Keep **Framework Preset: Next.js**.
4. Leave Root Directory as `./` and do not add environment variables.
5. Select **Deploy**.

Future pushes to the `main` branch will automatically create a new Vercel deployment.

## 6. If Vercel still shows an older version

Open the Vercel project, select **Deployments**, open the newest deployment, and confirm its Git commit matches the latest GitHub commit. If necessary, use **Redeploy** on that newest deployment without using the previous build cache.
