"use client";

import React from "react";
import styles from "./HomeAppleLanding.module.css";

export function HomeAppleLanding() {
  return (
    <div className={styles.root} id="home-apple-root">
      {/* 1. GLOBAL HEADER */}
      <header className={styles.globalHeader} id="global-header">
        <div className={styles.globalHeaderInner}>
          <div className={styles.logoPlaceholder} />
          <nav className={styles.globalNavLinks}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.globalNavLinkPlaceholder} />
            ))}
          </nav>
          <button className={styles.globalHeaderCTA} aria-label="Action" />
          <button className={styles.compactMenuBtn} aria-label="Action" />
        </div>
      </header>

      {/* 2. LOCAL NAV */}
      <nav className={styles.localNav} id="local-nav">
        <div className={styles.localNavInner}>
          <div className={styles.localNavLeft} />
          <div className={styles.localNavRight}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.localNavLinkPlaceholder} />
            ))}
            <button className={styles.localNavCTA} aria-label="Action" />
          </div>
        </div>
      </nav>

      {/* 3. HERO EDITORIAL */}
      <section className={styles.heroEditorial} id="hero-editorial">
        <div className={styles.eyebrowShape} />
        <div className={styles.heroH1Line1} />
        <div className={styles.heroH1Line2} />
        <div className={styles.heroSubheadline} />
        <div className={styles.heroActions}>
          <button className={styles.primaryButtonShape} aria-label="Action" />
          <button className={styles.secondaryButtonShape} aria-label="Action" />
        </div>

        {/* 4. HERO VISUAL STAGE */}
        <div className={styles.heroVisualStage} id="hero-visual-stage">
          <div className={styles.visualStageBackground} />
          <div className={styles.visualStageGridLines} />
          <div className={styles.visualStageMainPanel}>
            <div className={styles.dashboardLine} style={{ width: "40%" }} />
            <div className={styles.dashboardLine} style={{ width: "70%" }} />
            <div className={styles.dashboardLine} style={{ width: "55%" }} />
          </div>
          <div className={styles.visualStageLeftPanel}>
            <div className={styles.dashboardLine} style={{ width: "60%" }} />
            <div className={styles.dashboardLine} style={{ width: "30%" }} />
          </div>
          <div className={styles.visualStageRightPanel}>
            <div className={styles.dashboardLine} style={{ width: "50%", background: "rgba(255, 255, 255, 0.4)" }} />
            <div className={styles.dashboardLine} style={{ width: "80%", background: "rgba(255, 255, 255, 0.4)" }} />
          </div>
          <div className={styles.visualStageBottomCard}>
            <div className={styles.dashboardLine} style={{ width: "75%" }} />
            <div className={styles.dashboardLine} style={{ width: "40%" }} />
          </div>
        </div>
      </section>

      {/* 5. HIGHLIGHTS SLIDER — 7 Cards */}
      <section className={styles.highlightsSection} id="highlights-slider-section">
        <div className={styles.highlightsHeader}>
          <div className={styles.highlightsTitleVisual} />
        </div>
        <div className={styles.sliderViewport}>
          <div className={styles.highlightsTrack}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={styles.highlightCard}>
                <div className={styles.highlightTopVisual} />
                <div className={styles.highlightTitleShape} />
                <div className={styles.highlightTextShapes}>
                  <div className={styles.highlightTextLine} style={{ width: "90%" }} />
                  <div className={styles.highlightTextLine} style={{ width: "75%" }} />
                  <div className={styles.highlightTextLine} style={{ width: "85%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SHOWCASE SLIDER — 10 Cards */}
      <section className={styles.showcaseSection} id="showcase-slider-section">
        <div className={styles.showcaseHeader}>
          <div className={styles.showcaseTitleVisual} />
          <div className={styles.showcaseIntroVisual} />
        </div>
        <div className={styles.sliderViewport}>
          <div className={styles.showcaseTrack}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={styles.showcaseCard}>
                <div className={styles.showcaseImagePlaceholder} />
                <div className={styles.showcaseContentArea}>
                  <div>
                    <div className={styles.showcaseTitleShape} />
                    <div className={styles.showcaseSubtitleShape} />
                  </div>
                  <div className={styles.showcaseBadgeShape} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. CHAPTER SECTION A */}
      <section className={`${styles.chapterSection} ${styles.sectionPadding}`} id="chapter-section-a">
        <div className={styles.sectionContainer}>
          <div className={styles.chapterTitleVisual} />
          <div className={styles.chapterIntroVisual} />
        </div>
      </section>

      {/* 8. BENTO GRID — 4 Cards */}
      <section className={styles.bentoSection} id="bento-grid-section">
        <div className={styles.sectionContainer}>
          <div className={styles.bentoGrid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.bentoCard}>
                <div className={styles.bentoTopVisual} />
                <div className={styles.bentoTitleShape} />
                <div className={styles.bentoCopyShapes}>
                  <div className={styles.bentoCopyLine} style={{ width: "90%" }} />
                  <div className={styles.bentoCopyLine} style={{ width: "75%" }} />
                  <div className={styles.bentoCopyLine} style={{ width: "80%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. LARGE DARK VISUAL MODULE — 5 Rows */}
      <section className={`${styles.largeDarkSection} ${styles.sectionPadding}`} id="large-dark-visual-section">
        <div className={styles.sectionContainer}>
          <div className={styles.largeDarkHeader}>
            <div className={styles.largeDarkTitle} />
            <div className={styles.largeDarkIntro} />
          </div>
          <div className={styles.largeDarkVisual}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.largeDarkRow}>
                <div className={styles.largeDarkRowLeft}>
                  <div className={styles.largeDarkAvatar} />
                  <div className={styles.largeDarkTextLine} />
                </div>
                <div className={styles.largeDarkMetricPill} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FORM / DATA PREVIEW MODULE — 4 Rows */}
      <section className={`${styles.formSection} ${styles.sectionPadding}`} id="form-data-preview-section">
        <div className={styles.sectionContainer}>
          <div className={styles.formModule}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.formRow}>
                <div className={styles.formRowAvatarShape} />
                <div className={styles.formRowTextLine} />
                <div className={styles.formInputBoxes}>
                  <div className={styles.formInputBox} />
                  <div className={styles.formInputBox} />
                </div>
                <div className={styles.formRowTextLine} style={{ width: "50%" }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. METRICS + TABLE MODULE — 3 Metrics + 5 Rows */}
      <section className={`${styles.metricsSection} ${styles.sectionPadding}`} id="metrics-table-section">
        <div className={styles.sectionContainer}>
          <div className={`${styles.metricsGrid} ${styles.sliderViewport}`}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.metricCard}>
                <div className={styles.metricBigShape} />
                <div className={styles.metricSmallShape} />
              </div>
            ))}
          </div>
          <div className={styles.metricsTable}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={styles.tableRow}
                style={{ background: i % 2 === 0 ? "#f7f8fa" : "transparent" }}
              >
                <div className={styles.tableCol}>
                  <div className={styles.tableAvatarShape} />
                  <div className={styles.tableTextLineShort} />
                </div>
                <div className={styles.tableTextLineShort} style={{ width: "80px" }} />
                <div className={styles.tableTextLineMicro} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. PRODUCT CARDS GRID — 5 Cards */}
      <section className={`${styles.productGridSection} ${styles.sectionPadding}`} id="product-cards-grid-section">
        <div className={styles.sectionContainer}>
          <div className={`${styles.productGrid} ${styles.sliderViewport}`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={styles.productCard}>
                <div className={styles.productVisualPlaceholder} />
                <div>
                  <div className={styles.productTitleShape} />
                  <div className={styles.productCopyLine} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. GOLD ACCENT CARDS SECTION — 3 Cards */}
      <section className={`${styles.goldSection} ${styles.sectionPadding}`} id="gold-accent-cards-section">
        <div className={styles.sectionContainer}>
          <div className={styles.goldGrid}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.goldCard}>
                <div className={styles.goldTopVisual} />
                <div>
                  <div className={styles.goldTitleShape} />
                  <div className={styles.goldCopyLine} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. TEAM GRID + RAIL SECTION — Grid 8 Cards, Rail 8 Cards */}
      <section className={`${styles.teamSection} ${styles.sectionPadding}`} id="team-grid-rail-section">
        <div className={styles.sectionContainer}>
          <div className={styles.teamGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.teamCard}>
                <div className={styles.teamCardFlagShape} />
                <div className={styles.teamCardLine} />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.railContainer}>
          <div className={styles.railTrack}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.railCard}>
                <div className={styles.railCardAvatar} />
                <div style={{ width: "100%", marginTop: "14px" }}>
                  <div className={styles.railCardLine} style={{ width: "70%" }} />
                  <div className={styles.railCardLine} style={{ width: "45%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 15. TRUST / LEGAL CARDS SECTION — 3 Inner Cards */}
      <section className={`${styles.trustSection} ${styles.sectionPadding}`} id="trust-legal-cards-section">
        <div className={styles.sectionContainer}>
          <div className={styles.trustCard}>
            <div className={styles.trustCardTitleShape} />
            <div className={styles.trustCardCopyLine} />
            <div className={styles.trustGrid}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.innerTrustCard}>
                  <div className={styles.trustCardTitleShape} style={{ width: "50%" }} />
                  <div className={styles.trustCardCopyLine} style={{ width: "80%" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 16. FINAL CTA + FOOTER */}
      <section className={styles.finalCTA} id="final-cta-section">
        <div className={styles.sectionContainer}>
          <div className={styles.finalCTATitleShape} />
          <div className={styles.finalCTACopyShape} />
          <button className={styles.finalCTAButton} aria-label="Action" />
        </div>
      </section>

      <footer className={styles.footer} id="footer">
        <div className={styles.sectionContainer}>
          <div className={styles.footerGrid}>
            <div className={styles.footerColumn}>
              <div className={styles.footerLinePlaceholder} style={{ width: "120px" }} />
              <div className={styles.footerLinePlaceholderShort} />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.footerColumn}>
                <div className={styles.footerLinePlaceholder} />
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className={styles.footerLinePlaceholderShort} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
