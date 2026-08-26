"use client";

import { useEffect, useRef, useState } from "react";

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (video && prefersReducedMotion.matches) {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  async function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
      } catch {
        setIsPlaying(false);
      }
    } else {
      video.pause();
    }
  }

  async function toggleSound() {
    const video = videoRef.current;
    if (!video) return;

    if (video.muted) {
      video.currentTime = 0;
      video.muted = false;
      setIsMuted(false);

      try {
        await video.play();
      } catch {
        setIsPlaying(false);
      }
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  }

  return (
    <figure className="heroVideo">
      <div className="heroVideoFrame">
        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          preload="metadata"
          poster="/images/video/ideleon-company-poster.webp"
          aria-label="Рекламный ролик о комплексных поставках Иделеон"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src="/videos/ideleon-company.mp4" type="video/mp4" />
        </video>
      </div>

      <figcaption className="heroVideoCaption">
        <div className="heroVideoControls">
          <button type="button" onClick={togglePlayback}>
            {isPlaying ? "Пауза" : "Воспроизвести"}
          </button>
          <button type="button" className="heroVideoSound" onClick={toggleSound}>
            {isMuted ? "Смотреть со звуком" : "Выключить звук"}
          </button>
        </div>
        <span>49 секунд о компании</span>
      </figcaption>
    </figure>
  );
}
