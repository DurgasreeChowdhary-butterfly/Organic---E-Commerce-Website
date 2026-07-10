/**
 * Dummy product & category data for UI development.
 * Replace with real API calls (see src/services/productService.ts) once
 * the backend is wired up — shapes here match src/types/index.ts.
 */
import type { Category, Product } from "@/types";

export const CATEGORIES: Category[] = [
  { id: "cat-oils", name: "Cold Pressed Oils", slug: "cold-pressed-oils" },
  { id: "cat-millets", name: "Millets", slug: "millets" },
  { id: "cat-dryfruits", name: "Dry Fruits", slug: "dry-fruits" },
  { id: "cat-spices", name: "Spices", slug: "spices" },
  { id: "cat-foods", name: "Organic Foods", slug: "organic-foods" },
  { id: "cat-natural", name: "Natural Products", slug: "natural-products" },
];

export interface DummyProduct extends Product {
  categorySlug: string;
  rating: number;
  reviewCount: number;
  tint: string; // brand accent used for placeholder art
  weight: string;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isSeasonal: boolean;
  description: string;
  specifications: { label: string; value: string }[];
}

export const PRODUCTS: DummyProduct[] = [
  {
    id: "p1", name: "Wood-Pressed Groundnut Oil", slug: "wood-pressed-groundnut-oil",
    price: 549, discount_price: 449, stock_quantity: 42, is_best_seller: true, is_new_arrival: false,
    categorySlug: "cold-pressed-oils", rating: 4.8, reviewCount: 214, tint: "#8FA84D", weight: "1 L",
    isBestSeller: true, isNewArrival: false, isSeasonal: false,
    description: "Extracted using traditional wooden cold-press (kolhu) methods, this groundnut oil retains its natural aroma, nutrients, and rich nutty flavour — no heat, no chemicals, no refining.",
    specifications: [
      { label: "Extraction", value: "Wood cold-pressed" },
      { label: "Shelf Life", value: "9 months" },
      { label: "Origin", value: "Rayalaseema, Andhra Pradesh" },
      { label: "Packaging", value: "Glass bottle" },
    ],
  },
  {
    id: "p2", name: "Foxtail Millet", slug: "foxtail-millet",
    price: 229, discount_price: 189, stock_quantity: 8, is_best_seller: false, is_new_arrival: true,
    categorySlug: "millets", rating: 4.6, reviewCount: 87, tint: "#C9A227", weight: "1 kg",
    isBestSeller: false, isNewArrival: true, isSeasonal: false,
    description: "A low-glycemic ancient grain, hand-cleaned and stone-polished. High in fibre and easy to swap in for rice in your everyday cooking.",
    specifications: [
      { label: "Type", value: "Whole millet" },
      { label: "Processing", value: "Stone-polished" },
      { label: "Origin", value: "Karnataka" },
      { label: "Packaging", value: "Kraft stand-up pouch" },
    ],
  },
  {
    id: "p3", name: "Himalayan Pink Rock Salt", slug: "himalayan-pink-rock-salt",
    price: 129, stock_quantity: 120, is_best_seller: false, is_new_arrival: false,
    categorySlug: "spices", rating: 4.5, reviewCount: 143, tint: "#E98A4E", weight: "500 g",
    isBestSeller: false, isNewArrival: false, isSeasonal: false,
    description: "Hand-mined from ancient salt deposits, rich in trace minerals with a milder, cleaner taste than refined table salt.",
    specifications: [
      { label: "Form", value: "Fine crystal" },
      { label: "Origin", value: "Himalayan foothills" },
      { label: "Additives", value: "None" },
      { label: "Packaging", value: "Resealable pouch" },
    ],
  },
  {
    id: "p4", name: "Whole Kashmiri Almonds", slug: "whole-kashmiri-almonds",
    price: 799, discount_price: 699, stock_quantity: 30, is_best_seller: true, is_new_arrival: false,
    categorySlug: "dry-fruits", rating: 4.9, reviewCount: 302, tint: "#7A5230", weight: "500 g",
    isBestSeller: true, isNewArrival: false, isSeasonal: false,
    description: "Premium grade whole almonds, sun-dried and hand-sorted for size and quality. Naturally sweet with a satisfying crunch.",
    specifications: [
      { label: "Grade", value: "Premium A" },
      { label: "Origin", value: "Kashmir Valley" },
      { label: "Processing", value: "Sun-dried, hand-sorted" },
      { label: "Packaging", value: "Vacuum-sealed pouch" },
    ],
  },
  {
    id: "p5", name: "Turmeric Root Powder", slug: "turmeric-root-powder",
    price: 179, discount_price: 149, stock_quantity: 60, is_best_seller: false, is_new_arrival: false,
    categorySlug: "spices", rating: 4.7, reviewCount: 165, tint: "#E98A4E", weight: "250 g",
    isBestSeller: false, isNewArrival: false, isSeasonal: false,
    description: "Stone-ground from sun-dried turmeric root with a high curcumin content and deep golden colour. No polish, no additives.",
    specifications: [
      { label: "Curcumin Content", value: "~5.2%" },
      { label: "Processing", value: "Stone-ground" },
      { label: "Origin", value: "Erode, Tamil Nadu" },
      { label: "Packaging", value: "Resealable pouch" },
    ],
  },
  {
    id: "p6", name: "Raw Forest Honey", slug: "raw-forest-honey",
    price: 449, stock_quantity: 5, is_best_seller: false, is_new_arrival: true,
    categorySlug: "natural-products", rating: 4.8, reviewCount: 96, tint: "#C9A227", weight: "350 g",
    isBestSeller: false, isNewArrival: true, isSeasonal: true,
    description: "Unheated, unfiltered honey harvested from wild forest hives by tribal beekeeping communities in the Western Ghats.",
    specifications: [
      { label: "Processing", value: "Raw, unheated" },
      { label: "Source", value: "Wild forest hives" },
      { label: "Origin", value: "Western Ghats" },
      { label: "Packaging", value: "Glass jar" },
    ],
  },
  {
    id: "p7", name: "Sun-Dried Black Raisins", slug: "sun-dried-black-raisins",
    price: 299, discount_price: 259, stock_quantity: 55, is_best_seller: false, is_new_arrival: false,
    categorySlug: "dry-fruits", rating: 4.4, reviewCount: 71, tint: "#7A5230", weight: "400 g",
    isBestSeller: false, isNewArrival: false, isSeasonal: false,
    description: "Naturally sun-dried seedless black raisins with a deep, tangy sweetness — no sulphur treatment, no added sugar.",
    specifications: [
      { label: "Type", value: "Seedless" },
      { label: "Processing", value: "Sun-dried, untreated" },
      { label: "Origin", value: "Nashik, Maharashtra" },
      { label: "Packaging", value: "Resealable pouch" },
    ],
  },
  {
    id: "p8", name: "Cold Pressed Coconut Oil", slug: "cold-pressed-coconut-oil",
    price: 429, discount_price: 379, stock_quantity: 38, is_best_seller: true, is_new_arrival: false,
    categorySlug: "cold-pressed-oils", rating: 4.7, reviewCount: 188, tint: "#8FA84D", weight: "500 ml",
    isBestSeller: true, isNewArrival: false, isSeasonal: false,
    description: "Extracted from fresh coconut milk using a slow cold-press process that preserves its natural aroma and nutrients.",
    specifications: [
      { label: "Extraction", value: "Cold-pressed" },
      { label: "Shelf Life", value: "12 months" },
      { label: "Origin", value: "Kerala" },
      { label: "Packaging", value: "Glass bottle" },
    ],
  },
  {
    id: "p9", name: "Little Millet", slug: "little-millet",
    price: 199, stock_quantity: 0, is_best_seller: false, is_new_arrival: true,
    categorySlug: "millets", rating: 4.3, reviewCount: 34, tint: "#C9A227", weight: "1 kg",
    isBestSeller: false, isNewArrival: true, isSeasonal: false,
    description: "A quick-cooking, easily digestible millet ideal for khichdi and upma, packed with iron and fibre.",
    specifications: [
      { label: "Type", value: "Whole millet" },
      { label: "Processing", value: "Stone-polished" },
      { label: "Origin", value: "Telangana" },
      { label: "Packaging", value: "Kraft stand-up pouch" },
    ],
  },
  {
    id: "p10", name: "Cinnamon Sticks", slug: "cinnamon-sticks",
    price: 159, stock_quantity: 44, is_best_seller: false, is_new_arrival: false,
    categorySlug: "spices", rating: 4.6, reviewCount: 58, tint: "#E98A4E", weight: "100 g",
    isBestSeller: false, isNewArrival: false, isSeasonal: false,
    description: "True Ceylon cinnamon quills with a delicate, sweet aroma — hand-rolled and sun-dried.",
    specifications: [
      { label: "Variety", value: "Ceylon (true cinnamon)" },
      { label: "Form", value: "Whole quills" },
      { label: "Origin", value: "Kerala" },
      { label: "Packaging", value: "Resealable pouch" },
    ],
  },
  {
    id: "p11", name: "Organic Toor Dal", slug: "organic-toor-dal",
    price: 189, discount_price: 165, stock_quantity: 70, is_best_seller: true, is_new_arrival: false,
    categorySlug: "organic-foods", rating: 4.7, reviewCount: 121, tint: "#8FA84D", weight: "1 kg",
    isBestSeller: true, isNewArrival: false, isSeasonal: false,
    description: "Unpolished, naturally grown toor dal — cooks evenly and holds its earthy flavour better than polished varieties.",
    specifications: [
      { label: "Type", value: "Unpolished split lentil" },
      { label: "Origin", value: "Maharashtra" },
      { label: "Certification", value: "India Organic" },
      { label: "Packaging", value: "Kraft stand-up pouch" },
    ],
  },
  {
    id: "p12", name: "Neem & Tulsi Soap Bar", slug: "neem-tulsi-soap-bar",
    price: 149, stock_quantity: 90, is_best_seller: false, is_new_arrival: true,
    categorySlug: "natural-products", rating: 4.5, reviewCount: 42, tint: "#C9A227", weight: "100 g",
    isBestSeller: false, isNewArrival: true, isSeasonal: false,
    description: "Cold-processed soap made with organic neem and tulsi extracts — no sulphates, no synthetic fragrance.",
    specifications: [
      { label: "Process", value: "Cold-processed" },
      { label: "Key Ingredients", value: "Neem, Tulsi, Coconut Oil" },
      { label: "Skin Type", value: "All, especially acne-prone" },
      { label: "Packaging", value: "Recycled paper wrap" },
    ],
  },
];

export function getProductBySlug(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: DummyProduct, count = 4) {
  return PRODUCTS.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, count);
}

export function getProductsByCategory(slug: string) {
  return PRODUCTS.filter((p) => p.categorySlug === slug);
}

export const BEST_SELLERS = PRODUCTS.filter((p) => p.isBestSeller);
export const NEW_ARRIVALS = PRODUCTS.filter((p) => p.isNewArrival);
export const SEASONAL_PRODUCTS = PRODUCTS.filter((p) => p.isSeasonal);
