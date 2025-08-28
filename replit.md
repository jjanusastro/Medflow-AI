# Overview

MedFlow AI is a comprehensive healthcare practice management system that combines traditional medical office functionality with AI-powered insights. The application serves as a digital hub for healthcare practices to manage patient records, appointments, forms, and insurance verification while leveraging artificial intelligence to provide clinical insights, automate administrative tasks, and enhance patient care workflows.

The system is designed to streamline healthcare operations by providing tools for patient intake, appointment scheduling, AI-assisted analysis of medical forms, insurance verification, and practice analytics. It emphasizes HIPAA compliance and secure handling of medical data while offering modern user experience through AI integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built as a React Single Page Application (SPA) using:
- **React 18** with TypeScript for type safety and modern development practices
- **Vite** as the build tool for fast development and optimized production builds
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query** for server state management, caching, and data synchronization
- **Tailwind CSS** with **shadcn/ui** component library for consistent, accessible UI design
- **React Hook Form** for form handling and validation

The frontend follows a modular component architecture with separate directories for pages, components (organized by dashboard/layout/ui), hooks, and utilities. The design system uses CSS custom properties for theming and supports both light and dark modes.

## Backend Architecture
The server implements a REST API using:
- **Express.js** as the web framework with TypeScript
- **Passport.js** with local strategy for session-based authentication
- **Express Session** with PostgreSQL session store for secure session management
- **Modular route structure** separating authentication, business logic, and API endpoints
- **Service layer pattern** with dedicated modules for storage, AI integration, and authentication

The backend uses middleware for request logging, error handling, and authentication checks. API routes are organized by feature (patients, appointments, forms, AI interactions) with consistent error handling and response formatting.

## Data Storage Solutions
The application uses PostgreSQL as the primary database with:
- **Drizzle ORM** for type-safe database operations and migrations
- **Neon Database** serverless PostgreSQL for cloud deployment
- **Connection pooling** via Neon's serverless driver for efficient resource usage
- **Schema-first approach** with shared TypeScript types between client and server

The database schema includes tables for users, practices, patients, appointments, forms, AI interactions, and insurance verifications. All tables use UUID primary keys and include audit timestamps.

## Authentication and Authorization
Authentication is implemented using:
- **Session-based authentication** with secure HTTP-only cookies
- **Password hashing** using Node.js crypto module with scrypt algorithm
- **Role-based access control** supporting admin, doctor, nurse, and staff roles
- **Practice-based isolation** ensuring users only access data from their assigned practice
- **CSRF protection** through session tokens and same-site cookie policies

Sessions are stored in PostgreSQL using connect-pg-simple for persistence across server restarts.

## AI Integration Architecture
The system integrates OpenAI's GPT-5 model for:
- **Patient form analysis** providing medical insights and risk assessment
- **Insurance verification assistance** automating coverage validation
- **Appointment scheduling suggestions** based on patient history and clinical needs
- **Chat-based AI assistant** for general healthcare administrative queries

AI interactions are logged and tracked for audit purposes while maintaining patient privacy. The AI service is abstracted into a separate module with defined interfaces for different AI capabilities.

# External Dependencies

## Third-Party Services
- **OpenAI API** (GPT-5) for AI-powered medical insights and chat functionality
- **SendGrid** for transactional email services (appointment confirmations, follow-ups)
- **Stripe** for payment processing and subscription management
- **Neon Database** as the managed PostgreSQL provider

## UI and Component Libraries
- **Radix UI** primitives for accessible, unstyled UI components
- **shadcn/ui** for pre-built component implementations
- **Lucide React** for consistent iconography
- **Tailwind CSS** for utility-first styling

## Development and Infrastructure
- **Replit** for development environment and deployment
- **Vite** for frontend build tooling and development server
- **Drizzle Kit** for database migrations and schema management
- **TypeScript** for type safety across the entire stack

## Form and Data Handling
- **React Hook Form** for client-side form management
- **Zod** for runtime type validation and schema definitions
- **date-fns** for date manipulation and formatting
- **clsx/class-variance-authority** for conditional CSS class management

The application maintains a clear separation between development and production configurations, with environment variables managing API keys, database connections, and service integrations.