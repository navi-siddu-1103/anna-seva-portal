/**
 * Product Image Configuration
 * 
 * Maps product IDs to their corresponding image paths.
 * Images should be placed in /public/images/products/ directory.
 */

export const productImages: Record<string, string> = {
  // Product IDs from data.ts
  "1": "/images/products/rice_image.jpg",              // Rice (PDS)
  "2": "/images/products/wheat_flour_image.png",       // Wheat Flour (Atta)
  "3": "/images/products/sugar_image.jpg",             // Sugar
  "4": "/images/products/toor_dal_image.webp",         // Toor Dal
  "5": "/images/products/cooking_oil.jpg",             // Cooking Oil
  
  // Alternative IDs (for compatibility)
  "rice-pds": "/images/products/rice_image.jpg",
  "wheat-atta": "/images/products/wheat_flour_image.png",
  "sugar": "/images/products/sugar_image.jpg",
  "toor-dal": "/images/products/toor_dal_image.webp",
  "cooking-oil": "/images/products/cooking_oil.jpg",
};

/**
 * Get the image path for a product by its ID
 * @param productId - The unique identifier of the product
 * @returns The image path or a placeholder image URL
 */
export function getProductImage(productId: string): string {
  return productImages[productId] || "/images/products/placeholder.jpg";
}

/**
 * Get a fallback placeholder image URL with product name
 * @param productName - The name of the product for the placeholder
 * @returns A placeholder image URL from placehold.co
 */
export function getProductPlaceholder(productName: string): string {
  const firstWord = productName.split(' ')[0];
  return `https://placehold.co/400x400/F7BC0F/ffffff?text=${encodeURIComponent(firstWord)}`;
}

/**
 * Alternative image formats to try if the primary format fails
 */
export const imageFormats = ['jpg', 'png', 'webp'];

/**
 * Get all possible image paths for a product (trying different formats)
 * @param productId - The unique identifier of the product
 * @returns Array of possible image paths
 */
export function getProductImageVariants(productId: string): string[] {
  const basePath = `/images/products/${productId}`;
  return imageFormats.map(format => `${basePath}.${format}`);
}
