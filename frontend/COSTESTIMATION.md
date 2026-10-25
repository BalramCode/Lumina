# Lumina - Production Application Cost Estimation (Lean MVP Approach)

This document provides a revised, budget-optimized estimate to transition the Lumina frontend prototype into a production-ready MVP (Minimum Viable Product) for **under ₹5 Lakhs**.

To achieve this strict budget constraint, the architecture has been drastically simplified. We shift away from custom backend development and native mobile apps toward a **Backend-as-a-Service (BaaS)** architecture and a **Progressive Web App (PWA)**.

## 1. Overall Cost Breakdown by Category

The following table outlines the estimated one-time setup and development costs, alongside the lean recurring monthly and annual operational expenses.

| Category | Requirement | One-Time Cost | Monthly Cost | Annual Cost |
| -------- | ----------- | ------------: | -----------: | ----------: |
| **Software Development** | BaaS (Supabase/Firebase) integration, PWA conversion (1 Freelance Dev) | ₹2,00,000 - ₹3,00,000 | ₹0 | ₹0 |
| **Mobile Application** | Progressive Web App (PWA) configuration (No App Store deployment) | ₹0 | ₹0 | ₹0 |
| **Cloud & Infrastructure** | Vercel (Frontend), Supabase/Firebase (Backend/DB) Pro Tiers | ₹0 | ₹2,000 - ₹4,000 | ₹24,000 - ₹48,000 |
| **Security & Privacy** | BaaS built-in Row Level Security (RLS) policies (No external VAPT audit) | ₹0 | ₹0 | ₹0 |
| **External Services** | OpenAI API (Support), free-tier Map APIs, basic email services | ₹0 | ₹2,500 - ₹5,000 | ₹30,000 - ₹60,000 |
| **Testing & Deployment** | Developer-led QA, automated Vercel serverless deployments | ₹0 | ₹0 | ₹0 |
| **Maintenance** | Freelance retainer for critical bug fixes, DB backups, and minor updates | ₹0 | ₹10,000 - ₹15,000 | ₹1,20,000 - ₹1,80,000 |
| **Hardware** | N/A | ₹0 | ₹0 | ₹0 |

## 2. Cost Breakdown by Feature

This table details how the technical work is scaled down to fit the budget while still delivering core functionality.

| Feature | Required Technical Work | Estimated Cost |
| ------- | ----------------------- | -------------: |
| **Role-Based Authentication** | Supabase/Firebase Auth integration with existing UI. Basic role flags in DB. | ₹30,000 - ₹40,000 |
| **Digital Health Passport** | Firebase/Supabase Storage implementation relying entirely on strict Row-Level Security rules instead of custom encryption layers. | ₹50,000 - ₹70,000 |
| **Professional Directory (Navigate)** | Basic geo-queries using Supabase PostGIS or client-side distance calculations with free mapping tiles. | ₹40,000 - ₹60,000 |
| **Community Hub (Connect)** | Firestore or Supabase Realtime subscriptions for chat messages instead of custom WebSocket server development. | ₹50,000 - ₹75,000 |
| **AI Assistant (Support)** | Direct OpenAI API integration via serverless edge functions. | ₹30,000 - ₹40,000 |
| **Learning Modules (Learn)** | Static content loading with a basic DB table to track user progress (No complex Admin CMS). | ₹0 - ₹15,000 |

*Note: The feature costs above make up the "Software Development" total.*

## 3. Production Cost Calculation

| Phase | Estimated Cost Range (₹ INR) |
| ----- | ---------------------------: |
| **Estimated Development & Setup Cost (One-Time)** | ₹2,00,000 - ₹3,00,000 |
| **Estimated First-Year Recurring Cost** | ₹1,74,000 - ₹2,88,000 |
| **Estimated Total First-Year Cost** | ₹3,74,000 - ₹5,88,000 |
| **Estimated Ongoing Annual Cost (After Launch)** | ₹1,74,000 - ₹2,88,000 |

## 4. Cost Assumptions

To bring the cost under ₹5 Lakhs, significant compromises to the previous enterprise-level architecture are required:

*   **Development Team:** Instead of an agency team, this relies on hiring **1 experienced Full-Stack Freelancer** for 1.5 to 2 months. 
*   **Architecture Shift (BaaS):** Custom Node.js/Python backends are discarded in favor of **Supabase or Firebase**. This removes the need to build APIs from scratch, as the database provides direct secure frontend access.
*   **Mobile Approach (PWA):** Native iOS and Android apps (React Native) are replaced by making the existing React app a **Progressive Web App (PWA)**. Users will "Add to Home Screen" from their browser, eliminating mobile development time and App Store approval hurdles.
*   **Security & Privacy:** The project relies exclusively on the default security tools provided by Firebase/Supabase (RLS). We forgo expensive third-party penetration testing (VAPT) and custom legal/DPDP compliance consulting for the MVP stage.
*   **Admin Dashboard:** A custom Admin dashboard is omitted. Admins will manage content and verify users directly through the Supabase/Firebase console UI.

## Estimated Total Cost

**Realistic Lean MVP Range for Year 1: ₹3.7 Lakhs to ₹4.8 Lakhs**

**Explanation:** 
This budget restricts the project to a Lean MVP. By sacrificing native mobile apps, custom backend servers, dedicated admin panels, and rigorous third-party security audits, we can launch the core functionality of Lumina using modern serverless and BaaS technologies. The one-time development costs sit tightly between ₹2L and ₹3L, leaving enough room for essential first-year API limits, cloud hosting, and a modest freelance retainer for maintenance—keeping the entire first-year budget firmly below the ₹5 Lakh threshold.
