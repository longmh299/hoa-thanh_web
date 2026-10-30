'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ChevronDown } from 'lucide-react';

type Cat = { id: number; name: string };

export default function SearchProductBar({
  categories,
  initialQ,
  initialCategoryId,
}: {
  categories: Cat[];
  initialQ?: string;
  initialCategoryId?: string;
}) {
  const router = useRouter();

  const [q, setQ] = React.useState(initialQ ?? '');
  const [cat, setCat] = React.useState(initialCategoryId ?? ''); // string
  const [openCats, setOpenCats] = React.useState(false);
  const [suggest, setSuggest] = React.useState<{ name: string; slug: string }[]>([]);
  const [showSuggest, setShowSuggest] = React.useState(false);
  const boxRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) {
        setOpenCats(false);
        setShowSuggest(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Debounce suggest
  React.useEffect(() => {
    if (!q || q.trim().length < 2) {
      setSuggest([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const p = new URLSearchParams();
        p.set('q', q);
        if (cat) p.set('categoryId', cat);
        const res = await fetch(`/api/product-suggest?${p.toString()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const json = (await res.json()) as { items: { name: string; slug: string }[] };
        setSuggest(json.items ?? []);
        setShowSuggest(true);
      } catch {
        // ignore
      }
    }, 220);
    return () => clearTimeout(t);
  }, [q, cat]);

  function applyFilter(next?: { q?: string; categoryId?: string; page?: number }) {
    const qs = new URLSearchParams();
    const qVal = next?.q ?? q;
    const cVal = next?.categoryId ?? cat;
    if (qVal) qs.set('q', qVal);
    if (cVal) qs.set('categoryId', cVal);
    qs.set('page', String(next?.page ?? 1));
    router.push(`/san-pham?${qs.toString()}`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyFilter({ page: 1 });
    setShowSuggest(false);
  }

  return (
    <div ref={boxRef} className="w-full">
      <form
        onSubmit={onSubmit}
        className="relative flex items-stretch gap-0 rounded-full border bg-white shadow-sm overflow-hidden"
      >
        {/* Dropdown Category */}
        <button
          type="button"
          onClick={() => setOpenCats((v) => !v)}
          className="shrink-0 px-3 md:px-4 text-sm flex items-center gap-2 border-r hover:bg-gray-50"
          aria-haspopup="listbox"
          aria-expanded={openCats}
        >
          <span className="hidden md:inline">Danh mục</span>
          <span className="md:hidden">DM</span>
          <ChevronDown size={16} />
        </button>

        {/* Input */}
        <div className="flex-1 flex items-center px-3 md:px-4">
          <Search className="mr-2 opacity-60" size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => q.length >= 2 && setShowSuggest(true)}
            placeholder="Tìm sản phẩm, mã SKU…"
            className="w-full outline-none text-sm py-2"
          />
          {q ? (
            <button
              type="button"
              onClick={() => {
                setQ('');
                setSuggest([]);
                setShowSuggest(false);
              }}
              className="ml-2 rounded-full p-1 hover:bg-gray-100"
              aria-label="Xóa"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="rounded-full bg-black text-white text-sm px-4 py-2 m-1 hover:opacity-90"
        >
          Tìm kiếm
        </button>

        {/* Panel chọn danh mục */}
        {openCats && (
          <div
            role="listbox"
            className="absolute left-0 top-full z-20 mt-2 w-64 max-h-80 overflow-auto rounded-xl border bg-white shadow-lg"
          >
            <button
              type="button"
              onClick={() => {
                setCat('');
                setOpenCats(false);
                applyFilter({ categoryId: '', page: 1 });
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${!cat ? 'font-medium' : ''}`}
            >
              Tất cả danh mục
            </button>
            {categories.map((c) => {
              const cid = String(c.id); // ✅ convert number -> string
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCat(cid); // ✅ string
                    setOpenCats(false);
                    applyFilter({ categoryId: cid, page: 1 }); // ✅ string
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                    cat === cid ? 'font-medium' : ''
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Panel gợi ý */}
        {showSuggest && suggest.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-10 mt-2 rounded-xl border bg-white shadow-lg overflow-hidden">
            <ul className="max-h-80 overflow-auto">
              {suggest.map((s) => (
                <li key={s.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      router.push(`/san-pham/${s.slug}`); // đi thẳng tới sản phẩm
                      setShowSuggest(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    {s.name}
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t p-2 text-xs text-gray-500">
              Nhấn Enter để lọc trong danh sách
            </div>
          </div>
        )}
      </form>

      {/* chip danh mục */}
      {cat && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => {
              setCat('');
              applyFilter({ categoryId: '', page: 1 });
            }}
            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs hover:bg-gray-200"
          >
            Đang lọc theo danh mục
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
