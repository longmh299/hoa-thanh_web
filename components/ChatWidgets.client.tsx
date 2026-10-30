'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ChatWidgets() {
  // Ẩn chat trên trang admin nếu muốn
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  const zaloOA = process.env.NEXT_PUBLIC_ZALO_OA_ID || '';
  const fbPageId = process.env.NEXT_PUBLIC_FB_PAGE_ID || '';

  // Set thuộc tính chatbox cho Messenger sau khi mount
  useEffect(() => {
    const chatbox = document.getElementById('fb-customer-chat');
    if (chatbox && fbPageId) {
      chatbox.setAttribute('page_id', fbPageId);
      chatbox.setAttribute('attribution', 'biz_inbox');
    }
  }, [fbPageId]);

  return (
    <>
      {/* Zalo Chat Widget */}
      {zaloOA ? (
        <>
          <div
            className="zalo-chat-widget"
            data-oaid={zaloOA}
            data-welcome-message="Xin chào! Hòa Thành có thể hỗ trợ gì?"
            data-autopopup="0"
            data-width=""
            data-height=""
          />
          <Script src="https://sp.zalo.me/plugins/sdk.js" strategy="afterInteractive" />
        </>
      ) : null}

      {/* Facebook Messenger Customer Chat */}
      {fbPageId ? (
        <>
          <div id="fb-root"></div>
          <div id="fb-customer-chat" className="fb-customerchat"></div>

          <Script id="fb-chat-init" strategy="afterInteractive">
            {`
              window.fbAsyncInit = function() {
                FB.init({ xfbml: true, version: 'v19.0' });
              };
            `}
          </Script>

          {/* Loader SDK (tạo <script id="facebook-jssdk"> như hướng dẫn FB) */}
          <Script id="fb-sdk-loader" strategy="afterInteractive">
            {`
              (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s); js.id = id;
                js.src = 'https://connect.facebook.net/vi_VN/sdk/xfbml.customerchat.js';
                fjs.parentNode.insertBefore(js, fjs);
              }(document, 'script', 'facebook-jssdk'));
            `}
          </Script>
        </>
      ) : null}
    </>
  );
}
