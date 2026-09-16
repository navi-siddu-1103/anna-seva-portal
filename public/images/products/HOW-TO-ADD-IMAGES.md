# 📁 Where to Add Your Product Images

## Current Directory Structure

```
anna-seva-portal-main/
├── public/
│   └── images/
│       └── products/              ← ADD YOUR IMAGES HERE! 
│           ├── IMAGE-GUIDE.md
│           ├── README.md
│           ├── placeholder.svg
│           │
│           ├── rice.jpg          ← Add this file
│           ├── wheat.jpg         ← Add this file
│           ├── sugar.jpg         ← Add this file
│           ├── toor-dal.jpg      ← Add this file
│           └── cooking-oil.jpg   ← Add this file
│
├── src/
│   ├── app/
│   ├── components/
│   └── lib/
│       └── product-images.ts     ← Image mapping logic
│
└── PRODUCT-IMAGES-SETUP.md       ← Full documentation
```

## 🎯 Quick Steps

### Step 1: Navigate to the folder
```
Open File Explorer → Navigate to:
C:\Users\Naveen\OneDrive - A.M.C. ENGINEERING COLLEGE\Documents\anna-seva-portal-main\anna-seva-portal-main\public\images\products\
```

### Step 2: Add your images
Copy 5 product images with these EXACT names:
- ✅ rice.jpg
- ✅ wheat.jpg  
- ✅ sugar.jpg
- ✅ toor-dal.jpg
- ✅ cooking-oil.jpg

### Step 3: Refresh browser
- Open http://localhost:9002/distributor/stock
- Your images will appear in the Product Inventory table!

## 📸 Example Result

Before adding images:
```
[Placeholder] | Rice (PDS)     | 250 kg | [Input] | [Update]
[Placeholder] | Wheat Flour    | 400 kg | [Input] | [Update]
```

After adding images:
```
[Rice Photo] | Rice (PDS)      | 250 kg | [Input] | [Update]
[Wheat Photo]| Wheat Flour     | 400 kg | [Input] | [Update]
```

## ⚠️ Important Notes

1. **File names must match exactly** (case-sensitive)
2. **Supported formats**: .jpg, .png, .webp
3. **Recommended size**: 400x400 pixels
4. **Location must be**: `public/images/products/`

## 🔍 Verification

After adding images, check:
- ✅ Stock Management page shows product images
- ✅ Order page displays images in product cards
- ✅ No broken image icons
- ✅ Images load quickly

---

**Ready?** Just add your 5 product images to the folder and refresh! 🚀
