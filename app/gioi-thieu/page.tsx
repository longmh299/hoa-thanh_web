// app/gioi-thieu/page.tsx — Giới thiệu (giao diện B)
// ⚠️ Nội dung trong COMPANY / STATS / FIELDS là bản mẫu: sửa cho đúng thực tế của Hòa Thành trước khi đăng.
import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Factory, Globe2, ShieldCheck, Truck, Wrench, Hammer, Cog } from "lucide-react";
import { SITE, SOCIAL_LINKS, abs } from "@/lib/site";
import { ldJson } from "@/lib/seo";

const COMPANY = {
  slogan: "Nhập khẩu trực tiếp – giá tốt tại kho – phục vụ tận nơi.",
  summary:
    "Hòa Thành nhập khẩu và phân phối máy móc thiết bị cho nhà xưởng, cơ sở sản xuất và doanh nghiệp trên toàn quốc. Chúng tôi làm việc trực tiếp với nhà máy sản xuất, nên kiểm soát được chất lượng, chứng từ và giá thành.",
  // ĐIỀN: các đoạn giới thiệu chi tiết
  story: [
    "Mỗi thiết bị đều có đầy đủ chứng từ nhập khẩu (CO, CQ), hoá đơn VAT và được kiểm tra, chạy thử trước khi giao.",
    "Đội ngũ kỹ thuật hỗ trợ khách hàng chọn đúng máy theo sản lượng, mặt bằng và ngân sách — không bán thừa công suất.",
  ],
};

// ⚠️ ĐIỀN số liệu thật (hoặc xoá khối này)
const STATS = [
  { value: "100%", label: "hàng nhập khẩu chính hãng" },
  { value: "63", label: "tỉnh thành giao hàng" },
  { value: "24–48h", label: "phản hồi kỹ thuật" },
  { value: "Trong ngày", label: "gửi báo giá" },
];

const FIELDS = [
  { icon: Factory, title: "Nhà xưởng sản xuất", desc: "Máy móc, thiết bị phục vụ dây chuyền và xưởng sản xuất." },
  { icon: Cog, title: "Cơ khí – gia công", desc: "Thiết bị gia công, cắt, hàn, nén khí và phụ trợ." },
  { icon: Hammer, title: "Xây dựng – công trình", desc: "Máy và dụng cụ cho công trình, nhà thầu thi công." },
  { icon: Globe2, title: "Nhập khẩu theo yêu cầu", desc: "Tìm nguồn và nhập khẩu thiết bị theo cấu hình riêng." },
];

const COMMITMENTS = [
  { icon: ShieldCheck, title: "Hàng chính hãng", desc: "Đầy đủ CO, CQ, hoá đơn VAT cho từng thiết bị." },
  { icon: Clock, title: "Phản hồi nhanh", desc: "Tiếp nhận và xử lý yêu cầu kỹ thuật trong 24–48h." },
  { icon: Truck, title: "Giao hàng toàn quốc", desc: "Giao, lắp đặt và chạy thử tận nơi." },
  { icon: Wrench, title: "Bảo hành tận nơi", desc: "Linh kiện thay thế sẵn kho, kỹ thuật viên hỗ trợ trực tiếp." },
];

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: `${SITE.legalName} – nhập khẩu và phân phối máy móc thiết bị chính hãng, giao hàng, lắp đặt và bảo hành tận nơi toàn quốc.`,
  alternates: { canonical: "/gioi-thieu" },
  openGraph: { title: `Giới thiệu | ${SITE.name}`, url: "/gioi-thieu" },
};

const filled = (v?: string | null) => (v && !v.includes("[ĐIỀN") ? v : undefined);

export default function AboutPage() {
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: abs("/gioi-thieu"),
    name: `Giới thiệu ${SITE.name}`,
    mainEntity: {
      "@type": "LocalBusiness",
      "@id": abs("/#organization"),
      name: SITE.name,
      legalName: SITE.legalName,
      url: abs("/"),
      logo: abs(SITE.logo || "/images/logo.png"),
      foundingDate: SITE.foundingDate || undefined,
      taxID: filled(SITE.taxCode),
      email: SITE.email,
      telephone: `+84${SITE.phone.replace(/^0/, "")}`,
      address: filled(SITE.address),
      sameAs: SOCIAL_LINKS.map((s) => s.href),
    },
  };

  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-ink)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(orgLd) }} />

      <div className="mx-auto max-w-[1320px] px-4 pt-4 md:px-8 md:pt-5">
        <nav aria-label="Breadcrumb" className="text-[13.5px] text-[var(--color-muted)]">
          <Link href="/" className="hover:text-[var(--color-primary)]">Trang chủ</Link>
          <span className="px-1.5">›</span>
          <span className="text-[var(--color-ink)]">Giới thiệu</span>
        </nav>

        {/* ===== BANNER ===== */}
        <section className="relative mt-4 overflow-hidden rounded-[14px] bg-[var(--color-navy)] px-6 py-10 text-white md:px-12 md:py-14">
          <div aria-hidden className="absolute inset-y-0 right-0 w-[40%] bg-[#1A68D3] [clip-path:polygon(22%_0,100%_0,100%_100%,0_100%)]" />
          <div aria-hidden className="absolute bottom-0 left-0 h-[4px] w-full bg-[var(--color-promo)]" />
          <div className="relative max-w-[760px] space-y-4">
            <span className="inline-block rounded-[6px] bg-[var(--color-promo)] px-2.5 py-1 text-[12px] font-extrabold uppercase tracking-[0.08em] text-white">
              Về chúng tôi
            </span>
            <h1 className="text-[clamp(26px,3.4vw,44px)] font-extrabold leading-[1.15] tracking-[-0.02em]">
              {SITE.legalName}
            </h1>
            <p className="text-[16px] leading-relaxed text-[#E1EAF8] md:text-[18px]">{COMPANY.slogan}</p>
          </div>
        </section>

        {/* ===== SỐ LIỆU ===== */}
        <section className="mt-4 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="panel p-5">
              <div className="text-[clamp(24px,2.6vw,34px)] font-extrabold leading-none text-[var(--color-primary)]">{s.value}</div>
              <div className="mt-2 text-[14px] text-[var(--color-muted)]">{s.label}</div>
            </div>
          ))}
        </section>

        {/* ===== CÂU CHUYỆN + THÔNG TIN ===== */}
        <section className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="panel p-6 md:p-8">
            <h2 className="section-title mb-5">Hòa Thành là ai?</h2>
            <div className="space-y-4 text-[16px] leading-[1.75] text-[#3A4256]">
              <p className="text-[17px] font-medium text-[var(--color-ink)]">{COMPANY.summary}</p>
              {COMPANY.story.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>

          <div className="panel p-6 md:p-8">
            <h2 className="section-title mb-5">Thông tin doanh nghiệp</h2>
            <dl className="text-[15px]">
              {[
                { label: "Tên công ty", value: SITE.legalName },
                { label: "Mã số thuế", value: `${SITE.taxCode} (cấp ngày ${SITE.taxCodeIssuedAt})` },
                { label: "Địa chỉ", value: SITE.address },
                { label: "Hotline", value: SITE.phoneDisplay, href: `tel:${SITE.phone}` },
                { label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
              ].map((row) => (
                <div key={row.label} className="grid grid-cols-[34%_1fr] gap-3 border-b border-[var(--color-line)] py-3 last:border-0">
                  <dt className="text-[var(--color-muted)]">{row.label}</dt>
                  {row.href ? (
                    <dd><a href={row.href} className="font-semibold text-[var(--color-primary)] hover:underline">{row.value}</a></dd>
                  ) : (
                    <dd className="font-semibold">{row.value}</dd>
                  )}
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ===== LĨNH VỰC ===== */}
        <section className="mt-8">
          <h2 className="section-title mb-4">Lĩnh vực cung cấp</h2>
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {FIELDS.map((f) => (
              <div key={f.title} className="panel space-y-2.5 p-5">
                <span className="grid h-11 w-11 place-items-center rounded-[10px] bg-[var(--color-promo-soft)] text-[var(--color-promo)]">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="text-[16px] font-bold">{f.title}</h3>
                <p className="text-[14px] leading-relaxed text-[var(--color-muted)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== CAM KẾT ===== */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="section-title">Cam kết dịch vụ</h2>
            <Link href="/chinh-sach-bao-hanh-giao-hang" className="text-[14px] font-semibold text-[var(--color-primary)] hover:underline">
              Chính sách bảo hành ›
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {COMMITMENTS.map((c) => (
              <div key={c.title} className="panel flex gap-3 p-5">
                <c.icon className="mt-0.5 h-6 w-6 shrink-0 text-[var(--color-primary)]" />
                <div>
                  <h3 className="text-[15.5px] font-bold">{c.title}</h3>
                  <p className="mt-1 text-[14px] leading-relaxed text-[var(--color-muted)]">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== KÊU GỌI ===== */}
        <section className="mt-8 flex flex-col items-start justify-between gap-4 rounded-[14px] bg-[var(--color-navy)] px-5 py-6 text-white md:flex-row md:items-center md:px-8">
          <div>
            <h2 className="text-[20px] font-extrabold md:text-[24px]">Cần tư vấn thiết bị cho nhà xưởng?</h2>
            <p className="mt-1 text-[14.5px] text-[#D6E2FF]">Gửi yêu cầu, chúng tôi báo giá trong ngày.</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/lien-he" className="inline-flex min-h-[46px] items-center rounded-[10px] bg-[var(--color-promo)] px-5 font-display text-[15px] font-extrabold text-white hover:bg-[var(--color-promo-dark)]">
              Gửi yêu cầu báo giá
            </Link>
            <a href={SITE.zaloUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[46px] items-center rounded-[10px] bg-white px-5 font-display text-[15px] font-bold text-[var(--color-navy)] hover:brightness-95">
              Chat Zalo
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
