import type { Metadata } from "next";
import { ContentPage } from "@/components/content-page";

export const metadata: Metadata = {
  title: "Test de aire espirado en Chile: qué es y cómo funciona | Oralab",
  description: "El test de aire espirado mide hidrógeno y metano en tu aliento para ayudar a estudiar SIBO, IMO e intolerancias a azúcares. Conoce la preparación, la duración y cómo agendar.",
  alternates: { canonical: "/test-aire-espirado" },
};

export default function Page() {
  return (
    <ContentPage
      path="/test-aire-espirado"
      kicker="Salud digestiva"
      h1="Test de aire espirado: qué es y cómo funciona"
      intro="El test de aire espirado es un examen simple y no invasivo. Mide los gases que producen las bacterias del intestino cuando procesan ciertos azúcares, y que luego se eliminan por el aliento. Sirve para estudiar el sobrecrecimiento bacteriano (SIBO), el IMO y las intolerancias a la lactosa o la fructosa."
      sections={[
        {
          title: "¿Qué mide el test?",
          paragraphs: [
            "Cuando las bacterias del intestino fermentan un azúcar, producen gases como hidrógeno y metano. Parte de esos gases pasa a la sangre y se elimina al respirar. Al medirlos en el aliento, se puede ver cuándo y cuánto aumentan después de tomar una solución con un azúcar específico (sustrato).",
          ],
          bullets: [
            "Hidrógeno (H2): su aumento temprano puede orientar a SIBO o a malabsorción de azúcares.",
            "Metano (CH4): un nivel elevado se asocia a IMO, frecuentemente en personas con constipación.",
            "Cada examen entrega curvas con los valores medidos a lo largo del tiempo, que tu médico interpreta junto con tus síntomas.",
          ],
        },
        {
          title: "¿Cómo es el examen?",
          bullets: [
            "Soplas en el equipo para una primera medición (basal).",
            "Tomas la solución con el azúcar indicado por tu médico (por ejemplo lactulosa, glucosa, lactosa o fructosa).",
            "Repites la medición cada cierto tiempo, durante aproximadamente 90 a 120 minutos.",
            "Si presentas síntomas durante el test, se registran junto con las curvas.",
          ],
        },
        {
          title: "Preparación previa",
          paragraphs: [
            "Para que el resultado sea confiable, la preparación es importante. En general se indica una dieta sencilla el día anterior y un ayuno de 12 horas. Tu médico o nuestro equipo te entregará las instrucciones exactas, que también dependen de si tomas antibióticos u otros medicamentos.",
          ],
        },
        {
          title: "Tecnología utilizada",
          paragraphs: [
            "En Oralab trabajamos con analizadores de aliento Sunvou, fabricante especializado en equipos de análisis de gases en el aliento, que miden hidrógeno y metano con sensores electroquímicos.",
          ],
        },
      ]}
      faqs={[
        { q: "¿Duele o es invasivo?", a: "No. Solo debes soplar en el equipo y tomar una bebida con el azúcar indicado. No requiere agujas ni sedación." },
        { q: "¿Cuánto dura el test?", a: "El examen completo dura aproximadamente entre 90 y 120 minutos, según el tipo de test que indique tu médico." },
        { q: "¿Necesito orden médica?", a: "Lo recomendable es que el test sea indicado por tu médico, que decidirá qué azúcar usar y cómo interpretar los resultados en el contexto de tus síntomas." },
        { q: "¿Qué enfermedades puede detectar?", a: "No diagnostica por sí solo. Entrega información que, junto con tu historia clínica, ayuda a estudiar SIBO, IMO y malabsorción de lactosa o fructosa." },
        { q: "¿Puedo hacerlo en mi casa?", a: "Sí, en Oralab ofrecemos la opción de tomar las muestras en casa con un kit y enviarlas para su análisis. Conoce más en la página de test a domicilio." },
      ]}
    />
  );
}
