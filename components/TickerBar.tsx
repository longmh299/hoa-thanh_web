// components/TickerBar.tsx
"use client";

import { SITE } from "@/lib/site";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  items?: string[];
  duration?: number;      // giây cho 1 vòng
  bgClass?: string;       // màu nền
};

export default function TickerBar({
  items = [
    `Hotline: ${SITE.phoneDisplay}`,
    "Giao hàng toàn quốc",
    "Bảo hành tận nơi",
    "Tư vấn – lắp đặt nhanh",
  ],
  duration = 12,
  bgClass = "bg-[#2d46f0]",
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);

  const [baseW, setBaseW] = useState(0);
  const [wrapW, setWrapW] = useState(0);

  // đo kích thước thật
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      setBaseW(baseRef.current?.scrollWidth ?? 0);
      setWrapW(wrapRef.current?.clientWidth ?? 0);
    });
    if (wrapRef.current) ro.observe(wrapRef.current);
    if (baseRef.current) ro.observe(baseRef.current);
    // đo lần đầu
    setTimeout(() => {
      setBaseW(baseRef.current?.scrollWidth ?? 0);
      setWrapW(wrapRef.current?.clientWidth ?? 0);
    }, 0);
    return () => ro.disconnect();
  }, []);

  // cần lặp bao nhiêu lần để luôn phủ kín + có dư để chạy mượt
  const repeat = useMemo(() => {
    if (!baseW || !wrapW) return 2;
    return Math.max(2, Math.ceil((wrapW + baseW) / baseW));
  }, [baseW, wrapW]);

  const list = useMemo(() => Array.from({ length: repeat }, (_, i) => i), [repeat]);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${bgClass} text-white`}>
      <div
        className="whitespace-nowrap"
        style={
          {
            // dịch chuyển đúng bằng độ rộng của chuỗi gốc → seamless
            ["--shift" as any]: `${baseW}px`,
            ["--dur" as any]: `${duration}s`,
          } as React.CSSProperties
        }
      >
        <div
          className={`inline-flex items-center will-change-transform animate-[ticker_var(--dur)_linear_infinite] ${
            baseW ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* chuỗi gốc (để đo width) */}
          <div ref={baseRef} className="inline-flex">
            {items.map((t, i) => (
              <span key={`b-${i}`} className="px-4 py-2 md:px-5 md:py-3 border-r border-white/25">
                {t}
              </span>
            ))}
          </div>
          {/* lặp thêm N-1 lần cho đủ dài */}
          {list.slice(1).map((k) => (
            <div key={`r-${k}`} className="inline-flex">
              {items.map((t, i) => (
                <span key={`${k}-${i}`} className="px-4 py-2 md:px-5 md:py-3 border-r border-white/25">
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes ticker {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-1 * var(--shift)));
          }
        }
        /* pause khi hover (tiện test desktop) */
        div:hover > div > .animate-\[ticker_var\(--dur\)_linear_infinite\] {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
