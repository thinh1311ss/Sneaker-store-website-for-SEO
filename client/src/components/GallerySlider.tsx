"use client";

import { useState, useRef } from "react";

interface Props {
  urls: string[];
  caption?: string;
}

export default function GallerySlider({ urls, caption }: Props) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const touchStartX = useRef<number | null>(null);

  if (!urls.length) return null;

  const prev = () => setCurrent((c) => (c - 1 + urls.length) % urls.length);
  const next = () => setCurrent((c) => (c + 1) % urls.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <>
      <figure className="my-8">
        <div
          className="relative overflow-hidden rounded-xl bg-gray-100 select-none cursor-zoom-in"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={() => setLightbox(true)}
        >
          {/* Track */}
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {urls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={caption ? `${caption} ${i + 1}` : `Ảnh ${i + 1}`}
                className="min-w-full object-cover"
                draggable={false}
              />
            ))}
          </div>

          {/* Arrows */}
          {urls.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                aria-label="Ảnh trước"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition text-xl font-bold leading-none"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                aria-label="Ảnh tiếp"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition text-xl font-bold leading-none"
              >
                ›
              </button>
            </>
          )}

          {/* Counter badge */}
          <div className="absolute bottom-2 right-3 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white pointer-events-none">
            {current + 1} / {urls.length}
          </div>
        </div>

        {/* Dot indicators */}
        {urls.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5">
            {urls.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Chuyển đến ảnh ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === current ? "w-5 bg-gray-900" : "w-1.5 bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}

        {caption && (
          <figcaption className="mt-2 text-center text-sm text-gray-500 italic">
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(false)}
        >
          <img
            src={urls[current]}
            alt={caption || ""}
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {urls.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 text-white text-2xl font-bold flex items-center justify-center hover:bg-white/30"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 text-white text-2xl font-bold flex items-center justify-center hover:bg-white/30"
              >
                ›
              </button>
            </>
          )}
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 text-white text-3xl font-bold leading-none hover:text-gray-300"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}