import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const TARGET_URL = "https://www.apple.com/macbook-air/";
const OUT_ROOT = "layout-analysis/apple-macbook-air";

const viewports = [
  { name: "desktop-1440", width: 1440, height: 1200 },
  { name: "desktop-1068", width: 1068, height: 1200 },
  { name: "tablet-834", width: 834, height: 1200 },
  { name: "mobile-390", width: 390, height: 1200 },
];

const cssProps = [
  "display",
  "position",
  "top",
  "left",
  "right",
  "bottom",
  "z-index",
  "width",
  "height",
  "max-width",
  "min-height",
  "grid-template-columns",
  "grid-auto-flow",
  "grid-auto-columns",
  "flex-direction",
  "justify-content",
  "align-items",
  "gap",
  "column-gap",
  "row-gap",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "border-radius",
  "box-shadow",
  "background",
  "background-color",
  "color",
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "letter-spacing",
  "overflow",
  "overflow-x",
  "scroll-snap-type",
  "scroll-snap-align",
  "backdrop-filter",
  "opacity",
  "transform",
  "transition-property",
  "transition-duration",
  "transition-delay",
  "transition-timing-function",
  "animation-name",
  "animation-duration",
  "animation-delay",
  "animation-timing-function",
  "animation-iteration-count",
];

async function ensureDirs() {
  await fs.mkdir(path.join(OUT_ROOT, "screenshots"), { recursive: true });
  await fs.mkdir(path.join(OUT_ROOT, "reports"), { recursive: true });
  await fs.mkdir(path.join(OUT_ROOT, "data"), { recursive: true });
}

function safeName(value) {
  return String(value || "item")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const step = Math.max(450, window.innerHeight * 0.7);
      const timer = setInterval(() => {
        y += step;
        window.scrollTo(0, y);
        if (y >= document.body.scrollHeight - window.innerHeight - 10) {
          clearInterval(timer);
          setTimeout(resolve, 600);
        }
      }, 120);
    });
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
}

async function extractForViewport(page, viewportName) {
  return await page.evaluate(({ cssProps, viewportName }) => {
    function rectOf(el) {
      const r = el.getBoundingClientRect();
      return {
        x: Math.round(r.x),
        y: Math.round(r.y + window.scrollY),
        viewportY: Math.round(r.y),
        width: Math.round(r.width),
        height: Math.round(r.height),
        top: Math.round(r.top + window.scrollY),
        left: Math.round(r.left),
        right: Math.round(r.right),
        bottom: Math.round(r.bottom + window.scrollY),
      };
    }

    function styleOf(el) {
      const cs = getComputedStyle(el);
      const out = {};
      for (const prop of cssProps) out[prop] = cs.getPropertyValue(prop);
      return out;
    }

    function textOf(el) {
      return (el.innerText || el.textContent || "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 220);
    }

    function selectorOf(el) {
      if (el.id) return `#${el.id}`;
      const tag = el.tagName.toLowerCase();
      const cls = Array.from(el.classList || []).slice(0, 4).join(".");
      return cls ? `${tag}.${cls}` : tag;
    }

    function serialize(el, index, kind) {
      return {
        index,
        kind,
        tag: el.tagName.toLowerCase(),
        selector: selectorOf(el),
        id: el.id || null,
        className: typeof el.className === "string" ? el.className : "",
        textSample: textOf(el),
        rect: rectOf(el),
        styles: styleOf(el),
        childCount: el.children?.length || 0,
      };
    }

    const all = Array.from(document.querySelectorAll("*"));
    const visible = all.filter((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return (
        r.width > 0 &&
        r.height > 0 &&
        cs.display !== "none" &&
        cs.visibility !== "hidden" &&
        Number(cs.opacity || 1) !== 0
      );
    });

    const sectionCandidates = Array.from(
      document.querySelectorAll(
        [
          "header",
          "nav",
          "main",
          "main > *",
          "section",
          "footer",
          "[data-analytics-section-engagement]",
          "[data-unit-id]",
          "[class*='section']",
          "[class*='hero']",
          "[class*='gallery']",
          "[class*='router']",
          "[class*='compare']",
          "[class*='grid']",
          "[class*='tile']",
        ].join(",")
      )
    )
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width >= window.innerWidth * 0.45 && r.height >= 70;
      })
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
      .slice(0, 80);

    const headings = Array.from(document.querySelectorAll("h1,h2,h3"))
      .filter((el) => el.getBoundingClientRect().height > 0)
      .map((el, i) => serialize(el, i, "heading"));

    const sections = sectionCandidates.map((el, i) => serialize(el, i, "section"));

    const sticky = visible
      .filter((el) => {
        const cs = getComputedStyle(el);
        return cs.position === "sticky" || cs.position === "fixed";
      })
      .slice(0, 80)
      .map((el, i) => serialize(el, i, "sticky"));

    const sliders = visible
      .filter((el) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const hasOverflow = el.scrollWidth > el.clientWidth + 30;
        const snap = cs.getPropertyValue("scroll-snap-type") !== "none";
        const overflowX = cs.overflowX === "auto" || cs.overflowX === "scroll";
        const horizontalFlex = cs.display.includes("flex") && cs.flexDirection === "row";
        const horizontalGrid =
          cs.display.includes("grid") &&
          (cs.gridAutoFlow.includes("column") || cs.gridAutoColumns !== "auto");
        return r.width > 200 && r.height > 80 && hasOverflow && (snap || overflowX || horizontalFlex || horizontalGrid);
      })
      .slice(0, 40)
      .map((el, i) => {
        const base = serialize(el, i, "slider");
        const children = Array.from(el.children || []).slice(0, 10).map((child, childIndex) => ({
          childIndex,
          tag: child.tagName.toLowerCase(),
          selector: selectorOf(child),
          rect: rectOf(child),
          styles: {
            display: getComputedStyle(child).display,
            width: getComputedStyle(child).width,
            height: getComputedStyle(child).height,
            minWidth: getComputedStyle(child).minWidth,
            borderRadius: getComputedStyle(child).borderRadius,
            scrollSnapAlign: getComputedStyle(child).scrollSnapAlign,
          },
          textSample: textOf(child),
        }));
        return {
          ...base,
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          clientHeight: el.clientHeight,
          children,
        };
      });

    const animated = visible
      .filter((el) => {
        const cs = getComputedStyle(el);
        return (
          cs.transitionDuration !== "0s" ||
          cs.animationName !== "none" ||
          cs.animationDuration !== "0s" ||
          cs.transform !== "none"
        );
      })
      .slice(0, 160)
      .map((el, i) => serialize(el, i, "animation"));

    const cards = visible
      .filter((el) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const cn = typeof el.className === "string" ? el.className.toLowerCase() : "";
        return (
          r.width >= 180 &&
          r.height >= 120 &&
          (cn.includes("card") ||
            cn.includes("tile") ||
            cn.includes("item") ||
            cs.borderRadius !== "0px" ||
            cs.boxShadow !== "none")
        );
      })
      .slice(0, 180)
      .map((el, i) => serialize(el, i, "card"));

    return {
      viewportName,
      url: location.href,
      title: document.title,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
      },
      document: {
        scrollHeight: document.body.scrollHeight,
        scrollWidth: document.body.scrollWidth,
      },
      sections,
      headings,
      sticky,
      sliders,
      animated,
      cards,
    };
  }, { cssProps, viewportName });
}

function mdTable(rows, columns) {
  const header = `| ${columns.join(" | ")} |`;
  const sep = `| ${columns.map(() => "---").join(" | ")} |`;
  const body = rows
    .map((row) => `| ${columns.map((c) => String(row[c] ?? "").replace(/\n/g, " ").replace(/\|/g, "\\|")).join(" | ")} |`)
    .join("\n");
  return [header, sep, body].join("\n");
}

function sectionMapMarkdown(allData) {
  const desktop = allData.find((d) => d.viewportName === "desktop-1440") || allData[0];
  const rows = desktop.sections.slice(0, 40).map((s, i) => ({
    Orden: i + 1,
    Selector: s.selector,
    Texto: s.textSample.slice(0, 90),
    Width: s.rect.width,
    Height: s.rect.height,
    Top: s.rect.top,
    Display: s.styles.display,
    Position: s.styles.position,
  }));

  return `# Apple MacBook Air — Section Map

Fuente analizada: ${TARGET_URL}

${mdTable(rows, ["Orden", "Selector", "Texto", "Width", "Height", "Top", "Display", "Position"])}
`;
}

function measurementsMarkdown(allData) {
  let out = `# Measurements by Viewport\n\n`;

  for (const data of allData) {
    out += `## ${data.viewportName}\n\n`;
    out += `Viewport: ${data.viewport.width}x${data.viewport.height}\n\n`;
    out += `Document height: ${data.document.scrollHeight}px\n\n`;

    const headings = data.headings.slice(0, 30).map((h, i) => ({
      "#": i + 1,
      Tag: h.tag,
      Text: h.textSample.slice(0, 70),
      Size: h.styles["font-size"],
      Weight: h.styles["font-weight"],
      Line: h.styles["line-height"],
      Letter: h.styles["letter-spacing"],
      Width: h.rect.width,
      Height: h.rect.height,
    }));

    out += `### Headings\n\n`;
    out += mdTable(headings, ["#", "Tag", "Text", "Size", "Weight", "Line", "Letter", "Width", "Height"]);
    out += `\n\n`;

    const sections = data.sections.slice(0, 32).map((s, i) => ({
      "#": i + 1,
      Selector: s.selector,
      Width: s.rect.width,
      Height: s.rect.height,
      Padding: s.styles.padding,
      Margin: s.styles.margin,
      Bg: s.styles["background-color"],
      Radius: s.styles["border-radius"],
      Display: s.styles.display,
    }));

    out += `### Sections\n\n`;
    out += mdTable(sections, ["#", "Selector", "Width", "Height", "Padding", "Margin", "Bg", "Radius", "Display"]);
    out += `\n\n`;
  }

  return out;
}

function slidersMarkdown(allData) {
  let out = `# Sliders / Horizontal Rails\n\n`;

  for (const data of allData) {
    out += `## ${data.viewportName}\n\n`;

    if (!data.sliders.length) {
      out += `No obvious horizontal slider detected.\n\n`;
      continue;
    }

    const rows = data.sliders.map((s, i) => ({
      "#": i + 1,
      Selector: s.selector,
      Width: s.rect.width,
      Height: s.rect.height,
      ScrollWidth: s.scrollWidth,
      ClientWidth: s.clientWidth,
      OverflowX: s.styles["overflow-x"],
      Snap: s.styles["scroll-snap-type"],
      Display: s.styles.display,
      Gap: s.styles.gap || s.styles["column-gap"],
    }));

    out += mdTable(rows, ["#", "Selector", "Width", "Height", "ScrollWidth", "ClientWidth", "OverflowX", "Snap", "Display", "Gap"]);
    out += `\n\n`;

    for (const s of data.sliders.slice(0, 5)) {
      out += `### ${s.selector}\n\n`;
      const childRows = s.children.map((c) => ({
        "#": c.childIndex + 1,
        Selector: c.selector,
        Width: c.rect.width,
        Height: c.rect.height,
        Snap: c.styles.scrollSnapAlign,
        Text: c.textSample.slice(0, 60),
      }));
      out += mdTable(childRows, ["#", "Selector", "Width", "Height", "Snap", "Text"]);
      out += `\n\n`;
    }
  }

  return out;
}

function animationsMarkdown(allData) {
  let out = `# Animations / Transitions\n\n`;

  for (const data of allData) {
    out += `## ${data.viewportName}\n\n`;

    const rows = data.animated.slice(0, 80).map((a, i) => ({
      "#": i + 1,
      Selector: a.selector,
      Text: a.textSample.slice(0, 50),
      Transition: a.styles["transition-property"],
      Duration: a.styles["transition-duration"],
      Delay: a.styles["transition-delay"],
      Timing: a.styles["transition-timing-function"],
      Animation: a.styles["animation-name"],
      AnimDur: a.styles["animation-duration"],
      Transform: a.styles.transform.slice(0, 50),
      Opacity: a.styles.opacity,
    }));

    out += rows.length
      ? mdTable(rows, ["#", "Selector", "Text", "Transition", "Duration", "Delay", "Timing", "Animation", "AnimDur", "Transform", "Opacity"])
      : "No animation/transition styles detected.\n";

    out += `\n\n`;
  }

  return out;
}

function stickyMarkdown(allData) {
  let out = `# Sticky / Fixed Navigation\n\n`;

  for (const data of allData) {
    out += `## ${data.viewportName}\n\n`;

    const rows = data.sticky.map((s, i) => ({
      "#": i + 1,
      Selector: s.selector,
      Text: s.textSample.slice(0, 60),
      Position: s.styles.position,
      Top: s.styles.top,
      Height: s.rect.height,
      Width: s.rect.width,
      Z: s.styles["z-index"],
      Backdrop: s.styles["backdrop-filter"],
      Bg: s.styles["background-color"],
    }));

    out += rows.length
      ? mdTable(rows, ["#", "Selector", "Text", "Position", "Top", "Height", "Width", "Z", "Backdrop", "Bg"])
      : "No sticky/fixed elements detected.\n";

    out += `\n\n`;
  }

  return out;
}

function worldcupSpecMarkdown() {
  return `# Mundial entre Amigos — Framework Spec inspirado en arquitectura editorial premium

Este documento NO copia Apple. Traduce la arquitectura medida hacia una Home propia para Mundial entre Amigos.

## Orden final de secciones

1. Global header sticky
2. Local nav sticky
3. Hero editorial
4. Highlights slider
5. Slider de 10 jugadores
6. Cómo funciona
7. Competí contra tus amigos
8. Tu Mundial partido por partido
9. Ranking preview
10. Premios / pozo como capítulo interno
11. Partidos Dorados
12. Equipos y jugadores
13. Reglas claras
14. Esto no es apuesta
15. CTA final
16. Footer legal

## Tokens visuales

- page-bg: #f5f5f7
- surface: #ffffff
- surface-soft: #f7f8fa
- text-primary: #111111
- text-secondary: #5f6368
- accent: #0b7a3b
- accent-dark: #07552a
- accent-blue: #0a66c2
- gold: #c9a227
- radius-card: 18px
- radius-large: 28px
- shadow-card: 0 8px 28px rgba(0,0,0,0.08)

## Layout base

- Global nav max-width: 1024px
- Main container: 980px
- Wide container / sliders: 1680px
- Tablet container: 692px
- Mobile width: 87.5vw
- Section padding desktop: 120px 0
- Section padding tablet: 88px 0
- Section padding mobile: 72px 0

## 1. Global Header

- height: 44px desktop / 48px mobile
- sticky top: 0
- backdrop blur
- max-width: 1024px
- links: Cómo funciona, Fixture, Ranking, Premios, Reglas
- CTA: Entrar

## 2. Local Nav

- height: 52px desktop / 48px mobile
- sticky under global header
- max-width: 980px
- title: Mundial 2026
- anchors: Highlights, Cómo funciona, Ranking, Premios
- CTA: Mi predicción

## 3. Hero Editorial

- padding-top: 90px
- padding-bottom: 80px
- centered content
- H1: clamp(44px, 6vw, 64px)
- visual stage desktop: 980px x 470px
- visual stage tablet: 692px x 420px
- visual stage mobile: 87.5vw x 360px
- main message: Competí con tus amigos partido por partido.
- no cash-first message.

## 4. Highlights Slider

- horizontal rail
- scroll snap
- card desktop: 300px x 420px
- card mobile: 220px x 360px
- gap: 30px
- slides:
  1. Predecí todos los partidos
  2. Competí contra tus amigos
  3. Ranking en vivo
  4. Partidos Dorados
  5. Equipos y jugadores
  6. Premios por capítulos
  7. Tu cuenta con progreso

## 5. Slider de 10 jugadores

- horizontal rail
- desktop card: 300px x 440px
- mobile card: 240px x 380px
- badge: En revisión si status !== confirmed
- no decir plantel oficial.

## 6. Cómo funciona

- bento grid 2 columnas desktop
- 1 columna mobile
- card min-height: 300px
- cards:
  1. Creá tu predicción
  2. Pronosticá partido por partido
  3. Sumá puntos por aciertos
  4. Competí en el ranking

## 7. Competí contra tus amigos

- chapter opener
- leaderboard visual
- desktop visual: 980px x 560px
- empty state: El ranking aparece cuando empiecen los partidos.

## 8. Tu Mundial partido por partido

- fixture preview
- predictions columns: home_goals / away_goals
- no usar home_score / away_score
- desktop card height: 88px
- mobile vertical cards
- fallback: Fixture en actualización.

## 9. Ranking Preview

- 3 metrics arriba
- table compact abajo
- mobile metrics horizontal rail

## 10. Premios / Pozo

- capítulo interno, nunca arriba
- no cash-first hero
- packs:
  - Pack Apple
  - Pack Gamer Mundial
  - Pack Living Mundial
  - Pack Creador
  - Pack Libre Tech
- image_url null -> placeholder premium.

## 11. Partidos Dorados

- bonus section
- premium sport style
- no casino visual.

## 12. Equipos y jugadores

- team grid: 4 columns desktop, 3 tablet, 2 mobile
- player rail horizontal
- placeholders if missing assets
- players pending -> En revisión.

## 13. Reglas claras

- bento grid
- resultado exacto: 5 puntos
- ganador/empate correcto: 3 puntos
- diferencia gol correcta: 2 puntos
- goles exactos equipo: 1 punto
- bonus configurables.

## 14. Esto no es apuesta

- legal trust chapter
- no odds
- no casino
- no sportsbook
- social prediction game.

## 15. CTA final

- centered
- H2: 72px desktop / 44px mobile
- text: Armá tu predicción y competí con tus amigos.
- CTA: Crear mi predicción

## 16. Footer legal

- multi-column desktop
- accordion mobile
- links: Reglas, Términos, Privacidad, Contacto, Soporte
`;
}

async function screenshotSections(page, data, viewportName) {
  const sections = data.sections.slice(0, 18);
  const pageSize = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
  }));

  for (const section of sections) {
    const r = section.rect;
    const width = Math.max(1, Math.min(r.width, pageSize.width - Math.max(0, r.left)));
    const height = Math.max(1, Math.min(r.height, 1800, pageSize.height - Math.max(0, r.top)));

    if (width < 50 || height < 50) continue;

    const clip = {
      x: Math.max(0, r.left),
      y: Math.max(0, r.top),
      width,
      height,
    };

    try {
      const file = path.join(
        OUT_ROOT,
        "screenshots",
        `${viewportName}-section-${String(section.index + 1).padStart(2, "0")}-${safeName(section.selector)}.png`
      );
      await page.screenshot({ path: file, clip, animations: "disabled" });
    } catch {
      // Algunas secciones tienen clip inválido por lazy rendering. Las saltamos.
    }
  }
}

async function main() {
  await ensureDirs();

  const browser = await chromium.launch({ headless: true });
  const allData = [];

  for (const viewport of viewports) {
    const page = await browser.newPage({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
    });

    console.log(`Opening ${TARGET_URL} at ${viewport.name}...`);
    await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2500);
    await autoScroll(page);

    const fullPath = path.join(OUT_ROOT, "screenshots", `${viewport.name}-fullpage.png`);
    await page.screenshot({ path: fullPath, fullPage: true, animations: "disabled" });

    const data = await extractForViewport(page, viewport.name);
    allData.push(data);

    await screenshotSections(page, data, viewport.name);
    await page.close();
  }

  await browser.close();

  await fs.writeFile(
    path.join(OUT_ROOT, "data", "raw-measurements.json"),
    JSON.stringify(allData, null, 2),
    "utf8"
  );

  await fs.writeFile(path.join(OUT_ROOT, "reports", "section-map.md"), sectionMapMarkdown(allData), "utf8");
  await fs.writeFile(path.join(OUT_ROOT, "reports", "measurements.md"), measurementsMarkdown(allData), "utf8");
  await fs.writeFile(path.join(OUT_ROOT, "reports", "sliders.md"), slidersMarkdown(allData), "utf8");
  await fs.writeFile(path.join(OUT_ROOT, "reports", "animations.md"), animationsMarkdown(allData), "utf8");
  await fs.writeFile(path.join(OUT_ROOT, "reports", "sticky-nav.md"), stickyMarkdown(allData), "utf8");
  await fs.writeFile(path.join(OUT_ROOT, "reports", "worldcup-framework-spec.md"), worldcupSpecMarkdown(), "utf8");

  console.log("");
  console.log("DONE.");
  console.log(`Screenshots: ${OUT_ROOT}/screenshots`);
  console.log(`Reports:     ${OUT_ROOT}/reports`);
  console.log(`Raw JSON:    ${OUT_ROOT}/data/raw-measurements.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
