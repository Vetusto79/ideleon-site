"use client";

import { useEffect, useState } from "react";

const slides = [
  {
    src: "/images/hero/office-fitout.webp",
    alt: "Монтаж перегородок и потолочных систем в строящемся офисе",
  },
  {
    src: "/images/hero/medical-interior.webp",
    alt: "Внутренняя отделка и монтаж инженерных систем в медицинском учреждении",
  },
  {
    src: "/images/hero/commercial-interior.webp",
    alt: "Строительство внутреннего пространства крупного коммерческого объекта",
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (isPaused || prefersReducedMotion.matches) return;

    const timer = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % slides.length);
    }, 5500);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  function showPrevious() {
    setCurrentSlide((current) => (current - 1 + slides.length) % slides.length);
  }

  function showNext() {
    setCurrentSlide((current) => (current + 1) % slides.length);
  }

  return (
    <div
      className="heroImage heroCarousel"
      role="region"
      aria-roledescription="карусель"
      aria-label="Интерьеры строящихся объектов"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;

        return (
          <div
            className={`heroCarouselSlide${isActive ? " isActive" : ""}`}
            aria-hidden={!isActive}
            key={slide.src}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
            />
          </div>
        );
      })}

      <button
        type="button"
        className="heroCarouselArrow heroCarouselArrowPrevious"
        aria-label="Предыдущая фотография"
        onClick={showPrevious}
      >
        ‹
      </button>
      <button
        type="button"
        className="heroCarouselArrow heroCarouselArrowNext"
        aria-label="Следующая фотография"
        onClick={showNext}
      >
        ›
      </button>

      <div className="heroCarouselDots" aria-label="Выбор фотографии">
        {slides.map((slide, index) => (
          <button
            type="button"
            className={index === currentSlide ? "isActive" : ""}
            aria-label={`Показать фотографию ${index + 1}`}
            aria-current={index === currentSlide ? "true" : undefined}
            onClick={() => setCurrentSlide(index)}
            key={slide.src}
          />
        ))}
      </div>
    </div>
  );
}
