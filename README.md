# Shajra - Family Lineage Chart

A web application to store, update, and visualize family lineage (shajra).

## Features

*   **Interactive Family Tree:** Visualizes family data using the `family-chart` library.
*   **Dynamic Controls:** Allows users to adjust the number of ancestor and descendant generations displayed.
*   **Dark Mode:** Supports a dark color scheme for comfortable viewing in low-light environments.
*   **Responsive Design:** The user interface is designed to work on both desktop and mobile devices.

## Tech Stack

*   **[Nuxt 3](https://nuxt.com/):** A powerful Vue.js framework for building modern web applications.
*   **[Vue 3](https://vuejs.org/):** A progressive JavaScript framework for building user interfaces.
*   **[TypeScript](https://www.typescriptlang.org/):** A typed superset of JavaScript that compiles to plain JavaScript.
*   **[Tailwind CSS](https://tailwindcss.com/):** A utility-first CSS framework for rapid UI development.
*   **[family-chart](https://www.npmjs.com/package/family-chart):** A library for creating and displaying family tree visualizations.

## Getting Started

1.  **Install dependencies:**
    ```bash
    yarn install
    ```

2.  **Start the development server:**
    ```bash
    yarn dev
    ```

    The application will be available at `http://localhost:3000`.

## Future Development (TODO)

### User Authentication & Authorization

*   **Login System:** Implement a secure user authentication system.
*   **Role-Based Access Control (RBAC):** Introduce a robust permissions system based on user roles.

#### Roles:
*   **Owner:**
    *   Only one Owner for the entire application.
    *   Has all permissions, which cannot be revoked.
    *   Can manage permissions for all other users, including Moderators, but not Administrators.
*   **Administrator:**
    *   Can be multiple Administrators.
    *   Has all application permissions, similar to the Owner.
    *   Permissions are managed by the Owner.
*   **Moderator:**
    *   Users with specific content management permissions.
    *   Permissions are customizable and managed by the Owner.
*   **User:**
    *   Registered users with baseline permissions, such as viewing the family tree and managing their own profile.
*   **Guest:**
    *   Unauthenticated users with read-only access to public sections of the application.
