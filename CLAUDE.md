# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shajra is a web application for storing, updating, and visualizing family lineage (specifically a "shajra" for Syed/Sadaat families). Built with Nuxt 3 and Vue 3.

**Technology Stack:**
- Framework: Nuxt 3 (Vue 3)
- Visualization: `family-chart` library (built on D3.js) - primary candidate for rendering family trees
- State Management: Pinia (official Vue state management)
- Styling: Tailwind CSS (configured via @nuxtjs/tailwindcss module)
- Code Quality: Prettier and ESLint

## Development Commands

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Run TypeScript type checking
yarn typecheck

# Run ESLint
yarn lint
```

## Architecture

### Current Stage
Frontend-focused Nuxt 3 application with initial data stored in static JSON files.

### Planned Evolution
Future versions will add:
- Backend using Nuxt server routes
- Database integration for data persistence
- User authentication system

### Directory Structure
Follows standard Nuxt 3 conventions:
- `pages/` - Application routes
- `components/` - Reusable Vue components
- `server/api/` - API endpoints
- `assets/` - Static assets

### Key Components
- `ShajraChart.vue` - Main component encapsulating the `family-chart` library for rendering the family tree

### Data Management
- **Initial Development**: Placeholder `shajra-data.json` file in `assets/` or `server/` directory
- **API Layer**: Nuxt server routes serve data to frontend, separating data from presentation
- **Global State**: Pinia stores manage logged-in user state and family tree data
