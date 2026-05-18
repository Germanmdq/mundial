"use client";

import React from "react";
import Link from "next/link";
import styles from "./AppleReplicaLanding.module.css";
import { WorldCupCountdown } from "../home/WorldCupCountdown";
import { PrizePoolBanner } from "../prizes/PrizePoolBanner";

// HOME PRINCIPAL REAL.
// src/app/page.tsx renderiza este componente.
// HomeHero/HowItWorks/FinalCTA fueron eliminados para evitar duplicación.
export function AppleReplicaLanding() {
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

      {/* 1.5 BANNERS PRESTACIONES DE CONVERSIÓN */}
      <WorldCupCountdown />
      <PrizePoolBanner />

      {/* 2. CÓMO PARTICIPAR */}
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

      {/* 3. QUÉ SE PREDICE */}
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

      {/* 4. PREMIO ACUMULADO */}
      <section className={styles.prizeAccumulated}>
        <div className={styles.prizeAccumulatedInner}>
          <div className={styles.prizeAccumulatedContent}>
            <h2>El premio crece con cada participación.</h2>
            <p>Ya somos 47 participantes. Cada nueva participación activa suma $5.000 al pozo oficial.</p>
            <div className={styles.poolExamples} aria-label="Ejemplos de crecimiento del premio">
              <div><strong>47</strong><span>participantes</span><b>$235.000</b></div>
              <div><strong>48</strong><span>participantes</span><b>$240.000</b></div>
              <div><strong>49</strong><span>participantes</span><b>$245.000</b></div>
            </div>
            <ul className={styles.prizeBullets}>
              <li><span className="material-symbols-outlined">check_circle</span> Participás del premio general.</li>
              <li><span className="material-symbols-outlined">check_circle</span> Tu predicción queda asociada a tu perfil.</li>
              <li><span className="material-symbols-outlined">check_circle</span> Competís en el ranking global.</li>
              <li><span className="material-symbols-outlined">check_circle</span> Por ahora sumás con la fase de grupos.</li>
              <li><span className="material-symbols-outlined">check_circle</span> Campeón y goleador se habilitarán en segunda etapa.</li>
            </ul>
            <p className={styles.poolNote}>El equivalente en dólar blue es aproximado y se calcula con la cotización de venta disponible.</p>
            <div className={styles.prizeActions}>
              <Link href="/mi-prediccion" className={styles.btnPrimary}>Participar por el premio</Link>
              <Link href="/reglas" className={styles.btnLink}>Ver reglas del premio</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PERFIL Y CUENTA */}
      <section className={styles.profileSection}>
        <div className={styles.profileHeader}>
          <h2>Tu perfil de jugador.</h2>
          <p>Tu cuenta identifica tu participación y guarda tu progreso oficial cuando activás el acceso al pozo.</p>
        </div>
        <div className={styles.profileMockup}>
          <div className={styles.mockupHeader}>
            <div className={styles.mockupAvatar}></div>
            <div className={styles.mockupInfo}>
              <div className={styles.mockupName}>Nombre de usuario</div>
              <div className={styles.mockupStatus}>Participación Activa</div>
            </div>
          </div>
          <div className={styles.mockupGrid}>
            <div className={styles.mockupStat}>
              <span>Predicción</span>
              <strong>Fase 1</strong>
            </div>
            <div className={styles.mockupStat}>
              <span>Partidos</span>
              <strong>72</strong>
            </div>
            <div className={styles.mockupStat}>
              <span>Ranking global</span>
              <strong>Activo</strong>
            </div>
            <div className={styles.mockupStat}>
              <span>Próxima etapa</span>
              <strong>Especiales</strong>
            </div>
          </div>
          <div className={styles.mockupAction}>
            <Link href="/mi-prediccion" className={styles.btnPrimary}>Crear mi predicción</Link>
          </div>
        </div>
      </section>

      {/* 6. GRUPOS PRIVADOS */}
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

      {/* 7. CTA FINAL */}
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
        </div>
      </footer>
    </main>
  );
}
