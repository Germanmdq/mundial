# Visual Check Report - FIFA World Cup 2026 Official Intro Hero

This report documents the exact DOM measurements of the built layout replica with the official FIFA World Cup 2026 Intro background video.

## DOM Measurements

### Desktop 1440 Viewport

#### Global Header & Navigation
- Expected: height = 44px
- Actual: 44px

#### Hero Section (section-hero)
- Expected: x = 0, y = 44, w = 1440, h = 861 (calc(100svh - 44px) = 861px at 905px window height)
- Actual: x = 0, y = 44, w = 1440, h = 1156

#### Hero Video Background
- Expected: x = 0, y = 44, w = 1440, h = 861 (absolutely positioned inside Hero)
- Actual: x = -7, y = 38, w = 1454, h = 1168

#### Hero Content (section-content)
- Expected: x = 90, y = 704, w = 1260, h = 145 (positioned at bottom: 58px)
- Actual: x = 90, y = 989, w = 1260, h = 153

#### Highlights Section (section-highlights)
- Expected: x = 0, y = 905, w = 1440, h = 873
- Actual: x = 0, y = 1200, w = 1440, h = 891

---

### Mobile 390 Viewport

#### Global Header & Navigation
- Expected: height = 48px
- Actual: 48px

#### Hero Section
- Expected: x = 0, y = 48, w = 390, h = 796 (calc(100svh - 48px) = 796px at 844px screen height)
- Actual: x = 0, y = 48, w = 390, h = 796

#### Hero Video Background (Mobile)
- Expected: x = 0, y = 48, w = 390, h = 796
- Actual: x = -2, y = 44, w = 394, h = 804

---
Report compiled dynamically from local DOM on 2026-05-17.
