'use client';

import Image from 'next/image';
import { products } from '@/lib/data';
import { getProductImage, getProductPlaceholder } from '@/lib/product-images';

export default function ImageTestPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Image Test Page</h1>
      <p className="mb-4 text-muted-foreground">Testing product images with actual product IDs</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const imagePath = getProductImage(product.id);
          return (
            <div key={product.id} className="border rounded-lg p-4">
              <h3 className="font-bold mb-2">{product.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">ID: {product.id}</p>
              <p className="text-sm text-muted-foreground mb-4">Path: {imagePath}</p>
              
              <div className="relative w-full h-48 bg-muted rounded-md overflow-hidden mb-4">
                <Image
                  src={imagePath}
                  alt={product.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getProductPlaceholder(product.name);
                    console.error(`Failed to load image for ${product.name}:`, imagePath);
                  }}
                  onLoad={() => {
                    console.log(`Successfully loaded image for ${product.name}:`, imagePath);
                  }}
                />
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>Price: ₹{product.price}/{product.unit}</p>
                <p>Stock: {product.stock} {product.unit}</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="font-bold mb-2">Debug Info:</h2>
        <ul className="text-sm space-y-1">
          <li>✓ Check browser console (F12) for image load success/errors</li>
          <li>✓ Product IDs: {products.map(p => p.id).join(', ')}</li>
          <li>✓ Images folder: /public/images/products/</li>
        </ul>
      </div>
    </div>
  );
}
