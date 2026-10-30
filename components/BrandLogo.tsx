// components/BrandLogo.tsx — logo dùng chung cho Header/Footer.
// Có SITE.logo (ảnh trong /public) thì hiện ảnh; chưa có thì hiện ô chữ monogram.
import { SITE } from "@/lib/site";

export default function BrandLogo({
  dark = false,
  subtitle = "Máy móc thiết bị nhập khẩu",
}: {
  /** true = chữ trắng (dùng trên nền xanh đậm của footer) */
  dark?: boolean;
  subtitle?: string;
}) {
  return (
    <span className="flex items-center gap-2.5">
      {SITE.logo ? (
        <span className={dark ? "rounded-[12px] bg-white px-1.5 py-1" : ""}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SITE.logo} alt="" width={162} height={116} className="h-12 w-auto md:h-[52px]" />
        </span>
      ) : (
        <span
          aria-hidden
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-[12px] text-[17px] font-extrabold tracking-[-0.02em] ${
            dark ? "bg-white text-[var(--color-navy)]" : "bg-[var(--color-primary)] text-white"
          }`}
        >
          {SITE.monogram}
        </span>
      )}
      <span className="flex flex-col leading-none">
        <span
          className={`text-[19px] font-extrabold uppercase tracking-[-0.01em] md:text-[21px] ${
            dark ? "text-white" : "text-[var(--color-navy)]"
          }`}
        >
          {SITE.brand}
        </span>
        <span
          className={`mt-1 text-[11.5px] font-medium ${dark ? "text-[#C6D5EE]" : "text-[var(--color-muted)]"}`}
        >
          {subtitle}
        </span>
      </span>
    </span>
  );
}
