# 🚀 Vercel Deploy Steps - KrishiServiceBD

## Step 1: GitHub এ Code Push করুন

```bash
# যদি Git না করে থাকেন
git init
git add .
git commit -m "KrishiServiceBD - Ready for Vercel deploy"

# GitHub Repository তৈরি করুন
git remote add origin https://github.com/yourusername/krishiservicebd.git
git branch -M main
git push -u origin main
```

## Step 2: MongoDB Atlas Setup (Free)

1. **MongoDB Atlas এ যান**: https://cloud.mongodb.com
2. **Sign Up** করুন (Free)
3. **Create Cluster**:
   - "Create a Cluster" ক্লিক করুন
   - M0 Sandbox (Free) select করুন
   - Region: Singapore (বাংলাদেশের জন্য fast)
   - Cluster name: `KrishiServiceBD`
   - "Create Cluster" ক্লিক করুন

4. **Database User Create করুন**:
   - "Database Access" → "Add New Database User"
   - Username: `krishiadmin`
   - Password: একটা strong password দিন
   - "Create User" ক্লিক করুন

5. **Network Access কনফিগার করুন**:
   - "Network Access" → "Add IP Address"
   - "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0)
   - "Confirm" ক্লিক করুন

6. **Connection String পান**:
   - "Database" → "Connect" → "Connect your application"
   - Driver: Node.js
   - Connection string copy করুন:
   ```
   mongodb+srv://krishiadmin:YOUR_PASSWORD@krishiservicebd.mongodb.net/krishiservicebd
   ```

## Step 3: Vercel এ Deploy করুন

1. **Vercel এ যান**: https://vercel.com
2. **Sign Up** করুন (GitHub দিয়ে)
3. **New Project** ক্লিক করুন
4. **GitHub Repository Import**:
   - `krishiservicebd` repository select করুন
   - "Import" ক্লিক করুন

5. **Project Configuration**:
   - Framework: `Other`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `client/build`
   - Install Command: `npm install && cd client && npm install`

6. **Environment Variables Add করুন**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://krishiadmin:YOUR_PASSWORD@krishiservicebd.mongodb.net/krishiservicebd
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   ```

7. **Deploy** ক্লিক করুন

## Step 4: Domain Connect করুন

1. **Vercel Dashboard** এ যান
2. **Project Settings** → **Domains**
3. **Add Domain** ক্লিক করুন
4. `krishiservicebd.com` type করুন
5. **Add** ক্লিক করুন

6. **DNS Settings Update করুন** (আপনার domain provider এ):
   ```
   Type: A
   Name: @ (or krishiservicebd.com)
   Value: 76.76.21.21
   TTL: 300
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 300
   ```

## Step 5: Verify Deploy

1. **Wait for DNS Propagation** (5-30 minutes)
2. **Check URL**: https://krishiservicebd.com
3. **Test Admin Panel**: https://krishiservicebd.com/admin

## 🔧 Troubleshooting

### Build Failed?
```bash
# Check package.json versions
node --version  # Should be 18+
npm --version   # Should be 8+

# Fix common issues
npm install
cd client && npm install
cd .. && npm run build
```

### MongoDB Connection Error?
- IP whitelist check করুন (0.0.0.0/0)
- Username/password verify করুন
- Connection string format check করুন

### Domain Not Working?
- DNS propagation wait করুন
- A record value verify করুন (76.76.21.21)
- Vercel domain settings check করুন

## 📱 Mobile Testing

Deploy সফল হলে:
1. Mobile phone এ https://krishiservicebd.com খুলুন
2. Responsive design check করুন
3. Order flow test করুন
4. Admin panel test করুন

## 🎯 Success Checklist

- [ ] GitHub এ code push হয়েছে
- [ ] MongoDB Atlas free cluster ready
- [ ] Vercel এ deploy success
- [ ] Domain DNS configured
- [ ] Website accessible on https://krishiservicebd.com
- [ ] Admin panel working
- [ ] Mobile responsive
- [ ] Order system working

## 🎉 Done!

আপনার krishiservicebd.com website live! 🚀

### What's Next?
1. **Add Sample Products**: Admin panel থেকে products add করুন
2. **Test Orders**: Demo orders place করুন
3. **Setup Email**: Order notifications এর জন্য
4. **Marketing**: Social media এ share করুন

### Support
- Vercel: Dashboard logs check করুন
- MongoDB: Atlas metrics check করুন
- GitHub: Issues check করুন

**আপনার agricultural e-commerce website ready!** 🌾
