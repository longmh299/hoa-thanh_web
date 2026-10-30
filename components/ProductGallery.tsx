
// components/ProductGallery.tsx
"use client";

import { useState } from "react";

export default function ProductGallery({
  cover,
  images = [],
}: {
  cover?: string | null;
  images?: { url: string }[];
}) {
  const allImages = [cover, ...images.map(i => i.url)].filter(Boolean);

  const [active, setActive] = useState(allImages[0]);

  return (
    <div className="space-y-3">

      {/* MAIN IMAGE */}
      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
          {active ? (
            <img
              src={active}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-gray-400">No image</div>
          )}
        </div>
      </div>

      {/* THUMBNAIL */}
      <div className="flex gap-2 overflow-x-auto">
        {allImages.map((img, i) => (
          <img
            key={i}
            src={img!}
            onClick={() => setActive(img)}
            className={`w-16 h-16 object-cover rounded border cursor-pointer ${
              active === img ? "border-[var(--color-accent)]" : ""
            }`}
          />
        ))}
      </div>

    </div>
  );
}

