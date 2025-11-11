# Project: Shajra - A Lineage Tracking Application

## Project Overview

This project is a web application for storing, updating, and visualizing family lineage, specifically a "shajra" for Syed (Sadaat) families. It will be built using Nuxt 3.

*   **Purpose:** To provide a secure and user-friendly interface for authorized users to manage and explore their family tree.
*   **Technologies:**
    *   **Framework:** Nuxt 4.2.1 (Vue 3)
    *   **UI/Visualization:** The primary candidate for rendering the tree is the `family-chart` JavaScript library, which is built on D3.js and supports Vue.
    *   **Styling:** Tailwind CSS
*   **Initial Architecture:**
    *   A frontend-focused Nuxt 3 application.
    *   Initial data will be stored in a static JSON file within the project.
    *   Future development will involve creating a backend with a database (e.g., using Nuxt's server routes) to persist data and manage user authentication.






This project will follow standard Nuxt 3 conventions.

*   **Install Dependencies:**
    ```bash
    yarn install
    ```
*   **Run Development Server:**
    ```bash
    yarn dev
    ```
*   **Build for Production:**
    ```bash
    yarn build
    ```
*   **Preview Production Build:**
    ```bash
    yarn preview
    ```

## Nuxt Configuration

*   **Compatibility Date:** `2024-11-01`
*   **DevTools:** Enabled
*   **Modules:** `@nuxtjs/tailwindcss`, `@nuxt/eslint`
*   **TypeScript:** Strict mode enabled, type checking handled via `yarn typecheck` command.



## Development Conventions

*   **Directory Structure:** We will adhere to the standard Nuxt 3 directory structure (`pages/`, `components/`, `server/api/`, `assets/`).
*   **Components:** Reusable Vue components will be placed in the `components/` directory. A key component will be `ShajraChart.vue`, which will encapsulate the `family-chart` library.
*   **Data Management:**
    *   **Initial Data:** A placeholder `shajra-data.json` file will be created in the `server/api/` directory to hold the lineage data for initial development.
    *   **API Routes:** Nuxt server routes will be used to serve the data to the frontend, creating a clear separation between the data and presentation layers.
*   **State Management:** For managing global state (like the currently logged-in user or the family tree data), we will use Pinia, the official state management library for Vue.
*   **Coding Style:** We will use Prettier and ESLint to maintain a consistent code style, which can be set up during the Nuxt 3 project initialization.
