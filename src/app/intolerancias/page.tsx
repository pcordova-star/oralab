import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Test de intolerancia a lactosa y fructosa (aire espirado) | Oralab",
  description: "Test de aire espirado para estudiar intolerancia a la lactosa y a la fructosa. Cómo funciona, preparación y por qué puede ser útil descartar SIBO antes.",
  alternates: { canonical: "/intolerancias" },
};

export default function Page() {
  return (
    <ContentPage
      path="/intolerancias"
      kicker="Salud digestiva"
      h1="Test de intolerancia a lactosa y fructosa"
      intro="Algunas personas no digieren bien ciertos azúcares, como la lactosa de la leche o la fructosa de algunas frutas. El test de aire espirado ayuda a estudiar esa malabsorción midiendo los gases que se producen cuando esos azúcares llegan sin digerir al intestino grueso."
      sections={[
        {
          title: "¿Cómo funciona?",
          paragraphs: [
            "Tras una medición basal, tomas una solución con lactosa o fructosa y se mide el aliento cada cierto tiempo. Si el azúcar no se absorbe bien, las bacterias lo fermentan y el hidrógeno (y a veces el metano) aumenta en el aliento. Además se registran los síntomas que aparezcan durante el test.",
          ],
        },
        {
          title: "¿Por qué a veces conviene estudiar también SIBO?",
          paragraphs: [
            "Si hay un sobrecrecimiento bacteriano en el intestino delgado, el hidrógeno puede subir muy temprano durante el test, lo que podría interpretarse como intolerancia aunque el origen sea otro. Por eso, según cada caso, tu médico puede indicar estudiar SIBO primero o interpretar el test teniendo en cuenta esa posibilidad.",
          ],
        },
        {
          title: "Síntomas que pueden motivar el estudio",
          bullets: [
            "Hinchazón, gases o dolor después de consumir lácteos o frutas.",
            "Diarrea tras ciertos alimentos.",
            "Molestias digestivas sin causa clara.",
          ],
        },
      ]}
      faqs={[
        { q: "¿Qué azúcares se pueden estudiar?", a: "Habitualmente lactosa y fructosa. Tu médico indicará cuál es adecuado según tus síntomas." },
        { q: "¿Cuánto dura el test de lactosa o fructosa?", a: "Aproximadamente entre 2 y 3 horas, según el protocolo indicado." },
        { q: "¿Es necesario hacerse antes un test de SIBO?", a: "Depende de cada caso. Un SIBO no detectado puede influir en el resultado de otras pruebas, por eso es una decisión que toma tu médico." },
        { q: "¿Necesito ayuno?", a: "Sí, generalmente 12 horas de ayuno y una dieta sencilla el día previo. Te entregaremos las instrucciones detalladas al agendar." },
      ]}
    />
  );
}
