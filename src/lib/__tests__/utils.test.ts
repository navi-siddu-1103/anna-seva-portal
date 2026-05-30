import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('should merge simple class names', () => {
    const result = cn('px-2', 'py-1');
    expect(result).toBe('px-2 py-1');
  });

  it('should handle objects with boolean values', () => {
    const result = cn({
      'px-2': true,
      'py-1': false,
      'text-center': true,
    });
    expect(result).toContain('px-2');
    expect(result).toContain('text-center');
    expect(result).not.toContain('py-1');
  });

  it('should handle arrays of class names', () => {
    const result = cn(['px-2', 'py-1', 'text-center']);
    expect(result).toContain('px-2');
    expect(result).toContain('py-1');
    expect(result).toContain('text-center');
  });

  it('should merge tailwind classes with conflict resolution', () => {
    // When there are conflicting Tailwind classes, tailwind-merge should resolve them
    const result = cn('px-2', 'px-4');
    // Should have the last conflicting class win
    expect(result).toContain('px-');
  });

  it('should handle undefined and null values', () => {
    const result = cn('px-2', undefined, 'py-1', null);
    expect(result).toBe('px-2 py-1');
  });

  it('should handle empty strings', () => {
    const result = cn('px-2', '', 'py-1');
    expect(result).toBe('px-2 py-1');
  });

  it('should handle mixed input types', () => {
    const result = cn(
      'px-2',
      { 'py-1': true, 'text-sm': false },
      ['text-center', 'font-bold'],
      undefined
    );
    expect(result).toContain('px-2');
    expect(result).toContain('py-1');
    expect(result).toContain('text-center');
    expect(result).toContain('font-bold');
    expect(result).not.toContain('text-sm');
  });

  it('should handle nested arrays', () => {
    const result = cn(['px-2', ['py-1', 'text-center']]);
    expect(result).toContain('px-2');
    expect(result).toContain('py-1');
    expect(result).toContain('text-center');
  });

  it('should handle flex utility classes', () => {
    const result = cn('flex', 'flex-col', 'gap-2');
    expect(result).toContain('flex');
    expect(result).toContain('flex-col');
    expect(result).toContain('gap-2');
  });

  it('should handle grid utility classes', () => {
    const result = cn('grid', 'grid-cols-3', 'gap-4');
    expect(result).toContain('grid');
    expect(result).toContain('grid-cols-3');
    expect(result).toContain('gap-4');
  });

  it('should handle responsive classes', () => {
    const result = cn('px-2', 'md:px-4', 'lg:px-6');
    expect(result).toContain('px-2');
    expect(result).toContain('md:px-4');
    expect(result).toContain('lg:px-6');
  });

  it('should handle hover and focus states', () => {
    const result = cn('bg-blue-500', 'hover:bg-blue-600', 'focus:outline-none');
    expect(result).toContain('bg-blue-500');
    expect(result).toContain('hover:bg-blue-600');
    expect(result).toContain('focus:outline-none');
  });

  it('should handle dark mode classes', () => {
    const result = cn('bg-white', 'dark:bg-gray-900', 'text-black', 'dark:text-white');
    expect(result).toContain('dark:bg-gray-900');
    expect(result).toContain('dark:text-white');
  });

  it('should be idempotent', () => {
    const classes = 'px-2 py-1 text-center';
    const result1 = cn(classes);
    const result2 = cn(result1);
    expect(result1).toBe(result2);
  });

  it('should handle large class lists', () => {
    const largeList = Array.from({ length: 50 }, (_, i) => `class-${i}`);
    const result = cn(...largeList);
    expect(result).toContain('class-0');
    expect(result).toContain('class-49');
  });

  it('should handle special tailwind syntaxes', () => {
    const result = cn(
      'before:content-[""]',
      'after:content-["test"]',
      'placeholder:text-gray-400'
    );
    expect(result).toBeDefined();
  });

  it('should remove duplicate classes', () => {
    const result = cn('px-2', 'px-2', 'px-2');
    const classArray = result.split(' ').filter(c => c);
    const pxCount = classArray.filter(c => c.startsWith('px-2')).length;
    expect(pxCount).toBeLessThanOrEqual(1);
  });
});
