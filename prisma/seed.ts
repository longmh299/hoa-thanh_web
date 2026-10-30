// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function main() {
  // 1) Categories
  const categories = [
    { name: 'Máy hút chân không', slug: 'may-hut-chan-khong' },
    { name: 'Máy in date', slug: 'may-in-date' },
    { name: 'Máy dán khay/đóng gói khay', slug: 'may-dan-khay' },
    { name: 'Dây chuyền đóng gói VFFS', slug: 'day-chuyen-dong-goi-vffs' },
    { name: 'Máy đồng hoá', slug: 'may-dong-hoa' },
    { name: 'Bao bì khay thực phẩm (CPET/PP)', slug: 'khay-thuc-pham' },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
  }

  const categoryMap = new Map(
    (await prisma.category.findMany({ select: { id: true, slug: true } }))
      .map((c) => [c.slug, c.id]),
  );

  // 2) Products (sample)
  // Lưu ý: price là VND (Int). Nếu cần VND lớn hoặc có thập phân => cân nhắc Decimal.
  const products: Array<
    Omit<Parameters<typeof prisma.product.upsert>[0]['create'], 'categoryId'> & { categorySlug?: string }
  > = [
    // Máy hút chân không
    {
      slug: 'dz-260',
      name: 'Máy hút chân không DZ-260',
      short: 'Bản mini gọn, phù hợp quán nhỏ/tiệm thực phẩm.',
      description: `<p>Máy hút chân không DZ-260 giúp bảo quản thực phẩm, giảm oxy, kéo dài hạn sử dụng. Phù hợp đóng gói thịt cá, hải sản, đồ khô…</p>`,
      sku: 'DZ-260',
      price: 6850000,
      coverImage: '',
      isFeatured: true,
      published: true,
      metaTitle: 'Máy hút chân không DZ-260',
      metaDescription: 'DZ-260 mini, bền bỉ, dễ dùng cho quán/tiệm thực phẩm.',
      canonicalUrl: '',
      ogImage: '',
      noindex: false,
      nofollow: false,
      power: '0.37 kW',
      voltage: '220V/50Hz',
      weight: '35 kg',
      dimensions: '480×330×360 mm',
      functions: 'Hút chân không + hàn miệng túi',
      material: 'Thép sơn tĩnh điện',
      categorySlug: 'may-hut-chan-khong',
    },
    {
      slug: 'dz-500-2e',
      name: 'Máy hút chân không DZ-500-2E',
      short: 'Buồng hút lớn, dùng cho xưởng/nhà máy vừa.',
      description: `<p>Model DZ-500-2E cho năng suất cao, phù hợp sản xuất vừa và nhỏ. Điều khiển đơn giản, linh kiện phổ thông.</p>`,
      sku: 'DZ-500-2E',
      price: 18500000,
      coverImage: '',
      isFeatured: false,
      published: true,
      metaTitle: 'Máy hút chân không DZ-500-2E',
      metaDescription: 'Năng suất cao, buồng lớn, bền bỉ cho xưởng.',
      canonicalUrl: '',
      ogImage: '',
      noindex: false,
      nofollow: false,
      power: '0.9 kW',
      voltage: '220V/50Hz',
      weight: '90 kg',
      dimensions: '750×700×950 mm',
      functions: 'Hút chân không 1 buồng',
      material: 'Inox',
      categorySlug: 'may-hut-chan-khong',
    },

    // Máy in date
    {
      slug: 'hp-23',
      name: 'Máy in date HP-23',
      short: 'In mực nhiệt, nhỏ gọn, giá tốt.',
      description: `<p>HP-23 in ngày sản xuất – hạn sử dụng cho bao bì dạng túi. Dễ dùng, chi phí mực thấp.</p>`,
      sku: 'HP-23',
      price: 790000,
      coverImage: '',
      isFeatured: true,
      published: true,
      metaTitle: 'Máy in date HP-23',
      metaDescription: 'Máy in date giá rẻ, gọn nhẹ cho cửa hàng.',
      canonicalUrl: '',
      ogImage: '',
      noindex: false,
      nofollow: false,
      power: '90 W',
      voltage: '220V',
      weight: '2.5 kg',
      dimensions: '140×160×220 mm',
      functions: 'In NSX/HSD trên túi',
      material: 'Hợp kim + nhựa',
      categorySlug: 'may-in-date',
    },
    {
      slug: 'dy-8',
      name: 'Máy in date DY-8',
      short: 'Ép nhiệt ribbon, ký tự sắc nét.',
      description: `<p>DY-8 sử dụng ribbon mực nhiệt, ký tự bám tốt, phù hợp bao bì PE/PP/giấy bạc.</p>`,
      sku: 'DY-8',
      price: 990000,
      coverImage: '',
      isFeatured: false,
      published: true,
      metaTitle: 'Máy in date DY-8',
      metaDescription: 'In sắc nét, bám tốt trên nhiều loại bao bì.',
      canonicalUrl: '',
      ogImage: '',
      noindex: false,
      nofollow: false,
      power: '120 W',
      voltage: '220V',
      weight: '3 kg',
      dimensions: '250×240×140 mm',
      functions: 'In date ribbon',
      material: 'Hợp kim',
      categorySlug: 'may-in-date',
    },
    {
      slug: 'hp-241s',
      name: 'Máy in date HP-241S',
      short: 'Lắp trên băng tải/đóng gói tự động.',
      description: `<p>HP-241S tích hợp trên máy đóng gói, tốc độ in cao, đồng bộ dây chuyền.</p>`,
      sku: 'HP-241S',
      price: 3650000,
      coverImage: '',
      isFeatured: false,
      published: true,
      metaTitle: 'Máy in date HP-241S',
      metaDescription: 'Giải pháp in date cho dây chuyền tự động.',
      canonicalUrl: '',
      ogImage: '',
      noindex: false,
      nofollow: false,
      power: '200 W',
      voltage: '220V',
      weight: '8 kg',
      dimensions: '300×300×260 mm',
      functions: 'In date tự động',
      material: 'Thép/inox',
      categorySlug: 'may-in-date',
    },
    {
      slug: 'tdy-380',
      name: 'Máy in date TDY-380',
      short: 'Bàn ép tay, in trên hộp/nhãn phẳng.',
      description: `<p>TDY-380 ép nhiệt chữ đồng, in rõ trên bìa giấy/hộp carton mỏng/nhãn phẳng.</p>`,
      sku: 'TDY-380',
      price: 2950000,
      coverImage: '',
      isFeatured: false,
      published: true,
      metaTitle: 'Máy in date TDY-380',
      metaDescription: 'Ép chữ đồng, bền và sắc nét.',
      canonicalUrl: '',
      ogImage: '',
      noindex: false,
      nofollow: false,
      power: '300 W',
      voltage: '220V',
      weight: '10 kg',
      dimensions: '350×320×260 mm',
      functions: 'Ép nhiệt chữ đồng',
      material: 'Thép',
      categorySlug: 'may-in-date',
    },
    {
      slug: 'hp-241b',
      name: 'Máy in date HP-241B',
      short: 'Bàn đạp/bán tự động, hiệu suất tốt.',
      description: `<p>HP-241B in tốc độ nhanh, phù hợp cơ sở có lưu lượng vừa.</p>`,
      sku: 'HP-241B',
      price: 3150000,
      coverImage: '',
      isFeatured: false,
      published: true,
      metaTitle: 'Máy in date HP-241B',
      metaDescription: 'Bán tự động, tốc độ tốt.',
      canonicalUrl: '',
      ogImage: '',
      noindex: false,
      nofollow: false,
      power: '200 W',
      voltage: '220V',
      weight: '9 kg',
      dimensions: '320×300×260 mm',
      functions: 'In date ribbon',
      material: 'Thép',
      categorySlug: 'may-in-date',
    },

    // Dây chuyền đóng gói VFFS
    {
      slug: 'vffs-yn-320',
      name: 'Máy đóng gói VFFS YN-320',
      short: 'Tạo túi – định lượng – hàn mép tự động.',
      description: `<p>YN-320 phù hợp hạt, bột, snack; tích hợp định lượng, tạo túi, in date.</p>`,
      sku: 'YN-320',
      price: 165000000,
      coverImage: '',
      isFeatured: true,
      published: true,
      metaTitle: 'VFFS YN-320',
      metaDescription: 'Dây chuyền đóng gói tự động cho hạt/bột/snack.',
      canonicalUrl: '',
      ogImage: '',
      noindex: false,
      nofollow: false,
      power: '3 kW',
      voltage: '380V/50Hz',
      weight: '350 kg',
      dimensions: '1200×900×2000 mm',
      functions: 'Định lượng + tạo túi + in date',
      material: 'Inox 304',
      categorySlug: 'day-chuyen-dong-goi-vffs',
    },

    // Máy dán khay
    {
      slug: 'may-dan-khay-2-khuon',
      name: 'Máy dán khay 2 khuôn',
      short: 'Dán 2 khay/lượt, tăng năng suất đóng gói trái cây/thực phẩm.',
      description: `<p>Máy dán khay 2 khuôn, gia nhiệt ổn định, viền mép kín đẹp. Hợp khay PET/PP, màng co PE/PVC.</p>`,
      sku: 'TRAY-2M',
      price: 12500000,
      coverImage: '',
      isFeatured: false,
      published: true,
      metaTitle: 'Máy dán khay 2 khuôn',
      metaDescription: 'Giải pháp đóng khay nhanh, mép dán kín đẹp.',
      canonicalUrl: '',
      ogImage: '',
      noindex: false,
      nofollow: false,
      power: '800 W',
      voltage: '220V',
      weight: '22 kg',
      dimensions: '480×420×380 mm',
      functions: 'Dán khay thực phẩm',
      material: 'Inox',
      categorySlug: 'may-dan-khay',
    },

    // Máy đồng hoá
    {
      slug: 'may-dong-hoa-5l',
      name: 'Máy đồng hoá 5L',
      short: 'Thử nghiệm R&D, mỹ phẩm/đồ uống.',
      description: `<p>Máy đồng hoá 5L dùng cho phòng thí nghiệm và pilot, tốc độ cao, tạo nhũ mịn.</p>`,
      sku: 'HOMO-5L',
      price: 38500000,
      coverImage: '',
      isFeatured: false,
      published: true,
      metaTitle: 'Máy đồng hoá 5L',
      metaDescription: 'Đồng hoá mẫu nhỏ, nhũ mịn ổn định.',
      canonicalUrl: '',
      ogImage: '',
      noindex: false,
      nofollow: false,
      power: '1.1 kW',
      voltage: '220V',
      weight: '42 kg',
      dimensions: '600×450×900 mm',
      functions: 'Đồng hoá/nhũ hoá',
      material: 'Inox 304',
      categorySlug: 'may-dong-hoa',
    },

    // Khay thực phẩm
    {
      slug: 'khay-cpet-2-ngan-227x178x40',
      name: 'Khay CPET 2 ngăn 227×178×40',
      short: 'Chịu nhiệt lò nướng/vi sóng, dùng cho suất ăn.',
      description: `<p>Khay CPET chịu nhiệt, không biến dạng, an toàn tiếp xúc thực phẩm. Phù hợp suất ăn công nghiệp/airline.</p>`,
      sku: 'CPET-2N-227-178-40',
      price: 4200,
      coverImage: '',
      isFeatured: false,
      published: true,
      metaTitle: 'Khay CPET 2 ngăn 227×178×40',
      metaDescription: 'Khay chịu nhiệt, an toàn thực phẩm.',
      canonicalUrl: '',
      ogImage: '',
      noindex: false,
      nofollow: false,
      power: null,
      voltage: null,
      weight: null,
      dimensions: '227×178×40 mm',
      functions: 'Đựng thực phẩm chịu nhiệt',
      material: 'CPET',
      categorySlug: 'khay-thuc-pham',
    },
  ];

  for (const p of products) {
    const { categorySlug, ...data } = p as any;
    const categoryId = categorySlug ? categoryMap.get(categorySlug) ?? null : null;
    await prisma.product.upsert({
      where: { slug: data.slug },
      update: { ...data, categoryId },
      create: { ...data, categoryId },
    });
  }

  // 3) Posts
  const posts = [
    {
      slug: 'gioi-thieu-hoathanh',
      title: 'Giới thiệu Hòa Thành',
      content:
        '<p>Hòa Thành nhập khẩu và phân phối máy móc thiết bị chính hãng cho nhà xưởng, doanh nghiệp sản xuất. Tư vấn tận nơi, bảo hành nhanh.</p>',
      published: true,
      metaTitle: 'Giới thiệu Hòa Thành',
      metaDescription: 'Giải pháp máy móc bao bì thực phẩm – tư vấn & bảo hành.',
      canonicalUrl: '',
      ogImage: '',
    },
    {
      slug: 'huong-dan-su-dung-may-hut-chan-khong-dz-260',
      title: 'Hướng dẫn sử dụng máy hút chân không DZ-260',
      content:
        '<p>Kiểm tra nắp buồng, đặt túi ngay ngắn, chỉnh thời gian hút/hàn, thử vài lần để tối ưu đường hàn.</p>',
      published: true,
      metaTitle: 'Hướng dẫn DZ-260',
      metaDescription: 'Cách dùng DZ-260 để đường hàn đẹp, kín hơi.',
      canonicalUrl: '',
      ogImage: '',
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: { ...post },
      create: { ...post },
    });
  }

  console.log('✅ Seed done.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
