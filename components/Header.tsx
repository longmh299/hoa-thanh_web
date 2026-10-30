"use client";
// components/Header.tsx — Header giao diện B (kiểu sàn bán hàng):
// thanh thông tin xanh đậm → logo + ô tìm kiếm lớn + hotline → thanh menu xanh có "Danh mục sản phẩm".
// Khi cuộn: thanh thông tin trên cùng trượt mất, phần còn lại (cao 120px) dính ở đầu trang.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import BrandLogo from "./BrandLogo";

type Cat = {
  id: number;
  name: string;
  slug: string;
  ogImage?: string | null;
  children?: Cat[];
};

const nav = [
  { href: "/", label: "Trang chủ" },
  { href: "/san-pham", label: "Sản phẩm" },
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/tin-tuc", label: "Tin tức" },
  { href: "/chinh-sach-bao-hanh-giao-hang", label: "Bảo hành & giao hàng" },
  { href: "/lien-he", label: "Liên hệ" },
];

function IconSearch({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function IconPhone({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}

function SearchForm({ className = "" }: { className?: string }) {
  return (
    <form action="/tim-kiem" method="get" role="search" className={`flex h-11 overflow-hidden rounded-[10px] border-[1.5px] border-[var(--color-navy)] bg-white ${className}`}>
      <input
        type="search"
        name="q"
        required
        placeholder="Bạn cần tìm máy gì? VD: máy nén khí, máy hàn…"
        aria-label="Tìm kiếm sản phẩm"
        className="min-w-0 flex-1 bg-transparent px-4 text-[14.5px] text-[var(--color-ink)] outline-none placeholder:text-[#8A94A8]"
      />
      <button
        type="submit"
        className="flex items-center gap-2 bg-[var(--color-promo)] px-4 font-display text-[14.5px] font-bold text-white transition hover:bg-[var(--color-promo-dark)] md:px-6"
      >
        <IconSearch />
        <span className="hidden sm:inline">Tìm kiếm</span>
      </button>
    </form>
  );
}

export default function Header({ categories = [] }: { categories: Cat[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // menu mobile
  const [activeId, setActiveId] = useState<number | null>(null);

  // Đóng menu khi chuyển trang
  useEffect(() => {
    setOpen(false);
    setActiveId(null);
  }, [pathname]);

  const active = categories.find((c) => c.id === activeId);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header className="sticky top-0 z-50 md:-top-9">
      {/* THANH THÔNG TIN TRÊN CÙNG (desktop) */}
      <div className="hidden h-9 bg-[#073F8F] text-[13px] text-[#C6D5EE] md:block">
        <div className="mx-auto flex h-full max-w-[1320px] items-center justify-between gap-6 px-8">
          <span>
            <b className="font-semibold text-[var(--color-promo)]">Nhập khẩu chính hãng</b>
            <span className="px-2 opacity-50">·</span>Giao hàng & lắp đặt toàn quốc
            <span className="px-2 opacity-50">·</span>Bảo hành tận nơi
          </span>
          <span className="flex items-center gap-5">
            <a href={`mailto:${SITE.email}`} className="hover:text-white">{SITE.email}</a>
            <Link href="/chinh-sach-bao-hanh-giao-hang" className="hover:text-white">Chính sách bảo hành</Link>
            <Link href="/lien-he" className="hover:text-white">Hỗ trợ khách hàng</Link>
          </span>
        </div>
      </div>

      {/* LOGO + TÌM KIẾM + HOTLINE */}
      <div className="border-b border-[var(--color-line)] bg-white">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-4 px-4 md:h-[76px] md:gap-8 md:px-8">
          <Link href="/" aria-label={`${SITE.name} – Trang chủ`} className="shrink-0">
            <BrandLogo />
          </Link>

          <SearchForm className="hidden flex-1 md:flex" />

          <a href={`tel:${SITE.phone}`} className="hidden shrink-0 items-center gap-2.5 lg:flex">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--color-promo-soft)] text-[var(--color-promo)]">
              <IconPhone />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[12px] text-[var(--color-muted)]">Hotline tư vấn & báo giá</span>
              <span className="font-display text-[19px] font-extrabold text-[var(--color-navy)]">{SITE.phoneDisplay}</span>
            </span>
          </a>

          {/* Mobile: nút gọi + nút menu */}
          <div className="ml-auto flex items-center gap-2 md:hidden">
            <a
              href={`tel:${SITE.phone}`}
              aria-label={`Gọi ${SITE.phoneDisplay}`}
              className="grid h-10 w-10 place-items-center rounded-[10px] bg-[var(--color-promo-soft)] text-[var(--color-promo)]"
            >
              <IconPhone className="h-5 w-5" />
            </a>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-[10px] bg-[var(--color-navy)] text-white"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Đóng menu" : "Mở menu"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile: ô tìm kiếm dưới logo */}
        <div className="px-4 pb-3 md:hidden">
          <SearchForm />
        </div>
      </div>

      {/* THANH MENU XANH (desktop) */}
      <nav aria-label="Điều hướng chính" className="relative hidden bg-[var(--color-navy)] md:block">
        <div className="mx-auto flex h-11 max-w-[1320px] items-stretch px-8">
          {/* DANH MỤC SẢN PHẨM + menu thả xuống */}
          <div className="group relative" onMouseLeave={() => setActiveId(null)}>
            <Link
              href="/san-pham"
              className="flex h-full w-[240px] items-center gap-2.5 bg-[var(--color-promo)] px-4 font-display text-[14.5px] font-bold text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Danh mục sản phẩm
              <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </Link>

            {categories.length > 0 && (
              <div className="invisible absolute left-0 top-full z-50 flex opacity-0 transition duration-150 group-hover:visible group-hover:opacity-100">
                <ul className="max-h-[70vh] w-[240px] overflow-y-auto rounded-b-[12px] border border-t-0 border-[var(--color-line)] bg-white py-2 shadow-[0_18px_40px_-16px_rgba(8,63,143,0.35)]">
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/${c.slug}`}
                        onMouseEnter={() => setActiveId(c.id)}
                        className={`flex items-center justify-between gap-2 px-4 py-2.5 text-[14px] transition ${
                          activeId === c.id
                            ? "bg-[var(--color-blue-soft)] font-semibold text-[var(--color-primary)]"
                            : "text-[var(--color-ink)] hover:bg-[var(--color-blue-soft)]"
                        }`}
                      >
                        <span className="line-clamp-1">{c.name}</span>
                        {!!c.children?.length && <span aria-hidden className="text-[#8A94A8]">›</span>}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Bảng danh mục con của mục đang rê chuột */}
                {active?.children?.length ? (
                  <div className="max-h-[70vh] w-[min(760px,calc(100vw-340px))] overflow-y-auto rounded-br-[12px] border border-l-0 border-t-0 border-[var(--color-line)] bg-white p-6 shadow-[0_18px_40px_-16px_rgba(8,63,143,0.35)]">
                    <div className="grid grid-cols-3 gap-x-6 gap-y-5">
                      {active.children.map((sub) => (
                        <div key={sub.id}>
                          <Link href={`/${sub.slug}`} className="text-[14.5px] font-bold text-[var(--color-navy)] hover:text-[var(--color-primary)]">
                            {sub.name}
                          </Link>
                          {!!sub.children?.length && (
                            <ul className="mt-2 space-y-1.5">
                              {sub.children.map((child) => (
                                <li key={child.id}>
                                  <Link href={`/${child.slug}`} className="text-[13.5px] text-[var(--color-muted)] hover:text-[var(--color-primary)]">
                                    {child.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* CÁC TRANG */}
          <div className="flex flex-1 items-stretch pl-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center px-3.5 font-display text-[14.5px] font-semibold transition lg:px-4 ${
                  isActive(item.href)
                    ? "text-white after:absolute after:inset-x-3.5 after:bottom-0 after:h-[3px] after:rounded-t after:bg-[var(--color-promo)]"
                    : "text-[#E1EAF8] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <Link
            href="/lien-he"
            className="my-1.5 flex items-center gap-1.5 rounded-[8px] border border-[rgba(255,255,255,0.35)] px-4 font-display text-[14px] font-bold text-white transition hover:border-white hover:bg-[rgba(255,255,255,0.08)]"
          >
            Nhận báo giá nhanh
          </Link>
        </div>
      </nav>

      {/* MENU MOBILE */}
      {open && (
        <div className="max-h-[calc(100vh-120px)] overflow-y-auto border-b border-[var(--color-line)] bg-white md:hidden">
          <nav aria-label="Menu mobile" className="px-4 pb-5">
            <div className="grid grid-cols-2 gap-2 pt-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-[10px] px-3.5 py-3 text-[15px] font-semibold ${
                    isActive(item.href)
                      ? "bg-[var(--color-navy)] text-white"
                      : "bg-[var(--color-bg)] text-[var(--color-ink)]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {categories.length > 0 && (
              <div className="mt-5">
                <div className="eyebrow mb-2">Danh mục sản phẩm</div>
                <ul className="divide-y divide-[var(--color-line)] rounded-[12px] border border-[var(--color-line)]">
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link href={`/${c.slug}`} className="flex items-center justify-between px-4 py-3 text-[15px]">
                        {c.name}
                        <span aria-hidden className="text-[#8A94A8]">›</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2">
              <a href={`tel:${SITE.phone}`} className="btn-pill-outline">
                Gọi {SITE.phoneDisplay}
              </a>
              <Link href="/lien-he" className="btn-pill-primary">
                Nhận báo giá
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
