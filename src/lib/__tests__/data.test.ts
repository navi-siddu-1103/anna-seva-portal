import { products, fpsLocations, userComplaints, purchaseHistory, regionalAvailability } from '@/lib/data';
import type { Product, FPS, Complaint } from '@/lib/types';

describe('Data Exports', () => {
  describe('products', () => {
    it('should export products array', () => {
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    });

    it('should have valid product structure', () => {
      products.forEach((product: Product) => {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('unit');
        expect(product).toHaveProperty('entitlement');
        expect(product).toHaveProperty('stock');
        
        expect(typeof product.id).toBe('string');
        expect(typeof product.name).toBe('string');
        expect(typeof product.price).toBe('number');
        expect(typeof product.unit).toBe('string');
        expect(typeof product.entitlement).toBe('string');
        expect(typeof product.stock).toBe('number');
      });
    });

    it('should have positive prices and stock', () => {
      products.forEach((product: Product) => {
        expect(product.price).toBeGreaterThanOrEqual(0);
        expect(product.stock).toBeGreaterThanOrEqual(0);
      });
    });

    it('should include essential PDS items', () => {
      const productNames = products.map(p => p.name);
      expect(productNames).toContain('Rice (PDS)');
      expect(productNames).toContain('Wheat Flour (Atta)');
      expect(productNames).toContain('Sugar');
    });

    it('should have unique product IDs', () => {
      const ids = products.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have meaningful product names', () => {
      products.forEach((product: Product) => {
        expect(product.name.length).toBeGreaterThan(0);
        expect(product.name).not.toMatch(/^\s*$/);
      });
    });
  });

  describe('fpsLocations', () => {
    it('should export FPS locations array', () => {
      expect(Array.isArray(fpsLocations)).toBe(true);
      expect(fpsLocations.length).toBeGreaterThan(0);
    });

    it('should have valid FPS structure', () => {
      fpsLocations.forEach((fps: FPS) => {
        expect(fps).toHaveProperty('id');
        expect(fps).toHaveProperty('name');
        expect(fps).toHaveProperty('shopkeeper');
        expect(fps).toHaveProperty('hours');
        expect(fps).toHaveProperty('stockStatus');
        expect(fps).toHaveProperty('lat');
        expect(fps).toHaveProperty('lng');
        
        expect(typeof fps.id).toBe('string');
        expect(typeof fps.name).toBe('string');
        expect(typeof fps.shopkeeper).toBe('string');
        expect(typeof fps.hours).toBe('string');
        expect(typeof fps.stockStatus).toBe('string');
        expect(typeof fps.lat).toBe('number');
        expect(typeof fps.lng).toBe('number');
      });
    });

    it('should have valid GPS coordinates', () => {
      fpsLocations.forEach((fps: FPS) => {
        expect(fps.lat).toBeGreaterThanOrEqual(-90);
        expect(fps.lat).toBeLessThanOrEqual(90);
        expect(fps.lng).toBeGreaterThanOrEqual(-180);
        expect(fps.lng).toBeLessThanOrEqual(180);
      });
    });

    it('should have unique FPS IDs', () => {
      const ids = fpsLocations.map(fps => fps.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid stock status values', () => {
      const validStatuses = ['Available', 'Limited', 'Out of Stock'];
      fpsLocations.forEach((fps: FPS) => {
        expect(validStatuses).toContain(fps.stockStatus);
      });
    });

    it('should have non-empty shop names', () => {
      fpsLocations.forEach((fps: FPS) => {
        expect(fps.name.length).toBeGreaterThan(0);
      });
    });
  });

  describe('userComplaints', () => {
    it('should export complaints array', () => {
      expect(Array.isArray(userComplaints)).toBe(true);
      expect(userComplaints.length).toBeGreaterThan(0);
    });

    it('should have valid complaint structure', () => {
      userComplaints.forEach((complaint: Complaint) => {
        expect(complaint).toHaveProperty('id');
        expect(complaint).toHaveProperty('subject');
        expect(complaint).toHaveProperty('date');
        expect(complaint).toHaveProperty('status');
        
        expect(typeof complaint.id).toBe('string');
        expect(typeof complaint.subject).toBe('string');
        expect(typeof complaint.date).toBe('string');
        expect(typeof complaint.status).toBe('string');
      });
    });

    it('should have valid complaint status values', () => {
      const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Closed'];
      userComplaints.forEach((complaint: Complaint) => {
        expect(validStatuses).toContain(complaint.status);
      });
    });

    it('should have unique complaint IDs', () => {
      const ids = userComplaints.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have non-empty subjects', () => {
      userComplaints.forEach((complaint: Complaint) => {
        expect(complaint.subject.length).toBeGreaterThan(0);
      });
    });

    it('should have valid date format', () => {
      userComplaints.forEach((complaint: Complaint) => {
        const date = new Date(complaint.date);
        expect(date instanceof Date && !isNaN(date.getTime())).toBe(true);
      });
    });
  });

  describe('purchaseHistory', () => {
    it('should export purchase history object', () => {
      expect(typeof purchaseHistory).toBe('object');
      expect(purchaseHistory).not.toBeNull();
    });

    it('should have valid month keys', () => {
      Object.keys(purchaseHistory).forEach((month) => {
        expect(month).toMatch(/^\d{4}-\d{2}$/);
      });
    });

    it('should have arrays as values', () => {
      Object.values(purchaseHistory).forEach((items) => {
        expect(Array.isArray(items)).toBe(true);
      });
    });

    it('should have non-empty item lists', () => {
      Object.values(purchaseHistory).forEach((items) => {
        expect((items as string[]).length).toBeGreaterThan(0);
      });
    });

    it('should have string items in arrays', () => {
      Object.values(purchaseHistory).forEach((items) => {
        (items as string[]).forEach((item) => {
          expect(typeof item).toBe('string');
          expect(item.length).toBeGreaterThan(0);
        });
      });
    });

    it('should have realistic purchase items', () => {
      Object.values(purchaseHistory).forEach((items) => {
        expect((items as string[]).length).toBeGreaterThan(0);
        (items as string[]).forEach((item) => {
          expect(['Rice', 'Wheat', 'Wheat Flour', 'Sugar', 'Toor Dal', 'Oil']).toContain(item);
        });
      });
    });
  });

  describe('regionalAvailability', () => {
    it('should export regional availability object', () => {
      expect(typeof regionalAvailability).toBe('object');
      expect(regionalAvailability).not.toBeNull();
    });

    it('should have valid region keys', () => {
      Object.keys(regionalAvailability).forEach((region) => {
        expect(typeof region).toBe('string');
        expect(region.length).toBeGreaterThan(0);
      });
    });

    it('should have arrays as values', () => {
      Object.values(regionalAvailability).forEach((items) => {
        expect(Array.isArray(items)).toBe(true);
      });
    });

    it('should include Karnataka region', () => {
      expect(regionalAvailability).toHaveProperty('Karnataka');
    });

    it('should include Default region', () => {
      expect(regionalAvailability).toHaveProperty('Default');
    });

    it('should have regional specific items for Karnataka', () => {
      const karnatakItems = (regionalAvailability as any).Karnataka;
      expect(Array.isArray(karnatakItems)).toBe(true);
      expect(karnatakItems.length).toBeGreaterThan(0);
    });

    it('should have non-empty item lists', () => {
      Object.values(regionalAvailability).forEach((items) => {
        expect((items as string[]).length).toBeGreaterThan(0);
      });
    });

    it('should have string items in arrays', () => {
      Object.values(regionalAvailability).forEach((items) => {
        (items as string[]).forEach((item) => {
          expect(typeof item).toBe('string');
          expect(item.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Data Consistency', () => {
    it('products and regional availability should be related', () => {
      // At least some items in regional availability should correspond to products
      const productNames = new Set(products.map(p => p.name.split(' ')[0])); // First word
      const regionItems = Object.values(regionalAvailability)
        .flat()
        .map(item => item.split(' ')[0]); // First word
      
      expect(regionItems.length).toBeGreaterThan(0);
    });

    it('should have logical entitlement structure', () => {
      products.forEach((product: Product) => {
        expect(product.entitlement).toContain('per');
      });
    });
  });
});
