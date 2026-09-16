# Adding Product Images - Quick Guide

## 📁 Folder Structure Created

```
public/
└── images/
    └── products/
        ├── README.md (this file)
        ├── rice.jpg (add your image here)
        ├── wheat.jpg (add your image here)
        ├── sugar.jpg (add your image here)
        ├── toor-dal.jpg (add your image here)
        └── cooking-oil.jpg (add your image here)
```

## 🖼️ Image Requirements

### File Naming Convention:
| Product | File Name |
|---------|-----------|
| Rice (PDS) | `rice.jpg` or `rice.png` |
| Wheat Flour (Atta) | `wheat.jpg` or `wheat.png` |
| Sugar | `sugar.jpg` or `sugar.png` |
| Toor Dal | `toor-dal.jpg` or `toor-dal.png` |
| Cooking Oil | `cooking-oil.jpg` or `cooking-oil.png` |

### Image Specifications:
- ✅ **Formats**: JPG, PNG, or WEBP
- ✅ **Recommended Size**: 400x400 pixels (1:1 ratio)
- ✅ **Maximum File Size**: 500 KB per image
- ✅ **Background**: White or transparent background works best
- ✅ **Quality**: High resolution, well-lit photos

## 📸 Where to Get Images:

### Free Stock Photo Sites:
1. **Unsplash** - https://unsplash.com
2. **Pexels** - https://pexels.com
3. **Pixabay** - https://pixabay.com

### Search Terms:
- Rice: "basmati rice grains", "white rice"
- Wheat: "wheat flour", "atta flour bag"
- Sugar: "white sugar", "sugar crystals"
- Toor Dal: "toor dal", "yellow lentils", "pigeon peas"
- Cooking Oil: "cooking oil bottle", "refined oil"

## 🚀 How to Add Images:

1. **Download or take photos** of your products
2. **Rename files** according to the naming convention above
3. **Resize images** to 400x400 pixels (optional but recommended)
4. **Copy files** to this folder: `public/images/products/`
5. **Refresh your browser** - images will appear automatically!

## 🔄 Fallback Behavior:

If an image is not found, the system will:
1. Try to load the .jpg version
2. Try to load the .png version
3. Try to load the .webp version
4. Display a placeholder with the product name

## 💡 Tips:

- Use consistent lighting for all product photos
- Crop images to show just the product
- Remove busy backgrounds for cleaner look
- Keep file sizes small for faster loading
- Test in the app after adding images

## 🎯 Where Images Appear:

Your product images will be displayed in:
- ✅ **Stock Management Page** (Distributor view)
- ✅ **Order Page** (Customer view)
- ✅ **Product Cards** throughout the application

---

**Need Help?** Check the `/src/lib/product-images.ts` file for technical details.
