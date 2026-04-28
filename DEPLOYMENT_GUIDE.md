# KrishiServiceBD Deployment Guide

আপনার krishiservicebd.com ডোমেইনে ওয়েবসাইট deploy করার জন্য সম্পূর্ণ গাইড।

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Beginners)
**Cost:** Free tier available
**Pros:** Easy setup, automatic deployments, global CDN

#### Steps:
1. **Vercel Account তৈরি করুন**
   - https://vercel.com এ যান
   - GitHub/Google দিয়ে sign up করুন

2. **Project Upload করুন**
   ```bash
   # GitHub এ repository তৈরি করুন
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/krishiservicebd.git
   git push -u origin main
   ```

3. **Vercel এ Import করুন**
   - "Import Project" ক্লিক করুন
   - GitHub repository select করুন
   - Framework: "Other" select করুন

4. **Environment Variables সেট করুন**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/krishiservicebd
   JWT_SECRET=your_jwt_secret_key
   ```

5. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `client/build`
   - Install Command: `npm install && cd client && npm install`

### Option 2: Railway (Easy & Affordable)
**Cost:** ~$5/month
**Pros:** Simple setup, built-in database

#### Steps:
1. **Railway Account তৈরি করুন**
   - https://railway.app এ যান
   - GitHub দিয়ে sign up করুন

2. **New Project Deploy করুন**
   - "Deploy from GitHub repo" select করুন
   - আপনার repository choose করুন

3. **Environment Variables সেট করুন**
   - Railway dashboard এ "Variables" tab এ যান
   - Add করুন:
     ```
     PORT=5000
     NODE_ENV=production
     MONGODB_URI=mongodb+srv://...
     JWT_SECRET=your_secret
     ```

4. **Domain Setup**
   - "Settings" → "Domains" এ যান
   - `krishiservicebd.com` add করুন

### Option 3: DigitalOcean (Full Control)
**Cost:** ~$6/month
**Pros:** Full server control, better performance

#### Steps:
1. **Droplet Create করুন**
   - DigitalOcean account তৈরি করুন
   - Ubuntu 22.04 Droplet create করুন ($6/month)
   - SSH key setup করুন

2. **Server Setup**
   ```bash
   # SSH connect করুন
   ssh root@your_server_ip
   
   # System update
   apt update && apt upgrade -y
   
   # Node.js install
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   apt-get install -y nodejs
   
   # MongoDB install
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   apt update
   apt install -y mongodb-org
   
   # Start MongoDB
   systemctl start mongod
   systemctl enable mongod
   ```

3. **Project Deploy**
   ```bash
   # Project clone করুন
   cd /var/www
   git clone https://github.com/yourusername/krishiservicebd.git
   cd krishiservicebd
   
   # Dependencies install
   npm install
   cd client && npm install && cd ..
   
   # Production build
   cd client && npm run build && cd ..
   
   # Environment file create
   nano server/.env
   ```
   
   Environment file content:
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=mongodb://localhost:27017/krishiservicebd
   JWT_SECRET=your_production_secret
   ```

4. **PM2 Setup (Process Manager)**
   ```bash
   # PM2 install
   npm install -g pm2
   
   # Start application
   pm2 start server/index.js --name krishiservicebd
   
   # Save PM2 process
   pm2 save
   pm2 startup
   ```

5. **Nginx Setup**
   ```bash
   # Nginx install
   apt install nginx
   
   # Create config file
   nano /etc/nginx/sites-available/krishiservicebd
   ```
   
   Nginx config content:
   ```nginx
   server {
       listen 80;
       server_name krishiservicebd.com www.krishiservicebd.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   ```bash
   # Enable site
   ln -s /etc/nginx/sites-available/krishiservicebd /etc/nginx/sites-enabled/
   
   # Test and restart Nginx
   nginx -t
   systemctl restart nginx
   ```

### Option 4: Heroku (Easy but Limited)
**Cost:** ~$7/month
**Pros:** Very easy setup

#### Steps:
1. **Heroku CLI Install**
   ```bash
   # Windows
   npm install -g heroku
   
   # Login
   heroku login
   ```

2. **Create App**
   ```bash
   heroku create krishiservicebd
   ```

3. **Add MongoDB**
   ```bash
   heroku addons:create mongolab:sandbox
   ```

4. **Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_secret
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

## 🌐 Domain Configuration

### DNS Settings (যেকোনো hosting এর জন্য)

আপনার domain registrar (যেখান থেকে krishiservicebd.com কিনেছেন) এ:

1. **A Record**:
   - Host: @ (or krishiservicebd.com)
   - Value: আপনার server IP address
   - TTL: 300

2. **CNAME Record**:
   - Host: www
   - Value: krishiservicebd.com
   - TTL: 300

3. ** propagation সময় দিন** (5-30 minutes)

## 📦 MongoDB Setup Options

### Option 1: MongoDB Atlas (Recommended)
**Cost:** Free tier available
**Setup:**
1. https://cloud.mongodb.com এ যান
2. Free cluster create করুন
3. Network access এ IP whitelist করুন (0.0.0.0/0 for all)
4. Database user create করুন
5. Connection string copy করুন

### Option 2: Local MongoDB
**Cost:** Free
**Setup:** Server setup এর সময় install করুন

## 🔧 Production Optimizations

### 1. Security
```bash
# Firewall setup
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable

# SSL Certificate (Let's Encrypt)
apt install certbot python3-certbot-nginx
certbot --nginx -d krishiservicebd.com -d www.krishiservicebd.com
```

### 2. Performance
```bash
# Enable gzip compression
# Nginx config এ add করুন:
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Browser caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Monitoring
```bash
# PM2 monitoring
pm2 monit

# Log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## 📱 Mobile App Deployment (Optional)

### React Native Setup
```bash
# যদি mobile app বানাতে চান
npx react-native init KrishiServiceBDApp
```

## 🔄 CI/CD Setup

### GitHub Actions (Automatic Deployment)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        npm install
        cd client && npm install
        
    - name: Build
      run: cd client && npm run build
      
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/krishiservicebd
          git pull origin main
          npm install
          cd client && npm install && npm run build && cd ..
          pm2 restart krishiservicebd
```

## 📊 Monitoring & Analytics

### Google Analytics Setup
1. Google Analytics account তৈরি করুন
2. Tracking code `client/public/index.html` এ add করুন

### Error Tracking
```javascript
// Sentry বা similar service integrate করতে পারেন
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
});
```

## 🚨 Troubleshooting

### Common Issues:
1. **MongoDB Connection Error**: Connection string check করুন
2. **Port Already in Use**: `sudo lsof -i :5000` দিয়ে check করুন
3. **Build Fails**: Node version check করুন (v18+ recommended)
4. **Domain Not Working**: DNS propagation wait করুন

### Debug Commands:
```bash
# PM2 logs
pm2 logs krishiservicebd

# Nginx logs
tail -f /var/log/nginx/error.log

# MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

## 💰 Cost Summary

| Platform | Monthly Cost | Pros | Cons |
|----------|-------------|------|------|
| Vercel | $0-$20 | Easy, Free tier | Limited control |
| Railway | $5 | Simple, Database included | Less control |
| DigitalOcean | $6 | Full control, Better performance | Manual setup |
| Heroku | $7 | Very easy | Expensive, limited |

## 🎯 Recommendation

**শুরুর জন্য:** Railway (সবচেয়ে easy)
**প্রফেশনাল:** DigitalOcean (সবচেয়ে control)
**বাজেট সমস্যা:** Vercel (Free tier)

## 📞 Support

যদি deployment এ সমস্যা হয়:
1. এই guide ধাপে ধাপে follow করুন
2. Error logs check করুন
3. Google/Stack Overflow এ search করুন
4. Hosting provider এর support contact করুন

Deploy সফল হলে আপনার website live হবে krishiservicebd.com এ!
