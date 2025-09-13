import React, { useEffect, useRef } from 'react';
import './CartAnimation.css';

const CartAnimation = ({ 
  isVisible, 
  startPosition, 
  endPosition, 
  onAnimationComplete 
}) => {
  const animationRef = useRef(null);

  useEffect(() => {
    if (isVisible && animationRef.current) {
      const element = animationRef.current;
      
      // 设置初始位置
      element.style.left = `${startPosition.x}px`;
      element.style.top = `${startPosition.y}px`;
      
      // 触发动画
      requestAnimationFrame(() => {
        element.style.transform = `translate(${endPosition.x - startPosition.x}px, ${endPosition.y - startPosition.y}px) scale(0.3)`;
        element.style.opacity = '0';
      });

      // 动画完成后回调
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [isVisible, startPosition, endPosition, onAnimationComplete]);

  if (!isVisible) return null;

  return (
    <div 
      ref={animationRef}
      className="cart-animation"
    >
      🛒
    </div>
  );
};

export default CartAnimation; 