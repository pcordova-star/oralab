import Link from "next/link";
import { Navbar, Logo } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { SITE_URL, WHATSAPP_URL } from "@/lib/site";

export type Faq = { q: string; a: string };
export type Section = { title: string; paragraphs?: string[]; bullets?: string[] };

export type ContentPageProps = {
  path: string;
  kicker: string;
  h1: string;
  intro: string;
  sections: Section[];
  faqs: Faq[];
};

const RELATED = [
  { href: "/test-aire-espirado", label: "Test de aire espirado" },
  { href: "/sibo", label: "SIBO" },
  { href: "/imo", label: "IMO (metano)" },
  { href: "/intolerancias", label: "Intolerancias" },
  { href: "/test-a-domicilio", label: "Test a domicilio" },
];

export function ContentPage({ path, kicker, h1, intro, sections, faqs }: ContentPageProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: h1, item: `${SITE_URL}${path}` },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <article className="container mx-auto px-4 py-16 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-secondary mb-4">{kicker}</p>
          <h1 className="text-3xl md:text-5xl font-black text-primary leading-tight mb-6">{h1}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">{intro}</p>

          {sections.map((s) => (
            <section key={s.title} className="mb-10">
              <h2 className="text-2xl font-black text-primary mb-4">{s.title}</h2>
              {s.paragraphs?.map((p, i) => (
                <p key={i} className="text-base text-foreground/80 leading-relaxed mb-4">{p}</p>
              ))}
              {s.bullets && (
                <ul className="list-disc pl-6 space-y-2 text-base text-foreground/80">
                  {s.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="mb-12">
            <h2 className="text-2xl font-black text-primary mb-6">Preguntas frecuentes</h2>
            <div className="space-y-6">
              {faqs.map((f) => (
                <div key={f.q}>
                  <h3 className="text-lg font-bold text-primary mb-2">{f.q}</h3>
                  <p className="text-base text-foreground/80 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="rounded-3xl bg-primary/5 border border-primary/10 p-8 text-center mb-12">
            <h2 className="text-2xl font-black text-primary mb-3">¿Quieres agendar tu test?</h2>
            <p className="text-muted-foreground mb-6">Reserva tu hora o escríbenos y te orientamos.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/booking"><Button className="rounded-full font-black h-12 px-8">Agendar test</Button></Link>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="rounded-full font-black h-12 px-8">Escribir por WhatsApp</Button>
              </a>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-8">
            La información de esta página es educativa y no reemplaza la evaluación de tu médico. Los resultados del test deben ser interpretados por un profesional de la salud.
          </p>

          <nav aria-label="Más información" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-primary/70">
            {RELATED.filter((r) => r.href !== path).map((r) => (
              <Link key={r.href} href={r.href} className="hover:text-secondary">{r.label}</Link>
            ))}
          </nav>
        </article>
      </main>
      <footer className="bg-white border-t border-border py-12">
        <div className="container mx-auto px-4 text-center">
          <Link href="/"><Logo /></Link>
          <p className="text-muted-foreground text-sm mt-4">Laboratorio especializado en Salud Digestiva Avanzada.</p>
        </div>
      </footer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
