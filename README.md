# CircuitVerse AI Pro

Cloud-native digital logic circuit CAD studio with Gemini AI sub-circuit synthesis, real-time timing waveforms, and truth table diagnostics.

**Live App:** [https://circuitverse-ai-pro.vercel.app](https://circuitverse-ai-pro.vercel.app)

## Overview

CircuitVerse AI Pro is a full-stack electronic design automation (EDA) and digital logic simulation platform built for designing, simulating, and analyzing combinational and sequential circuits directly in the browser.

## Key Features

- **Interactive Logic Canvas & Simulation Engine:** Place logic gates, multiplexers/demultiplexers, adders, and sequential latches, wire connections, toggle inputs, and run real-time simulation states.
- **Timing Diagram & Logic Analyzer:** Inspect live HIGH/LOW signal waveforms and simulation cycles.
- **Combinational Truth Table Solver:** Validate input/output behavior and circuit logic automatically.
- **AI Copilot & Sub-Circuit Synthesis:** Generate sub-circuits, analyze signal flow, inspect truth tables, and troubleshoot circuit errors using Google Gemini AI.
- **Cloud Persistence & Themes:** Save projects, circuits, simulation runs, and user preferences to PostgreSQL with support for Light, Dark, and Cyberpunk themes.

## Tech Stack

- **Framework & UI:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Database & ORM:** PostgreSQL (Neon with connection pooling), Prisma ORM 7
- **Authentication:** NextAuth (Google OAuth)
- **AI:** Google Gemini AI (`@google/genai`)
- **Payments:** Stripe (subscription checkout & plan management)
- **Hosting:** Vercel

## Local Development

1. **Install dependencies:**
   ```bash
   npm install