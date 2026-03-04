export interface CatalogProduct {
  slug: string;
  name: string;
  image: string;
  hoverImage: string;
  description: string;
  sizes: string[];
  price: string;
}

export interface CatalogCategory {
  slug: string;
  name: string;
  displayTitle: string;
  description: string;
  headerImage: string;
  products: CatalogProduct[];
}

export const catalogCategories: CatalogCategory[] = [
  {
    slug: "vip",
    name: "Luxury series",
    displayTitle: "L U X U R Y\nS E R I E S",
    description:
      "Commanding presence for executive saloons and luxury SUVs. Designed for maximum visual impact, featuring intricate monoblock structures and elegant brushed finishes.",
    headerImage: "/catalog/catalog_1_white.png",
    products: [
      {
        slug: "drx-101",
        name: "DRX-101",
        image: "/catalog/vossen_1_angle.png",
        hoverImage: "/catalog/vossen_1_front.png",
        description:
          "A bold multi-spoke design engineered for maximum airflow and minimal unsprung mass. Each spoke is CNC-machined to a mirror edge.",
        sizes: ['20"', '21"', '22"', '23"'],
        price: "From $8,200",
      },
      {
        slug: "drx-102",
        name: "DRX-102",
        image: "/catalog/vossen_2_angle.png",
        hoverImage: "/catalog/vossen_2_front.png",
        description:
          "Deep concave profile with directional spokes designed for aggressive stance and superior brake cooling.",
        sizes: ['20"', '21"', '22"', '23"'],
        price: "From $8,800",
      },
      {
        slug: "drx-103",
        name: "DRX-103",
        image: "/catalog/vossen_3_angle.png",
        hoverImage: "/catalog/vossen_3_front.png",
        description:
          "Minimalist five-spoke geometry channelling pure racing heritage. Ultra-lightweight monoblock construction.",
        sizes: ['19"', '20"', '21"', '22"'],
        price: "From $7,600",
      },
      {
        slug: "drx-291",
        name: "DRX-291",
        image: "/catalog/DRX_291_angle-Photoroom.png",
        hoverImage: "/catalog/DRX_291_front-Photoroom.png",
        description:
          "Sculptural twelve-spoke geometry with hand-polished barrels. Precision-forged for flagship sedans and executive SUVs.",
        sizes: ['20"', '21"', '22"'],
        price: "From $8,400",
      },
      {
        slug: "drx-292",
        name: "DRX-292",
        image: "/catalog/DRX_292_angle-Photoroom.png",
        hoverImage: "/catalog/DRX_292_front-Photoroom.png",
        description:
          "Asymmetric turbine-blade design optimised for visual drama. Deep-dish profile meets aerospace-grade forging.",
        sizes: ['21"', '22"', '23"'],
        price: "From $9,200",
      },
      {
        slug: "drx-293",
        name: "DRX-293",
        image: "/catalog/DRX_293_angle-Photoroom.png",
        hoverImage: "/catalog/DRX_293_front-Photoroom.png",
        description:
          "Stepped-lip monoblock with micro-milled spoke edges. Imposing street presence with a refined machinist finish.",
        sizes: ['20"', '21"', '22"', '23"'],
        price: "From $8,800",
      },
    ],
  },
  {
    slug: "offroad",
    name: "Off-Road Series",
    displayTitle: "O F F - R O A D\nS E R I E S",
    description:
      "Engineered for the extremes. Reinforced load ratings and bead-lock capabilities meet rugged aesthetics. Built to withstand the harshest terrains without compromising on style.",
    headerImage: "/catalog/catalog_2_white.png",
    products: [
      {
        slug: "drx-201",
        name: "DRX-201",
        image: "/catalog/vossen_1_angle.png",
        hoverImage: "/catalog/vossen_1_front.png",
        description:
          "Reinforced eight-spoke bead-lock design rated for extreme off-road loads. Full trail-ready specification.",
        sizes: ['17"', '18"', '20"'],
        price: "From $6,800",
      },
      {
        slug: "drx-202",
        name: "DRX-202",
        image: "/catalog/vossen_2_angle.png",
        hoverImage: "/catalog/vossen_2_front.png",
        description:
          "Tactical mesh pattern with simulated bead-lock ring. MIL-spec corrosion-resistant coating.",
        sizes: ['17"', '18"', '20"'],
        price: "From $7,200",
      },
      {
        slug: "drx-203",
        name: "DRX-203",
        image: "/catalog/vossen_3_angle.png",
        hoverImage: "/catalog/vossen_3_front.png",
        description:
          "Heavy-duty split-five spoke with integrated tyre pressure sensor bosses. Built for overlanding.",
        sizes: ['17"', '18"', '20"'],
        price: "From $7,500",
      },
      {
        slug: "drx-294",
        name: "DRX-294",
        image: "/catalog/DRX_294_angle-Photoroom.png",
        hoverImage: "/catalog/DRX_294_front-Photoroom.png",
        description:
          "Widebody mesh pattern with reinforced bead-seat and integrated TPMS bosses. Built for the toughest trails.",
        sizes: ['17"', '18"', '20"'],
        price: "From $7,100",
      },
      {
        slug: "drx-295",
        name: "DRX-295",
        image: "/catalog/DRX_295_angle-Photoroom.png",
        hoverImage: "/catalog/DRX_295_front-Photoroom.png",
        description:
          "Six-spoke tactical design with protective ceramic-blast coating. Sand, salt and UV rated for expeditions.",
        sizes: ['17"', '18"', '20"'],
        price: "From $7,400",
      },
      {
        slug: "drx-296",
        name: "DRX-296",
        image: "/catalog/DRX_296_angle-Photoroom.png",
        hoverImage: "/catalog/DRX_296_front-Photoroom.png",
        description:
          "Heavy-gauge split-spoke with simulated bead-lock ring. Maximum ground-clearance compatibility.",
        sizes: ['18"', '20"'],
        price: "From $6,600",
      },
    ],
  },
  {
    slug: "sport",
    name: "Sport Series",
    displayTitle: "S P O R T \u00A0 S E R I E S",
    description:
      "Performance driven. Focusing on weight reduction and brake cooling. These lightweight forged designs reduce unsprung mass for superior handling and track-ready dynamics.",
    headerImage: "/catalog/catalog_3_white.png",
    products: [
      {
        slug: "drx-301",
        name: "DRX-301",
        image: "/catalog/vossen_1_angle.png",
        hoverImage: "/catalog/vossen_1_front.png",
        description:
          "Track-focused monoblock with maximum brake caliper clearance. Carbon-ceramic compatible.",
        sizes: ['19"', '20"', '21"'],
        price: "From $9,200",
      },
      {
        slug: "drx-302",
        name: "DRX-302",
        image: "/catalog/vossen_2_angle.png",
        hoverImage: "/catalog/vossen_2_front.png",
        description:
          "Aero-blade spoke design with integrated air channels. Optimised CFD for brake cooling.",
        sizes: ['19"', '20"', '21"'],
        price: "From $9,800",
      },
      {
        slug: "drx-303",
        name: "DRX-303",
        image: "/catalog/vossen_3_angle.png",
        hoverImage: "/catalog/vossen_3_front.png",
        description:
          "Lightweight split-five with centre-lock option. Born on the Nürburgring.",
        sizes: ['19"', '20"'],
        price: "From $10,600",
      },
      {
        slug: "drx-297",
        name: "DRX-297",
        image: "/catalog/DRX_297_angle-Photoroom.png",
        hoverImage: "/catalog/DRX_297_front-Photoroom.png",
        description:
          "Ultra-lightweight monoblock with aggressive directional spokes. Shaves unsprung mass for sharper lap times.",
        sizes: ['19"', '20"', '21"'],
        price: "From $9,500",
      },
      {
        slug: "drx-298",
        name: "DRX-298",
        image: "/catalog/DRX_298_angle-Photoroom.png",
        hoverImage: "/catalog/DRX_298_front-Photoroom.png",
        description:
          "Fan-blade aero spoke with integrated brake duct channels. Optimised for carbon-ceramic brake clearance.",
        sizes: ['19"', '20"', '21"'],
        price: "From $10,200",
      },
      {
        slug: "drx-299",
        name: "DRX-299",
        image: "/catalog/DRX_299_angle-Photoroom.png",
        hoverImage: "/catalog/DRX_299_front-Photoroom.png",
        description:
          "Concave twin-five spoke forged from 6061-T6 billet. Engineering-first design for precision driving.",
        sizes: ['19"', '20"'],
        price: "From $11,000",
      },
      {
        slug: "drx-391",
        name: "DRX-391",
        image: "/catalog/DRX_391_angle-Photoroom.png",
        hoverImage: "/catalog/DRX_391_front-Photoroom.png",
        description:
          "Hybrid carbon-weave barrel with forged-aluminium face. Pinnacle of lightweight engineering meets track-day aesthetics.",
        sizes: ['20"', '21"'],
        price: "From $13,200",
      },
      {
        slug: "drx-393",
        name: "DRX-393",
        image: "/catalog/DRX_393_angle-Photoroom.png",
        hoverImage: "/catalog/DRX_393_front-Photoroom.png",
        description:
          "Split-spoke motorsport architecture with deep concavity and milled spoke transitions. Built for aggressive street and circuit styling.",
        sizes: ['20"', '21"', '22"'],
        price: "From $12,100",
      },
      {
        slug: "drx-394",
        name: "DRX-394",
        image: "/catalog/DRX_394_angle-Photoroom.png",
        hoverImage: "/catalog/DRX_394_front-Photoroom.png",
        description:
          "Directional blade pattern engineered for visual motion and brake airflow. Lightweight forged profile with track-ready intent.",
        sizes: ['20"', '21"', '22"'],
        price: "From $12,400",
      },
      {
        slug: "drx-395",
        name: "DRX-395",
        image: "/catalog/DRX_395_angle-Photoroom.png",
        hoverImage: "/catalog/DRX_395_front-Photoroom.png",
        description:
          "High-tension multi-spoke layout with reinforced hub geometry. Designed to balance low weight with high-speed stability.",
        sizes: ['19"', '20"', '21"'],
        price: "From $11,900",
      },
      {
        slug: "drx-397",
        name: "DRX-397",
        image: "/catalog/DRX_397_angle-Photoroom.png",
        hoverImage: "/catalog/DRX_397_front-Photoroom.png",
        description:
          "Ultra-concave Y-spoke forged concept with pronounced outer lip. Purposeful performance stance for premium sport platforms.",
        sizes: ['20"', '21"', '22"'],
        price: "From $12,700",
      },
    ],
  },
];

export function getCategoryBySlug(
  slug: string
): CatalogCategory | undefined {
  return catalogCategories.find((c) => c.slug === slug);
}

export function getProductBySlug(
  categorySlug: string,
  productSlug: string
): { product: CatalogProduct; category: CatalogCategory } | undefined {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return undefined;
  const product = category.products.find((p) => p.slug === productSlug);
  if (!product) return undefined;
  return { product, category };
}
