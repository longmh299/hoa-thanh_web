// lib/product-import-run.ts
// Ghi dữ liệu nhập từ Excel vào database (tạo danh mục, chép ảnh về Cloudinary, tạo/cập nhật sản phẩm).
// Chỉ gọi từ route handler đã kiểm tra quyền admin.
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { catKey, normUrl, type CheckedRow, type ImportOptions } from "@/lib/product-import";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const cloudinaryReady = () =>
  Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

/** Đường dẫn trùng tên trang có sẵn của web → không dùng làm slug danh mục (danh mục nằm ở /<slug>) */
const RESERVED = new Set([
  "admin", "api", "san-pham", "tin-tuc", "gioi-thieu", "lien-he", "tim-kiem",
  "chinh-sach-bao-hanh-giao-hang", "sitemap", "robots", "images", "icon",
]);

/* ===================== Danh mục ===================== */

/** Trả về map "tên danh mục (đã chuẩn hoá)" → id. Tạo danh mục chưa có nếu create = true. */
export async function ensureCategories(names: string[], create: boolean) {
  const all = await prisma.category.findMany({ select: { id: true, name: true, slug: true, order: true } });
  const map: Record<string, number> = {};
  for (const c of all) map[catKey(c.name)] ??= c.id;
  const slugs = new Set(all.map((c) => c.slug));
  let order = all.reduce((m, c) => Math.max(m, c.order), 0);
  const created: string[] = [];

  if (create) {
    for (const raw of names) {
      const name = raw.replace(/\s+/g, " ").trim();
      const k = catKey(name);
      if (!name || map[k]) continue;
      const base = slugify(name) || "danh-muc";
      let slug = RESERVED.has(base) ? `${base}-1` : base;
      for (let i = 2; slugs.has(slug); i++) slug = `${base}-${i}`;
      slugs.add(slug);
      const c = await prisma.category.create({ data: { name, slug, order: ++order }, select: { id: true } });
      map[k] = c.id;
      created.push(name);
    }
  }
  return { map, created };
}

/* ===================== Ảnh ===================== */

const isCloudinary = (u: string) => /res\.cloudinary\.com\//i.test(u);

/** Chép 1 ảnh (theo link) về Cloudinary. Cùng 1 link luôn ra cùng 1 ảnh (không bị trùng khi nhập lại). */
async function copyOne(url: string): Promise<string> {
  const u = normUrl(url);
  if (!u || isCloudinary(u)) return u || url;
  const id = crypto.createHash("sha1").update(u).digest("hex").slice(0, 20);
  const res = await cloudinary.uploader.upload(u, {
    folder: `${process.env.CLOUDINARY_FOLDER || "hoathanh"}/san-pham`,
    public_id: id,
    overwrite: false,
    resource_type: "image",
    timeout: 30000,
  });
  return res.secure_url;
}

async function mapLimit<T, R>(items: T[], limit: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const k = i++;
        out[k] = await fn(items[k]);
      }
    })
  );
  return out;
}

type ImageCopier = { copy: (u: string) => Promise<string>; copied: number; failed: string[] };

function makeCopier(enabled: boolean): ImageCopier {
  const cache = new Map<string, Promise<string>>();
  const c: ImageCopier = {
    copied: 0,
    failed: [],
    copy: (u) => {
      const url = normUrl(u) || u;
      if (!enabled || !url || isCloudinary(url)) return Promise.resolve(url);
      if (!cache.has(url)) {
        cache.set(
          url,
          copyOne(url)
            .then((r) => {
              c.copied++;
              return r;
            })
            .catch(() => {
              c.failed.push(url);
              return url; // giữ link cũ
            })
        );
      }
      return cache.get(url)!;
    },
  };
  return c;
}

/** Chép ảnh nằm trong HTML mô tả rồi thay link */
async function rewriteHtmlImages(html: string, copier: ImageCopier) {
  const srcs = [...new Set([...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1]))];
  if (!srcs.length) return html;
  const done = await mapLimit(srcs, 4, (s) => copier.copy(s));
  let out = html;
  srcs.forEach((s, i) => {
    if (done[i] !== s) out = out.split(s).join(done[i]);
  });
  return out.replace(/src=(["'])\/\//g, "src=$1https://");
}

/* ===================== Sản phẩm ===================== */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Chữ thường (không có thẻ HTML) → các đoạn <p> */
function toHtml(s: string) {
  if (!s) return "";
  if (/<[a-z][\s\S]*>/i.test(s)) return s;
  return s
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p)}</p>`)
    .join("\n");
}

function toEmbedUrl(url: string) {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    if (u.hostname === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.replace("/", "")}`;
    return url;
  } catch {
    return url;
  }
}

export type RowResult = {
  row: number;
  slug: string;
  name: string;
  result: "created" | "updated" | "skipped" | "failed";
  message?: string;
  id?: number;
};

/** Nhập 1 nhóm dòng (client gửi từng nhóm nhỏ để không bị quá thời gian chờ). */
export async function importRows(rows: CheckedRow[], opt: ImportOptions, catMap: Record<string, number>) {
  const copier = makeCopier(opt.copyImages && cloudinaryReady());
  const results: RowResult[] = [];

  for (const r of rows) {
    const base = { row: r.row, slug: r.slug, name: r.name };
    if (r.status === "error") {
      results.push({ ...base, result: "skipped", message: r.errors.join("; ") });
      continue;
    }
    try {
      const existing = await prisma.product.findUnique({ where: { slug: r.slug }, select: { id: true } });
      if (existing && !opt.updateExisting) {
        results.push({ ...base, result: "skipped", message: "Đã có – bỏ qua" });
        continue;
      }

      // Ảnh
      const [cover, gallery, descHtml] = await Promise.all([
        r.coverImage ? copier.copy(r.coverImage) : Promise.resolve(""),
        mapLimit(r.gallery, 4, (u) => copier.copy(u)),
        (async () => {
          let html = toHtml(r.description);
          if (r.variants) html += `\n<h3>Các phiên bản</h3>\n${toHtml(r.variants.replace(/;\s*/g, "\n"))}`;
          return opt.copyImages && cloudinaryReady() ? rewriteHtmlImages(html, copier) : html.replace(/src=(["'])\/\//g, "src=$1https://");
        })(),
      ]);

      const categoryId = r.category ? catMap[catKey(r.category)] ?? null : null;
      const specs = {
        power: r.power, voltage: r.voltage, weight: r.weight,
        dimensions: r.dimensions, material: r.material, warranty: r.warranty,
      };

      if (!existing) {
        const created = await prisma.product.create({
          data: {
            name: r.name,
            slug: r.slug,
            short: r.short || null,
            description: descHtml || null,
            sku: r.sku || null,
            price: r.price ?? 0,
            coverImage: cover || null,
            videoUrl: toEmbedUrl(r.videoUrl) || null,
            published: opt.importHidden ? false : r.published ?? true,
            isFeatured: r.isFeatured ?? false,
            metaTitle: r.metaTitle || null,
            metaDescription: r.metaDescription || null,
            categoryId,
            ...Object.fromEntries(Object.entries(specs).map(([k, v]) => [k, v || null])),
            images: { create: gallery.map((url, i) => ({ url, alt: `${r.name} – ảnh ${i + 2}`, sort: i })) },
            attributes: r.brand ? { create: [{ name: "Nhãn hiệu", value: r.brand, sort: 0 }] } : undefined,
          },
          select: { id: true },
        });
        results.push({ ...base, result: "created", id: created.id });
      } else {
        // Cập nhật: chỉ ghi đè ô có dữ liệu trong file, ô trống giữ nguyên
        const data: Record<string, any> = { name: r.name };
        if (r.short) data.short = r.short;
        if (descHtml) data.description = descHtml;
        if (r.sku) data.sku = r.sku;
        if (r.price !== null) data.price = r.price;
        if (cover) data.coverImage = cover;
        if (r.videoUrl) data.videoUrl = toEmbedUrl(r.videoUrl);
        if (r.published !== null) data.published = r.published;
        if (r.isFeatured !== null) data.isFeatured = r.isFeatured;
        if (r.metaTitle) data.metaTitle = r.metaTitle;
        if (r.metaDescription) data.metaDescription = r.metaDescription;
        if (r.category && categoryId) data.categoryId = categoryId;
        for (const [k, v] of Object.entries(specs)) if (v) data[k] = v;
        if (gallery.length) data.images = { deleteMany: {}, create: gallery.map((url, i) => ({ url, alt: `${r.name} – ảnh ${i + 2}`, sort: i })) };

        await prisma.$transaction(async (tx) => {
          await tx.product.update({ where: { id: existing.id }, data });
          if (r.brand) {
            const attr = await tx.productAttribute.findFirst({ where: { productId: existing.id, name: "Nhãn hiệu" }, select: { id: true } });
            if (attr) await tx.productAttribute.update({ where: { id: attr.id }, data: { value: r.brand } });
            else await tx.productAttribute.create({ data: { productId: existing.id, name: "Nhãn hiệu", value: r.brand, sort: 0 } });
          }
        });
        results.push({ ...base, result: "updated", id: existing.id });
      }
    } catch (e: any) {
      const msg =
        e?.code === "P2002"
          ? `Trùng ${String(e?.meta?.target ?? "").includes("sku") ? "mã SKU" : "đường dẫn"} với sản phẩm khác`
          : e?.message?.slice(0, 200) || "Lỗi không rõ";
      results.push({ ...base, result: "failed", message: msg });
    }
  }

  return { results, imagesCopied: copier.copied, imagesFailed: copier.failed };
}
