# Auto Connex

High-fidelity mobile prototype built with React Native + Expo, deployable to web via Vercel.

## 🚀 Quick Start

```bash
npm install
npx expo start --web    # Web browser
npx expo start          # Mobile (scan QR with Expo Go app)
```

## 📁 Project Structure

```
auto_connex/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen views
│   ├── navigation/      # Navigation setup
│   ├── constants/       # Design tokens (theme.ts)
│   └── assets/          # Images, fonts, icons
├── App.tsx              # Main entry point
└── vercel.json          # Web deployment config
```

## 🎨 Workflow: Figma → Code

1. Export assets from Figma → `src/assets/`
2. Copy design tokens → `src/constants/theme.ts`
3. Build components → `src/components/`
4. Create screens → `src/screens/`
5. Deploy → `npm run deploy`

## 🌐 Deploy to Vercel

```bash
npm run build:web
vercel
```

## 📖 Documentation

See `.github/copilot-instructions.md` for detailed development guidelines.

---

**Tech Stack**: React Native • Expo • TypeScript • NativeWind • Vercel
