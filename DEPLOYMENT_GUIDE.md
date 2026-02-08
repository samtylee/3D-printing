# Glenferrie Festival Market Stall App - Deployment Guide

## ✅ Project Complete!

Your kid-friendly market stall tracking app is now **fully functional and ready to deploy** with live Firebase sync across multiple devices.

---

## 📁 Files Created

1. **index.html** - Complete single-page app with 5 tabs (Setup, Products, Sales, Dashboard, Reports)
2. **style.css** - Kid-friendly styling with vibrant gradients and responsive design
3. **app.js** - Complete application logic with Firebase Realtime Database integration

---

## 🚀 Getting Started

### Option 1: Deploy to GitHub Pages (Recommended)

1. **Create a GitHub repository:**
   - Go to [github.com/new](https://github.com/new)
   - Name: `3d-printing-market-stall` (or any name you prefer)
   - Make it **Public** (required for GitHub Pages)
   - Click "Create repository"

2. **Upload your files:**
   - Click "Add file" → "Upload files"
   - Drag and drop: `index.html`, `style.css`, `app.js`
   - Click "Commit changes"

3. **Enable GitHub Pages:**
   - Go to Settings → Pages
   - Source: Set to "main" branch
   - Save
   - Your app will be available at: `https://yourusername.github.io/3d-printing-market-stall`

4. **Share the link** with parents/kids - everyone with the link can see live updates!

---

## 🔥 Firebase Configuration

✅ **Already configured!** Your Firebase project is set up with:

- **Project ID:** `d-printing-8c673`
- **Database URL:** `https://d-printing-8c673-default-rtdb.asia-southeast1.firebasedatabase.app`
- **Security:** Test mode (read/write enabled for all users with the link)

Your Firebase credentials are embedded in `app.js` lines 1-12.

---

## 💾 How It Works

### Data Storage (3-Layer System)

1. **In-Memory (appState)** - Fast, immediate updates
2. **Browser Storage (localStorage)** - Offline fallback
3. **Firebase Realtime Database** - Live sync across all devices

### Sync Status

- **Green dot + "Live Sync ✓"** = Connected to Firebase (all devices see updates instantly)
- **Orange dot + "Offline Mode"** = Using local storage (syncs when back online)

---

## 📋 Feature Overview

### 1. **Setup Tab**
- Add team members (kids running the stall)
- View sync status
- Load demo data (for testing)
- Reset all data

### 2. **Products Tab**
- Add products with names and prices
- Edit product prices
- Delete products
- All changes sync instantly

### 3. **Sales Tab**
- **Quick Sale Mode:** Tap product button → select payment method → recorded instantly
- **Detailed Mode:** Add multiple products with quantities in one transaction
- Adjust quantities or undo recent sales
- View all sales history

### 4. **Dashboard Tab**
- **Real-time metrics:**
  - Total Revenue
  - Total Costs (stall fee + insurance + Square reader)
  - Net Profit
  - Per-kid Payout
  - Break-even tracker with visual meter
- **Product chart** - Shows which items sold best
- **Confetti celebration** - Triggers when profit > $0! 🎉

### 5. **Reports Tab**
- **Print Team Report** - Full financial summary + product performance
- **Print All Kid Reports** - Individual earnings page for each team member
- PDF-ready (print to PDF in browser)

---

## 🎨 Kid-Friendly Design Features

✅ Large touch-friendly buttons (120px minimum)  
✅ Bright gradient backgrounds  
✅ Clear visual feedback on every action  
✅ Color-coded sections  
✅ Fun confetti animation when profitable  
✅ Responsive design (works on phones, tablets, laptops)  

---

## 📱 Testing

### Test Multi-Device Sync:

1. Open your GitHub Pages link on 2 different devices/browsers
2. Add a team member on Device 1
3. **Instantly appears on Device 2** ✓
4. Add a product on Device 2  
5. **Instantly appears on Device 1** ✓
6. Record a sale on either device
7. **Both devices update simultaneously** ✓

### Test Demo Data:

1. Go to **Setup tab**
2. Click "Load Demo Data"
3. Dashboard auto-populates with sample data
4. See confetti when profit triggers!

---

## 🐛 Troubleshooting

### "Offline Mode" showing even with internet?
- Check browser console (F12) for Firebase errors
- Verify Firebase credentials in app.js lines 1-12
- Clear browser cache and reload

### Data not syncing between devices?
- Ensure both devices are on **same URL**
- Check both have **internet connection**
- Verify Firebase Realtime Database is in **test mode**

### Charts not appearing?
- This is normal if no sales data exists yet
- Load demo data or add real sales first

---

## 🔐 Security Notes

🟢 **Test Mode Security** (Current Setup)
- Anyone with the link can read/write data
- Perfect for festival scenario (informal sharing)
- Not suitable for sensitive data

🔴 **If you need more security later:**
- Enable Firebase Authentication (requires login)
- Set specific permission rules in Firebase Console
- (Not needed for this use case)

---

## 📊 Cost Breakdown (Default Values)

The app comes pre-configured with example costs:

- **Stall Fee:** $175
- **Insurance:** $50  
- **Square Reader:** $50 (one-time)
- **Total:** $275

Edit these in **Costs tab** before running the event.

---

## 🎯 Pro Tips

1. **Before the Festival:**
   - Add all team members in Setup tab
   - Add all products with prices
   - Test with demo data to see dashboard
   - Print sample report

2. **During the Festival:**
   - Use Quick Sale Mode (faster for high volume)
   - Keep one device with Dashboard visible for everyone to see
   - Confetti triggers when you break even! 🎉

3. **After the Festival:**
   - Print reports for each kid
   - Screenshot the final dashboard
   - Save the URL for records

---

## 🚨 Important: Don't Lose Your Data

Your data is stored in **3 places:**
1. Your Firebase project (cloud backup)
2. Browser localStorage (local backup)
3. If you export/print reports (paper backup)

**Always keep the URL handy** - it's your link to all historical data!

---

## 📞 Support

If you encounter issues:

1. Check browser console (F12 → Console tab) for error messages
2. Verify all 3 files are uploaded (index.html, style.css, app.js)
3. Confirm Firebase credentials match your project
4. Try clearing browser cache and reloading

---

## 🎉 You're All Set!

Your app is ready for Glenferrie Festival! Share the link with parents and kids, and watch the magic happen in real-time. 

**Have fun at the market!** 🚀
