"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./AppleReplicaLanding.module.css";
import { WorldCupCountdown } from "../home/WorldCupCountdown";

type PrizePoolState = {
  participants: number;
  poolARS: number;
  entryAmountARS: number;
  entryAmountUSD: number;
  usdBlueRate: number;
  poolUSDApproxBlue: number;
};

const fallbackPrizePool: PrizePoolState = {
  participants: 47,
  poolARS: 235000,
  entryAmountARS: 5000,
  entryAmountUSD: 5,
  usdBlueRate: 1415,
  poolUSDApproxBlue: 235000 / 1415,
};

const formatARS = (value: number) => `$${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
const formatUSD = (value: number) =>
  `USD aprox. ${value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
const formatUSDPrice = (value: number) => `USD ${value.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;

// HOME PRINCIPAL REAL.
// src/app/page.tsx renderiza este componente.
// HomeHero/HowItWorks/FinalCTA fueron eliminados para evitar duplicación.
export function AppleReplicaLanding() {
  const [prizePool, setPrizePool] = useState<PrizePoolState>(fallbackPrizePool);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/prize-pool")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load prize pool");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setPrizePool({
          participants: Number(data.participants) || fallbackPrizePool.participants,
          poolARS: Number(data.poolARS) || fallbackPrizePool.poolARS,
          entryAmountARS: Number(data.entryAmountARS) || fallbackPrizePool.entryAmountARS,
          entryAmountUSD: Number(data.entryAmountUSD) || fallbackPrizePool.entryAmountUSD,
          usdBlueRate: Number(data.usdBlueRate ?? data.blueRate) || fallbackPrizePool.usdBlueRate,
          poolUSDApproxBlue: Number(data.poolUSDApproxBlue) || fallbackPrizePool.poolUSDApproxBlue,
        });
      })
      .catch(() => {
        if (!cancelled) setPrizePool(fallbackPrizePool);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className={styles.page}>
      {/* 1. HERO */}
      <section className={styles.hero} id="hero-section">
        <video
          className={styles.heroVideo}
          id="hero-product-frame"
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          aria-hidden="true"
        >
          <source src="/apple-replica/hero-desktop.mp4" type="video/mp4" />
        </video>

        <div className={styles.heroContent} id="hero-content">
          <div className={styles.heroContentLeft}>
            <div className={styles.productName}>Mundial entre Amigos</div>
            <h1 className={styles.heroTitle}>Armá tu predicción del Mundial 2026 entre amigos.</h1>
            <p className={styles.heroSubline}>Probá 6 partidos gratis. Para guardar tu predicción oficial, completar la fase de grupos y competir por el premio acumulado, activá tu participación.</p>
          </div>

          <div className={styles.heroContentRight}>
            <Link href="/mi-prediccion" className={styles.heroBtnPrimary}>
              Crear mi predicción
            </Link>
            <Link href="/reglas" className={styles.heroBtnSecondary}>
              Ver reglas
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CUENTA REGRESIVA */}
      <WorldCupCountdown />

      {/* 3. PREMIO ACUMULADO */}
      <section className={styles.prizeAccumulated}>
        <div className={styles.prizeAccumulatedInner}>
          <div className={styles.prizeAccumulatedContent}>
            <h2>El premio crece con cada participación.</h2>
            <p>Ya somos {prizePool.participants} participantes. Cada nueva participación activa suma {formatARS(prizePool.entryAmountARS)} ARS al pozo oficial. Desde el exterior, la participación es de {formatUSDPrice(prizePool.entryAmountUSD)}.</p>
            <div className={styles.poolMetrics} aria-label="Contador del premio acumulado">
              <div>
                <span>Participantes</span>
                <strong>{prizePool.participants}</strong>
              </div>
              <div>
                <span>Pozo acumulado</span>
                <strong>{formatARS(prizePool.poolARS)} ARS</strong>
                <small>Equivalente dólar blue: {formatUSD(prizePool.poolUSDApproxBlue)}</small>
              </div>
              <div>
                <span>Valor por participación</span>
                <strong>Argentina: {formatARS(prizePool.entryAmountARS)} ARS</strong>
                <small>Exterior: {formatUSDPrice(prizePool.entryAmountUSD)}</small>
              </div>
            </div>
            <p className={styles.blueRateLine}>Dólar blue venta: {formatARS(prizePool.usdBlueRate)}</p>
            <p className={styles.poolNote}>El equivalente en dólares se calcula sobre el pozo en pesos usando la cotización de venta del dólar blue. El precio internacional de participación es {formatUSDPrice(prizePool.entryAmountUSD)}.</p>
            <div className={styles.prizeActions}>
              <Link href="/mi-prediccion" className={styles.btnPrimary}>Participar en la fase de grupos</Link>
              <Link href="/reglas" className={styles.btnLink}>Ver reglas del premio</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DISTRIBUCIÓN DEL POZO */}
      <section className={styles.prizeDistribution}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>DISTRIBUCIÓN DEL POZO ACUMULADO</p>
          <h2>Premios Oficiales del Torneo</h2>
          <p>En esta primera etapa se compite con los 72 partidos de la fase de grupos. El ranking de fase de grupos define el 70% del pozo acumulado. Campeón del Mundial y goleador se habilitarán en segunda etapa y repartirán el 15% cada uno.</p>
        </div>
        <div className={styles.distributionGrid}>
          <div className={styles.distributionCard}>
            <h3>Ranking fase de grupos</h3>
            <strong>70%</strong>
            <span>Del pozo total</span>
          </div>
          <div className={styles.distributionCard}>
            <h3>Campeón del Mundial</h3>
            <strong>15%</strong>
            <span>Se habilita en segunda etapa</span>
          </div>
          <div className={styles.distributionCard}>
            <h3>Goleador del torneo</h3>
            <strong>15%</strong>
            <span>Se habilita en segunda etapa</span>
          </div>
        </div>
        <p className={styles.distributionNote}>La primera etapa se cierra con la fase de grupos. Las eliminatorias, campeón y goleador se habilitarán más adelante para que todos puedan elegir con más información.</p>
      </section>

      {/* 5. PUNTUACIÓN Y REGLAS */}
      <section className={styles.scoringRules}>
        <div className={styles.scoringCard}>
          <p className={styles.sectionEyebrow}>SISTEMA DE PUNTUACIÓN</p>
          <h2>¿Cómo sumás puntos?</h2>
          <div className={styles.scoreList}>
            <div className={styles.scoreItem}>
              <strong>5</strong>
              <div>
                <h3>Marcador Exacto</h3>
                <p>Acertás el ganador/empate y la cantidad exacta de goles de ambos equipos. Ejemplo: pronóstico 2-1, resultado 2-1.</p>
              </div>
            </div>
            <div className={styles.scoreItem}>
              <strong>4</strong>
              <div>
                <h3>Tendencia + diferencia</h3>
                <p>Acertás el ganador o empate y además acertás la diferencia exacta de goles. Ejemplo: pronóstico 3-1, resultado 2-0.</p>
              </div>
            </div>
            <div className={styles.scoreItem}>
              <strong>3</strong>
              <div>
                <h3>Solo tendencia</h3>
                <p>Acertás únicamente si el partido termina en victoria local, visitante o empate. Ejemplo: pronóstico 2-1, resultado 1-0.</p>
              </div>
            </div>
            <div className={styles.scoreItem}>
              <strong>0</strong>
              <div>
                <h3>Incorrecto</h3>
                <p>No acertás ni el resultado ni la tendencia del encuentro.</p>
              </div>
            </div>
          </div>
          <div className={styles.specialNote}>
            <h3>Pronósticos Especiales</h3>
            <p>Campeón y goleador no suman puntos al ranking de fase de grupos. Participan por premios separados y se habilitarán en segunda etapa.</p>
          </div>
        </div>

        <div className={styles.rulesCard}>
          <p className={styles.sectionEyebrow}>REGLAMENTO OFICIAL</p>
          <h2>Reglas por Fase y Desempates</h2>
          <div className={styles.ruleBlock}>
            <h3>Fase de Grupos (Sin penales)</h3>
            <p>Los encuentros de fase de grupos pueden terminar en empate tras los 90 minutos reglamentarios. El pronóstico es el resultado de los 90 minutos reglamentarios. No se consideran penales.</p>
          </div>
          <div className={styles.ruleBlock}>
            <h3>Playoffs (Eliminatorias)</h3>
            <p>Se habilitan en segunda etapa. No forman parte de la carga inicial.</p>
          </div>
          <div className={styles.ruleBlock}>
            <h3>Jerarquía de desempate en ranking</h3>
            <ol className={styles.tieList}>
              <li>Mayor cantidad de marcadores exactos acertados (predicciones de 5 puntos).</li>
              <li>Mayor cantidad de diferencias de gol correctas (predicciones de 4 puntos).</li>
              <li>Fecha y hora de activación del pago de participación (quien pagó primero).</li>
            </ol>
          </div>
        </div>
      </section>

      {/* 6. NATURALEZA DEL JUEGO */}
      <section className={styles.socialGame}>
        <div className={styles.socialGameHeader}>
          <h2>Un juego entre amigos para vivir el Mundial distinto.</h2>
          <p>
            Mundial entre Amigos no es una plataforma de apuestas. Es una competencia social de predicciones: cargás tus resultados, seguís la fase de grupos, comparás tu ranking con otros participantes y competís por el pozo acumulado.
          </p>
          <p>
            La idea es simple: divertirse, discutir resultados, sufrir cada gol y tener un premio real para hacerlo más emocionante.
          </p>
        </div>
        <div className={styles.socialGameGrid}>
          <div className={styles.socialGameCard}>
            <span className="material-symbols-outlined">groups</span>
            <h3>Jugás con amigos</h3>
            <p>Compartís la emoción del Mundial en una competencia simple y social.</p>
          </div>
          <div className={styles.socialGameCard}>
            <span className="material-symbols-outlined">psychology_alt</span>
            <h3>No es azar</h3>
            <p>Ganás puntos por tus predicciones, no por una ruleta ni por una apuesta contra la casa.</p>
          </div>
          <div className={styles.socialGameCard}>
            <span className="material-symbols-outlined">savings</span>
            <h3>Hay premio acumulado</h3>
            <p>Cada participación activa suma al pozo oficial.</p>
          </div>
          <div className={styles.socialGameCard}>
            <span className="material-symbols-outlined">flag</span>
            <h3>Primera etapa</h3>
            <p>Ahora se juega la fase de grupos. Después se habilitan eliminatorias, campeón y goleador.</p>
          </div>
        </div>
      </section>

      {/* 7. CÓMO PARTICIPAR */}
      <section className={styles.howItWorks} id="como-funciona">
        <div className={styles.howItWorksHeader}>
          <h2 className={styles.howItWorksTitle}>Cómo funciona.</h2>
          <p className={styles.howItWorksSubtitle}>Primero cargás la fase de grupos. Las eliminatorias, campeón y goleador se habilitan en una segunda etapa.</p>
        </div>

        <div className={styles.howItWorksGrid3}>
          <div className={styles.howItWorksCard}>
            <div className={styles.howItWorksIconWrap}>
              <span className="material-symbols-outlined">sports_soccer</span>
            </div>
            <h3 className={styles.howItWorksCardTitle}>1. Probá 6 partidos gratis</h3>
            <p className={styles.howItWorksCardText}>
              Empezás sin pagar y ves cómo queda tu Mundial con tus primeros resultados.
            </p>
          </div>

          <div className={styles.howItWorksCard}>
            <div className={styles.howItWorksIconWrap}>
              <span className="material-symbols-outlined">verified</span>
            </div>
            <h3 className={styles.howItWorksCardTitle}>2. Activá tu participación</h3>
            <p className={styles.howItWorksCardText}>
              Para guardar tu predicción oficial y competir por el pozo, activás tu participación.
            </p>
          </div>

          <div className={styles.howItWorksCard}>
            <div className={styles.howItWorksIconWrap}>
              <span className="material-symbols-outlined">view_kanban</span>
            </div>
            <h3 className={styles.howItWorksCardTitle}>3. Completá la fase de grupos</h3>
            <p className={styles.howItWorksCardText}>
              Cargás los 72 partidos de grupos. Después se habilitan eliminatorias y especiales.
            </p>
          </div>

          <div className={styles.howItWorksCard}>
            <div className={styles.howItWorksIconWrap}>
              <span className="material-symbols-outlined">workspace_premium</span>
            </div>
            <h3 className={styles.howItWorksCardTitle}>4. Segunda etapa</h3>
            <p className={styles.howItWorksCardText}>
              Más adelante vas a poder completar eliminatorias, campeón y goleador.
            </p>
          </div>

          <div className={styles.howItWorksCard}>
            <div className={styles.howItWorksIconWrap}>
              <span className="material-symbols-outlined">emoji_events</span>
            </div>
            <h3 className={styles.howItWorksCardTitle}>5. Competí por el pozo</h3>
            <p className={styles.howItWorksCardText}>
              Cada participación activa suma al premio acumulado y al ranking oficial.
            </p>
          </div>
        </div>
      </section>

      {/* 8. QUÉ SE PREDICE */}
      <section className={styles.predictionScope}>
        <div className={styles.predictionHeader}>
          <h2 className={styles.predictionTitle}>Tu predicción, etapa por etapa.</h2>
        </div>
        <div className={styles.predictionGrid}>
          <div className={styles.predictionCard}>
            <span className="material-symbols-outlined">sports_soccer</span>
            <h3>Fase de grupos</h3>
            <p>Por ahora cargás los 72 partidos de grupos.</p>
          </div>
          <div className={styles.predictionCard}>
            <span className="material-symbols-outlined">format_list_numbered</span>
            <h3>Grupos</h3>
            <p>La tabla se arma con tus resultados.</p>
          </div>
          <div className={styles.predictionCard}>
            <span className="material-symbols-outlined">lock_clock</span>
            <h3>Eliminatorias</h3>
            <p>Se habilitan después de cerrar la primera etapa.</p>
          </div>
          <div className={styles.predictionCard}>
            <span className="material-symbols-outlined">stars</span>
            <h3>Especiales</h3>
            <p>Campeón y goleador se habilitarán en segunda etapa.</p>
          </div>
        </div>
      </section>

      {/* 9. GRUPOS PRIVADOS */}
      <section className={styles.privateGroups}>
        <div className={styles.groupsHeader}>
          <div className={styles.comingSoonBadge}>Próximamente</div>
          <h2>Grupos privados</h2>
          <p>Muy pronto vas a poder crear grupos privados para competir con tus amigos.</p>
        </div>
        <div className={styles.groupsGrid}>
          <div className={styles.groupCard}>
            <span className="material-symbols-outlined">add_circle</span>
            <h3>1. Crear grupo</h3>
            <p>Vas a poder ponerle nombre a tu grupo privado.</p>
          </div>
          <div className={styles.groupCard}>
            <span className="material-symbols-outlined">person_add</span>
            <h3>2. Invitar amigos</h3>
            <p>Vas a compartir un link de acceso con tus amigos.</p>
          </div>
          <div className={styles.groupCard}>
            <span className="material-symbols-outlined">leaderboard</span>
            <h3>3. Ranking privado</h3>
            <p>Van a competir entre ustedes además del ranking general.</p>
          </div>
        </div>
        <div className={styles.groupsAction}>
          <button type="button" className={styles.btnDisabled} disabled>Próximamente</button>
        </div>
      </section>

      {/* 10. CTA FINAL */}
      <section className={styles.finalCtaSection}>
        <div className={styles.finalCtaContent}>
          <h2 className={styles.finalCtaTitle}>Tu Mundial empieza con una predicción.</h2>
          <p className={styles.finalCtaDescription}>
            Probá 6 partidos gratis. Si querés guardar tu predicción oficial, activá tu participación y completá la fase de grupos.
          </p>
          <div className={styles.finalCtaActionsFlex}>
            <Link href="/mi-prediccion" className={styles.btnPrimaryLg}>Crear mi predicción</Link>
            <Link href="/equipos" className={styles.btnSecondaryLg}>Ver equipos</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.globalFooter}>
        <div className={styles.globalFooterInner}>
          <div className={styles.footerBrand}>Mundial entre Amigos</div>
          <div className={styles.footerLinks}>
            <Link href="/reglas">Reglas</Link>
            <Link href="/">Términos</Link>
            <Link href="/">Privacidad</Link>
            <Link href="/">Soporte</Link>
          </div>
          <div className={styles.footerCopyright}>
            © 2026 Mundial entre Amigos. Todos los derechos reservados.
          </div>
          <div className={styles.footerDisclaimer}>
            Mundial entre Amigos es una experiencia recreativa de predicción y ranking social.
          </div>
        </div>
      </footer>
    </main>
  );
}
