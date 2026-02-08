# 3D Printing Market Stall Tracker

A **kid-friendly web app** for tracking and visualizing a one-day market stall business with **live data sharing across devices via Firebase**.

## ✨ Features

### Core Functionality
- ✅ **Setup:** Manage team members and event details
- ✅ **Products:** Add products with customizable prices
- ✅ **Sales:** Track sales in Quick or Detailed mode with undo/adjust options
- ✅ **Dashboard:** Real-time metrics, profit tracker, and confetti celebration 🎉
- ✅ **Reports:** Print team summaries and individual earnings reports

### Live Sync
- 🔄 **Multi-Device Sync:** All devices viewing the same URL see updates instantly
- 📱 **Responsive Design:** Works on phones, tablets, and desktops
- 🌐 **Offline Ready:** Falls back to local storage if internet disconnects
- 🟢 **Sync Indicator:** Visual feedback showing connection status

### Data Management  
- 💾 **Dual Storage:** Firebase cloud + browser cache (never lose data)
- 📊 **Cost Tracking:** Stall fees, insurance, equipment costs
- 📈 **Analytics:** Revenue by product, top sellers, profit/loss per kid
- 🎨 **Print-Friendly:** Reports optimized for PDF export

---

## 🚀 Quick Start

### 1. Deploy to GitHub Pages
```bash
# Create new repo at github.com/new (make it PUBLIC)
# Upload: index.html, style.css, app.js
# Settings → Pages → main branch
# Share the generated URL
```

### 2. That's It!
Open the URL on any device with internet → all devices sync in real-time

---

## 🏗️ Architecture

### Files
- **index.html** - App structure (5 tabs, forms, modals, canvas)
- **style.css** - Kid-friendly styling (gradients, responsive, print-friendly)
- **app.js** - Complete logic (Firebase sync, calculations, event handlers)

### Tech Stack
- **Frontend:** Vanilla HTML5/CSS3/JavaScript (no frameworks)
- **Database:** Firebase Realtime Database (v10.7.0 via CDN)
- **Storage:** 3-layer system (appState → localStorage → Firebase)
- **Deployment:** GitHub Pages (free, no backend needed)

### Firebase Config
```javascript
Project ID: d-printing-8c673
Database: asia-southeast1 region
Mode: Test (read/write enabled)
URL: https://d-printing-8c673-default-rtdb.asia-southeast1.firebasedatabase.app
```

---

## 📋 Tab Breakdown

### **Setup**
- Add/remove team members
- Sync status indicator
- Load demo data (pre-populate dashboard)
- Reset all data

### **Products** 
- Add new products (name + price)
- Edit prices anytime
- Delete products
- All changes sync instantly

### **Sales**
- **Quick Mode:** Tap product → select payment → done
- **Detailed Mode:** Add multiple items per transaction
- View sales history with timestamps
- Undo last sale or adjust quantities
- Payment methods: Cash, Card, Mobile

### **Dashboard**
- Real-time financial summary
- Break-even progress meter
- Product sales chart (visual performance)
- Per-child payout calculator
- **Confetti animation** when profit > $0

### **Reports**
- Print team summary (revenue, costs, top products)
- Print individual earnings for each team member
- PDF-ready output

---

## 💡 Usage Examples

### Festival Day Workflow
```
1. Team Setup → Add kids' names
2. Products → Add items for sale + prices
3. Sales Tab → Record each transaction
4. Parents watch Dashboard in real-time
5. After Festival → Print reports for each kid
```

### Multi-Device Sync
```
Device 1 (Kids at stall):
- Record sales constantly

Device 2 (Parents):  
- Watch Dashboard in real-time
- See profit ticker and confetti
- No manual refresh needed!
```

### Demo Data
```
Setup → "Load Demo Data"
↓
Dashboard shows:
- 5 team members
- 5 products
- 7 sample sales
- Live profit calculation
- Confetti celebration
```

---

## 🎨 Design Features

| Feature | Benefit |
|---------|---------|
| Large buttons (120px+) | Easy for kids to tap |
| Vibrant gradients | Kid-friendly visual appeal |
| Real-time updates | Instant feedback on actions |
| Color-coded sections | Easy navigation |
| Confetti animation | Celebration when profitable |
| Responsive layout | Works on any screen size |
| Print-friendly CSS | Perfect reports |
| Sync indicator | Know when connected |

---

## 🔧 Customization

### Change Default Costs
Edit in **app.js** (or via app UI):
```javascript
costs: {
    stallFee: 175,      // Edit this
    insurance: 50,      // Edit this  
    squareReader: 50    // Edit this
}
```

### Change Event Name
Edit in **index.html** or **app.js**:
```javascript
reportMeta: {
    eventName: "Glenferrie Festival"  // ← Change this
}
```

### Add More Products to Demo
Edit `loadDemoData()` function in **app.js** to add more items.

---

## 📊 Data Persistence

Your data is stored in **3 places** for maximum reliability:

### 1. **In-Memory (appState)** 
- Lightning-fast access
- Lost if page closes
- Synced to other layers constantly

### 2. **Browser Storage (localStorage)**
- Survives page refresh
- ~5-10MB limit per domain
- Offline fallback when Firebase unavailable

### 3. **Firebase Database**
- Cloud backup (never lost)
- Syncs across all devices  
- Real-time updates
- Test mode allows free read/write

---

## 🌐 Deployment Options

### Option 1: GitHub Pages ⭐ (Recommended)
- **Cost:** Free
- **Setup:** 5 minutes
- **URL:** `https://username.github.io/repo-name`
- **Pros:** Fast, reliable, no backend needed
- **Cons:** Publicly accessible (OK for festival)

### Option 2: Vercel/Netlify
- **Cost:** Free tier available
- **Setup:** Connect GitHub repo
- **URL:** Custom domain possible
- **Pros:** Easy deploys, custom domains
- **Cons:** Slightly slower than GitHub Pages

### Option 3: Self-Hosted
- **Cost:** Server cost (Heroku, etc.)
- **Setup:** Complex
- **Pros:** Full control
- **Cons:** Not needed for this app

---

## 🛡️ Security

### Current Setup (Test Mode)
✅ Anyone with URL can read/write  
✅ Perfect for informal festival sharing  
✅ No authentication needed  
✅ Data visible only to URL holders  

### If You Need More Security Later
🔓 Enable Firebase Authentication  
🔓 Set custom security rules  
🔓 Requires login  
(Not needed for this use case)

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Offline Mode" showing | Check internet, clear cache, reload |
| Data not syncing | Verify both devices on same URL + online |
| Charts not showing | Load demo data or add real sales first |
| Confetti not triggering | Profit needs to be > $0 |
| Reports blank | Add team members + sales first |

---

## 📱 Browser Support

✅ Chrome/Edge (latest)  
✅ Safari (latest)  
✅ Firefox (latest)  
✅ Mobile browsers (iOS Safari, Chrome Mobile)  

---

## 🎯 Tips & Tricks

### Before Festival
- [ ] Add all team member names
- [ ] Set correct product prices  
- [ ] Update cost values (stall fee, insurance)
- [ ] Test with demo data
- [ ] Print sample report
- [ ] Share URL with parents

### During Festival
- Keep Sales tab active for quick entries
- Have Dashboard on second device/display
- Watch for confetti celebration 🎉

### After Festival
- Print reports for each kid
- Screenshot final dashboard
- Save URL for future reference

---

## 📞 Help & Support

### Encountering Errors?
1. Open browser console (F12 → Console tab)
2. Check for error messages
3. Verify files uploaded correctly
4. Clear cache and reload
5. Check Firebase connection status

### Reporting Issues
- Check the troubleshooting section above
- Verify Firebase credentials
- Confirm all 3 files are present

---

## 📜 Version Info

- **Last Updated:** 2024
- **Framework:** Vanilla JavaScript (no dependencies)
- **Firebase SDK:** v10.7.0
- **Compatibility:** Modern browsers (ES6+)

---

## 🎉 Have Fun!

This app was built to make your market stall management easy and fun. Kids track sales, parents watch in real-time, and everyone celebrates when you hit profit! 

**Enjoy Glenferrie Festival!** 🚀
