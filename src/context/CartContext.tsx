import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase, CartItem, Product } from '../lib/supabase';

interface CartState {
  items: (CartItem & { product: Product })[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  totalAmount: number;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: (CartItem & { product: Product })[] }
  | { type: 'ADD_ITEM'; payload: CartItem & { product: Product } }
  | { type: 'UPDATE_ITEM'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string };

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
  totalItems: 0,
  totalAmount: 0,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CART':
      const items = action.payload;
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      return { ...state, items, totalItems, totalAmount };
    case 'ADD_ITEM':
      const newItems = [...state.items, action.payload];
      return {
        ...state,
        items: newItems,
        totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
      };
    case 'UPDATE_ITEM':
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: updatedItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
      };
    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: filteredItems,
        totalItems: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: filteredItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
      };
    default:
      return state;
  }
};

const CartContext = createContext<{
  state: CartState;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  loadCart: () => Promise<void>;
} | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const loadCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        dispatch({ type: 'SET_CART', payload: [] });
        return;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      dispatch({ type: 'SET_CART', payload: data || [] });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToCart = async (productId: string, quantity = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Please sign in to add items to cart');
      }

      // Check if item already exists in cart
      const existingItem = state.items.find(item => item.product_id === productId);
      
      if (existingItem) {
        await updateCartItem(existingItem.id, existingItem.quantity + quantity);
        return;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity,
        })
        .select(`
          *,
          product:products(*)
        `)
        .single();

      if (error) throw error;

      dispatch({ type: 'ADD_ITEM', payload: data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;

      dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  const clearCart = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      dispatch({ type: 'SET_CART', payload: [] });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};