# 🎨 ColorCraft — Color Palette Generator

A premium **color palette generator** with a gradient studio, WCAG contrast analyzer, color explorer, and a saved-palette workspace. Built with vanilla JS + Vite, no framework needed.

![ColorCraft Logo](public/assets/logo-128.png)

## ✨ Features

- 🎨 **Palette Generator** — Random, analogous, triadic, complementary, split-complementary, tetradic, and monochromatic harmonies
- 🔒 **Lock & Edit** — Lock favorite swatches, fine-tune individual colors with a native picker + shade ramp
- ⌨️ **Spacebar Reroll** — Press `SPACE` to instantly regenerate unlocked colors
- 🌈 **Gradient Studio** — Linear, radial, and conic gradients with multi-stop control
- 🔍 **Color Explorer** — HEX / RGB / HSL / HSV inspection with shade, tint, and tone ramps
- ♿ **WCAG Contrast Analyzer** — Real-time AA/AAA pass-fail with smart color fix suggestions
- 💾 **Saved Workspace** — Tag, search, rename, duplicate, and export saved palettes
- 📤 **Multi-format Export** — CSS variables, Tailwind config, JSON design tokens, and HEX lists
- 🌗 **Dark / Light Theme** — Animated toggle with system-preference detection
- 📱 **Fully Responsive** — Works smoothly across phones, tablets, and desktops

## 🛠️ Tech Stack

- **HTML5 + CSS3 + Vanilla JavaScript** — no framework
- **Vite** — dev server & production bundler
- **Vitest** — unit testing for the color engine
- **Lucide Icons** — self-hosted, no CDN dependency

## 📁 Project Structure

```text
colorcraft-generator/
├── public/
│   ├── assets/          # Logo & brand images
│   ├── css/             # Stylesheets (variables, components, effects…)
│   ├── js/              # App logic (generator, auth, router, colors…)
│   ├── vendor/          # Vendored third-party libs (lucide)
│   └── favicon.svg
├── tests/               # Vitest unit tests
├── index.html           # Main generator page
├── explorer.html        # Color explorer
├── gradient.html        # Gradient studio
├── contrast.html        # WCAG contrast analyzer
├── saved.html           # Saved palettes dashboard
├── guide.html           # Color theory guide
├── vite.config.ts
└── package.json
```

## 🚀 Getting Started

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd colorcraft-generator

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev

# 4. Build for production
npm run build

# 5. Preview the production build
npm run preview

# Run tests & typecheck
npm test
npm run lint
```

## 🧪 Testing

The color math engine (HEX/RGB/HSL conversions, WCAG contrast, harmony algorithms) is covered by unit tests:

```bash
npm test        # run once
npm run test:watch  # watch mode
```

## 🔐 Notes on Auth

The sign-in flow is a **local demo** — accounts are stored in your browser's `localStorage` only. No data ever leaves your device. Don't reuse a real password here.

## 📄 License

This project is open-source and available for learning and personal use.
