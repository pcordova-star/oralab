import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "IMO (metano intestinal): qué es y cómo se detecta | Oralab",
  description: "El IMO es el sobrecrecimiento de microorganismos productores de metano en el intestino. Conoce su relación con la constipación y cómo se estudia con el test de aire espirado.",
  alternates: { canonical: "/imo" },
};

export default function Page() {
  return (
    <ContentPage
      path="/imo"
      kicker="Salud digestiva"
      h1="IMO: sobrecrecimiento de metano intestinal"
      intro="IMO significa sobrecrecimiento de microorganismos metanógenos intestinales (Intestinal Methanogen Overgrowth). Estos microorganismos producen metano, un gas que se asocia a un tránsito intestinal más lento y, con frecuencia, a constipación."
      sections={[
        {
          title: "¿Cómo se relaciona con la constipación?",
          paragraphs: [
            "La constipación es la dificultad para evacuar o la disminución en la frecuencia de las deposiciones. Cuando hay exceso de metano, el movimiento del intestino puede enlentecerse. Por eso, en personas con constipación persistente, los médicos pueden pedir medir metano en el aliento.",
          ],
        },
        {
          title: "¿Cómo se detecta?",
          paragraphs: [
            "Con el test de aire espirado se mide el metano (CH4) en tu aliento. Un valor sostenido sobre el umbral definido por los criterios clínicos (en la práctica habitual, 10 ppm o más) orienta a IMO. El resultado debe ser interpretado por tu médico junto con tus síntomas.",
          ],
        },
        {
          title: "Diferencia con el SIBO",
          bullets: [
            "SIBO: predomina el aumento de hidrógeno; puede cursar con diarrea, gases e hinchazón.",
            "IMO: predomina el metano elevado; suele asociarse a constipación.",
            "Pueden coexistir, por eso el test mide ambos gases en el mismo examen.",
          ],
        },
      ]}
      faqs={[
        { q: "¿Qué significa IMO?", a: "Intestinal Methanogen Overgrowth: sobrecrecimiento de microorganismos que producen metano en el intestino." },
        { q: "¿El IMO produce siempre constipación?", a: "Se asocia con frecuencia a constipación, pero no en todos los casos. La evaluación médica es necesaria para interpretar el resultado." },
        { q: "¿Es lo mismo que el SIBO?", a: "No. Son condiciones relacionadas pero distintas. Un mismo test de aire espirado puede orientar a una, a otra o a ambas." },
        { q: "¿Qué examen debo hacerme?", a: "El test de aire espirado con medición de hidrógeno y metano. Tu médico indicará el azúcar a utilizar." },
      ]}
    />
  );
}
