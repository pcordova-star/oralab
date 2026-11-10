import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "SIBO: síntomas y test de aire espirado | Oralab",
  description: "¿Qué es el SIBO (sobrecrecimiento bacteriano del intestino delgado)? Síntomas, cómo se estudia con el test de aire espirado y qué esperar del examen.",
  alternates: { canonical: "/sibo" },
};

export default function Page() {
  return (
    <ContentPage
      path="/sibo"
      kicker="Salud digestiva"
      h1="SIBO: qué es y cómo se estudia"
      intro="SIBO significa sobrecrecimiento bacteriano del intestino delgado. Ocurre cuando hay más bacterias de lo normal en una zona donde normalmente hay pocas, lo que puede producir hinchazón, gases y molestias digestivas."
      sections={[
        {
          title: "Síntomas frecuentes",
          bullets: [
            "Distensión y sensación de hinchazón abdominal.",
            "Gases excesivos y dolor o cólicos.",
            "Diarrea, constipación o alternancia entre ambas.",
            "Sensación de malestar después de comer.",
          ],
          paragraphs: [
            "Estos síntomas son comunes a muchas condiciones digestivas. Por eso es importante que un médico evalúe tu caso antes de sacar conclusiones.",
          ],
        },
        {
          title: "¿Cómo se estudia con el test de aire espirado?",
          paragraphs: [
            "Después de tomar una solución con un azúcar (habitualmente lactulosa o glucosa), se mide el hidrógeno y el metano en el aliento durante aproximadamente 90 a 120 minutos. Un aumento del hidrógeno sobre el nivel basal, en el rango y momento definidos por los criterios clínicos, orienta a SIBO. Tu médico interpreta las curvas junto con tus síntomas.",
          ],
        },
        {
          title: "Gases que se miden",
          bullets: [
            "Hidrógeno (H2): principal gas para orientar a SIBO.",
            "Metano (CH4): su elevación se asocia a IMO, una condición relacionada que suele acompañarse de constipación.",
          ],
        },
        {
          title: "¿Y después del resultado?",
          paragraphs: [
            "El tratamiento y el seguimiento deben ser indicados por tu médico tratante. Si aún no tienes uno, en Oralab trabajamos con profesionales aliados que pueden ayudarte con la interpretación clínica de tus resultados.",
          ],
        },
      ]}
      faqs={[
        { q: "¿Qué significa SIBO?", a: "Son las siglas en inglés de Small Intestinal Bacterial Overgrowth, es decir, sobrecrecimiento bacteriano del intestino delgado." },
        { q: "¿El test de aire espirado confirma el SIBO?", a: "Es una de las herramientas más usadas para estudiarlo, pero el diagnóstico lo hace el médico considerando el resultado, tus síntomas y tu historia clínica." },
        { q: "¿Qué preparación necesito?", a: "Normalmente una dieta sencilla el día anterior y 12 horas de ayuno. También debes informar si tomaste antibióticos recientemente, porque pueden alterar el resultado." },
        { q: "¿Cuál es la diferencia entre SIBO e IMO?", a: "En el SIBO predomina el aumento de hidrógeno; en el IMO (sobrecrecimiento de metanógenos intestinales) predomina el metano elevado, y suele asociarse a constipación." },
      ]}
    />
  );
}
