
# WPL Fantasy League UI Documentation

## Project Overview

This project is the user interface for the WPL Fantasy League application. It is a single-page application built with React and Vite.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your_username_/WPL-Fantasy-League.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```

### Running the application

```sh
npm run dev
```

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Runs the app in the development mode.
- `npm run build`: Builds the app for production to the `dist` folder.
- `npm run lint`: Lints the code using ESLint.
- `npm run preview`: Serves the production build locally.

## Dependencies

| Dependency                  | Version    | Description                                      |
| --------------------------- | ---------- | ------------------------------------------------ |
| @tanstack/react-query       | ^5.90.5    | Data fetching and caching library for React.     |
| @tanstack/react-query-devtools | ^5.90.2    | Devtools for @tanstack/react-query.            |
| @tanstack/react-router      | ^1.133.28  | Routing library for React.                       |
| @tanstack/react-router-devtools | ^1.133.28  | Devtools for @tanstack/react-router.           |
| axios                       | ^1.12.2    | Promise based HTTP client for the browser and node.js. |
| react                       | ^19.1.1    | A JavaScript library for building user interfaces. |
| react-dom                   | ^19.1.1    | Entry point to the DOM and server renderers for React. |
| zustand                     | ^5.0.8     | Small, fast and scalable bearbones state-management for React. |

## Dev Dependencies

| Dependency                  | Version      | Description                                      |
| --------------------------- | ------------ | ------------------------------------------------ |
| @eslint/js                  | ^9.36.0      | Core ESLint rules.                               |
| @tailwindcss/vite           | ^4.1.16      | Vite plugin for Tailwind CSS.                    |
| @tanstack/router-plugin     | ^1.133.29    | TanStack Router plugin for Vite.                 |
| @types/react                | ^19.1.16     | TypeScript definitions for React.                |
| @types/react-dom            | ^19.1.9      | TypeScript definitions for React DOM.            |
| @vitejs/plugin-react        | ^5.0.4       | Vite plugin for React.                           |
| autoprefixer                | ^10.4.21     | PostCSS plugin to parse CSS and add vendor prefixes. |
| eslint                      | ^9.36.0      | Pluggable linting utility for JavaScript and JSX. |
| eslint-plugin-react-hooks   | ^5.2.0       | ESLint rules for React Hooks.                    |
| eslint-plugin-react-refresh | ^0.4.22      | ESLint plugin for React Refresh.                 |
| globals                     | ^16.4.0      | Global identifiers for ESLint.                   |
| postcss                     | ^8.5.6       | Tool for transforming styles with JS plugins.    |
| tailwindcss                 | ^4.1.16      | A utility-first CSS framework.                   |
| vite                        | npm:rolldown-vite@7.1.14 | Next Generation Frontend Tooling.      |
| vite-plugin-pwa             | ^1.1.0       | Vite plugin for Progressive Web Apps.            |

## Configuration

### Vite Configuration (`vite.config.js`)

The Vite configuration file sets up the development server and build process. Key features include:

- **React Plugin**: Enables React support.
- **Tailwind CSS**: Integrates Tailwind CSS.
- **TanStack Router**: Integrates TanStack Router.
- **PWA Plugin**: Configures the application as a Progressive Web App.

### ESLint Configuration (`eslint.config.js`)

The ESLint configuration file sets up the code linting rules. Key features include:

- **Recommended Rules**: Uses recommended rules from ESLint and React Hooks.
- **React Refresh**: Enables React Refresh.
- **Globals**: Defines global variables.

## Project Structure

The project structure is organized as follows:

```
src/
├── api/              # API client and endpoints
├── assets/           # Static assets like images and SVGs
├── components/       # Reusable UI components
├── features/         # Feature-specific logic, hooks, and API calls
├── libs/             # Helper functions and libraries
├── pages/            # Top-level page components
├── routes/           # Route definitions for the application
├── store/            # State management using Zustand
├── index.css         # Global CSS styles
├── main.tsx          # Main entry point of the application
├── routeTree.gen.ts  # Auto-generated route tree by TanStack Router
└── sw.ts             # Service worker for PWA functionality
```

### `main.tsx`

This is the main entry point of the application. It sets up the React Query client, the TanStack Router, and renders the root component.

### `index.css`

This file contains global CSS styles for the application, including font imports, Tailwind CSS configuration, and custom styles.

## Components

The `src/components` directory contains reusable UI components used throughout the application.

### Main Components

- **`BottomNavbar.tsx`**: The main navigation bar at the bottom of the screen.
- **`Delta.tsx`**: A component to show the change in a user's rank (up, down, or neutral).
- **`GWNavigation.tsx`**: Navigation for switching between gameweeks.
- **`GWPitch.tsx`**: The pitch view of a user's team for a specific gameweek.
- **`GWPlayerList.tsx`**: The list view of a user's team for a specific gameweek.
- **`GWStatsCards.tsx`**: Cards displaying gameweek statistics.
- **`GWTabSwitcher.tsx`**: A switcher to toggle between the pitch and list view.
- **`Header.tsx`**: The main header of the application.
- **`ListPlayerItem.tsx`**: A list item representing a player.
- **`ManagerPointsCard.tsx`**: A card displaying a manager's points.
- **`ManagerStatsCard.tsx`**: A card displaying a manager's statistics.
- **`PitchBanner.tsx`**: A banner displayed on the pitch view.
- **`PitchPlayerCard.tsx`**: A card representing a player on the pitch.
- **`PlayerStatsOverlay.tsx`**: An overlay displaying a player's statistics.
- **`ScrollableTable.tsx`**: A scrollable table component.
- **`SplashScreen.tsx`**: The splash screen displayed when the application is loading.
- **`StatRow.tsx`**: A row in a statistics table.

### Common Components

The `src/components/common` directory contains common, reusable components.

- **`Button.tsx`**: A general-purpose button component.
- **`Checkbox.tsx`**: A checkbox component.

### Icons

The `src/components/icons` directory contains SVG icons used throughout the application.

- `AngleDown.tsx`
- `AngleLeft.tsx`
- `AngleRight.tsx`
- `AngleUp.tsx`
- `ArrowRight.tsx`
- `Dollar.tsx`
- `Graph.tsx`
- `Group.tsx`
- `Home.tsx`
- `Info.tsx`
- `Neutral.tsx`
- `Notification.tsx`
- `User.tsx`
- `UserSettings.tsx`

### Skeletons

The `src/components/skeletons` directory contains skeleton components used for loading states.

- `GWNavigationSkeleton.tsx`
- `GWPitchSkeleton.tsx`
- `GWStatsCardsSkeleton.tsx`
- `PitchPlayerCardSkeleton.tsx`
- `PlayerStatsOverlaySkeleton.tsx`
- `ScrollableTableSkeleton.tsx`

## Pages

The `src/pages` directory contains the top-level pages of the application.

- **`LoginPage.tsx`**: The login page for users to authenticate.

### Manager

- **`ManagerPage.tsx`**: The main dashboard for a manager, displaying their stats and points.
- **`PickTeamPage.tsx`**: The page where a manager can pick their team for the upcoming gameweek.

### Standings

- **`StandingsPage.tsx`**: Displays the overall league standings.
- **`TeamDetailsPage.tsx`**: Shows the detailed view of a specific team, including their gameweek performance.

## Routes

The `src/routes` directory defines the routing structure of the application using TanStack Router.

- **`__root.tsx`**: The root layout of the application. It includes the main header and the outlet for rendering child routes.
- **`404.tsx`**: The component to display when a route is not found.
- **`index.tsx`**: The initial route of the application, which displays the splash screen.
- **`login.tsx`**: The route for the login page.
- **`ProtectedRoute.tsx`**: A higher-order component that protects routes from unauthenticated access.

### Manager Routes

- **`manager/index.tsx`**: The route for the manager dashboard page.
- **`manager/pick-team/index.tsx`**: The route for the pick team page.

### Standings Routes

- **`standings/index.tsx`**: The route for the standings page.
- **`standings/$teamName.tsx`**: A dynamic route that displays the details of a specific team.

## State Management

The application uses Zustand for global state management. The state is organized into a single store, `useUserStore`.

### `useUserStore.tsx`

This store manages the user's authentication state.

- **`user`**: An object containing the user's team name.
- **`setUser`**: A function to set the user in the state.
- **`removeUser`**: A function to remove the user from the state.

## API

The `src/api` directory contains the API client and endpoint definitions.

### `client.ts`

This file configures the Axios client for making API requests. It includes:

- A base URL for the API.
- A request interceptor to attach the authentication token to requests.
- A response interceptor to handle errors, including 401 unauthorized errors.

### `endpoints.ts`

This file defines the API endpoints and query keys for TanStack Query.

- **`API_ENDPOINTS`**: An object containing all the API endpoints for authentication, standings, and players.
- **`QUERY_KEYS`**: An object containing the query keys used for caching data with TanStack Query.

## Features

The `src/features` directory contains the application's core features, organized by domain.

### Auth

The `src/features/auth` directory contains the logic for user authentication.

- **`api.ts`**: Contains the API calls for logging in and validating the user's token.
- **`hooks.ts`**: Contains the TanStack Query hooks for interacting with the auth API.
- **`queries.ts`**: Contains the query and mutation definitions for authentication.
- **`types.ts`**: Contains the TypeScript types for the authentication feature.

### Players

The `src/features/players` directory contains the logic for fetching and managing player data.

- **`api.ts`**: Contains the API calls for getting all players and a specific player by name.
- **`hooks.ts`**: Contains the TanStack Query hooks for interacting with the players API.
- **`queries.ts`**: Contains the query definitions for players.
- **`types.ts`**: Contains the TypeScript types for the players feature.

### Standings

The `src/features/standings` directory contains the logic for fetching and managing standings data.

- **`api.ts`**: Contains the API calls for getting all standings and the details of a specific team.
- **`hooks.ts`**: Contains the TanStack Query hooks for interacting with the standings API.
- **`queries.ts`**: Contains the query definitions for standings.
- **`types.ts`**: Contains the TypeScript types for the standings feature.

## Libs

The `src/libs` directory contains helper functions and other library code.

### `helpers/pickMyTeam.ts`

This file contains helper functions for managing a user's team.

- **`handlePlayerSwap`**: This function takes the team data, a player's name, and the player's location (starting or bench) and returns a list of available players to swap with.
- **`executeSwap`**: This function takes the team data and the names of two players to swap and returns the updated team data.
