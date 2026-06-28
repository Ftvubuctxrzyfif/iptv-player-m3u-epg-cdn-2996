# 🔄 How to Restore Your LG webOS TV IPTV Player

## Your files are safe in the Kliv cloud! 

Since you deleted the files from your local computer, here's how to get them back:

## Option 1: Download from Kliv Dashboard (EASIEST)
1. Log in to your Kliv account
2. Go to your projects dashboard
3. Find the project: `iptv-player-m3u-epg-cdn-2996`
4. Click "Download" or "Export Project"
5. Extract the ZIP file to your desired location

## Option 2: Recreate from Scratch (Below Guide)
Follow the instructions below to recreate all files.

## Option 3: Check GitHub First
If you already uploaded to GitHub:
- Visit: https://github.com/YOUR_USERNAME/lgwebos-pipo
- Click green "Code" button
- Select "Download ZIP"
- Extract to your computer

---

## 📱 Your LG webOS TV IPTV Player - Complete File List

When restored, your project will contain:

### Root Files:
- `appinfo.json` - webOS TV app manifest
- `package.json` - Dependencies and build scripts
- `README.md` - Complete documentation
- `WEBOS_BUILD.md` - Build instructions
- `UPLOAD_TO_GITHUB.md` - GitHub upload guide
- `index.html` - App entry point
- `vite.config.ts` - Build configuration
- `.gitignore` - Git ignore rules

### Source Files (`src/`):
- `App.tsx` - Main app component
- `main.tsx` - App entry point
- `App.css` - App styles
- `index.css` - Global styles

### Components (`src/components/`):
- `VideoPlayer.tsx` - TV-optimized video player
- `IptvChannelList.tsx` - Channel list component
- `ChannelList.tsx` - Alternative channel list
- `PortalConfig.tsx` - Portal configuration form

### Pages (`src/pages/`):
- `App.tsx` - Main application page
- `Login.tsx` - Login page
- `Index.tsx` - Landing page
- `NotFound.tsx` - 404 page
- `Dashboard.tsx` - Dashboard page

### Hooks (`src/hooks/`):
- `use-tv-navigation.ts` - TV remote control navigation

### UI Components (`src/components/ui/`):
- Complete set of shadcn/ui components (40+ files)

### Utilities (`src/lib/`):
- `utils.ts` - Utility functions
- `shared/kliv-auth.js` - Authentication SDK
- `shared/kliv-database.js` - Database SDK
- `shared/kliv-content.js` - Content SDK
- `shared/kliv-functions.js` - Functions SDK

### Public Files (`public/`):
- `placeholder.svg` - Placeholder image
- `robots.txt` - SEO robots file
- Icon files for webOS TV

## 🚀 After Restoration:

Once you have your files back, you can:

1. **Run the development server:**
   ```bash
   cd /path/to/project
   npm install
   npm run dev
   ```

2. **Build for webOS TV:**
   ```bash
   npm run build
   npm run webos:build
   ```

3. **Upload to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "LG webOS TV IPTV Player"
   git remote add origin https://github.com/YOUR_USERNAME/lgwebos-pipo.git
   git push -u origin main
   ```

## 📞 Need Help?
The files are safe and can be fully restored!