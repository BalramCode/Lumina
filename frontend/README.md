# Lumina - Community Operating System

> This project is currently a frontend implementation/prototype. Backend services and persistent data integration are not yet connected.

Lumina is a community operating system designed to connect families, professionals, resources, and communities to make autism support more accessible, inclusive, and free. It transitions the experience from social discrimination to social acceptance, ensuring no parent navigates autism alone. The current implementation serves as a functional frontend prototype showcasing the UI, workflows, and user experience.

---

## Table of Contents

1. [Key Features](#key-features)
2. [Technology Stack](#technology-stack)
3. [Frontend Architecture](#frontend-architecture)
4. [Complete User Workflow](#complete-user-workflow)
5. [Page / Route Documentation](#page--route-documentation)
6. [Project Structure](#project-structure)
7. [Component Architecture](#component-architecture)
8. [State Management](#state-management)
9. [Frontend Data Flow](#frontend-data-flow)
10. [UI / UX Architecture](#ui--ux-architecture)
11. [Responsive Design](#responsive-design)
12. [Forms & Validation](#forms--validation)
13. [Authentication UI](#authentication-ui)
14. [Mock Data & Prototype Architecture](#mock-data--prototype-architecture)
15. [Backend Integration Roadmap](#backend-integration-roadmap)
16. [Environment Variables](#environment-variables)
17. [Installation](#installation)
18. [Available Scripts](#available-scripts)
19. [Deployment](#deployment)
20. [Browser Compatibility](#browser-compatibility)
21. [Performance](#performance)
22. [Accessibility](#accessibility)
23. [Testing](#testing)
24. [Known Limitations](#known-limitations)
25. [Future Improvements](#future-improvements)
26. [Feature-to-Code Mapping](#feature-to-code-mapping)
27. [Technical Architecture Summary](#technical-architecture-summary)
28. [End-to-End Frontend Diagram](#end-to-end-frontend-diagram)
29. [Quick Technical Reference](#quick-technical-reference)

---

## Key Features

### Prototype / Mock

*   **Role-Based Onboarding:** Users can simulate joining as a Parent, Professional, Educator, or Ally. (*Implemented in `Welcome.jsx` - functional via local storage*)
*   **Learn / Educational Modules:** Step-by-step mock modules covering topics like early intervention. (*Implemented in `Learn.jsx` & `Lesson.jsx`*)
*   **Navigate / Geo-Tagged Matchmaking:** Find mock professionals based on location, distance, and expertise using a simulated map. (*Implemented in `Navigate.jsx`*)
*   **Connect / Community Hub:** Browse simulated clubs and enter a mocked club chat environment. (*Implemented in `Connect.jsx` & `ClubChat.jsx`*)
*   **Support / AI & Passport:** A prototype digital health passport and a simulated AI assistance interface. (*Implemented in `Support.jsx`*)
*   **Include & Empower:** Informational pages outlining social inclusion tools and legal rights. (*Implemented in `Include.jsx` & `Empower.jsx`*)
*   **Dark / Light Mode:** Fully functional theme toggling persisting to local storage. (*Implemented in `AppContext.jsx`*)

### Planned

*   Real-time chat and community forums.
*   Actual geolocation and map SDK integration (e.g., Mapbox or Google Maps).
*   Live AI integration for personalized support.
*   Backend authentication and persistent user accounts.

---

## Technology Stack

| Category         | Technology | Purpose |
| ---------------- | ---------- | ------- |
| Frontend         | React 19   | Core UI Library |
| Language         | JavaScript | Application Logic |
| Styling          | Tailwind CSS 3.4 | Utility-first styling and theme tokens |
| UI Components    | Radix UI / Shadcn | Accessible UI primitives (Dialogs, Select, Slider) |
| Routing          | React Router 7 | Client-side routing and navigation |
| State Management | React Context | Global state (theme, language, mock auth) |
| Data Fetching    | Axios, React Query | Included in deps, prepared for future API calls |
| Forms            | React Hook Form | Included in deps for future form handling |
| Validation       | Zod | Included in deps for future schema validation |
| Icons            | Lucide React | Scalable vector icons |
| Animation        | Framer Motion | Included for advanced animations |
| Build Tool       | Craco | Extending Create React App build configuration |

---

## Frontend Architecture

The frontend is a Single Page Application (SPA) built with React. The entry point (`src/index.js`) renders the `App` component, which wraps the application in the `AppProvider` (Context API) and `BrowserRouter`. 

Unauthenticated/new users are shown the `Welcome` screen. Once they select a role and agree to terms, their state is saved to `localStorage`, and they are granted access to the main `Shell` which wraps authenticated routes in a responsive `Layout`.

```mermaid
flowchart TD
    A[User] --> B[React Entry Point (App.js)]
    B --> C[AppProvider (Context)]
    C --> D{Is Onboarded?}
    D -- No --> E[Welcome Screen (Mock Auth)]
    E --> D
    D -- Yes --> F[Layout Component]
    F --> G[React Router (Routes)]
    G --> H[Dashboard / Learn / Navigate / etc.]
    H --> I[Shadcn UI Components]
    H --> J[Mock Data (lib/mockData.js)]
```

---

## Complete User Workflow

### Onboarding Workflow
```mermaid
flowchart TD
    A[User Opens App] --> B[Welcome Page]
    B --> C[Select Role (Parent, Professional, etc.)]
    C --> D[Confirm Age & Consent]
    D --> E[Update Context & Local Storage]
    E --> F[Redirect to Dashboard]
```

### Navigation & Discovery Workflow
```mermaid
flowchart TD
    A[Dashboard] --> B[Click 'Navigate']
    B --> C[Navigate Page]
    C --> D[Adjust Filters (Type, Distance)]
    D --> E[Filter Mock Data in Memory]
    E --> F[Update Mock Map & Directory]
    F --> G[View Professional Profile]
    G --> H[Simulate 'Connect' Request]
```

---

## Page / Route Documentation

| Route | Page | Purpose | Status |
| ----- | ---- | ------- | ------ |
| `/` | `Dashboard.jsx` | Overview of modules and user progress. | Prototype |
| `/learn` | `Learn.jsx` | Browse educational resources. | Prototype |
| `/learn/:id` | `Lesson.jsx` | Detailed view of a mock learning lesson. | Prototype |
| `/navigate` | `Navigate.jsx` | Discover professionals with a simulated map. | Prototype |
| `/connect` | `Connect.jsx` | Browse community clubs. | Prototype |
| `/connect/club/:id` | `ClubChat.jsx` | Simulated chat interface. | Prototype |
| `/support` | `Support.jsx` | AI assistant and digital passport mock. | Prototype |
| `/include` | `Include.jsx` | Social inclusion resources and AAC mocks. | Prototype |
| `/empower` | `Empower.jsx` | Job portals and rights resources. | Prototype |
| `/profile` | `Profile.jsx` | User profile management. | Prototype |

---

## Project Structure

```text
frontend/
├── public/                # Static assets
├── src/
│   ├── components/
│   │   ├── ui/            # Shadcn Radix UI Primitives
│   │   ├── Layout.jsx     # Main application layout wrapper
│   │   ├── LuminaLogo.jsx # SVG Logo component
│   │   ├── shared.jsx     # Shared layout/design components
│   │   └── Welcome.jsx    # Onboarding/Mock Login screen
│   ├── context/
│   │   └── AppContext.jsx # Global state (theme, onboarded, role)
│   ├── lib/
│   │   ├── mockData.js    # Hardcoded mock data for the prototype
│   │   ├── translations.js# Basic localization strings
│   │   └── utils.js       # Utility functions (Tailwind merge, etc.)
│   ├── pages/             # Route level components (Dashboard, Learn, etc.)
│   ├── App.css            # Minimal global overrides
│   ├── App.js             # Router and App Shell
│   ├── index.css          # Tailwind directives and CSS variables
│   └── index.js           # React DOM entry point
├── craco.config.js        # Build configuration extending Webpack
├── tailwind.config.js     # Tailwind themes, colors, and plugins
└── package.json           # Dependencies and scripts
```

---

## Component Architecture

| Component | Location | Purpose |
| --------- | -------- | ------- |
| `Layout` | `src/components/Layout.jsx` | Wraps all authenticated pages with a sidebar navigation, mobile drawer, and top bar. |
| `Welcome` | `src/components/Welcome.jsx` | Handles the mock onboarding flow for new users. |
| `PageHeader` | `src/components/shared.jsx` | Standardized header block for top-level pages. |
| `PillarBanner` | `src/components/shared.jsx` | Reusable banner highlighting a core "pillar" of the app. |
| `DemoTag` | `src/components/shared.jsx` | Small badge to indicate a feature is a prototype. |
| `ui/*` | `src/components/ui/` | A suite of accessible Radix UI primitives configured with Tailwind (Buttons, Dialogs, Sliders, Cards, Avatars). |

---

## State Management

State management is kept simple for the frontend prototype, utilizing **React Context API** and **Local Storage**. 

*   `AppContext.jsx`: Manages `dark` (theme), `lang` (localization), `onboarded` (auth state), and `role` (user type).
*   **Local Storage**: Persists the above variables so the mock session survives page reloads (`lumina_theme`, `lumina_lang`, `lumina_onboarded`, `lumina_role`).
*   **Component State**: Standard React `useState` and `useMemo` are used extensively for filtering mock data (e.g., filtering professionals on the Navigate page).

---

## Frontend Data Flow

Because there is no backend, all dynamic data is imported directly from a static file.

```mermaid
flowchart LR
    A[User Interaction (e.g. Filter)] --> B[React Component (Navigate)]
    B --> C[Local State (useState/useMemo)]
    C --> D[lib/mockData.js]
    D --> E[Filter Logic in Memory]
    E --> F[Rendered UI (Cards/Map)]
```

---

## UI / UX Architecture

The design system uses a custom **Lumina Color Palette** integrated with CSS Variables and Tailwind CSS. 
*   **Colors**: Custom defined colors such as Lumina Teal (`#5E8B7E`) and Lumina Green (`#6FA287`) are used alongside standardized CSS variables for backgrounds and cards.
*   **Typography**: Uses `Atkinson Hyperlegible` and `Public Sans`.
*   **Dark Mode**: Supported natively via the `.dark` class toggled in `AppContext`, adjusting all CSS variables.
*   **Micro-interactions**: Uses Tailwind animate plugins and Framer Motion (prepared) for smooth transitions.

---

## Responsive Design

The application is fully responsive using Tailwind CSS breakpoints:
*   **Mobile (< 640px)**: Uses a hamburger menu triggering a Shadcn `Sheet` (Drawer) for navigation. Grids collapse to single columns.
*   **Tablet (640px - 1024px)**: Grid layouts utilize 2 columns.
*   **Desktop (> 1024px)**: Uses a persistent fixed left-sidebar for navigation and 3+ column layouts for data-heavy pages.

---

## Forms & Validation

Currently, forms are handled via controlled React inputs (e.g., chat inputs in `ClubChat.jsx`, filter selects in `Navigate.jsx`).

> **Frontend Validation Only:** While `react-hook-form` and `zod` are included in the package dependencies, complex validation schemas are reserved for future backend integration. Currently, there is no real data submission.

---

## Authentication UI

> Authentication is currently UI-level/prototype functionality. No real authentication service is connected.

The mock authentication is handled in `Welcome.jsx`. The user selects a role, clicks a checkbox to confirm their age, and the app updates the `onboarded` state in Context and Local Storage. This grants them access to the protected routes inside `Layout.jsx`. 

---

## Mock Data & Prototype Architecture

All prototype data is centralized in `src/lib/mockData.js`. This allows the application to feel alive without a database.

*   **Data Types**: `USER`, `PASSPORT`, `LEARNING_MODULES`, `CLUBS`, `PROFESSIONALS`, etc.
*   **Consumption**: Pages import these constants directly. For example, `Navigate.jsx` imports `PROFESSIONALS` and uses `Array.filter` to simulate backend search queries.

```mermaid
flowchart TD
    A[Mock Data (mockData.js)] --> B[Frontend Logic (useState/useMemo)]
    B --> C[Components (e.g., Navigate.jsx)]
    C --> D[Rendered UI]
```

---

## Backend Integration Roadmap

*Future work only.*

When transitioning to a full-stack application, the architecture will evolve to consume a real API.

```mermaid
flowchart LR
    A[Current Frontend] --> B[Future REST/GraphQL API Layer]
    B --> C[Future Node.js/Python Backend]
    C --> D[Future PostgreSQL/MongoDB Database]
    C --> E[Future External Services (Mapbox, Auth0)]
```
*   **Database**: Replace `mockData.js` with a live database to store users, clubs, and professional directories.
*   **Authentication**: Integrate a provider like Auth0 or Firebase to replace the local-storage onboarding flow.
*   **Real-time Services**: Integrate WebSockets for `ClubChat.jsx`.

---

## Environment Variables

Currently, the frontend prototype **does not require** any `.env` variables to run.

---

## Installation

### Prerequisites
*   Node.js (v18+)
*   Yarn (v1.22+)

### Development

Install dependencies and start the development server:

```bash
yarn install
yarn start
```
The app will run locally on `http://localhost:3000`.

### Production Build

```bash
yarn build
```
This utilizes Craco to output an optimized React build to the `build/` folder.

---

## Available Scripts

| Command | Purpose |
| ------- | ------- |
| `yarn start` | Runs the app in development mode using craco. |
| `yarn build` | Builds the app for production to the `build` folder. |
| `yarn test` | Launches the test runner (currently no tests are written). |

---

## Deployment

The project is built using Create React App / Craco, making it compatible with any static site host.
Currently, there is no specific deployment configuration file (like `vercel.json` or `netlify.toml`), but it can be easily deployed to:
*   Vercel
*   Netlify
*   GitHub Pages

---

## Browser Compatibility

Relies on modern browser features (CSS Variables, Flexbox, CSS Grid). Compatible with:
*   Chrome (latest)
*   Firefox (latest)
*   Safari (latest)
*   Edge (latest)

---

## Performance

*   **Asset Optimization**: SVG icons (Lucide) are used instead of heavy image assets where possible.
*   **Memoization**: Extensive use of `useMemo` and `useCallback` inside `AppContext` and complex data pages (`Navigate.jsx`) to prevent unnecessary re-renders when filtering mock data.

---

## Accessibility

*   **Semantic HTML**: Proper heading structures are used.
*   **Radix UI**: Shadcn components are built on top of Radix UI, which provides out-of-the-box keyboard navigation, focus management, and proper ARIA labels.
*   **Color Contrast**: The custom Lumina palette was designed considering readability.

---

## Testing

> Automated tests are not currently implemented.

While the `craco test` script is available, no unit, integration, or E2E tests have been written for the prototype phase.

---

## Known Limitations

*   **No backend integration**: All data is reset if `localStorage` is cleared (aside from hardcoded mock data).
*   **Mock data only**: Chat messages, professional directories, and educational content are static.
*   **No real authentication**: The "login" is purely superficial.
*   **Mock Maps**: The map in `Navigate.jsx` is constructed using CSS absolute positioning rather than a real Map SDK.

---

## Future Improvements

### Frontend Improvements
*   Replace Mock Maps with an interactive library like Mapbox GL JS.
*   Implement `react-hook-form` and `zod` for real input validation.
*   Add localized language dictionaries in `translations.js`.

### Backend Integration (Planned)
*   Connect Axios/React Query to a live backend.
*   Implement secure JWT-based authentication.
*   Setup WebSockets for live club chats.

---

## Feature-to-Code Mapping

| Feature | Page | Main Components | Data Source | Status |
| ------- | ---- | --------------- | ----------- | ------ |
| Onboarding | `Welcome.jsx` | `Button`, `Checkbox` | Local Storage | Prototype |
| Global Layout | `Layout.jsx` | Sidebar, Mobile Drawer | `AppContext` | Functional |
| Learning Hub | `Learn.jsx` | `Card`, `Progress` | `mockData.js` | Prototype |
| Professional Map | `Navigate.jsx` | `MockMap`, `Select` | `mockData.js` | Prototype |
| Community Chat | `ClubChat.jsx` | `ScrollArea`, `Input` | `mockData.js` | Prototype |
| Health Passport | `Support.jsx` | `Tabs`, `Badge` | `mockData.js` | Prototype |

---

## Technical Architecture Summary

```text
User
 ↓
React Router (App.js)
 ↓
Layout (Sidebar / Mobile Menu)
 ↓
Pages (Navigate, Learn, etc.)
 ↓
Shadcn Components / Shared Components
 ↓
State (React Context) / Mock Data
 ↓
Rendered Prototype UI
```

---

## End-to-End Frontend Diagram

```mermaid
flowchart TD
    A[User] --> B[Lumina Frontend Application]
    B --> C[React Router]
    
    C --> D[Authenticated Pages]
    C --> E[Welcome / Onboarding]
    
    D --> F[Reusable Components (PillarBanner, PageHeader)]
    D --> G[Shadcn UI Components (Buttons, Dialogs)]
    
    D --> H[React Context API]
    H --> I[Local Storage (Theme, Auth State)]
    
    D --> J[Mock / Static Data (lib/mockData.js)]
    J --> D
    
    D --> K[Rendered Interface]
```

---

## Quick Technical Reference

*   **Framework**: React 19
*   **Language**: JavaScript
*   **Build Tool**: Craco (Create React App wrapper)
*   **Styling**: Tailwind CSS 3.4
*   **UI Library**: Shadcn UI (Radix)
*   **Routing**: React Router DOM 7
*   **State Management**: React Context API + Local Storage
*   **Main Pages**: `Dashboard`, `Navigate`, `Connect`, `Learn`, `Support`
*   **Main Commands**: `yarn install`, `yarn start`, `yarn build`
*   **Data Source**: Static Mock Data (`src/lib/mockData.js`)
*   **Current Project Status**: Frontend Prototype (No Backend)
