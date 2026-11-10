import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Test de aire espirado a domicilio (SIBO) | Oralab",
  description: "Realiza el test de aire espirado en tu casa o lugar de trabajo con un kit de toma de muestras y recibe el análisis de hidrógeno y metano. Cómo funciona y qué necesitas.",
  alternates: { canonical: "/test-a-domicilio" },
};

export default function Page() {
  return (
    <ContentPage
      path="/test-a-domicilio"
      kicker="Test a domicilio"
      h1="Test de aire espirado a domicilio"
      intro="En Oralab puedes realizar el test de aire espirado sin desplazarte: recibes un kit, tomas tus muestras de aliento en casa o en tu lugar de trabajo, y nosotros las analizamos y entregamos un informe con los resultados."
      sections={[
        {
          title: "¿Cómo funciona?",
          bullets: [
            "Agendas tu test y recibes el kit con instrucciones claras.",
            "Sigues la preparación indicada (dieta sencilla y ayuno).",
            "Tomas las muestras de aliento en los tiempos indicados, mientras registras tus síntomas.",
            "Nos haces llegar las muestras dentro del plazo definido y las analizamos.",
            "Recibes tu informe con las curvas de hidrógeno y metano.",
          ],
        },
        {
          title: "Plazo para analizar las muestras",
          paragraphs: [
            "Las muestras de aliento deben llegar al análisis dentro de un tiempo acotado (alrededor de 6 horas desde su toma) para que los gases se mantengan estables y el resultado sea confiable. Te indicaremos cómo coordinar esto al agendar.",
          ],
        },
        {
          title: "¿Para quién es útil?",
          bullets: [
            "Personas que prefieren realizar el test con comodidad.",
            "Pacientes de otras ciudades o con dificultad para desplazarse.",
            "Centros de salud o clínicas que quieren ofrecer el test a sus pacientes.",
          ],
        },
      ]}
      faqs={[
        { q: "¿El resultado es igual de confiable que en el centro?", a: "El análisis se realiza con el mismo equipo. Lo importante es respetar la preparación, los tiempos de toma y el plazo de entrega de las muestras." },
        { q: "¿Qué gases se informan?", a: "Hidrógeno y metano, con sus curvas a lo largo del tiempo." },
        { q: "¿Necesito indicación médica?", a: "Es recomendable. Tu médico decide qué azúcar usar y cómo interpretar el resultado junto a tus síntomas." },
        { q: "¿Pueden ofrecerlo clínicas o centros médicos?", a: "Sí. Si tienes un centro y quieres ofrecer el test a domicilio a tus pacientes, escríbenos por WhatsApp." },
      ]}
    />
  );
}
