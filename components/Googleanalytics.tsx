"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { GA_MEASUREMENT_ID, gaPageview } from "../lib/Gtag";

function GaPageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;

    // Không đếm lượt truy cập khu vực quản trị vào số liệu công khai.
    if (pathname?.startsWith("/admin")) return;

    const query = searchParams?.toString();
    const url = query ? `${pathname}?${query}` : pathname || "/";
    gaPageview(url);
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){ window.dataLayer.push(arguments); }
          window.gtag = gtag;
          gtag('js', new Date());
          // send_page_view: false — vì tracker bên dưới tự bắn page_view
          // theo từng lần chuyển route (App Router là SPA, không reload trang).
          gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
        `}
      </Script>

      {/* useSearchParams() cần bọc Suspense khi dùng trong layout */}
      <Suspense fallback={null}>
        <GaPageviewTracker />
      </Suspense>
    </>
  );
}