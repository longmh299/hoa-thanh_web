// lib/product-import.ts
// Đọc file Excel sản phẩm → danh sách dòng đã chuẩn hoá + kiểm tra trước khi nhập.
// Dùng chung cho: /api/admin/products/import/* và /api/admin/products/export.
// Chỉ chạy phía server (Node).
import ExcelJS from "exceljs";
import { slugify } from "@/lib/slug";

/* ===================== Kiểu dữ liệu ===================== */

export type ImportRow = {
  row: number; // số dòng trong Excel (để báo lỗi)
  name: string;
  slug: string;
  category: string;
  price: number | null; // null = file không có cột giá / ô trống
  sku: string;
  published: boolean | null;
  isFeatured: boolean | null;
  coverImage: string;
  gallery: string[];
  short: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  videoUrl: string;
  brand: string;
  variants: string;
  power: string;
  voltage: string;
  weight: string;
  dimensions: string;
  material: string;
  warranty: string;
};

export type RowStatus = "new" | "update" | "skip" | "error";

export type CheckedRow = ImportRow & {
  status: RowStatus;
  warnings: string[];
  errors: string[];
  newCategory: boolean;
};

export type ImportOptions = {
  updateExisting: boolean;
  createCategories: boolean;
  copyImages: boolean;
  importHidden: boolean;
};

/* ===================== Cột Excel ===================== */

/** Cột web hiểu được. `keys`: tên cột đã bỏ dấu, viết thường, bỏ phần trong ngoặc / sau dấu "–". */
export const COLUMNS: { field: keyof ImportRow; label: string; keys: string[]; width: number; note?: string }[] = [
  { field: "name", label: "Tên sản phẩm", keys: ["ten san pham", "ten"], width: 46, note: "Bắt buộc" },
  { field: "slug", label: "Đường dẫn (slug)", keys: ["duong dan", "slug", "duong dan alias"], width: 36, note: "Để trống = tự tạo từ tên. Trùng slug sản phẩm đã có = cập nhật sản phẩm đó" },
  { field: "category", label: "Danh mục", keys: ["danh muc", "loai san pham"], width: 26, note: "Tên danh mục. Chưa có thì tự tạo (nếu bật tuỳ chọn)" },
  { field: "price", label: "Giá (₫) – 0 = Liên hệ", keys: ["gia", "gia ban"], width: 16, note: "Số, không cần dấu chấm. 0 hoặc trống = hiện “Liên hệ”" },
  { field: "sku", label: "Mã SKU", keys: ["ma sku", "sku", "ma san pham"], width: 14 },
  { field: "published", label: "Hiển thị", keys: ["hien thi"], width: 10, note: "Có / Không" },
  { field: "isFeatured", label: "Nổi bật", keys: ["noi bat"], width: 10, note: "Có / Không" },
  { field: "coverImage", label: "Ảnh đại diện", keys: ["anh dai dien"], width: 40, note: "Link ảnh (https://…)" },
  { field: "gallery", label: "Ảnh phụ", keys: ["anh phu", "thu vien anh"], width: 40, note: "Nhiều link: mỗi link 1 dòng trong ô, hoặc cách nhau bằng dấu phẩy" },
  { field: "short", label: "Mô tả ngắn", keys: ["mo ta ngan"], width: 40, note: "Mỗi ý 1 dòng" },
  { field: "description", label: "Mô tả chi tiết", keys: ["mo ta chi tiet", "mo ta san pham", "mo ta"], width: 60, note: "Chữ thường hoặc HTML" },
  { field: "metaTitle", label: "SEO Title", keys: ["seo title", "the tieu de"], width: 36 },
  { field: "metaDescription", label: "SEO Description", keys: ["seo description", "the mo ta"], width: 46 },
  { field: "videoUrl", label: "Video (YouTube)", keys: ["video", "video youtube"], width: 30 },
  { field: "brand", label: "Nhãn hiệu", keys: ["nhan hieu", "thuong hieu"], width: 14 },
  { field: "power", label: "Công suất", keys: ["cong suat"], width: 14 },
  { field: "voltage", label: "Điện áp", keys: ["dien ap"], width: 12 },
  { field: "weight", label: "Trọng lượng", keys: ["trong luong"], width: 12 },
  { field: "dimensions", label: "Kích thước", keys: ["kich thuoc"], width: 16 },
  { field: "material", label: "Chất liệu", keys: ["chat lieu"], width: 14 },
  { field: "warranty", label: "Bảo hành", keys: ["bao hanh"], width: 12 },
  { field: "variants", label: "Phiên bản", keys: ["phien ban"], width: 30, note: "Ghi chú các phiên bản/giá – thêm vào cuối mô tả khi tạo mới" },
];

const deaccent = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

/** "Giá (₫) – 0 = Liên hệ" → "gia" ; "Tên sản phẩm*" → "ten san pham" */
function headerKey(h: string) {
  const base = h.split(/[(\[–—]| - /)[0];
  return deaccent(base).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function fieldForHeader(h: string): keyof ImportRow | null {
  const k = headerKey(h);
  if (!k) return null;
  for (const c of COLUMNS) if (c.keys.includes(k)) return c.field;
  return null;
}

/* ===================== Đọc ô ===================== */

function cellText(v: ExcelJS.CellValue): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (v instanceof Date) return v.toISOString();
  const o = v as any;
  if (Array.isArray(o.richText)) return o.richText.map((r: any) => r.text).join("");
  if (o.hyperlink) return String(o.text?.richText ? o.text.richText.map((r: any) => r.text).join("") : o.text ?? o.hyperlink);
  if ("result" in o) return o.result == null ? "" : String(o.result);
  if (o.error) return "";
  return String(o);
}

const clean = (s: string) => s.replace(/\r\n?/g, "\n").trim();

function toPrice(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  if (/li[eê]n\s*h[eệ]/i.test(t)) return 0;
  const digits = t.replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

function toBool(s: string): boolean | null {
  const t = deaccent(s.trim().toLowerCase());
  if (!t) return null;
  if (["co", "yes", "y", "1", "true", "x", "hien", "hien thi"].includes(t)) return true;
  if (["khong", "no", "n", "0", "false", "an"].includes(t)) return false;
  return null;
}

/** Link ảnh: bỏ khoảng trắng, "//cdn…" → "https://cdn…", bỏ dòng không phải link. */
export function normUrl(u: string) {
  let s = u.trim();
  if (s.startsWith("//")) s = "https:" + s;
  return /^https?:\/\//i.test(s) ? s : "";
}

function splitUrls(s: string) {
  return s
    .split(/[\n,;]+|\s+(?=https?:)/)
    .map(normUrl)
    .filter(Boolean);
}

/* ===================== Đọc file ===================== */

export async function parseWorkbook(buf: ArrayBuffer): Promise<{ rows: ImportRow[]; sheet: string; columns: string[] }> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);

  // Ưu tiên sheet tên "Sản phẩm", không thì sheet đầu tiên có cột tên sản phẩm
  const sheets = [...wb.worksheets].sort((a, b) => Number(headerKey(b.name) === "san pham") - Number(headerKey(a.name) === "san pham"));
  for (const ws of sheets) {
    // Tìm dòng tiêu đề trong 5 dòng đầu
    for (let hr = 1; hr <= Math.min(5, ws.rowCount); hr++) {
      const map = new Map<number, keyof ImportRow>();
      const used = new Set<string>();
      ws.getRow(hr).eachCell((cell, col) => {
        const f = fieldForHeader(cellText(cell.value));
        if (f && !used.has(f)) {
          map.set(col, f);
          used.add(f);
        }
      });
      if (!used.has("name")) continue;

      const rows: ImportRow[] = [];
      for (let r = hr + 1; r <= ws.rowCount; r++) {
        const raw: Partial<Record<keyof ImportRow, string>> = {};
        let any = false;
        ws.getRow(r).eachCell((cell, col) => {
          const f = map.get(col);
          if (!f) return;
          const t = clean(cellText(cell.value));
          if (t) {
            raw[f] = t;
            any = true;
          }
        });
        if (!any) continue;

        const name = (raw.name ?? "").replace(/\s+/g, " ").trim();
        const slug = slugify(raw.slug || name);
        const cover = normUrl(raw.coverImage ?? "");

        // File xuất từ Sapo/Haravan: dòng không có tên, cùng slug với dòng trên = ảnh phụ của sản phẩm đó
        const prev = rows[rows.length - 1];
        if (!name && prev && raw.slug && slugify(raw.slug) === prev.slug) {
          for (const u of [cover, ...splitUrls(raw.gallery ?? "")])
            if (u && u !== prev.coverImage && !prev.gallery.includes(u)) prev.gallery.push(u);
          continue;
        }

        rows.push({
          row: r,
          name,
          slug,
          category: (raw.category ?? "").replace(/\s+/g, " ").trim(),
          price: raw.price !== undefined ? toPrice(raw.price) : null,
          sku: (raw.sku ?? "").trim(),
          published: raw.published !== undefined ? toBool(raw.published) : null,
          isFeatured: raw.isFeatured !== undefined ? toBool(raw.isFeatured) : null,
          coverImage: cover,
          gallery: splitUrls(raw.gallery ?? "").filter((u) => u !== cover),
          short: raw.short ?? "",
          description: raw.description ?? "",
          metaTitle: raw.metaTitle ?? "",
          metaDescription: (raw.metaDescription ?? "").replace(/\s+/g, " "),
          videoUrl: raw.videoUrl ?? "",
          brand: raw.brand ?? "",
          variants: raw.variants ?? "",
          power: raw.power ?? "",
          voltage: raw.voltage ?? "",
          weight: raw.weight ?? "",
          dimensions: raw.dimensions ?? "",
          material: raw.material ?? "",
          warranty: raw.warranty ?? "",
        });
      }
      return { rows, sheet: ws.name, columns: [...used] };
    }
  }
  throw new Error('Không tìm thấy cột "Tên sản phẩm" trong file. Hãy dùng file mẫu.');
}

/* ===================== Kiểm tra ===================== */

export type DbSnapshot = {
  products: { slug: string; sku: string | null }[];
  categories: { name: string; slug: string }[];
};

export const catKey = (name: string) => deaccent(name).toLowerCase().replace(/\s+/g, " ").trim();

/** Kiểm tra từng dòng với dữ liệu đang có. Không ghi gì vào database. */
export function checkRows(rows: ImportRow[], db: DbSnapshot, opt: ImportOptions): CheckedRow[] {
  const existingSlug = new Set(db.products.map((p) => p.slug));
  const skuOwner = new Map(db.products.filter((p) => p.sku).map((p) => [p.sku!.toLowerCase(), p.slug]));
  const catNames = new Set(db.categories.map((c) => catKey(c.name)));
  const seenSlug = new Set<string>();
  const seenSku = new Set<string>();

  return rows.map((r) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    if (!r.name) errors.push("Thiếu tên sản phẩm");
    if (!r.slug) errors.push("Không tạo được đường dẫn (slug)");
    if (r.slug && seenSlug.has(r.slug)) errors.push("Trùng đường dẫn với dòng phía trên trong file");
    if (r.slug) seenSlug.add(r.slug);

    const exists = existingSlug.has(r.slug);
    let status: RowStatus = errors.length ? "error" : exists ? (opt.updateExisting ? "update" : "skip") : "new";

    let sku = r.sku;
    if (sku) {
      const k = sku.toLowerCase();
      const owner = skuOwner.get(k);
      if (seenSku.has(k) || (owner && owner !== r.slug)) {
        warnings.push(`Mã SKU "${sku}" đã dùng cho sản phẩm khác – bỏ trống SKU`);
        sku = "";
      } else seenSku.add(k);
    }

    let newCategory = false;
    if (!r.category) {
      if (status === "new") warnings.push("Không có danh mục");
    } else if (!catNames.has(catKey(r.category))) {
      if (opt.createCategories) newCategory = true;
      else warnings.push(`Danh mục "${r.category}" chưa có – để trống`);
    }

    if (status === "new" && !r.coverImage) warnings.push("Chưa có ảnh đại diện");
    if (r.price && r.price > 0 && r.price < 10000) warnings.push(`Giá ${r.price}₫ rất thấp – kiểm tra lại`);
    if (status === "skip") warnings.push("Đã có sản phẩm cùng đường dẫn – bỏ qua (tuỳ chọn cập nhật đang tắt)");

    return { ...r, sku, status, errors, warnings, newCategory };
  });
}

/* ===================== Xuất file ===================== */

export type ExportProduct = {
  name: string;
  slug: string;
  price: number | null;
  sku: string | null;
  published: boolean;
  isFeatured: boolean;
  coverImage: string | null;
  short: string | null;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  videoUrl: string | null;
  power: string | null;
  voltage: string | null;
  weight: string | null;
  dimensions: string | null;
  material: string | null;
  warranty: string | null;
  category: { name: string } | null;
  images: { url: string }[];
  attributes: { name: string; value: string }[];
};

/** Tạo file Excel cùng định dạng file mẫu. products rỗng = file mẫu có 1 dòng ví dụ. */
export async function buildWorkbook(products: ExportProduct[] | null): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Website";
  const cols = COLUMNS.filter((c) => c.field !== "variants");
  const ws = wb.addWorksheet("Sản phẩm", { views: [{ state: "frozen", xSplit: 1, ySplit: 1 }] });
  ws.columns = cols.map((c) => ({ header: c.label, key: c.field, width: c.width }));

  const head = ws.getRow(1);
  head.height = 30;
  head.eachCell((cell, i) => {
    cell.font = { name: "Arial", bold: true, color: { argb: "FFFFFFFF" }, size: 10 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: cols[i - 1].field === "name" ? "FFE5361B" : "FF0B57C2" } };
    cell.alignment = { vertical: "middle", wrapText: true };
    const note = cols[i - 1].note;
    if (note) cell.note = note;
  });

  const yesNo = (b: boolean) => (b ? "Có" : "Không");
  const list =
    products ??
    ([
      {
        name: "Máy hàn miệng túi liên tục FR-900",
        slug: "may-han-mieng-tui-lien-tuc-fr-900",
        price: 4500000,
        sku: "FR-900",
        published: true,
        isFeatured: false,
        coverImage: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        short: "Hàn túi nilon, túi bạc liên tục\nCó in date",
        description: "<p>Máy hàn miệng túi liên tục FR-900 dùng cho túi nhựa, túi bạc…</p>",
        metaTitle: "",
        metaDescription: "",
        videoUrl: "",
        power: "500W",
        voltage: "220V",
        weight: "25 kg",
        dimensions: "",
        material: "Inox",
        warranty: "12 tháng",
        category: { name: "Máy hàn miệng túi" },
        images: [],
        attributes: [{ name: "Nhãn hiệu", value: "Hòa Thành" }],
      },
    ] as ExportProduct[]);

  for (const p of list) {
    ws.addRow({
      name: p.name,
      slug: p.slug,
      category: p.category?.name ?? "",
      price: p.price ?? 0,
      sku: p.sku ?? "",
      published: yesNo(p.published),
      isFeatured: yesNo(p.isFeatured),
      coverImage: p.coverImage ?? "",
      gallery: p.images.map((i) => i.url).join("\n"),
      short: p.short ?? "",
      description: (p.description ?? "").slice(0, 32000),
      metaTitle: p.metaTitle ?? "",
      metaDescription: p.metaDescription ?? "",
      videoUrl: p.videoUrl ?? "",
      brand: p.attributes.find((a) => /nh[aã]n hi[eệ]u|th[uư][oơ]ng hi[eệ]u/i.test(a.name))?.value ?? "",
      power: p.power ?? "",
      voltage: p.voltage ?? "",
      weight: p.weight ?? "",
      dimensions: p.dimensions ?? "",
      material: p.material ?? "",
      warranty: p.warranty ?? "",
    });
  }
  ws.eachRow((row, i) => {
    if (i === 1) return;
    row.font = { name: "Arial", size: 10 };
    row.alignment = { vertical: "top" };
  });
  ws.getColumn("price").numFmt = '#,##0;-#,##0;"Liên hệ"';

  // Sheet hướng dẫn
  const guide = wb.addWorksheet("Hướng dẫn");
  guide.getColumn(1).width = 24;
  guide.getColumn(2).width = 90;
  guide.addRow(["Cột", "Cách điền"]).font = { name: "Arial", bold: true };
  for (const c of COLUMNS) guide.addRow([c.label, c.note ?? ""]);
  guide.addRow([]);
  guide.addRow(["Lưu ý", "Chỉ cột “Tên sản phẩm” là bắt buộc. Khi cập nhật sản phẩm đã có, ô để trống sẽ giữ nguyên dữ liệu cũ."]);
  guide.addRow(["", "Thứ tự cột không quan trọng, web nhận theo tên cột. Có thể xoá cột không dùng."]);
  guide.eachRow((r) => {
    r.alignment = { vertical: "top", wrapText: true };
    if (!r.font?.bold) r.font = { name: "Arial", size: 10 };
  });

  return Buffer.from(await wb.xlsx.writeBuffer());
}
