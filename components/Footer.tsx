// components/Footer.tsx — footer giao diện B: nền xanh đậm, 4 cột, dải cam kết phía trên
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SITE, SOCIAL_LINKS, abs } from "@/lib/site";
import { ldJson } from "@/lib/seo";
import BrandLogo from "./BrandLogo";

const ICONS: Record<string, string> = {
  ytb: "M23.5 6.2a4 4 0 0 0-2.8-2.8C18.9 3 12 3 12 3s-6.9 0-8.7.4A4 4 0 0 0 .5 6.2 41 41 0 0 0 0 12a41 41 0 0 0 .5 5.8 4 4 0 0 0 2.8 2.8C5.1 21 12 21 12 21s6.9 0 8.7-.4a4 4 0 0 0 2.8-2.8A41 41 0 0 0 24 12a41 41 0 0 0-.5-5.8zM9.5 15.5v-7L16 12l-6.5 3.5z",
  fb: "M22 12a10 10 0 1 0-11.5 9.9v-7H7.9V12h2.6V9.7c0-2.6 1.5-4 3.9-4 1.1 0 2.3.2 2.3.2v2.5h-1.3c-1.3 0-1.7.8-1.7 1.6V12h2.9l-.5 2.9h-2.4v7A10 10 0 0 0 22 12z",
  tt: "M16 8.3a6 6 0 0 0 4 1.5V13a9 9 0 0 1-4-.9v4.3a5.5 5.5 0 1 1-5.5-5.5c.2 0 .4 0 .6.1v3a2.5 2.5 0 1 0 1.9 2.4V3h3v5.3z",
};

/** "NGÀNH DƯỢC , MỸ PHẨM" → "Ngành dược, mỹ phẩm" (tên nhập toàn chữ hoa trong admin) */
function niceName(name: string) {
  const clean = name.replace(/\s+,/g, ",").replace(/\s+/g, " ").trim();
  if (clean !== clean.toLocaleUpperCase("vi")) return clean;
  const lower = clean.toLocaleLowerCase("vi");
  return lower.charAt(0).toLocaleUpperCase("vi") + lower.slice(1);
}

/** Bỏ các giá trị còn là chữ mẫu "[ĐIỀN …]" để không gửi thông tin sai cho Google */
const filled = (v?: string | null) => (v && !v.includes("[ĐIỀN") ? v : undefined);

async function getFooterCategories() {
  try {
    return await prisma.category.findMany({
      where: { parentId: null },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      take: 6,
      select: { id: true, slug: true, name: true },
    });
  } catch {
    return [];
  }
}

export default async function Footer() {
  const categories = await getFooterCategories();

  // JSON-LD doanh nghiệp: lấy toàn bộ từ lib/site.ts
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": abs("/#organization"),
    name: SITE.name,
    legalName: SITE.legalName,
    url: abs("/"),
    logo: abs(SITE.logo || "/images/logo.png"),
    image: abs("/images/og-default.jpg"),
    description: SITE.tagline,
    foundingDate: SITE.foundingDate || undefined,
    taxID: filled(SITE.taxCode),
    telephone: `+84${SITE.phone.replace(/^0/, "")}`,
    email: SITE.email,
    address: filled(SITE.addressParts.street)
      ? {
          "@type": "PostalAddress",
          streetAddress: SITE.addressParts.street,
          addressLocality: filled(SITE.addressParts.locality),
          addressRegion: filled(SITE.addressParts.region),
          addressCountry: "VN",
        }
      : undefined,
    geo: SITE.geo
      ? { "@type": "GeoCoordinates", latitude: SITE.geo.lat, longitude: SITE.geo.lng }
      : undefined,
    areaServed: { "@type": "Country", name: "Việt Nam" },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: SITE.openingHours.open,
        closes: SITE.openingHours.close,
      },
    ],
    sameAs: SOCIAL_LINKS.map((s) => s.href),
  };

  const colTitle = "mb-4 text-[15px] font-bold uppercase tracking-[0.04em] text-white";
  const linkCls = "text-[14.5px] text-[#E1EAF8] transition hover:text-white";

  return (
    <footer className="mt-12 text-white md:mt-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(jsonLd) }} />

      <div className="bg-[var(--color-navy)]">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-4 pb-10 pt-12 sm:grid-cols-2 md:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* CỘT 1: CÔNG TY */}
          <div>
            <Link href="/" aria-label={`${SITE.name} – Trang chủ`} className="inline-block">
              <BrandLogo dark />
            </Link>
            <p className="mt-4 text-[14.5px] font-semibold leading-snug text-white">{SITE.legalName}</p>
            <ul className="mt-3 space-y-2 text-[14px] leading-normal text-[#E1EAF8]">
              <li>Địa chỉ: {SITE.address}</li>
              <li>MST: {SITE.taxCode}</li>
              <li>Giờ làm việc: {SITE.openingHours.days}, {SITE.openingHours.open} – {SITE.openingHours.close}</li>
            </ul>
          </div>

          {/* CỘT 2: DANH MỤC */}
          <div>
            <h4 className={colTitle}>Danh mục sản phẩm</h4>
            <ul className="space-y-2.5">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/${c.slug}`} className={linkCls}>{niceName(c.name)}</Link>
                </li>
              ))}
              <li>
                <Link href="/san-pham" className="text-[14.5px] font-semibold text-[var(--color-promo)] hover:underline">
                  Xem tất cả →
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: HỖ TRỢ */}
          <div>
            <h4 className={colTitle}>Hỗ trợ khách hàng</h4>
            <ul className="space-y-2.5">
              <li><Link href="/gioi-thieu" className={linkCls}>Giới thiệu công ty</Link></li>
              <li><Link href="/chinh-sach-bao-hanh-giao-hang" className={linkCls}>Chính sách bảo hành</Link></li>
              <li><Link href="/chinh-sach-bao-hanh-giao-hang" className={linkCls}>Giao hàng & lắp đặt</Link></li>
              <li><Link href="/tin-tuc" className={linkCls}>Tin tức & hướng dẫn</Link></li>
              <li><Link href="/lien-he" className={linkCls}>Liên hệ báo giá</Link></li>
            </ul>
          </div>

          {/* CỘT 4: LIÊN HỆ */}
          <div>
            <h4 className={colTitle}>Liên hệ nhanh</h4>
            <a href={`tel:${SITE.phone}`} className="block">
              <span className="block text-[13px] text-[#E1EAF8]">Hotline tư vấn & báo giá</span>
              <span className="mt-1 block text-[26px] font-extrabold leading-none text-[var(--color-promo)]">{SITE.phoneDisplay}</span>
            </a>
            <a href={`mailto:${SITE.email}`} className={`mt-4 block ${linkCls}`}>{SITE.email}</a>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              {SOCIAL_LINKS.filter((s) => s.key !== "zalo").map((s) => (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-full bg-[rgba(255,255,255,0.1)] text-white transition hover:bg-[var(--color-primary)]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d={ICONS[s.key]} /></svg>
                </a>
              ))}
              {SITE.zaloUrl && (
                <a
                  href={SITE.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center rounded-full bg-white px-4 text-[14px] font-bold text-[var(--color-primary)] transition hover:brightness-95"
                >
                  Chat Zalo
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-[rgba(255,255,255,0.12)]">
          <div className="mx-auto flex max-w-[1320px] flex-col gap-2 px-4 py-5 text-[13px] text-[#8FA0C6] md:flex-row md:items-center md:justify-between md:px-8">
            <span>© {new Date().getFullYear()} {SITE.legalName}. Bảo lưu mọi quyền.</span>
            <span>MST {SITE.taxCode} – cấp ngày {SITE.taxCodeIssuedAt}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
