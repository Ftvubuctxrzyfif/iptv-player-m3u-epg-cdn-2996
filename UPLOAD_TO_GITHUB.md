# 🚀 How to Upload Your Project to GitHub

## Step 1: Create GitHub Account (if you don't have one)
1. Go to **https://github.com**
2. Click **"Sign up"** and create your account
3. Verify your email address

## Step 2: Create a New Repository
1. Go to **https://github.com**
2. Click the **"+"** icon in the top-right corner
3. Click **"New repository"**

## Step 3: Fill in Repository Details
- **Repository name**: `lgwebos-pipo`
- **Description**: `IPTV Player for LG webOS TV - Live TV streaming application`
- **Public or Private**: Choose whichever you prefer
- **⚠️ IMPORTANT**: UNCHECK "Add a README file" (we already have one)
- **⚠️ IMPORTANT**: UNCHECK "Add .gitignore" (we already have one)
- Click **"Create repository"**

## Step 4: Copy the Repository URL
After creating, GitHub will show you a URL like:
```
https://github.com/YOUR_USERNAME/lgwebos-pipo.git
```
Copy this URL!

## Step 5: Open Terminal/Command Prompt on Your Computer

### **Windows:**
- Press `Win + R`
- Type `cmd` and press Enter
- Or search for "Command Prompt"

### **Mac:**
- Press `Cmd + Space`
- Type "Terminal" and press Enter

### **Linux:**
- Press `Ctrl + Alt + T`

## Step 6: Navigate to Your Project Folder
```bash
cd /path/to/your/project
```

**Example on Windows:**
```bash
cd C:\Users\YourName\Documents\iptv-player-project
```

**Example on Mac/Linux:**
```bash
cd /Users/yourname/Documents/iptv-player-project
```

## Step 7: Run These Commands One by One

### **Command 1: Initialize Git**
```bash
git init
```

### **Command 2: Add All Files**
```bash
git add .
```

### **Command 3: Make First Commit**
```bash
git commit -m "Initial commit: IPTV Player for LG webOS TV"
```

### **Command 4: Connect to GitHub**
Replace `YOUR_USERNAME` with your actual GitHub username:
```bash
git remote add origin https://github.com/YOUR_USERNAME/lgwebos-pipo.git
```

### **Command 5: Push to GitHub**
```bash
git branch -M main
git push -u origin main
```

## Step 8: Enter GitHub Credentials
- **Username**: Your GitHub username
- **Password**: Your GitHub **Personal Access Token** (NOT your account password)

### How to get Personal Access Token:
1. Go to GitHub.com → Click your profile picture → **Settings**
2. Scroll down → Click **"Developer settings"**
3. Click **"Personal access tokens"** → **"Tokens (classic)"**
4. Click **"Generate new token"** → **"Generate new token (classic)"**
5. Give it a name (like "Upload Token")
6. Select **"repo"** scope
7. Click **"Generate token"**
8. Copy the token (you won't see it again!)
9. Use this token as your password

## Step 9: Check Your Repository
After successful push, go to:
```
https://github.com/YOUR_USERNAME/lgwebos-pipo
```

You should see all your project files there!

## 🎯 Quick Summary - All Commands Together
```bash
git init
git add .
git commit -m "Initial commit: IPTV Player for LG webOS TV"
git remote add origin https://github.com/YOUR_USERNAME/lgwebos-pipo.git
git branch -M main
git push -u origin main
```

## 🔧 Common Problems & Solutions

### **Problem: "git is not recognized"**
- **Solution**: Install Git from https://git-scm.com/downloads

### **Problem: "Permission denied"**
- **Solution**: Use your Personal Access Token (not your password)

### **Problem: "remote origin already exists"**
- **Solution**: Run this command first:
  ```bash
  git remote remove origin
  ```

### **Problem: "failed to push"**
- **Solution**: Make sure you created the repository on GitHub first

## 📋 What You Should See on GitHub
After successful upload, your repository will contain:
- 📄 README.md
- 📄 appinfo.json  
- 📄 package.json
- 📁 src/ (with all your code)
- 📁 public/ (with icons)
- 📁 components/
- All your IPTV Player files!

## 🎉 Success!
Your **lgwebos-pipo** project is now on GitHub and can be:
- Shared with others
- Downloaded from any computer
- Used as backup
- Collaborated on with other developers

---

**Need more help?** Each step shows exactly what to do - just follow them in order!