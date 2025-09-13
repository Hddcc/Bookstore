import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// 从localStorage加载购物车数据
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : { items: [] };
  } catch (error) {
    console.error('加载购物车数据失败:', error);
    return { items: [] };
  }
};

// 保存购物车数据到localStorage
const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('保存购物车数据失败:', error);
  }
};

const cartReducer = (state, action) => {
  let newState;
  
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        newState = {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      } else {
        newState = {
          ...state,
          items: [...state.items, { ...action.payload, quantity: 1 }]
        };
      }
      break;
    
    case 'REMOVE_FROM_CART':
      newState = {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
      break;
    
    case 'UPDATE_QUANTITY':
      newState = {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
      break;
    
    case 'CLEAR_CART':
      newState = {
        ...state,
        items: []
      };
      break;
    
    default:
      return state;
  }
  
  // 保存到localStorage
  saveCartToStorage(newState);
  return newState;
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, loadCartFromStorage());

  const addToCart = (book) => {
    dispatch({ type: 'ADD_TO_CART', payload: book });
  };

  const removeFromCart = (bookId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: bookId });
  };

  const updateQuantity = (bookId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: bookId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.currentPrice * item.quantity), 0);
  };

  const value = {
    items: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 