import { Leaf, Users, MapPin, ShieldCheck } from "lucide-react";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import { CERTIFICATIONS } from "@/data/misc";

const FARM_PARTNERS = [
  { region: "Rayalaseema, Andhra Pradesh", produce: "Cold-pressed groundnut & sesame oil" },
  { region: "Karnataka & Telangana", produce: "Foxtail, little & kodo millets" },
  { region: "Kashmir Valley", produce: "Whole almonds & dry fruits" },
  { region: "Western Ghats", produce: "Raw forest honey" },
  { region: "Kerala", produce: "Cold-pressed coconut oil, cinnamon" },
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Our Story" }]} />

      <section className="text-center max-w-2xl mx-auto mb-14 animate-fade-up">
        <div className="w-14 h-14 rounded-full bg-forest-700 flex items-center justify-center mx-auto mb-5">
          <Leaf className="w-7 h-7 text-gold" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-forest-700 mb-4">From soil to home, nothing in between</h1>
        <p className="text-brown-500 leading-relaxed">
          Prakruti Organics started with a simple frustration: it was nearly impossible to buy food that tasted the
          way it did at our grandparents' homes. So we went looking — for farmers who still cold-press oil in wooden
          kolhus, for millet growers who hand-clean their harvest, for beekeepers who never heat their honey. Today
          we work directly with over 250 partner farms across India, cutting out the middlemen and bringing that
          quality straight to your kitchen.
        </p>
      </section>

      <section className="grid sm:grid-cols-3 gap-4 mb-14">
        <div className="rounded-3xl bg-white shadow-soft p-6 text-center">
          <div className="font-display text-2xl text-forest-700">250+</div>
          <div className="text-xs text-brown-500 mt-1">Partner Farms</div>
        </div>
        <div className="rounded-3xl bg-white shadow-soft p-6 text-center">
          <div className="font-display text-2xl text-forest-700">40k+</div>
          <div className="text-xs text-brown-500 mt-1">Happy Homes</div>
        </div>
        <div className="rounded-3xl bg-white shadow-soft p-6 text-center">
          <div className="font-display text-2xl text-forest-700">0</div>
          <div className="text-xs text-brown-500 mt-1">Additives, Ever</div>
        </div>
      </section>

      <section id="farm-partners" className="mb-14 scroll-mt-24">
        <h2 className="font-display text-2xl text-forest-700 mb-6 flex items-center gap-2"><Users className="w-5 h-5 text-pista-700" /> Our Farm Partners</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {FARM_PARTNERS.map((f) => (
            <div key={f.region} className="rounded-2xl bg-white shadow-soft p-5 flex items-start gap-3">
              <MapPin className="w-4.5 h-4.5 text-pista-700 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-forest-700">{f.region}</p>
                <p className="text-xs text-brown-500 mt-0.5">{f.produce}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="certifications" className="scroll-mt-24">
        <h2 className="font-display text-2xl text-forest-700 mb-6 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-pista-700" /> Certifications</h2>
        <div className="flex flex-wrap gap-3">
          {CERTIFICATIONS.map((cert) => (
            <div key={cert} className="flex items-center gap-2 rounded-full px-4 py-2 bg-white text-xs font-semibold text-forest-700 shadow-soft">
              <ShieldCheck className="w-3.5 h-3.5 text-pista-700" /> {cert}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
