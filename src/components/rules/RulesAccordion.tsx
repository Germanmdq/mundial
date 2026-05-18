"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

const RULES_SECTIONS = [
  {
    title: "Naturaleza de la competencia",
    content: "Mundial entre Amigos es una competencia de habilidad basada en la predicción de resultados deportivos de la Copa Mundial de la FIFA 2026. No constituye un juego de azar."
  },
  {
    title: "Participación",
    content: "Podrá participar cualquier persona física que cumpla con los requisitos de edad mínima y active su inscripción mediante el pago de participación oficial."
  },
  {
    title: "Edad mínima",
    content: "La participación está limitada a mayores de 18 años o según la legislación local vigente."
  },
  {
    title: "Carga de predicciones",
    content: "Las predicciones pueden realizarse y modificarse hasta 15 minutos antes del inicio de cada partido oficial. Una vez iniciado el encuentro, el sistema bloquea los cambios automáticamente."
  },
  {
    title: "Sistema de puntos",
    content: "Se otorgan puntos en base a los aciertos del marcador de la siguiente manera:\n\n• 5 Puntos: Marcador Exacto (ej: pronóstico 2-1 y partido termina 2-1).\n• 4 Puntos: Tendencia + diferencia de goles (ej: pronóstico 3-1 y partido termina 2-0).\n• 3 Puntos: Solo tendencia (ej: pronóstico 2-1 y partido termina 1-0).\n• 0 Puntos: Incorrecto.\n\n*Los partidos dorados (Golden Matches) duplican los puntos obtenidos en dicho partido.*"
  },
  {
    title: "Fase de Grupos (Sin penales)",
    content: "Durante la Fase de Grupos, los partidos pueden terminar en empate tras los 90 minutos reglamentarios. No existe definición por penales. El pronóstico es el resultado de los 90 minutos reglamentarios."
  },
  {
    title: "Fases Eliminatorias (Playoffs)",
    content: "Las fases eliminatorias se habilitarán en la segunda etapa. El pronóstico aplicará al resultado al finalizar el tiempo regular o prórroga (120 minutos). Los penales solo sirven como desempate de clasificación para definir qué equipo clasifica, pero no agregan goles adicionales al marcador ni otorgan puntos extra."
  },
  {
    title: "Distribución de Premios",
    content: "En esta primera etapa se compite con los 72 partidos de la fase de grupos. El pozo acumulado oficial (formado por $5.000 ARS por participante activo) se distribuirá de la siguiente manera:\n\n• Ranking fase de grupos: 70% del pozo acumulado.\n• Campeón del Mundial: 15% del pozo acumulado, se habilita en segunda etapa.\n• Goleador del torneo: 15% del pozo acumulado, se habilita en segunda etapa.\n\nCampeón y goleador no suman puntos al ranking de fase de grupos. Participan por premios separados y se habilitarán en segunda etapa."
  },
  {
    title: "Criterios de desempate",
    content: "En caso de que dos o más participantes igualen en la puntuación general al finalizar el torneo, el ganador del puesto correspondiente se determinará aplicando la siguiente jerarquía:\n\n1. Mayor cantidad de marcadores exactos acertados (predicciones de 5 puntos).\n2. Mayor cantidad de diferencias de gol correctas (predicciones de 4 puntos).\n3. Fecha y hora de activación del pago de la inscripción (el participante que abonó primero su entrada oficial)."
  }
];

export function RulesAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {RULES_SECTIONS.map((section, idx) => (
        <div 
          key={idx}
          className="border border-[#e5e5e7] rounded-2xl bg-white overflow-hidden shadow-sm transition-all"
        >
          <button
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-[#f5f5f7] transition-colors"
          >
            <span className="text-[#1d1d1f] font-bold text-[15px]">{section.title}</span>
            <span className={cn(
              "material-symbols-outlined text-[#0071e3] transition-transform duration-300",
              openIndex === idx && "rotate-180"
            )}>
              expand_more
            </span>
          </button>
          <div className={cn(
            "px-6 overflow-hidden transition-all duration-300 ease-out",
            openIndex === idx ? "max-h-[500px] pb-5 pt-1" : "max-h-0"
          )}>
            <p className="text-[#6e6e73] text-[14px] leading-relaxed">
              {section.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
