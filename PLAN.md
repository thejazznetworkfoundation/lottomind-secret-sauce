# LottoMind AI — Lottery Intelligence App

## Overview
A premium, dark-and-gold lottery assistant app that combines AI-powered chat, smart number generation, frequency heatmaps, and draw history — supporting both **Powerball** and **Mega Millions**.

**Design Inspiration:** Luxury casino aesthetic — deep black backgrounds, rich gold accents, subtle shimmer effects. Think high-end poker app meets Bloomberg terminal meets a modern fintech dashboard.

---

## Features

- **AI Chat** — Ask the AI for lottery number strategies using natural language (e.g. "Give me hot numbers for Powerball"). Real AI responses powered by the built-in toolkit.
- **Smart Number Generator** — Generate numbers using hot/cold/balanced strategies with animated lottery ball reveals.
- **Frequency Heatmap** — Visual grid showing how often each number has appeared, with gold-to-dark intensity coloring for both Powerball and Mega Millions.
- **Draw History** — Browse past generated number sets with timestamps and which strategy was used.
- **Game Switcher** — Toggle between Powerball and Mega Millions anywhere in the app.
- **Donation CTA** — A support button on the generator screen that opens The Jazz Network Foundation donation page.
- **Live Lottery API Integration** — Pull recent official draw data for Powerball and Mega Millions from public live endpoints.
- **Advanced Prediction Model** — Blend frequency, recency, momentum, and pair-trend scoring into generated picks with confidence indicators.
- **AI Dream Interpreter** — Describe a dream, AI extracts symbols and emotions, maps them to lottery numbers using a dream symbol database with math transformations. Shows insight, symbol mapping, lucky numbers, and extended number pool.
- **Trivia Rewards System** — Answer lottery-themed trivia questions to earn Lotto Credits. Three difficulty levels (Easy/Medium/Hard), daily & weekly streak bonuses, credits & unlock menu with premium features, and credit top-up packs.

---

## Design

- **Theme:** Deep black (#0A0A0A) base with warm gold (#D4AF37) as the primary accent. Secondary accents in amber and champagne tones.
- **Cards:** Dark charcoal cards with subtle gold borders and soft inner glow effects.
- **Lottery Balls:** Circular gold-gradient balls with slight shadow, animated entrance when numbers are generated.
- **Heatmap:** Grid of numbered cells where intensity maps from dark (cold) to bright gold (hot).
- **Typography:** Clean sans-serif, bold gold headings, light gray body text.
- **Micro-interactions:** Button press scale animations, ball bounce-in animations, haptic feedback on number generation.

---

## Screens

1. **Home / Generator Tab** — Game selector (Powerball / Mega Millions), strategy picker (Hot, Cold, Balanced), big "Generate" button, animated number balls display, live draw status, prediction confidence, quick stats summary, and a donation support card for The Jazz Network Foundation.
2. **Heatmap Tab** — Full number grid (1–69 for Powerball, 1–70 for Mega Millions) with live model intensity coloring. Tap a cell to see score, recency, momentum, and frequency details.
3. **Dreams Tab** — Dream Oracle screen where users type a dream description. AI interprets symbols, emotions, and intensity, then maps them to lottery numbers via a 70+ symbol database. Shows dream insight card, symbol-to-number mapping, animated lucky number balls, and an extended combo pool.
4. **AI Chat Tab** — Chat interface to ask for strategies and number advice. Gold-accented message bubbles on dark background. AI responds with strategy insights, explains the model, and can generate numbers directly.
5. **History Tab** — Scrollable list of past generations showing the numbers, game type, strategy used, confidence, model source, and reasons.

---

## Implementation Status
- [x] Donation CTA wired to The Jazz Network Foundation
- [x] Premium dark-and-gold tab UI across generator, heatmap, chat, and history
- [x] Live lottery draw fetching for Powerball and Mega Millions
- [x] Advanced weighted prediction model using recent draw trends
- [x] Prediction confidence and reasoning surfaced in generator, chat, and history
- [x] Live heatmap driven by computed model scores
- [x] AI Dream Interpreter with symbol-to-number mapping and GPT-powered dream analysis
- [x] Trivia Rewards system with play screen, rewards hub, streak tracking, credits & unlock menu

---

## App Icon
- [x] A dark background with a glowing gold lottery ball featuring a brain/circuit pattern — representing AI-powered lottery intelligence.
