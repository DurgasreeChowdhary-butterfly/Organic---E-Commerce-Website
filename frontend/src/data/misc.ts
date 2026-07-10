export const TESTIMONIALS = [
  { id: "t1", name: "Ananya R.", city: "Bengaluru", rating: 5, quote: "The mustard oil tastes like what my grandmother used to press at home. Genuinely different quality." },
  { id: "t2", name: "Karthik S.", city: "Chennai", rating: 5, quote: "Packaging feels premium and the millets are visibly cleaner than what I used to buy locally." },
  { id: "t3", name: "Divya M.", city: "Pune", rating: 4, quote: "Ordering is fast, delivery is careful, and everything smells and tastes fresh." },
];

export const COUPONS = [
  { code: "WELCOME50", label: "Flat ₹50 off on your first order", type: "flat" as const, value: 50, minOrder: 499 },
  { code: "MILLET10", label: "10% off on all millets", type: "percentage" as const, value: 10, minOrder: 300 },
];

export const BANNER_OFFERS = [
  { id: "b1", title: "Season's First Cold-Press", subtitle: "Groundnut & Sesame oils, freshly pressed", tint: "#8FA84D" },
  { id: "b2", title: "Millet Week", subtitle: "Up to 20% off on all millet varieties", tint: "#C9A227" },
  { id: "b3", title: "Dry Fruits Festival Box", subtitle: "Curated gifting sets now live", tint: "#7A5230" },
];

export const CERTIFICATIONS = ["USDA Organic", "India Organic", "FSSAI Certified", "Non-GMO Verified"];
