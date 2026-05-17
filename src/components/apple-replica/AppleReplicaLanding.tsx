"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./AppleReplicaLanding.module.css";
import { FeaturedPlayersCarousel } from "./FeaturedPlayersCarousel";

export function AppleReplicaLanding() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className={styles.page}>
      <header className={styles.globalNav}>
        <nav className={styles.globalNavInner} aria-label="Menú principal">
          <Link href="/" className={styles.brand}>
            Mundial entre Amigos
          </Link>

          <div className={styles.desktopLinks}>
            <Link href="/">Cómo funciona</Link>
            <Link href="/equipos">Equipos</Link>
            <Link href="/ranking">Ranking</Link>
            <Link href="/premios">Premios</Link>
            <Link href="/reglas">Reglas</Link>
          </div>

          <div className={styles.desktopActions}>
            <Link href="/login" className={styles.loginLink}>Ingresar</Link>
            <Link href="/mi-prediccion" className={styles.navCta}>Crear mi predicción</Link>
          </div>

          <button
            className={styles.mobileMenuButton}
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span></span>
            <span></span>
          </button>
        </nav>

        <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ""}`}>
          <Link href="/" onClick={() => setMenuOpen(false)}>Cómo funciona</Link>
          <Link href="/equipos" onClick={() => setMenuOpen(false)}>Equipos</Link>
          <Link href="/ranking" onClick={() => setMenuOpen(false)}>Ranking</Link>
          <Link href="/premios" onClick={() => setMenuOpen(false)}>Premios</Link>
          <Link href="/reglas" onClick={() => setMenuOpen(false)}>Reglas</Link>
          <Link href="/mi-prediccion" className={styles.mobileMenuCta} onClick={() => setMenuOpen(false)}>Crear mi predicción</Link>
        </div>
      </header>

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
            <h1 className={styles.heroTitle}>Armá tu predicción.</h1>
            <p className={styles.heroSubline}>Competí con tus amigos.</p>
          </div>

          <div className={styles.heroContentRight}>
            <div className={styles.priceCopy}>
              <strong>Entrada única</strong>
              <span>Predicción completa</span>
            </div>
            <Link href="/mi-prediccion" className={styles.buyButton}>
              Jugar
            </Link>
          </div>
        </div>
      </section>

      <FeaturedPlayersCarousel />

      {/* Sección Cómo Funciona */}
      <section className={styles.howItWorks} id="como-funciona">
        <div className={styles.howItWorksHeader}>
          <p className={styles.howItWorksEyebrow}>Cómo funciona</p>
          <h2 className={styles.howItWorksTitle}>
            Armás tus predicciones, sumás puntos y competís contra tus amigos durante todo el Mundial.
          </h2>
        </div>

        <div className={styles.howItWorksGrid}>
          <div className={styles.howItWorksCard}>
            <div className={styles.howItWorksIconWrap}>
              <span className="material-symbols-outlined">edit_note</span>
            </div>
            <h3 className={styles.howItWorksCardTitle}>1. Armá tu predicción</h3>
            <p className={styles.howItWorksCardText}>
              Completá los resultados de los partidos antes de que empiece cada fecha.
            </p>
          </div>

          <div className={styles.howItWorksCard}>
            <div className={styles.howItWorksIconWrap}>
              <span className="material-symbols-outlined">stars</span>
            </div>
            <h3 className={styles.howItWorksCardTitle}>2. Sumá puntos</h3>
            <p className={styles.howItWorksCardText}>
              Acertá ganadores, empates y marcadores exactos para subir en el ranking.
            </p>
          </div>

          <div className={styles.howItWorksCard}>
            <div className={styles.howItWorksIconWrap}>
              <span className="material-symbols-outlined">groups</span>
            </div>
            <h3 className={styles.howItWorksCardTitle}>3. Competí con amigos</h3>
            <p className={styles.howItWorksCardText}>
              Entrá al ranking, compará tus puntos y seguí la tabla en tiempo real.
            </p>
          </div>

          <div className={styles.howItWorksCard}>
            <div className={styles.howItWorksIconWrap}>
              <span className="material-symbols-outlined">emoji_events</span>
            </div>
            <h3 className={styles.howItWorksCardTitle}>4. Jugá por el premio</h3>
            <p className={styles.howItWorksCardText}>
              El ganador global se lleva el premio principal al final de la competencia.
            </p>
          </div>
        </div>
      </section>

      {/* Sección Premio Garantizado */}
      <section className={styles.prizeSection}>
        <div className={styles.prizeCard}>
          <div className={styles.prizeLeft}>
            <p className={styles.prizeEyebrow}>Premio garantizado</p>
            <h2 className={styles.prizeAmount}>AR$ 550.000</h2>
            <p className={styles.prizeDescription}>
              El premio inicial está garantizado y puede crecer con cada nuevo participante.
            </p>
          </div>
          <div className={styles.prizeRight}>
            <Link href="/mi-prediccion" className={styles.prizeCtaButton}>
              Crear mi predicción
            </Link>
          </div>
        </div>
      </section>

      {/* Sección CTA Final */}
      <section className={styles.finalCtaSection}>
        <div className={styles.finalCtaContent}>
          <h2 className={styles.finalCtaTitle}>
            El Mundial empieza antes del primer partido.
          </h2>
          <p className={styles.finalCtaDescription}>
            Creá tu predicción, invitá a tus amigos y viví cada resultado como si fuera una final.
          </p>
          <div className={styles.finalCtaActions}>
            <Link href="/mi-prediccion" className={styles.finalCtaButton}>
              Crear mi predicción
            </Link>
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
