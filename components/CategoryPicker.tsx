"use client";

import { usePathname, useRouter } from "next/navigation";

type Cat = { id: number; name: string; slug: string };

export default function CategoryChips({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const pathname = usePathname();

  function go(slug?: string) {
    if (!slug) {
      router.replace("/san-pham");
    } else {
      router.replace(`/danh-muc/${slug}`);
    }
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">

      {/* ALL */}
      <button
        onClick={() => go(undefined)}
        className={`px-4 py-1.5 rounded-full text-sm border transition whitespace-nowrap
          ${
            pathname === "/san-pham"
              ? "bg-[var(--color-accent)] text-white"
              : "bg-white hover:bg-gray-100 text-gray-700"
          }`}
      >
        Tất cả
      </button>

      {categories.map((c) => {
        const active = pathname.includes(c.slug);

        return (
          <button
            key={c.id}
            onClick={() => go(c.slug)}
            className={`px-4 py-1.5 rounded-full text-sm border transition whitespace-nowrap
              ${
                active
                  ? "bg-[var(--color-accent)] text-white"
                  : "bg-white hover:bg-gray-100 text-gray-700"
              }`}
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
}