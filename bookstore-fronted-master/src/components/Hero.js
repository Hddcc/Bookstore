import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 从后端获取轮播图数据
  useEffect(() => {
    const fetchCarousels = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/v1/carousel/list');
        const data = await response.json();
        
        if (data.code === 0) {
          // 转换后端数据格式为前端需要的格式
          const formattedSlides = data.data.map(carousel => ({
            id: carousel.id,
            title: carousel.title,
            subtitle: carousel.description,
            description: carousel.description,
            image: carousel.image_url,
            buttonText: "立即探索",
            buttonLink: carousel.link_url || "#"
          }));
          setSlides(formattedSlides);
        } else {
          console.error('获取轮播图失败:', data.message);
          // 使用默认轮播图
          setSlides([
            {
              id: 1,
              title: "精选好书推荐",
              subtitle: "发现更多精彩内容",
              description: "为您推荐最优质的图书，涵盖文学、科技、历史等多个领域",
              image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=400&fit=crop",
              buttonText: "立即探索",
              buttonLink: "/category/文学"
            },
            {
              id: 2,
              title: "科幻小说专区",
              subtitle: "探索无限可能的科幻世界",
              description: "发现更多精彩科幻作品，体验未来科技的魅力",
              image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&h=400&fit=crop",
              buttonText: "查看科幻",
              buttonLink: "/category/科幻"
            },
            {
              id: 3,
              title: "儿童文学天地",
              subtitle: "为孩子们精选的童话故事",
              description: "为孩子们精选的童话故事，培养阅读兴趣",
              image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop",
              buttonText: "查看童话",
              buttonLink: "/category/童话"
            }
          ]);
        }
      } catch (error) {
        console.error('获取轮播图失败:', error);
        // 使用默认轮播图
        setSlides([
          {
            id: 1,
            title: "精选好书推荐",
            subtitle: "发现更多精彩内容",
            description: "为您推荐最优质的图书，涵盖文学、科技、历史等多个领域",
            image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=400&fit=crop",
            buttonText: "立即探索",
            buttonLink: "/category/文学"
          },
          {
            id: 2,
            title: "科幻小说专区",
            subtitle: "探索无限可能的科幻世界",
            description: "发现更多精彩科幻作品，体验未来科技的魅力",
            image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&h=400&fit=crop",
            buttonText: "查看科幻",
            buttonLink: "/category/科幻"
          },
          {
            id: 3,
            title: "儿童文学天地",
            subtitle: "为孩子们精选的童话故事",
            description: "为孩子们精选的童话故事，培养阅读兴趣",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop",
            buttonText: "查看童话",
            buttonLink: "/category/童话"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCarousels();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => {
      if (prev === 0) {
        // 如果是第一张，平滑过渡到最后一张
        return slides.length - 1;
      }
      return prev - 1;
    });
  };

  const goToNextSlide = () => {
    setCurrentSlide((prev) => {
      if (prev === slides.length - 1) {
        // 如果是最后一张，平滑过渡到第一张
        return 0;
      }
      return prev + 1;
    });
  };

  const handleButtonClick = (linkUrl) => {
    if (linkUrl.startsWith('/')) {
      navigate(linkUrl);
    } else {
      window.location.href = linkUrl;
    }
  };

  if (loading) {
    return (
      <div className="hero-section">
        <div className="hero-container">
          <div className="hero-loading">
            <div className="loading-spinner"></div>
            <p>加载轮播图中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-section">
      <div className="hero-container">
        <div className="hero-slider">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            >
              <div className="hero-content">
                <div className="hero-text">
                  <h1 className="hero-title">{slide.title}</h1>
                  <h2 className="hero-subtitle">{slide.subtitle}</h2>
                  <p className="hero-description">{slide.description}</p>
                  <button 
                    className="hero-button"
                    onClick={() => handleButtonClick(slide.buttonLink)}
                  >
                    {slide.buttonText}
                  </button>
                </div>
                <div className="hero-image">
                  <img src={slide.image} alt={slide.title} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 导航按钮 */}
        <button className="hero-nav prev" onClick={goToPrevSlide}>
          ‹
        </button>
        <button className="hero-nav next" onClick={goToNextSlide}>
          ›
        </button>

        {/* 指示器 */}
        <div className="hero-indicators">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`hero-indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero; 