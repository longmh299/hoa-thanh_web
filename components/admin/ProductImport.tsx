// components/admin/ProductImport.tsx — Nhập sản phẩm từ Excel (3 bước: tải file → kiểm tra → nhập)
"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, Download, FileSpreadsheet, Loader2, Upload } from "lucide-react";
import { btnCls } from "@/components/admin/ui";

type Status = "new" | "update" | "skip" | "error";
type Row = {
  row: number;
  name: string;
  slug: string;
  category: string;
  price: number | null;
  coverImage: string;
  gallery: string[];
  status: Status;
  warnings: string[];
  errors: string[];
  newCategory: boolean;
  [k: string]: any;
};
type Summary = {
  total: number;
  new: number;
  update: number;
  skip: number;
  error: number;
  warning: number;
  categories: number;
  newCategories: string[];
  images: number;
};
type Options = { updateExisting: boolean; createCategories: boolean; copyImages: boolean; importHidden: boolean };
type RowResult = { row: number; slug: string; name: string; result: "created" | "updated" | "skipped" | "failed"; message?: string };

const STATUS: Record<Status, { label: string; cls: string }> = {
  new: { label: "Mới", cls: "bg-emerald-50 text-emerald-700" },
  update: { label: "Cập nhật", cls: "bg-blue-50 text-blue-700" },
  skip: { label: "Bỏ qua", cls: "bg-slate-100 text-slate-600" },
  error: { label: "Lỗi", cls: "bg-red-50 text-red-700" },
};

const fmtPrice = (p: number | null) => (p ? new Intl.NumberFormat("vi-VN").format(p) + "₫" : "Liên hệ");

function Steps({ step }: { step: 1 | 2 | 3 }) {
  const items = ["Tải file lên", "Kiểm tra", "Nhập xong"];
  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((t, i) => {
        const n = i + 1;
        const done = n < step;
        const cur = n === step;
        return (
          <div key={t} className="flex items-center gap-3">
            <div className={`flex items-center gap-2 ${cur ? "text-blue-700" : done ? "text-slate-800" : "text-slate-400"}`}>
              <span
                className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                  cur ? "bg-blue-600 text-white" : done ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                {done ? <Check size={14} /> : n}
              </span>
              <span className="text-sm font-medium">{t}</span>
            </div>
            {n < 3 && <span className="h-px w-8 bg-slate-200 sm:w-10" />}
          </div>
        );
      })}
    </div>
  );
}

function Opt({
  checked,
  onChange,
  title,
  desc,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  desc: string;
  disabled?: boolean;
}) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 ${disabled ? "opacity-50" : ""}`}>
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <b className="font-medium text-slate-800">{title}</b>
        <br />
        <span className="text-slate-500">{desc}</span>
      </span>
    </label>
  );
}

export default function ProductImport() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [opt, setOpt] = useState<Options>({ updateExisting: true, createCategories: true, copyImages: true, importHidden: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rows, setRows] = useState<Row[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [sheet, setSheet] = useState("");
  const [cloudinary, setCloudinary] = useState(true);
  const [tab, setTab] = useState<"all" | Status | "warning">("all");

  const [progress, setProgress] = useState({ done: 0, total: 0, phase: "" });
  const [results, setResults] = useState<RowResult[]>([]);
  const [imgCopied, setImgCopied] = useState(0);
  const [imgFailed, setImgFailed] = useState<string[]>([]);
  const [createdCats, setCreatedCats] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (f: File | undefined | null) => {
    setError(null);
    if (!f) return;
    if (!/\.xlsx$/i.test(f.name)) {
      setError("Chỉ nhận file .xlsx. File .xls/.csv: mở bằng Excel rồi “Lưu thành” Excel Workbook (.xlsx).");
      return;
    }
    setFile(f);
  };

  async function check() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("options", JSON.stringify(opt));
      const res = await fetch("/api/admin/products/import/preview", { method: "POST", body: fd });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) throw new Error(json?.error || "Không kiểm tra được file.");
      setRows(json.rows);
      setSummary(json.summary);
      setSheet(json.sheet);
      setCloudinary(json.cloudinary);
      setTab("all");
      setStep(2);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  const toImport = useMemo(() => rows.filter((r) => r.status === "new" || r.status === "update"), [rows]);

  async function run() {
    if (!toImport.length) return;
    setBusy(true);
    setError(null);
    const t0 = Date.now();
    const all: RowResult[] = [];
    let copied = 0;
    const failed: string[] = [];
    try {
      // 1) Danh mục
      setProgress({ done: 0, total: toImport.length, phase: "Đang chuẩn bị danh mục…" });
      const names = [...new Set(toImport.map((r) => r.category).filter(Boolean))];
      const cr = await fetch("/api/admin/products/import/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names, create: opt.createCategories }),
      });
      const cj = await cr.json().catch(() => null);
      if (!cr.ok || !cj?.ok) throw new Error(cj?.error || "Không tạo được danh mục.");
      setCreatedCats(cj.created);

      // 2) Sản phẩm: gửi từng nhóm nhỏ (có chép ảnh thì nhóm nhỏ hơn cho khỏi quá thời gian chờ)
      const size = opt.copyImages && cloudinary ? 3 : 20;
      for (let i = 0; i < toImport.length; i += size) {
        const chunk = toImport.slice(i, i + size);
        setProgress({ done: i, total: toImport.length, phase: opt.copyImages && cloudinary ? "Đang nhập & chép ảnh…" : "Đang nhập…" });
        let json: any = null;
        for (let attempt = 0; attempt < 2 && !json?.ok; attempt++) {
          const res = await fetch("/api/admin/products/import/commit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rows: chunk, options: opt, catMap: cj.map, last: i + size >= toImport.length }),
          }).catch(() => null);
          json = res ? await res.json().catch(() => null) : null;
        }
        if (!json?.ok) {
          chunk.forEach((r) => all.push({ row: r.row, slug: r.slug, name: r.name, result: "failed", message: json?.error || "Mất kết nối / quá thời gian chờ" }));
        } else {
          all.push(...json.results);
          copied += json.imagesCopied;
          failed.push(...json.imagesFailed);
        }
        setResults([...all]);
        setImgCopied(copied);
        setImgFailed([...failed]);
      }
      setProgress({ done: toImport.length, total: toImport.length, phase: "Xong" });
      setElapsed(Math.round((Date.now() - t0) / 1000));
      setStep(3);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function downloadReport() {
    const esc = (s: any) => `"${String(s ?? "").replace(/"/g, '""')}"`;
    const label = { created: "Đã thêm", updated: "Đã cập nhật", skipped: "Bỏ qua", failed: "Lỗi" } as const;
    const lines = [
      ["Dòng", "Tên sản phẩm", "Đường dẫn", "Kết quả", "Ghi chú"].map(esc).join(","),
      ...rows
        .filter((r) => r.status === "error" || r.status === "skip")
        .map((r) => [r.row, r.name, r.slug, r.status === "error" ? "Lỗi – bỏ qua" : "Bỏ qua", [...r.errors, ...r.warnings].join("; ")].map(esc).join(",")),
      ...results.map((r) => {
        const src = rows.find((x) => x.row === r.row);
        return [r.row, r.name, r.slug, label[r.result], [r.message, ...(src?.warnings ?? [])].filter(Boolean).join("; ")].map(esc).join(",");
      }),
    ];
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bao-cao-nhap-san-pham.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function reset() {
    setStep(1);
    setFile(null);
    setRows([]);
    setSummary(null);
    setResults([]);
    setImgCopied(0);
    setImgFailed([]);
    setCreatedCats([]);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const shown = rows.filter((r) =>
    tab === "all" ? true : tab === "warning" ? r.status !== "error" && r.warnings.length > 0 : r.status === tab
  );
  const count = (k: RowResult["result"]) => results.filter((r) => r.result === k).length;

  return (
    <div className="space-y-5">
      <div className="text-sm text-slate-500">
        <Link href="/admin/products" className="hover:text-slate-800">Sản phẩm</Link> / <span className="text-slate-800">Nhập từ Excel</span>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Nhập sản phẩm từ Excel</h1>
          <p className="text-sm text-slate-500">Thêm hoặc cập nhật hàng loạt sản phẩm bằng 1 file .xlsx</p>
        </div>
      </div>
      <Steps step={step} />

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* ===================== BƯỚC 1 ===================== */}
      {step === 1 && (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                pick(e.dataTransfer.files?.[0]);
              }}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition ${
                drag ? "border-blue-500 bg-blue-50" : file ? "border-emerald-300 bg-emerald-50/50" : "border-blue-300 bg-blue-50/40 hover:bg-blue-50"
              }`}
            >
              <div className={`grid h-12 w-12 place-items-center rounded-full ${file ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                {file ? <FileSpreadsheet size={22} /> : <Upload size={22} />}
              </div>
              {file ? (
                <>
                  <div className="text-base font-semibold text-slate-800">{file.name}</div>
                  <div className="text-sm text-slate-500">{(file.size / 1024).toFixed(0)} KB · bấm để chọn file khác</div>
                </>
              ) : (
                <>
                  <div className="text-base font-semibold text-slate-800">Kéo thả file Excel vào đây</div>
                  <div className="text-sm text-slate-500">
                    hoặc <span className="font-medium text-blue-700 underline">chọn file</span> · .xlsx, tối đa 10MB, tối đa 1.000 dòng
                  </div>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={(e) => pick(e.target.files?.[0])}
              />
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <div className="font-medium text-slate-800">Tuỳ chọn</div>
              <Opt
                checked={opt.updateExisting}
                onChange={(v) => setOpt({ ...opt, updateExisting: v })}
                title="Trùng đường dẫn (slug) thì cập nhật"
                desc="Chỉ ghi đè ô có dữ liệu, ô trống giữ nguyên. Không tick: bỏ qua sản phẩm đã có"
              />
              <Opt
                checked={opt.createCategories}
                onChange={(v) => setOpt({ ...opt, createCategories: v })}
                title="Tự tạo danh mục chưa có"
                desc='Theo cột "Danh mục" trong file'
              />
              <Opt
                checked={opt.copyImages}
                onChange={(v) => setOpt({ ...opt, copyImages: v })}
                title="Chép ảnh về Cloudinary của web"
                desc="Ảnh đại diện, ảnh phụ và ảnh trong mô tả – không phụ thuộc web cũ nữa (chạy lâu hơn)"
              />
              <Opt
                checked={opt.importHidden}
                onChange={(v) => setOpt({ ...opt, importHidden: v })}
                title="Nhập ở trạng thái Ẩn"
                desc="Áp dụng cho sản phẩm mới. Kiểm tra xong mới bật hiển thị"
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button type="button" className={btnCls.primary} disabled={!file || busy} onClick={check}>
                {busy && <Loader2 size={16} className="animate-spin" />} Kiểm tra file →
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
              <div className="text-sm font-semibold text-slate-800">Chưa có file mẫu?</div>
              <p className="mt-1 text-sm text-slate-500">Tải file mẫu có sẵn tên cột, ghi chú cách điền và 1 dòng ví dụ.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="/api/admin/products/import/template" className={btnCls.secondary}>
                  <Download size={16} /> Tải file mẫu (.xlsx)
                </a>
                <a href="/api/admin/products/export" className={btnCls.secondary}>
                  <Download size={16} /> Xuất sản phẩm hiện có
                </a>
              </div>
              <p className="mt-3 text-xs text-slate-400">Mẹo: xuất ra, sửa giá/mô tả hàng loạt trong Excel rồi nhập lại để cập nhật.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm md:p-6">
              <div className="font-semibold text-slate-800">Các cột đọc được</div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-600">
                <span><b className="text-slate-800">Tên sản phẩm</b> <span className="text-red-500">*</span></span>
                <span>Đường dẫn (slug)</span>
                <span>Danh mục</span>
                <span>Giá (0 = Liên hệ)</span>
                <span>Mã SKU</span>
                <span>Hiển thị (Có/Không)</span>
                <span>Ảnh đại diện</span>
                <span>Ảnh phụ</span>
                <span>Mô tả ngắn</span>
                <span>Mô tả chi tiết</span>
                <span>SEO Title</span>
                <span>SEO Description</span>
                <span>Nổi bật (Có/Không)</span>
                <span>Video (YouTube)</span>
                <span>Nhãn hiệu</span>
                <span>Công suất, điện áp…</span>
              </div>
              <p className="mt-3 text-xs text-slate-400">Web nhận theo tên cột, thứ tự cột không quan trọng. Đọc được cả file xuất từ Sapo/Bizweb.</p>
            </div>
          </div>
        </div>
      )}

      {/* ===================== BƯỚC 2 ===================== */}
      {step === 2 && summary && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="text-sm">
              <b className="text-slate-800">{file?.name}</b>
              <span className="text-slate-500"> · sheet “{sheet}” · {summary.total} dòng · {summary.images} ảnh</span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">{summary.new} mới</span>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">{summary.update} cập nhật</span>
              {summary.skip > 0 && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{summary.skip} bỏ qua</span>}
              <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">{summary.warning} cảnh báo</span>
              <span className="rounded-full bg-red-50 px-3 py-1 text-red-700">{summary.error} lỗi</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                {summary.categories} danh mục{summary.newCategories.length ? ` (${summary.newCategories.length} tạo mới)` : ""}
              </span>
            </div>
          </div>

          {opt.copyImages && !cloudinary && (
            <div className="border-b border-amber-200 bg-amber-50 px-5 py-2.5 text-sm text-amber-800">
              Chưa cấu hình Cloudinary trong file .env (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET) – ảnh sẽ giữ link cũ, không chép được.
            </div>
          )}
          {summary.newCategories.length > 0 && (
            <div className="border-b border-slate-100 px-5 py-2.5 text-sm text-slate-600">
              <b className="font-medium text-slate-800">Danh mục sẽ tạo mới:</b> {summary.newCategories.join(", ")}
            </div>
          )}

          <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-5 text-sm">
            {(
              [
                ["all", "Tất cả", summary.total],
                ["new", "Mới", summary.new],
                ["update", "Cập nhật", summary.update],
                ["warning", "Cảnh báo", summary.warning],
                ["error", "Lỗi", summary.error],
                ...(summary.skip ? [["skip", "Bỏ qua", summary.skip]] : []),
              ] as [typeof tab, string, number][]
            ).map(([k, l, n]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 font-medium ${
                  tab === k ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {l} <span className="text-xs text-slate-400">{n}</span>
              </button>
            ))}
          </div>

          <div className="max-h-[60vh] overflow-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Dòng</th>
                  <th className="px-3 py-2">Ảnh</th>
                  <th className="px-3 py-2">Sản phẩm</th>
                  <th className="px-3 py-2">Danh mục</th>
                  <th className="px-3 py-2">Giá</th>
                  <th className="px-3 py-2">Số ảnh</th>
                  <th className="px-3 py-2">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.row} className="border-t border-slate-100 align-top">
                    <td className="px-3 py-2.5 text-slate-400">{r.row}</td>
                    <td className="px-3 py-2.5">
                      {r.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.coverImage} alt="" loading="lazy" className="h-10 w-10 rounded border border-slate-100 object-contain" />
                      ) : (
                        <div className="grid h-10 w-10 place-items-center rounded border border-dashed border-amber-300 text-[10px] text-amber-600">—</div>
                      )}
                    </td>
                    <td className="max-w-[360px] px-3 py-2.5">
                      <div className="font-medium text-slate-800">{r.name || <span className="italic text-slate-400">(trống)</span>}</div>
                      <div className="truncate text-xs text-slate-400">{r.slug}</div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600">
                      {r.category || <span className="text-slate-300">—</span>}
                      {r.newCategory && <div className="text-xs text-blue-600">+ tạo mới</div>}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">{r.price === null ? <span className="text-slate-300">—</span> : fmtPrice(r.price)}</td>
                    <td className="px-3 py-2.5 text-slate-600">{(r.coverImage ? 1 : 0) + r.gallery.length}</td>
                    <td className="max-w-[260px] px-3 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span>
                      {r.status !== "error" && r.warnings.length > 0 && (
                        <span className="ml-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Cảnh báo</span>
                      )}
                      {[...r.errors, ...r.warnings].map((m) => (
                        <div key={m} className={`mt-1 text-xs ${r.errors.includes(m) ? "text-red-600" : "text-slate-500"}`}>
                          {m}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
                {!shown.length && (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-sm text-slate-400">
                      Không có dòng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
            <span className="text-sm text-slate-500">
              {busy ? (
                <span className="flex items-center gap-2 text-slate-700">
                  <Loader2 size={16} className="animate-spin" /> {progress.phase} {progress.done}/{progress.total} – đừng đóng trang
                </span>
              ) : (
                "Dòng lỗi sẽ bị bỏ qua. Dòng cảnh báo vẫn được nhập."
              )}
            </span>
            <div className="flex gap-2">
              <button type="button" className={btnCls.secondary} disabled={busy} onClick={reset}>
                ← Chọn file khác
              </button>
              <button type="button" className={btnCls.primary} disabled={busy || !toImport.length} onClick={run}>
                {busy && <Loader2 size={16} className="animate-spin" />}
                Nhập {toImport.length} sản phẩm
              </button>
            </div>
          </div>
          {busy && (
            <div className="h-1.5 bg-slate-100">
              <div className="h-1.5 bg-blue-600 transition-all" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} />
            </div>
          )}
        </div>
      )}

      {/* ===================== BƯỚC 3 ===================== */}
      {step === 3 && (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
            <div className="flex items-center gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-full ${count("failed") ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                {count("failed") ? <AlertTriangle size={20} /> : <Check size={20} />}
              </div>
              <div>
                <div className="text-base font-semibold text-slate-800">
                  Đã nhập xong {count("created") + count("updated")} sản phẩm
                  {count("failed") > 0 && <span className="text-amber-700"> · {count("failed")} lỗi</span>}
                </div>
                <div className="text-sm text-slate-500">
                  Mất {elapsed >= 60 ? `${Math.floor(elapsed / 60)} phút ` : ""}
                  {elapsed % 60} giây
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
              {[
                ["Thêm mới", count("created")],
                ["Cập nhật", count("updated")],
                ["Danh mục mới", createdCats.length],
                ["Ảnh đã chép", imgCopied],
              ].map(([k, v]) => (
                <div key={k as string} className="rounded-lg bg-slate-50 p-3">
                  <div className="text-xl font-semibold text-slate-800">{v as number}</div>
                  <div className="text-xs text-slate-500">{k}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/admin/products" className={btnCls.primary}>
                Xem danh sách sản phẩm
              </Link>
              <button type="button" className={btnCls.secondary} onClick={downloadReport}>
                <Download size={16} /> Tải báo cáo (.csv)
              </button>
              <button type="button" className={btnCls.secondary} onClick={reset}>
                Nhập file khác
              </button>
            </div>
          </div>

          {(() => {
            const failedRows = results.filter((r) => r.result === "failed");
            const noImg = rows.filter((r) => (r.status === "new" || r.status === "update") && !r.coverImage).length;
            const items = [
              ...(failedRows.length ? [`${failedRows.length} sản phẩm lỗi: ${failedRows.slice(0, 5).map((r) => `dòng ${r.row} (${r.message})`).join("; ")}${failedRows.length > 5 ? "…" : ""} – nhập lại file là được, sản phẩm đã vào sẽ chỉ được cập nhật`] : []),
              ...(noImg ? [`${noImg} sản phẩm chưa có ảnh – lọc nhanh ở Sản phẩm → “chưa có ảnh đại diện”`] : []),
              ...(imgFailed.length ? [`${imgFailed.length} ảnh không chép được (link hỏng hoặc web cũ chặn) – đang giữ link cũ`] : []),
              ...(summary?.error ? [`${summary.error} dòng lỗi trong file đã bị bỏ qua – xem trong báo cáo`] : []),
            ];
            return items.length ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 md:p-6">
                <div className="font-semibold">Cần xem lại ({items.length})</div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {items.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                {noImg > 0 && (
                  <Link href="/admin/products?missing=image" className="mt-3 inline-block font-medium underline">
                    Mở danh sách chưa có ảnh
                  </Link>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800 md:p-6">
                Không có gì cần xem lại.
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
