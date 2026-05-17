"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./AppleReplicaLanding.module.css";

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
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#fixture">Fixture</a>
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
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#fixture">Fixture</a>
          <Link href="/ranking">Ranking</Link>
          <Link href="/premios">Premios</Link>
          <Link href="/reglas">Reglas</Link>
          <Link href="/mi-prediccion" className={styles.mobileMenuCta}>Crear mi predicción</Link>
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

        <div className={styles.heroOverlay}></div>

        <div className={styles.heroContent} id="hero-content">
          <div className={styles.heroContentLeft}>
            <div className={styles.productName}>MacBook Air</div>
            <h1 className={styles.heroTitle}>Might takes flight.</h1>
            <p className={styles.heroSubline}>Now supercharged by M5.</p>
          </div>

          <div className={styles.heroContentRight}>
            <div className={styles.priceCopy}>
              <strong>From $1099 or</strong>
              <span>$91.58/mo. for 12 mo.</span>
            </div>
            <button className={styles.buyButton}>Buy</button>
          </div>
        </div>
      </section>

      <section className={styles.highlights} id="highlights-section">
        <div className={styles.highlightsHeader}>
          <h2 className={styles.highlightsTitle}>Get the highlights.</h2>
        </div>

        <div className={styles.highlightsRail}>
          <div className={styles.highlightsTrack}>
            {Array.from({ length: 4 }).map((_, index) => (
              <article key={index} className={styles.highlightCard}>
                <div className={styles.highlightMedia}></div>
                <div className={styles.highlightCopy}>
                  <div className={styles.highlightLineLarge}></div>
                  <div className={styles.highlightLine}></div>
                  <div className={styles.highlightLineShort}></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
