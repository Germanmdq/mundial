"use client";

import React from "react";
import Link from "next/link";
import styles from "./AppleReplicaLanding.module.css";
import { WorldCupCountdown } from "../home/WorldCupCountdown";
import { PrizePoolBanner } from "../prizes/PrizePoolBanner";

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
            <h1 className={styles.heroTitle}>Armá tu predicción del Mundial 2026.</h1>
            <p className={styles.heroSubline}>Completá tus resultados, elegí goleador y campeón, y competí con tus amigos durante todo el torneo.</p>
          </div>

          <div className={styles.heroContentRight}>
            <Link href="/mi-prediccion" className={styles.heroBtnPrimary}>
              Crear mi predicción
            </Link>
            <Link href="#como-funciona" className={styles.heroBtnSecondary}>
              Cómo funciona
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
          <h2 className={styles.howItWorksTitle}>Cómo participar.</h2>
          <p className={styles.howItWorksSubtitle}>En pocos pasos armás tu Mundial y empezás a competir.</p>
        </div>

        <div className={styles.howItWorksGrid3}>
          <div className={styles.howItWorksCard}>
            <div className={styles.howItWorksIconWrap}>
              <span className="material-symbols-outlined">person_add</span>
            </div>
            <h3 className={styles.howItWorksCardTitle}>1. Crear tu cuenta</h3>
            <p className={styles.howItWorksCardText}>
              Entrás con tu usuario para guardar tu predicción y seguir tu ranking.
            </p>
          </div>

          <div className={styles.howItWorksCard}>
            <div className={styles.howItWorksIconWrap}>
              <span className="material-symbols-outlined">view_kanban</span>
            </div>
            <h3 className={styles.howItWorksCardTitle}>2. Cargar la zona de grupos</h3>
            <p className={styles.howItWorksCardText}>
              Completás los resultados de cada partido y armás las tablas.
            </p>
          </div>

          <div className={styles.howItWorksCard}>
            <div className={styles.howItWorksIconWrap}>
              <span className="material-symbols-outlined">emoji_events</span>
            </div>
            <h3 className={styles.howItWorksCardTitle}>3. Elegir goleador y campeón</h3>
            <p className={styles.howItWorksCardText}>
              Sumás tus predicciones principales para competir por más puntos.
            </p>
          </div>
        </div>
      </section>

      {/* 3. QUÉ SE PREDICE */}
      <section className={styles.predictionScope}>
        <div className={styles.predictionHeader}>
          <h2 className={styles.predictionTitle}>Tu predicción completa.</h2>
        </div>
        <div className={styles.predictionGrid}>
          <div className={styles.predictionCard}>
            <span className="material-symbols-outlined">sports_soccer</span>
            <h3>Partidos</h3>
            <p>Predicción resultado por resultado.</p>
          </div>
          <div className={styles.predictionCard}>
            <span className="material-symbols-outlined">format_list_numbered</span>
            <h3>Grupos</h3>
            <p>La tabla se arma con tus resultados.</p>
          </div>
          <div className={styles.predictionCard}>
            <span className="material-symbols-outlined">stars</span>
            <h3>Goleador</h3>
            <p>Elegís quién termina arriba.</p>
          </div>
          <div className={styles.predictionCard}>
            <span className="material-symbols-outlined">workspace_premium</span>
            <h3>Campeón</h3>
            <p>Marcás quién levanta la Copa.</p>
          </div>
        </div>
      </section>

      {/* 4. PREMIO ACUMULADO */}
      <section className={styles.prizeAccumulated}>
        <div className={styles.prizeAccumulatedInner}>
          <div className={styles.prizeAccumulatedContent}>
            <h2>¿Querés jugar por el premio acumulado?</h2>
            <p>Cuando completás la zona de grupos, podés activar tu participación por el premio acumulado y entrar al ranking general.</p>
            <ul className={styles.prizeBullets}>
              <li><span className="material-symbols-outlined">check_circle</span> Participás del premio general.</li>
              <li><span className="material-symbols-outlined">check_circle</span> Tu predicción queda asociada a tu perfil.</li>
              <li><span className="material-symbols-outlined">check_circle</span> Competís en el ranking global.</li>
              <li><span className="material-symbols-outlined">check_circle</span> Sumás por fase de grupos, goleador y campeón.</li>
              <li><span className="material-symbols-outlined">check_circle</span> Podés crear grupos privados con tus amigos.</li>
            </ul>
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
          <p>Cada participante tiene su cuenta, su predicción guardada y su evolución durante el torneo.</p>
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
              <strong>Guardada</strong>
            </div>
            <div className={styles.mockupStat}>
              <span>Puntos</span>
              <strong>2,450</strong>
            </div>
            <div className={styles.mockupStat}>
              <span>Ranking global</span>
              <strong>#142</strong>
            </div>
            <div className={styles.mockupStat}>
              <span>Grupos privados</span>
              <strong>3</strong>
            </div>
          </div>
          <div className={styles.mockupAction}>
            <Link href="/mi-prediccion" className={styles.btnPrimary}>Crear mi cuenta</Link>
          </div>
        </div>
      </section>

      {/* 6. GRUPOS PRIVADOS */}
      <section className={styles.privateGroups}>
        <div className={styles.groupsHeader}>
          <h2>Armá tu grupo privado.</h2>
          <p>Creá una liga con tus amigos, compartí el enlace y seguí un ranking propio durante todo el Mundial.</p>
        </div>
        <div className={styles.groupsGrid}>
          <div className={styles.groupCard}>
            <span className="material-symbols-outlined">add_circle</span>
            <h3>1. Crear grupo</h3>
            <p>Ponés nombre a tu grupo privado.</p>
          </div>
          <div className={styles.groupCard}>
            <span className="material-symbols-outlined">person_add</span>
            <h3>2. Invitar amigos</h3>
            <p>Compartís un link de acceso.</p>
          </div>
          <div className={styles.groupCard}>
            <span className="material-symbols-outlined">leaderboard</span>
            <h3>3. Ranking privado</h3>
            <p>Compiten entre ustedes además del ranking general.</p>
          </div>
        </div>
        <div className={styles.groupsAction}>
          <Link href="/mi-prediccion" className={styles.btnPrimary}>Crear grupo privado</Link>
        </div>
      </section>

      {/* 7. CTA FINAL */}
      <section className={styles.finalCtaSection}>
        <div className={styles.finalCtaContent}>
          <h2 className={styles.finalCtaTitle}>Tu Mundial empieza con una predicción.</h2>
          <p className={styles.finalCtaDescription}>
            Cargá tus resultados, guardá tu camino al campeón y preparate para competir con tus amigos.
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
