# Visual Check Report - FIFA World Cup 2026 Intro Hero and Aceternity Players Carousel with Real Photos

This report documents the exact DOM measurements of the built layout replica with the latest background video (no shading overlay, 56px globalNav), the horizontal Aceternity Players Carousel, and real cropped photos of Lionel Messi and Kylian Mbappé in their cards!

## DOM Measurements

### Desktop 1440 Viewport

#### Global Header & Navigation
- Expected: height = 56px, position: sticky
- Actual: 56px

#### Hero Section (section-hero)
- Expected: x = 0, y = 56, w = 1440, h = 849 (calc(100svh - 56px) = 849px at 905px window height)
- Actual: x = 0, y = 56, w = 1440, h = 1144

#### Hero Video Background
- Expected: x = 0, y = 56, w = 1440, h = 849 (absolutely positioned inside Hero, cover, filter: none, opacity: 1)
- Actual: x = 0, y = 56, w = 1440, h = 1144

#### Hero Content (section-content)
- Expected: x = 90, y = 704, w = 1260, h = 145 (positioned at bottom: 58px)
- Actual: x = 90, y = 989, w = 1260, h = 153

#### Featured Players Carousel Section (jugadores)
- Expected: x = 0, y = 905, w = 1440, h = 678 (6 premium Aceternity cards with real cropped photo cards, horizontal scroll)
- Actual: x = 0, y = 1200, w = 1440, h = 1023

#### Highlights Section (section-highlights)
- Expected: x = 0, y = 1583, w = 1440, h = 873
- Actual: x = 0, y = 2223, w = 1440, h = 891

---

### Mobile 390 Viewport

#### Global Header & Navigation
- Expected: height = 56px
- Actual: 56px

#### Hero Section
- Expected: x = 0, y = 56, w = 390, h = 788 (calc(100svh - 56px) = 788px at 844px screen height)
- Actual: x = 0, y = 56, w = 390, h = 788

#### Hero Video Background (Mobile)
- Expected: x = 0, y = 56, w = 390, h = 788
- Actual: x = 0, y = 56, w = 390, h = 788

#### Featured Players Carousel Section (Mobile)
- Expected: x = 0, y = 844, w = 390, h = 582
- Actual: x = 0, y = 844, w = 390, h = 757

---
Report compiled dynamically from local DOM on 2026-05-17.
