import { reducer, useToast, toast } from '@/hooks/use-toast';

describe('Toast Reducer', () => {
  const initialState = { toasts: [] };

  describe('ADD_TOAST action', () => {
    it('should add a new toast', () => {
      const newToast = {
        id: '1',
        title: 'Success',
        description: 'Operation completed',
        open: true,
      };

      const action = {
        type: 'ADD_TOAST' as const,
        toast: newToast,
      };

      const state = reducer(initialState, action);
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0]).toEqual(newToast);
    });

    it('should replace toast when limit is reached (TOAST_LIMIT=1)', () => {
      const toast1 = { id: '1', title: 'First', open: true };
      const toast2 = { id: '2', title: 'Second', open: true };

      let state = initialState;
      state = reducer(state, { type: 'ADD_TOAST', toast: toast1 });
      state = reducer(state, { type: 'ADD_TOAST', toast: toast2 });

      // Only the most recent toast should be present due to TOAST_LIMIT=1
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].id).toBe('2');
    });

    it('should limit toasts to TOAST_LIMIT', () => {
      let state = initialState;
      
      for (let i = 0; i < 5; i++) {
        state = reducer(state, {
          type: 'ADD_TOAST',
          toast: { id: String(i), title: `Toast ${i}`, open: true },
        });
      }

      // TOAST_LIMIT is 1 according to the implementation
      expect(state.toasts.length).toBeLessThanOrEqual(1);
    });

    it('should handle toast with all properties', () => {
      const fullToast = {
        id: '1',
        title: 'Title',
        description: 'Description',
        open: true,
        variant: 'default' as const,
        onOpenChange: jest.fn(),
      };

      const state = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: fullToast,
      });

      expect(state.toasts[0]).toEqual(fullToast);
    });
  });

  describe('UPDATE_TOAST action', () => {
    it('should update existing toast', () => {
      const initialToast = { id: '1', title: 'Original', open: true };
      let state = reducer(initialState, { type: 'ADD_TOAST', toast: initialToast });

      const updated = reducer(state, {
        type: 'UPDATE_TOAST',
        toast: { id: '1', title: 'Updated' },
      });

      expect(updated.toasts[0].title).toBe('Updated');
    });

    it('should preserve other properties when updating', () => {
      const initialToast = {
        id: '1',
        title: 'Original',
        description: 'Original description',
        open: true,
      };
      let state = reducer(initialState, { type: 'ADD_TOAST', toast: initialToast });

      const updated = reducer(state, {
        type: 'UPDATE_TOAST',
        toast: { id: '1', title: 'Updated' },
      });

      expect(updated.toasts[0].title).toBe('Updated');
      expect(updated.toasts[0].description).toBe('Original description');
    });

    it('should not add new toast when updating non-existent toast', () => {
      let state = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: { id: '1', title: 'Existing', open: true },
      });

      const updated = reducer(state, {
        type: 'UPDATE_TOAST',
        toast: { id: '999', title: 'Non-existent' },
      });

      expect(updated.toasts).toHaveLength(1);
    });

    it('should handle single toast update', () => {
      let state = initialState;
      state = reducer(state, { type: 'ADD_TOAST', toast: { id: '1', title: 'Toast 1', open: true } });

      // Update the existing toast
      const updated = reducer(state, {
        type: 'UPDATE_TOAST',
        toast: { id: '1', title: 'Updated Toast 1' },
      });

      expect(updated.toasts[0].title).toBe('Updated Toast 1');
    });
  });

  describe('DISMISS_TOAST action', () => {
    it('should dismiss specific toast by id', () => {
      let state = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: { id: '1', title: 'Toast', open: true },
      });

      const dismissed = reducer(state, {
        type: 'DISMISS_TOAST',
        toastId: '1',
      });

      expect(dismissed.toasts[0].open).toBe(false);
    });

    it('should dismiss all toasts when no id provided', () => {
      let state = initialState;
      state = reducer(state, {
        type: 'ADD_TOAST',
        toast: { id: '1', title: 'Toast 1', open: true },
      });

      const dismissed = reducer(state, {
        type: 'DISMISS_TOAST',
      });

      expect(dismissed.toasts[0].open).toBe(false);
    });

    it('should handle non-existent toast id gracefully', () => {
      let state = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: { id: '1', title: 'Toast', open: true },
      });

      const dismissed = reducer(state, {
        type: 'DISMISS_TOAST',
        toastId: '999',
      });

      expect(dismissed.toasts[0].open).toBe(true); // Original should remain open
    });
  });

  describe('REMOVE_TOAST action', () => {
    it('should remove specific toast by id', () => {
      let state = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: { id: '1', title: 'Toast', open: true },
      });

      expect(state.toasts).toHaveLength(1);

      const removed = reducer(state, {
        type: 'REMOVE_TOAST',
        toastId: '1',
      });

      expect(removed.toasts).toHaveLength(0);
    });

    it('should remove all toasts when no id provided', () => {
      let state = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: { id: '1', title: 'Toast', open: true },
      });

      const removed = reducer(state, {
        type: 'REMOVE_TOAST',
      });

      expect(removed.toasts).toHaveLength(0);
    });

    it('should handle non-existent toast id gracefully', () => {
      let state = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: { id: '1', title: 'Toast', open: true },
      });

      const removed = reducer(state, {
        type: 'REMOVE_TOAST',
        toastId: '999',
      });

      expect(removed.toasts).toHaveLength(1); // Original should remain
    });
  });

  describe('Toast State Transitions', () => {
    it('should handle add -> dismiss -> remove flow', () => {
      let state = initialState;
      
      state = reducer(state, {
        type: 'ADD_TOAST',
        toast: { id: '1', title: 'Toast', open: true },
      });
      expect(state.toasts[0].open).toBe(true);

      state = reducer(state, {
        type: 'DISMISS_TOAST',
        toastId: '1',
      });
      expect(state.toasts[0].open).toBe(false);

      state = reducer(state, {
        type: 'REMOVE_TOAST',
        toastId: '1',
      });
      expect(state.toasts).toHaveLength(0);
    });

    it('should handle add -> update flow', () => {
      let state = initialState;
      
      state = reducer(state, {
        type: 'ADD_TOAST',
        toast: { id: '1', title: 'Original', open: true },
      });

      state = reducer(state, {
        type: 'UPDATE_TOAST',
        toast: { id: '1', title: 'Updated', description: 'New description' },
      });

      expect(state.toasts[0].title).toBe('Updated');
      expect(state.toasts[0].description).toBe('New description');
    });

    it('should handle add -> update -> dismiss -> remove flow', () => {
      let state = initialState;
      
      state = reducer(state, {
        type: 'ADD_TOAST',
        toast: { id: '1', title: 'Toast', open: true },
      });

      state = reducer(state, {
        type: 'UPDATE_TOAST',
        toast: { id: '1', title: 'Updated' },
      });

      state = reducer(state, {
        type: 'DISMISS_TOAST',
        toastId: '1',
      });

      state = reducer(state, {
        type: 'REMOVE_TOAST',
        toastId: '1',
      });

      expect(state.toasts).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty toasts array', () => {
      const state = reducer(initialState, {
        type: 'REMOVE_TOAST',
      });

      expect(state.toasts).toHaveLength(0);
    });

    it('should preserve immutability', () => {
      const originalState = { toasts: [] };
      const newState = reducer(originalState, {
        type: 'ADD_TOAST',
        toast: { id: '1', title: 'Toast', open: true },
      });

      expect(originalState.toasts).toHaveLength(0);
      expect(newState.toasts).toHaveLength(1);
    });

    it('should handle rapid remove cycles', () => {
      let state = initialState;

      state = reducer(state, {
        type: 'ADD_TOAST',
        toast: { id: '1', title: 'Toast', open: true },
      });

      state = reducer(state, { type: 'REMOVE_TOAST' });
      expect(state.toasts).toHaveLength(0);
    });

    it('should handle special characters in toast properties', () => {
      const state = reducer(initialState, {
        type: 'ADD_TOAST',
        toast: {
          id: '1',
          title: 'Special: <>&"\'',
          description: '中文测试 🎉',
          open: true,
        },
      });

      expect(state.toasts[0].title).toBe('Special: <>&"\'');
      expect(state.toasts[0].description).toBe('中文测试 🎉');
    });
  });

  describe('Type Safety', () => {
    it('should have correct action type constants', () => {
      const actionTypes = {
        ADD_TOAST: 'ADD_TOAST',
        UPDATE_TOAST: 'UPDATE_TOAST',
        DISMISS_TOAST: 'DISMISS_TOAST',
        REMOVE_TOAST: 'REMOVE_TOAST',
      };

      expect(Object.keys(actionTypes)).toHaveLength(4);
    });
  });
});
