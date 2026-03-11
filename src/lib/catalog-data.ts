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
    displayTitle: "L U X U R Y \u00A0 S E R I E S",
    description:
      "Commanding presence for executive saloons and luxury SUVs. Designed for maximum visual impact, featuring intricate monoblock structures and elegant brushed finishes.",
    headerImage: "/catalog/catalog_1_white.png",
    products: [
      {
        slug: "drx-101",
        name: "DRX-101",
        image: "/catalog/luxury/DRX_101_angle.png",
        hoverImage: "/catalog/luxury/DRX_101_front.png",
        description:
          "A bold multi-spoke design engineered for maximum airflow and minimal unsprung mass. Each spoke is CNC-machined to a mirror edge.",
        sizes: ['20"', '21"', '22"', '23"'],
        price: "From $8,200",
      },
      {
        slug: "drx-102",
        name: "DRX-102",
        image: "/catalog/luxury/DRX_102_angle.png",
        hoverImage: "/catalog/luxury/DRX_102_front.png",
        description:
          "Deep concave profile with directional spokes designed for aggressive stance and superior brake cooling.",
        sizes: ['20"', '21"', '22"', '23"'],
        price: "From $8,800",
      },
      {
        slug: "drx-103",
        name: "DRX-103",
        image: "/catalog/luxury/DRX_103_angle.png",
        hoverImage: "/catalog/luxury/DRX_103_front.png",
        description:
          "Minimalist five-spoke geometry channelling pure racing heritage. Ultra-lightweight monoblock construction.",
        sizes: ['19"', '20"', '21"', '22"'],
        price: "From $7,600",
      },
      {
        slug: "drx-104",
        name: "DRX-104",
        image: "/catalog/luxury/DRX_104_angle.png",
        hoverImage: "/catalog/luxury/DRX_104_front.png",
        description:
          "Sculptural twelve-spoke geometry with hand-polished barrels. Precision-forged for flagship sedans and executive SUVs.",
        sizes: ['20"', '21"', '22"'],
        price: "From $8,400",
      },
      {
        slug: "drx-105",
        name: "DRX-105",
        image: "/catalog/luxury/DRX_105_angle.png",
        hoverImage: "/catalog/luxury/DRX_105_front.png",
        description:
          "Asymmetric turbine-blade design optimised for visual drama. Deep-dish profile meets aerospace-grade forging.",
        sizes: ['21"', '22"', '23"'],
        price: "From $9,200",
      },
      {
        slug: "drx-106",
        name: "DRX-106",
        image: "/catalog/luxury/DRX_106_angle.png",
        hoverImage: "/catalog/luxury/DRX_106_front.png",
        description:
          "Stepped-lip monoblock with micro-milled spoke edges. Imposing street presence with a refined machinist finish.",
        sizes: ['20"', '21"', '22"', '23"'],
        price: "From $8,800",
      },
      {
        slug: "drx-107",
        name: "DRX-107",
        image: "/catalog/luxury/DRX_107_angle.png",
        hoverImage: "/catalog/luxury/DRX_107_front.png",
        description:
          "Contemporary split-spoke architecture with precision-milled detailing. Refined luxury for grand tourers.",
        sizes: ['20"', '21"', '22"'],
        price: "From $8,600",
      },
      {
        slug: "drx-109",
        name: "DRX-109",
        image: "/catalog/luxury/DRX_109_angle.png",
        hoverImage: "/catalog/luxury/DRX_109_front.png",
        description:
          "Flowing multi-arm design with deep concavity and brushed finish. Engineered for flagship presence.",
        sizes: ['21"', '22"', '23"'],
        price: "From $9,400",
      },
      {
        slug: "drx-110",
        name: "DRX-110",
        image: "/catalog/luxury/DRX_110_angle.png",
        hoverImage: "/catalog/luxury/DRX_110_front.png",
        description:
          "Monoblock mesh pattern with hand-polished outer lip. Timeless elegance for ultra-luxury platforms.",
        sizes: ['20"', '21"', '22"', '23"'],
        price: "From $9,600",
      },
      {
        slug: "drx-111",
        name: "DRX-111",
        image: "/catalog/luxury/DRX_111_angle.png",
        hoverImage: "/catalog/luxury/DRX_111_front.png",
        description:
          "Directional fan-spoke with concave face and mirror-cut accents. The pinnacle of luxury wheel design.",
        sizes: ['21"', '22"', '23"', '24"'],
        price: "From $10,200",
      },
    ],
  },
  {
    slug: "offroad",
    name: "Off-Road Series",
    displayTitle: "O F F - R O A D \u00A0 S E R I E S",
    description:
      "Engineered for the extremes. Reinforced load ratings and bead-lock capabilities meet rugged aesthetics. Built to withstand the harshest terrains without compromising on style.",
    headerImage: "/catalog/catalog_2_white.png",
    products: [
      {
        slug: "drx-301",
        name: "DRX-301",
        image: "/catalog/offroad/DRX_301_angle.png",
        hoverImage: "/catalog/offroad/DRX_301_front.png",
        description:
          "Reinforced eight-spoke bead-lock design rated for extreme off-road loads. Full trail-ready specification.",
        sizes: ['17"', '18"', '20"'],
        price: "From $6,800",
      },
      {
        slug: "drx-302",
        name: "DRX-302",
        image: "/catalog/offroad/DRX_302_angle.png",
        hoverImage: "/catalog/offroad/DRX_302_front.png",
        description:
          "Tactical mesh pattern with simulated bead-lock ring. MIL-spec corrosion-resistant coating.",
        sizes: ['17"', '18"', '20"'],
        price: "From $7,200",
      },
      {
        slug: "drx-303",
        name: "DRX-303",
        image: "/catalog/offroad/DRX_303_angle.png",
        hoverImage: "/catalog/offroad/DRX_303_front.png",
        description:
          "Heavy-duty split-five spoke with integrated tyre pressure sensor bosses. Built for overlanding.",
        sizes: ['17"', '18"', '20"'],
        price: "From $7,500",
      },
      {
        slug: "drx-304",
        name: "DRX-304",
        image: "/catalog/offroad/DRX_304_angle.png",
        hoverImage: "/catalog/offroad/DRX_304_front.png",
        description:
          "Widebody mesh pattern with reinforced bead-seat and integrated TPMS bosses. Built for the toughest trails.",
        sizes: ['17"', '18"', '20"'],
        price: "From $7,100",
      },
      {
        slug: "drx-305",
        name: "DRX-305",
        image: "/catalog/offroad/DRX_305_angle.png",
        hoverImage: "/catalog/offroad/DRX_305_front.png",
        description:
          "Six-spoke tactical design with protective ceramic-blast coating. Sand, salt and UV rated for expeditions.",
        sizes: ['17"', '18"', '20"'],
        price: "From $7,400",
      },
      {
        slug: "drx-306",
        name: "DRX-306",
        image: "/catalog/offroad/DRX_306_angle.png",
        hoverImage: "/catalog/offroad/DRX_306_front.png",
        description:
          "Heavy-gauge split-spoke with simulated bead-lock ring. Maximum ground-clearance compatibility.",
        sizes: ['18"', '20"'],
        price: "From $6,600",
      },
      {
        slug: "drx-307",
        name: "DRX-307",
        image: "/catalog/offroad/DRX_307_angle.png",
        hoverImage: "/catalog/offroad/DRX_307_front.png",
        description:
          "Aggressive directional spoke layout with reinforced hub mount. Engineered for extreme terrain articulation.",
        sizes: ['17"', '18"', '20"'],
        price: "From $7,300",
      },
      {
        slug: "drx-309",
        name: "DRX-309",
        image: "/catalog/offroad/DRX_309_angle.png",
        hoverImage: "/catalog/offroad/DRX_309_front.png",
        description:
          "Rugged twin-spoke with hardened barrel lip and anti-corrosion clear coat. Desert and mud rated.",
        sizes: ['17"', '18"', '20"'],
        price: "From $7,600",
      },
      {
        slug: "drx-310",
        name: "DRX-310",
        image: "/catalog/offroad/DRX_310_angle.png",
        hoverImage: "/catalog/offroad/DRX_310_front.png",
        description:
          "Multi-window design with reinforced centre bore and load-rated spokes. Ready for heavy-duty towing.",
        sizes: ['18"', '20"', '22"'],
        price: "From $7,800",
      },
      {
        slug: "drx-311",
        name: "DRX-311",
        image: "/catalog/offroad/DRX_311_angle.png",
        hoverImage: "/catalog/offroad/DRX_311_front.png",
        description:
          "Bold ten-spoke with stepped lip and forged barrel. Overland-proven construction meets street presence.",
        sizes: ['17"', '18"', '20"'],
        price: "From $7,000",
      },
      {
        slug: "drx-312",
        name: "DRX-312",
        image: "/catalog/offroad/DRX_312_angle.png",
        hoverImage: "/catalog/offroad/DRX_312_front.png",
        description:
          "Concave six-spoke with integrated rock guard. Full trail specification with expedition styling.",
        sizes: ['17"', '18"', '20"'],
        price: "From $7,500",
      },
      {
        slug: "drx-313",
        name: "DRX-313",
        image: "/catalog/offroad/DRX_313_angle.png",
        hoverImage: "/catalog/offroad/DRX_313_front.png",
        description:
          "Classic deep-dish with reinforced bead ring and heavy wall construction. Ultimate expedition capability.",
        sizes: ['17"', '18"', '20"'],
        price: "From $7,900",
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
        slug: "drx-201",
        name: "DRX-201",
        image: "/catalog/sport/DRX_201_angle.png",
        hoverImage: "/catalog/sport/DRX_201_front.png",
        description:
          "Track-focused monoblock with maximum brake caliper clearance. Carbon-ceramic compatible.",
        sizes: ['19"', '20"', '21"'],
        price: "From $9,200",
      },
      {
        slug: "drx-202",
        name: "DRX-202",
        image: "/catalog/sport/DRX_202_angle.png",
        hoverImage: "/catalog/sport/DRX_202_front.png",
        description:
          "Aero-blade spoke design with integrated air channels. Optimised CFD for brake cooling.",
        sizes: ['19"', '20"', '21"'],
        price: "From $9,800",
      },
      {
        slug: "drx-203",
        name: "DRX-203",
        image: "/catalog/sport/DRX_203_angle.png",
        hoverImage: "/catalog/sport/DRX_203_front.png",
        description:
          "Lightweight split-five with centre-lock option. Born on the Nürburgring.",
        sizes: ['19"', '20"'],
        price: "From $10,600",
      },
      {
        slug: "drx-204",
        name: "DRX-204",
        image: "/catalog/sport/DRX_204_angle.png",
        hoverImage: "/catalog/sport/DRX_204_front.png",
        description:
          "Ultra-lightweight monoblock with aggressive directional spokes. Shaves unsprung mass for sharper lap times.",
        sizes: ['19"', '20"', '21"'],
        price: "From $9,500",
      },
      {
        slug: "drx-205",
        name: "DRX-205",
        image: "/catalog/sport/DRX_205_angle.png",
        hoverImage: "/catalog/sport/DRX_205_front.png",
        description:
          "Fan-blade aero spoke with integrated brake duct channels. Optimised for carbon-ceramic brake clearance.",
        sizes: ['19"', '20"', '21"'],
        price: "From $10,200",
      },
      {
        slug: "drx-207",
        name: "DRX-207",
        image: "/catalog/sport/DRX_207_angle.png",
        hoverImage: "/catalog/sport/DRX_207_front.png",
        description:
          "Concave twin-five spoke forged from 6061-T6 billet. Engineering-first design for precision driving.",
        sizes: ['19"', '20"'],
        price: "From $11,000",
      },
      {
        slug: "drx-208",
        name: "DRX-208",
        image: "/catalog/sport/DRX_208_angle.png",
        hoverImage: "/catalog/sport/DRX_208_front.png",
        description:
          "Hybrid carbon-weave barrel with forged-aluminium face. Pinnacle of lightweight engineering meets track-day aesthetics.",
        sizes: ['20"', '21"'],
        price: "From $13,200",
      },
      {
        slug: "drx-209",
        name: "DRX-209",
        image: "/catalog/sport/DRX_209_angle.png",
        hoverImage: "/catalog/sport/DRX_209_front.png",
        description:
          "Split-spoke motorsport architecture with deep concavity and milled spoke transitions. Built for aggressive street and circuit styling.",
        sizes: ['20"', '21"', '22"'],
        price: "From $12,100",
      },
      {
        slug: "drx-210",
        name: "DRX-210",
        image: "/catalog/sport/DRX_210_angle.png",
        hoverImage: "/catalog/sport/DRX_210_front.png",
        description:
          "Directional blade pattern engineered for visual motion and brake airflow. Lightweight forged profile with track-ready intent.",
        sizes: ['20"', '21"', '22"'],
        price: "From $12,400",
      },
      {
        slug: "drx-211",
        name: "DRX-211",
        image: "/catalog/sport/DRX_211_angle.png",
        hoverImage: "/catalog/sport/DRX_211_front.png",
        description:
          "High-tension multi-spoke layout with reinforced hub geometry. Designed to balance low weight with high-speed stability.",
        sizes: ['19"', '20"', '21"'],
        price: "From $11,900",
      },
      {
        slug: "drx-212",
        name: "DRX-212",
        image: "/catalog/sport/DRX_212_angle.png",
        hoverImage: "/catalog/sport/DRX_212_front.png",
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
