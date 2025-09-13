import React, { createContext, useContext, useState, useRef } from 'react';

const CartAnimationContext = createContext();

export { CartAnimationContext };

export const useCartAnimation = () => {
  const context = useContext(CartAnimationContext);
  if (!context) {
    throw new Error('useCartAnimation must be used within a CartAnimationProvider');
  }
  return context;
};

export const CartAnimationProvider = ({ children }) => {
  const [cartAnimation, setCartAnimation] = useState({
    isVisible: false,
    startPosition: { x: 0, y: 0 },
    endPosition: { x: 0, y: 0 }
  });

  const cartButtonRef = useRef(null);
  const cartBadgeRef = useRef(null);

  const triggerCartAnimation = (startPosition) => {
    if (cartButtonRef.current) {
      const cartRect = cartButtonRef.current.getBoundingClientRect();
      const endPosition = {
        x: cartRect.left + cartRect.width / 2,
        y: cartRect.top + cartRect.height / 2
      };

      setCartAnimation({
        isVisible: true,
        startPosition,
        endPosition
      });

      // 触发购物车按钮抖动
      cartButtonRef.current.classList.add('shake');
      setTimeout(() => {
        cartButtonRef.current.classList.remove('shake');
      }, 600);

      // 触发购物车徽章脉冲
      if (cartBadgeRef.current) {
        cartBadgeRef.current.classList.add('pulse');
        setTimeout(() => {
          cartBadgeRef.current.classList.remove('pulse');
        }, 600);
      }
    }
  };

  const handleAnimationComplete = () => {
    setCartAnimation({
      isVisible: false,
      startPosition: { x: 0, y: 0 },
      endPosition: { x: 0, y: 0 }
    });
  };

  const value = {
    cartAnimation,
    cartButtonRef,
    cartBadgeRef,
    triggerCartAnimation,
    handleAnimationComplete
  };

  return (
    <CartAnimationContext.Provider value={value}>
      {children}
    </CartAnimationContext.Provider>
  );
}; 