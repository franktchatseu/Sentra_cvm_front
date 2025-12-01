# CVM Platform Study Guide: Sentra CVM Frontend

## Table of Contents

1. [Project Overview](#project-overview)
2. [Core Architecture](#core-architecture)
3. [Key Concepts & Entities](#key-concepts--entities)
4. [Campaign Creation Workflow](#campaign-creation-workflow)
5. [How This Differs from Traditional CRM/Marketing Platforms](#how-this-differs)
6. [Technology Stack](#technology-stack)
7. [Feature Areas & Their Purpose](#feature-areas--their-purpose)
8. [Data Flow Patterns](#data-flow-patterns)
9. [Why Certain Design Decisions Were Made](#why-certain-design-decisions-were-made)

---

## Project Overview

**What is Sentra CVM?**

- **CVM** = Customer Value Management
- A **unified platform** for telecom/mobile operators to design, execute, and analyze **marketing campaigns** at scale
- Manages 5+ million customers, multiple segments, thousands of campaigns running simultaneously
- Handles complex multi-channel orchestration (SMS, Email, USSD, Push, IVR, WhatsApp, In-App, Web)

**Why Build a CVM?**
Traditional CRM platforms (Salesforce, Hubspot) are generalist. CVM is specialist:

- **Scale**: Handles millions of customers, thousands of concurrent campaigns
- **Speed**: Campaign execution in minutes, not days
- **Governance**: Built-in PII/GDPR controls, data classification, audit trails
- **Segmentation**: Dynamic, predictive, behavioral segments updated in real-time
- **Multi-channel**: Native support for telecom channels (SMS, USSD, IVR) + modern ones
- **Integration**: Direct connection to customer DBs, data warehouses, and telecom infrastructure

---

## Core Architecture

### 1. Technology Stack

```
Frontend: React 18 + TypeScript + Tailwind CSS + Vite
Routing: React Router v7
Data Viz: Recharts
UI Icons: Lucide React
Internationalization: Custom i18n (English, Spanish, Swahili)
Form Handling: Headless UI (Listbox, Dialog, Transition)
Build: Vite
State Management: Context API (Auth, Toast, Notifications, Language)
```

### 2. Project Structure

```
src/
├── App.tsx                          # Root component
├── main.tsx                         # Vite entry point
├── contexts/                        # Global state (Auth, Toast, Notifications, Language)
│   ├── AuthContext.tsx
│   ├── ToastContext.tsx
│   ├── NotificationContext.tsx
│   └── LanguageContext.tsx
├── features/                        # Feature modules (self-contained domains)
│   ├── campaigns/                   # Campaign management
│   ├── segments/                    # Audience segmentation
│   ├── offers/                      # Promotional offers
│   ├── products/                    # Product catalog
│   ├── communications/              # Message templates & policies
│   ├── jobs/                        # Scheduled jobs & job types
│   ├── servers/                     # External endpoints & infrastructure
│   ├── connection-profiles/         # Data source configurations
│   ├── dashboard/                   # Analytics & reporting
│   ├── auth/                        # Authentication & login
│   ├── customer/                    # Individual customer management
│   ├── customers/                   # Bulk customer operations
│   ├── notifications/               # Notification management
│   ├── quicklists/                  # Pre-built customer lists
│   ├── roles/                       # Role-based access control
│   ├── settings/                    # User & system settings
│   └── [others]/                    # Additional features
├── shared/                          # Reusable components & utilities
│   ├── components/                  # UI components (buttons, modals, loaders)
│   ├── configs/                     # Configuration masters (templates, offer types, etc.)
│   ├── hooks/                       # Custom React hooks
│   ├── i18n/                        # Internationalization strings
│   ├── services/                    # API clients & utilities
│   ├── types/                       # TypeScript type definitions
│   └── utils/                       # Helper functions (formatting, color schemes, etc.)
└── assets/                          # Static assets (fonts, images)
```

### 3. Feature Module Pattern

Each feature is **self-contained** with a consistent structure:

```
features/campaigns/
├── pages/                           # Full-page components (routes)
│   ├── CampaignsPage.tsx           # List view
│   ├── CreateCampaignPage.tsx      # Create/edit form with multi-step flow
│   ├── CampaignDetailsPage.tsx     # Single campaign view
│   └── CampaignsAnalyticsPage.tsx  # Analytics dashboard
├── components/                      # Reusable components within feature
│   ├── CampaignModal.tsx
│   ├── CampaignCard.tsx
│   └── [others]/
├── services/                        # API calls to backend
│   └── campaignService.ts          # CRUD, search, analytics endpoints
├── types/                           # TypeScript interfaces/types
│   └── campaign.ts                 # All campaign-related types
├── hooks/                           # Feature-specific hooks
│   └── useCampaignFilters.ts
└── [utils, data, etc]/              # Feature utilities
```

---

## Key Concepts & Entities

### 1. **Campaigns** (Core Entity)

- **What**: Marketing initiatives sent to customer segments
- **Lifecycle**: Define → Map Audience → Map Offers → Schedule → Execute → Analyze
- **Status**: Draft, Pending Approval, Active, Completed, Paused
- **Types**: Multiple Target Group, A/B Test, Champion-Challenger, Round Robin
- **Multi-channel**: SMS, Email, USSD, Push, WhatsApp, IVR, Web, In-App

### 2. **Segments** (Audience)

- **Definition**: Groups of customers meeting specific criteria
- **Types**:
  - **Static**: Manually added, fixed membership
  - **Dynamic**: Rules-based, recalculate membership as data changes
  - **Predictive**: ML model scores (churn risk, propensity)
  - **Behavioral**: Activity-based (recency, frequency, engagement)
  - **Demographic**: Age, gender, location
  - **Geographic**: Region, zone, area
  - **Transactional**: Spend, frequency, purchase patterns
- **Scale**: Millions of members per segment
- **Membership**: Tracks which customers are in each segment

### 3. **Offers** (Promotions)

- **Definition**: What customers get (discounts, bundles, rewards)
- **Types**: Data, Voice, SMS, Combo, Voucher, Loyalty, Bundle, Bonus
- **Reward Types**: Bundle, Points, Discount, Cashback, Custom Fulfilment
- **Mapping**: Linked to segments → "Offer X goes to Segment Y"
- **Tracking**: Measure take-up, redemption, revenue impact

### 4. **Products**

- **Definition**: What operators sell (services, bundles, packages)
- **Types**: Data Products, Voice, SMS, VAS, Device
- **Used In**: Building offers, tracking inventory, revenue attribution

### 5. **Servers** (Infrastructure)

- **Definition**: External endpoints where data/commands go
- **Examples**: Email API, SMS Gateway, Data Warehouse, CRM, S3, Kafka
- **Attributes**: Host, port, protocol, auth, health-check URL, timeouts, retries
- **Health**: Periodic checks to detect failures
- **Circuit Breaker**: Auto-disable if failing repeatedly

### 6. **Connection Profiles** (Data Strategy)

- **Definition**: How to access a data source using a server + strategy
- **References**: A server + data-specific config
- **Strategy**: Full load, incremental, CDC, upsert, append, merge
- **Governance**: Data classification, PII flag, GDPR flag, validity window
- **Performance**: Batch size, parallelism, connection pooling
- **Used By**: Scheduled jobs to fetch/sync data safely

### 7. **Job Types** (Work Templates)

- **Definition**: Categories of work (Email Send, Data Export, Segment Compute)
- **Purpose**: Standardize, organize, enable role-based permissions
- **Examples**: `EMAIL_CAMPAIGN`, `DATA_EXPORT`, `SEGMENT_COMPUTATION`
- **Single Instance Used Many Times**: All email jobs use the "Email" job type

### 8. **Scheduled Jobs** (Automation)

- **Definition**: Instances of job types configured to run on a schedule
- **Schedule Types**: Manual, Cron, Interval, Event-driven, Dependency-based
- **Parameters**: Which job type, when to run, which resources (server/profile), owners
- **Execution**: Scheduler triggers at appointed time; worker runs using job type + resources
- **Tracking**: Logs, retry attempts, success/failure, execution time

### 9. **Communication Channels**

- **Definition**: Delivery mechanisms (SMS, Email, Push, USSD, IVR, WhatsApp, Web, In-App)
- **Status**: Active or inactive
- **Channel-specific**: SMS has Flash option, Email has rich HTML, USSD has menu trees

### 10. **Creative Templates**

- **Definition**: Reusable message/creative designs
- **Supports**: SMS, Email (HTML), Push, USSD, WhatsApp, IVR, Web, In-App
- **Variables**: Placeholders for personalization ({{customer_name}}, {{offer}}, etc.)
- **Used In**: Campaign content creation

### 11. **Configs** (Master Reference Data)

- **Definition**: Platform-wide lookup tables and standards
- **Examples**:
  - Campaign Objectives (Acquisition, Retention, Churn Prevention)
  - Departments (Marketing, Sales, Support)
  - Team Roles (Campaign Manager, Data Analyst)
  - Line of Business (GSM, Internet, Enterprise)
  - Tracking Sources (for analytics)
  - Product Types, Segment Types, Offer Types, Campaign Types

---

## Campaign Creation Workflow

### Multi-Step Flow (Currently 4 Steps)

```
Step 1: DEFINITIONS
├── Campaign Name, Code
├── Objective (linked to config)
├── Type (Multi-target, A/B, Champion-Challenger, etc. - from config)
├── Budget
├── Duration (start/end date)
└── Owner, Department, Team Role (from configs)

Step 2: MAP AUDIENCE (SEGMENTS)
├── Choose segment(s) to target
├── Set segment membership criteria (if dynamic)
├── Preview segment size (e.g., "2.3M customers")
├── Option: Create new segment on-the-fly
└── For each segment: set mapping to next step

Step 3: MAP OFFERS TO SEGMENTS
├── For each segment from Step 2:
│   ├── Choose offer(s) to assign
│   ├── Set variant / control group split (e.g., 80/20)
│   ├── Add reward type (e.g., "Bundle Reward")
│   └── Set tracking source for analytics
└── Preview: matrix of Segment → Offer mappings

Step 4: BROADCAST SCHEDULE & PREVIEW
├── Choose communication channel(s) (SMS, Email, Push, etc. - from config)
├── Pick or create creative template (from templates)
├── Set schedule:
│   ├── Send Now (immediate)
│   ├── Schedule for specific date/time
│   └── Recurring (daily, weekly, etc.) → creates Scheduled Job
├── [NEW] Select Connection Profile (if exporting/syncing)
├── [NEW] Set Job Type (Send, Export, Sync, etc.)
├── Preview:
│   ├── Sample recipients (e.g., 10 rows)
│   ├── Rendered message
│   ├── Estimated reach
│   └── Budget impact
└── Create Campaign & Scheduled Job(s)
```

### Why These 4 Steps?

1. **Definitions**: Setup, ownership, business rules
2. **Audience**: Who gets it? (segments are the core of targeting)
3. **Offers**: What do they get? (map offers to segments)
4. **Schedule**: How & when? (channels, timing, delivery infrastructure)

---

## How This Differs from Traditional CRM/Marketing Platforms

| Aspect              | Traditional CRM (Salesforce, HubSpot) | Sentra CVM                                                |
| ------------------- | ------------------------------------- | --------------------------------------------------------- |
| **Scale**           | 100K-1M contacts                      | 5M+ customers, real-time                                  |
| **Targeting**       | Account + contact-based               | Segment-based (millions per segment)                      |
| **Channels**        | Email, maybe SMS                      | SMS, USSD, IVR, Push, Email, Web, WhatsApp, In-App, IVR   |
| **Segmentation**    | Static lists, basic rules             | Dynamic, predictive, behavioral, ML-driven                |
| **Execution Speed** | Days to weeks                         | Minutes to hours                                          |
| **Integration**     | Via connectors/APIs                   | Direct DB access, data warehouses, real-time streams      |
| **Governance**      | Basic (access control)                | PII/GDPR by design, data classification, validity windows |
| **Data Strategy**   | Single sync                           | Multiple: full, incremental, CDC, upsert, streaming       |
| **Operator Focus**  | Not built-in                          | Native: billing systems, SIM management, network data     |
| **Revenue Model**   | Per-user licensing                    | Per-contact, per-campaign, per-execution                  |

---

## Feature Areas & Their Purpose

### **Campaigns** (`src/features/campaigns/`)

- **Purpose**: Design, execute, and analyze marketing campaigns
- **Key Pages**:
  - `CampaignsPage`: List all campaigns with filters (status, owner, date range)
  - `CreateCampaignPage`: Multi-step wizard (4 steps as above)
  - `CampaignDetailsPage`: View campaign setup, execution status, metrics
  - `CampaignsAnalyticsPage`: Dashboard with charts, top performers, breakdowns
- **Concepts**:
  - Campaign lifecycle (draft → approval → active → complete)
  - Multi-channel orchestration
  - Target group mapping

### **Segments** (`src/features/segments/`)

- **Purpose**: Create and manage audience segments
- **Key Pages**:
  - `SegmentsPage`: List segments with filters (type, size, owner)
  - `SegmentDetailsPage`: View segment definition, membership, rules
  - `CreateSegmentPage`: Define rules, pick type (static/dynamic/etc.)
- **Concepts**:
  - Segment types (static, dynamic, predictive, behavioral, demographic, geographic, transactional)
  - Rule-based membership computation
  - Preview sample members
  - Add/remove manual members (for static segments)

### **Offers** (`src/features/offers/`)

- **Purpose**: Create promotional offers
- **Key Pages**:
  - `OffersPage`: List offers with filters
  - `CreateOfferPage`: Define offer details, rewards, validity
  - `OfferDetailsPage`: View offer metrics, mapped campaigns
- **Concepts**:
  - Offer types (Data, Voice, SMS, Combo, etc.)
  - Reward types (Bundle, Points, Discount, Cashback)
  - Tracking source assignment (for analytics)
  - Offer-to-segment mapping

### **Products** (`src/features/products/`)

- **Purpose**: Manage product catalog
- **Concepts**:
  - Product types (Data Products, Voice, SMS, VAS, Device)
  - Used in offers and campaign budget calculation

### **Communications** (`src/features/communications/`)

- **Purpose**: Manage communication policies and templates
- **Key Sections**:
  - Communication channels (SMS, Email, USSD, Push, etc.)
  - Creative templates with variables
  - Communication policies (rules for when/how to send)
- **Concepts**:
  - Multi-channel template support
  - Variable personalization
  - Policy-driven sending logic

### **Scheduled Jobs** (`src/features/jobs/`)

- **Purpose**: Manage background/recurring jobs
- **Job Types**: Email Send, SMS Send, Data Export, Segment Compute, Report Gen, Data Sync
- **Key Pages**:
  - `ScheduledJobsPage`: List jobs with filters (status, type, owner)
  - `CreateScheduledJobPage`: Define job (type, schedule, resources)
  - `ScheduledJobDetailsPage`: View job execution history, logs
- **Concepts**:
  - Job type templates (reusable work definitions)
  - Schedule types (manual, cron, interval, event-driven)
  - Connection profile selection (which data source to use)
  - Health monitoring, retry logic

### **Servers** (`src/features/servers/`)

- **Purpose**: Register external endpoints
- **Key Pages**:
  - `ServersPage`: List all servers with health status
  - `ServerFormPage`: Create/edit server config
  - `ServerDetailsPage`: View server health, usage, details
- **Concepts**:
  - Endpoint configuration (host, port, protocol, auth)
  - Health checks (periodic validation)
  - Environment-based (dev, qa, uat, prod)
  - Protocol types (HTTP/HTTPS, FTP/SFTP, SMTP, Kafka, etc.)

### **Connection Profiles** (`src/features/connection-profiles/`)

- **Purpose**: Define data sources and how to access them
- **Key Pages**:
  - `ConnectionProfilesPage`: List profiles with stats
  - `ConnectionProfileFormPage`: Create/edit profile
  - `ConnectionProfileDetailsPage`: View profile health, usage
- **Concepts**:
  - Links to a Server + data strategy
  - Load strategy (full, incremental, CDC, upsert)
  - Governance (PII, GDPR, classification)
  - Performance tuning (batch size, parallelism)
  - Validity window (when profile is active)

### **Dashboard** (`src/features/dashboard/`)

- **Purpose**: High-level platform analytics
- **Key Sections**:
  - Campaign health (total, active, draft, pending)
  - Segment insights (total, by type, largest)
  - Offer performance (top offers, trending)
  - Recent activity timeline

### **Auth** (`src/features/auth/`)

- **Purpose**: User authentication and login
- **Managed By**: AuthContext (global state)

### **Settings** (`src/features/settings/`)

- **Purpose**: User preferences, system configuration
- **Concepts**:
  - User preferences (language, timezone)
  - System settings (retention, compliance)

### **Configuration** (`src/shared/configs/`)

- **Purpose**: Master reference data
- **Examples**:
  - Campaign Objectives, Departments, Team Roles
  - Offer Types, Campaign Types, Segment Types, Product Types
  - Tracking Sources, Communication Channels, Creative Templates
  - Reward Types

---

## Data Flow Patterns

### 1. **Fetching Data (List/Details)**

```
UI Component (e.g., CampaignsPage.tsx)
  ↓
  useEffect() → calls service.getList()
  ↓
  Service (campaignService.ts) → builds URL + auth headers
  ↓
  fetch() → backend API (/campaigns, /campaigns/:id, /campaigns/search, etc.)
  ↓
  Parse response → setData()
  ↓
  Render UI with data + filters
```

### 2. **Creating/Updating (Form Submission)**

```
User fills form (e.g., CreateCampaignPage.tsx multi-step)
  ↓
  Validation checks
  ↓
  onSubmit() → calls service.create() or service.update()
  ↓
  Service builds payload (POST/PUT) → backend
  ↓
  Backend processes, returns updated entity
  ↓
  Show success toast + navigate or refresh list
```

### 3. **Deleting**

```
User clicks Delete → Confirm Dialog
  ↓
  onConfirm() → calls service.delete(id)
  ↓
  Service sends DELETE request
  ↓
  Backend deletes, returns success
  ↓
  Remove from UI list + show toast
```

### 4. **Search/Filter**

```
User types in search box → debounce (300ms)
  ↓
  setSearchTerm() → useEffect listens
  ↓
  Calls service.search({ term, filters, page, limit })
  ↓
  Backend queries, returns paginated results
  ↓
  Update filtered list in UI
```

### 5. **Multi-Step Form (e.g., Campaign Creation)**

```
Step 1: Set campaign basics (name, objective, type)
  → State: [formData, setFormData]
  → Validation on "Next"

Step 2: Select segments
  → Add to formData.segments[]
  → Show segment preview

Step 3: Map offers to segments
  → Build matrix in formData.offerMappings
  → Show preview

Step 4: Schedule & broadcast
  → Add formData.schedule, formData.channels, formData.connectionProfile
  → Preview campaign

Final: Submit
  → Combine all steps into single API call
  → Create campaign + create scheduled job(s) if recurring
  → Navigate to campaign details
```

---

## Why Certain Design Decisions Were Made

### 1. **Feature-Based Folder Structure** (not layer-based)

```
Good: src/features/campaigns/ + src/features/segments/
Avoid: src/pages/, src/components/, src/services/
```

**Why?**

- Scalability: Each team owns a feature domain
- Isolation: Campaigns team changes don't break segments
- Discoverability: All campaign code in one place
- Reduces coupling

### 2. **Service Layer Pattern**

```
Every feature has: campaignService.ts, segmentService.ts, etc.
```

**Why?**

- Decouples UI from API details
- Easy to mock for testing
- Centralized error handling & retry logic
- Consistent auth headers across all requests

### 3. **Context API for Global State** (not Redux)

```
AuthContext, ToastContext, NotificationContext, LanguageContext
```

**Why?**

- CVM has limited shared state (auth, UI notifications)
- Redux overkill for this scope
- Simpler, fewer dependencies
- Easier onboarding for new devs

### 4. **Multi-Step Campaign Creation** (not single-page form)

```
Step 1 → Step 2 → Step 3 → Step 4 → Submit
```

**Why?**

- Complex domain (segments + offers + channels + scheduling)
- Reduce cognitive load per step
- Allow preview/validation at each stage
- Support discarding draft without losing input
- Better mobile experience

### 5. **Segment Types as Config**

```
Static, Dynamic, Predictive, Behavioral, Demographic, Geographic, Transactional
```

**Why?**

- Different computation strategies for each type
- Each type has different UX (rules builder vs. ML model selector)
- Allows platform to grow (add new types later without code changes)
- Marketing terminology (not technical jargon)

### 6. **Server vs. Connection Profile Separation**

```
Server = network endpoint (host, port, protocol, auth, health)
Connection Profile = server + data strategy (batch size, sync column, PII flag)
```

**Why?**

- Server is infrastructure-owned, profiles are data-strategy-owned
- Reuse: Multiple profiles can share same server
- Governance: PII/GDPR flags on profiles, not servers
- Strategy changes (batch size) don't require new server config

### 7. **Job Type + Scheduled Job Separation**

```
Job Type = template (e.g., "Email Campaign Send")
Scheduled Job = instance (e.g., "Nightly newsletter on 02:00 daily")
```

**Why?**

- Standardization: All email jobs follow same logic
- Permissions: Can restrict who can create email jobs
- Analytics: "How many email jobs ran today?"
- Scalability: Scheduler doesn't need to understand each job's logic

### 8. **Configs as Hardcoded Lookup Tables** (not API-driven by default)

```
Campaign Objectives, Offer Types, Segment Types stored in configurationPageConfigs.ts
```

**Why?**

- Fast: No API call needed for dropdowns
- Simple: Admins edit TypeScript, not DB
- Cacheable: Never changes during session
- Later: Can migrate to backend API if needed

### 9. **Internationalization (i18n) from Day 1**

```
src/shared/i18n/translations/{en, es, sw}.ts
```

**Why?**

- CVM is global (telecom, multiple countries)
- Easy to add new languages
- Keep UI labels in one place (maintainability)
- Support regional needs (Swahili for East Africa)

### 10. **Recharts for Analytics** (not bespoke D3)

```
Pie charts, bar charts, line charts with built-in tooltips
```

**Why?**

- CVM dashboards don't need custom interactivity
- Recharts is battle-tested, performant
- Reduces build size vs. D3
- Easy to customize (colors, labels, etc.)

### 11. **Tailwind CSS for Styling**

```
Utility-first CSS framework
```

**Why?**

- Fast development (no context switching to CSS files)
- Consistent design tokens (colors, spacing, shadows)
- Small bundle size (tree-shaking unused styles)
- Works great with component-driven development

### 12. **React Router v7** (client-side routing)

```
/campaigns, /campaigns/:id, /campaigns/create, etc.
```

**Why?**

- SPA reduces server load (backend just serves API)
- Fast navigation (no page reloads)
- Deep linking (shareable URLs)
- Matches CVM's interactive, fast-paced UX needs

---

## Key Takeaways

1. **CVM is specialist**: Built for telecom operators managing millions of customers, not generalist CRM
2. **Segmentation is core**: Campaigns are built on top of segments (not just contact lists)
3. **Multi-channel is native**: SMS, Email, USSD, IVR, Push, etc. all equally supported
4. **Scale matters**: Architecture decisions optimize for millions of customers, fast execution
5. **Governance by design**: PII/GDPR controls baked into data strategy (connection profiles)
6. **Orchestration layer**: Scheduled jobs + job types handle complex automation
7. **Fast UI**: React + routing + context makes platform feel responsive
8. **Team scalability**: Feature-based structure lets teams work independently
9. **Flexibility**: Configs + templates reduce hard-coded logic
10. **Growth path**: Architecture supports adding new features without major refactoring

---

## Next Steps to Master the Project

1. **Explore One Feature End-to-End**:

   - Pick `campaigns` or `segments`
   - Follow the code from `CampaignPage.tsx` → `campaignService.ts` → backend API call
   - Understand state management, form validation, error handling

2. **Trace Campaign Creation Flow**:

   - Open `CreateCampaignPage.tsx`
   - Walk through all 4 steps
   - See how data flows between steps

3. **Review API Service Patterns**:

   - Compare `campaignService.ts`, `segmentService.ts`, `jobService.ts`
   - Notice how they follow same pattern (list, create, update, delete, search, etc.)

4. **Understand Data Types**:

   - Read `src/features/campaigns/types/campaign.ts`
   - Read `src/features/segments/types/segment.ts`
   - See how types define contracts between frontend and backend

5. **Study Config System**:

   - Review `src/shared/configs/configurationPageConfigs.ts`
   - See how campaign types, segment types, offer types are defined
   - Understand why they're shared across multiple features

6. **Try Building a Feature**:
   - Extend an existing feature or create a small new one
   - Practice the feature-based structure
   - Get comfortable with service layer + context API pattern

---

## Questions to Ask As You Learn

- **Why does this button do that?** → Trace the handler to service to backend
- **How do users create segments?** → Open `CreateSegmentPage.tsx`, follow multi-step
- **Where do campaign types come from?** → Check `configurationPageConfigs.ts`
- **How is authentication handled?** → Review `AuthContext.tsx`
- **What happens when someone searches?** → Trace search input → debounce → API call
- **How are segments computed?** → Review segment types, query generation

This guide is your foundation. Dive into code, ask questions, and build!
