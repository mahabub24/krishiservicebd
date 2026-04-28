# 🚀 Quick Deploy Guide - KrishiServiceBD

সবচেয়ে সহজ deployment পদ্ধতি (Railway ব্যবহার করে)

## ⚡ 5 Minutes Deploy

### Step 1: GitHub এ Upload করুন
```bash
git init
git add .
git commit -m "Ready for deploy"
git remote add origin https://github.com/yourusername/krishiservicebd.git
git push -u origin main
```

### Step 2: Railway এ Deploy করুন
1. https://railway.app এ যান
2. GitHub দিয়ে sign up করুন
3. "Deploy from GitHub repo" ক্লিক করুন
4. আপনার repository select করুন
5. "Deploy Now" ক্লিক করুন

### Step 3: Environment Variables সেট করুন
Railway dashboard এ "Variables" tab এ যান:
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/krishiservicebd
JWT_SECRET=your_secret_key_here
PORT=5000
```

### Step 4: MongoDB Setup (Free)
1. https://cloud.mongodb.com এ যান
2. Free cluster create করুন
3. Database user create করুন
4. Connection string copy করে Railway এ paste করুন

### Step 5: Domain Setup
1. Railway "Settings" → "Domains" এ যান
2. `krishiservicebd.com` add করুন
3. DNS settings update করুন:
   - A Record: @ → Railway IP
   - CNAME: www → krishiservicebd.com

## ✅ Done!
আপনার website live হবে krishiservicebd.com এ!

## 💰 Cost
- Railway: ~$5/month
- MongoDB: Free tier
- Domain: ~$10/year
- **Total: ~$70/year**

## 🆘 সমস্যা হলে?
1. Railway logs check করুন
2. MongoDB connection verify করুন  
3. DNS propagation wait করুন (5-30 mins)
