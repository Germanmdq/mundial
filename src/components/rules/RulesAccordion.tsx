"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

const RULES_SECTIONS = [
  {
    title: "Naturaleza de la competencia",
    content: "Mi Predicción Mundial 2026 es una competencia de habilidad basada en la predicción de resultados deportivos de la Copa Mundial de la FIFA 2026. No constituye un juego de azar ni apuestas."
  },
  {
    title: "Participación",
    content: "Podrá participar cualquier persona física que cumpla con los requisitos de edad mínima y abone la entrada única."
  },
  {
    title: "Edad mínima",
    content: "La participación está limitada a mayores de 18 años o según la legislación local vigente."
  },
  {
    title: "Entrada",
    content: "La entrada única tiene un valor de $5.000 ARS y otorga acceso a todas las fases de la competencia."
  },
  {
    title: "Carga de predicciones",
    content: "Las predicciones deben cargarse hasta 15 minutos antes del inicio de cada partido. Una vez iniciado el encuentro, no se podrán realizar cambios."
  },
  {
    title: "Sistema de puntos",
    content: "10 pts por resultado exacto. 5 pts por ganador correcto. 2 pts por goles de un equipo. Los Golden Matches duplican el puntaje total obtenido en dicho partido."
  },
  {
    title: "Gran Premio Fase de Grupos",
    content: "Se entregará un premio especial al primer puesto del ranking una vez finalizada la fase de grupos."
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
