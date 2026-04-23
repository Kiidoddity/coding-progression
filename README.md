# Road to Coding Mastery 🚀

A mobile-first PWA to track your coding course progress. Add to your iPhone home screen for a native app feel.

---

## Deploy to GitHub Pages (step by step)

### 1. Install Node.js
Download from https://nodejs.org (LTS version)

### 2. Create a GitHub repo
- Go to https://github.com/new
- Name it `course-tracker` (or anything you like)
- Set it to **Public**
- Click **Create repository**

### 3. Update the base path
Open `vite.config.js` and change `'/course-tracker/'` to match your repo name:
```js
base: '/your-repo-name/',
```

### 4. Set up the project locally
```bash
# Clone your new empty repo
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# Copy all these project files into the folder, then:
npm install
```

### 5. Deploy
```bash
npm run deploy
```
This builds the app and pushes it to a `gh-pages` branch automatically.

### 6. Enable GitHub Pages
- Go to your repo on GitHub
- Click **Settings** → **Pages**
- Under **Branch**, select `gh-pages` → `/ (root)`
- Click **Save**

Your app will be live at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```
(Takes ~1 minute to go live)

---

## Add to iPhone Home Screen

1. Open the URL in **Safari** on your iPhone
2. Tap the **Share** button (box with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **Add**

It will appear as a full-screen app with no browser UI. Your courses are saved locally on your phone.

---

## Run locally
```bash
npm run dev
```
Then open http://localhost:5173/course-tracker/
