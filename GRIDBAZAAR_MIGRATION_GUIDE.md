# GridBazaar Migration Guide

This guide outlines how to extract GridBazaar (VoltMarket) into a standalone project.

## Step 1: Create New Lovable Project
1. Go to [lovable.dev](https://lovable.dev) and create a new project
2. Name it "GridBazaar" or similar

## Step 2: Copy Core Application Files

### Main Application Structure
```
src/
├── App.tsx                              # ✅ REPLACE - New routing structure
├── main.tsx                             # ✅ KEEP - Standard entry point
├── index.css                            # ✅ KEEP - Design system
├── nav-items.tsx                        # ✅ REPLACE - GridBazaar only routes
└── pages/
    ├── Index.tsx                        # ✅ REPLACE - GridBazaar landing
    └── VoltMarket.tsx                   # ✅ COPY - Main routing component
```

### Authentication & Context
```
src/contexts/
└── VoltMarketAuthContext.tsx            # ✅ COPY

src/hooks/
├── useVoltMarketAuth.ts                 # ✅ COPY
└── useVoltMarketAuth.tsx                # ✅ COPY
```

### All VoltMarket Components
```
src/components/voltmarket/               # ✅ COPY ENTIRE DIRECTORY
├── VoltMarketAuth.tsx
├── VoltMarketLayout.tsx
├── VoltMarketNavigation.tsx
├── VoltMarketListings.tsx
├── VoltMarketDashboard.tsx
├── [... all other VoltMarket components]
```

### All VoltMarket Hooks
```
src/hooks/
├── useVoltMarketListings.ts             # ✅ COPY
├── useVoltMarketPortfolio.ts            # ✅ COPY
├── useVoltMarketAnalytics.ts            # ✅ COPY
├── useVoltMarketAccessRequests.ts       # ✅ COPY
├── useVoltMarketSavedSearches.ts        # ✅ COPY
├── useVoltMarketDocuments.ts            # ✅ COPY
├── useVoltMarketMessages.ts             # ✅ COPY
├── useVoltMarketNotifications.ts        # ✅ COPY
├── useVoltMarketTransactions.ts         # ✅ COPY
├── useVoltMarketVerification.ts         # ✅ COPY
├── useVoltMarketWatchlist.ts            # ✅ COPY
└── [... all other VoltMarket hooks]
```

## Step 3: Supabase Configuration

### Edge Functions
Copy entire directories:
```
supabase/functions/
├── create-voltmarket-profile/           # ✅ COPY
├── send-verification-email/             # ✅ COPY
├── verify-email/                        # ✅ COPY
├── voltmarket-chat/                     # ✅ COPY
├── voltmarket-document-management/      # ✅ COPY
├── voltmarket-loi-management/           # ✅ COPY
├── voltmarket-notifications/            # ✅ COPY
├── voltmarket-portfolio-management/     # ✅ COPY
└── voltmarket-verification-system/      # ✅ COPY
```

### Database Migrations
Copy relevant migrations that create VoltMarket tables:
```
supabase/migrations/
├── [timestamp]-create-voltmarket-tables.sql     # ✅ COPY
├── [timestamp]-voltmarket-permissions.sql       # ✅ COPY
└── [... all VoltMarket related migrations]
```

### Storage Buckets
These will be recreated via migrations:
- `listing-images` (public)
- `profile-images` (public)  
- `documents` (public)

## Step 4: Required Code Changes

### New App.tsx Structure
The new App.tsx should route directly to VoltMarket pages instead of the multi-app structure.

### Update Index Page
Create a GridBazaar-specific landing page that routes users directly to the platform.

### Remove Cross-References
- Remove imports from VoltScout components
- Remove references to other apps in navigation
- Clean up any shared utilities that aren't needed

### Update Authentication Flow
- Modify auth redirects to point to GridBazaar routes
- Update email templates to reference GridBazaar branding

## Step 5: Database Options

### Option A: Shared Database (Recommended for Development)
- Use the same Supabase project
- Both apps share the same database
- Easier for testing and development

### Option B: New Database (Recommended for Production)
- Create new Supabase project
- Export VoltMarket data from current project
- Import into new project
- Update environment variables

## Step 6: Environment Configuration

### Supabase Connection
Update with new project credentials (if using new database):
```
Project ID: [new-project-id]
Anon Key: [new-anon-key]
URL: https://[new-project-id].supabase.co
```

### Required Secrets
Ensure these secrets are configured in the new project:
- OPENAI_API_KEY
- RESEND_API_KEY  
- GOOGLE_MAPS_API_KEY
- STRIPE_SECRET_KEY (if using payments)

## Step 7: Deployment

### Custom Domain Setup
- Deploy the new GridBazaar project
- Configure custom domain (e.g., gridbazaar.com)
- Update Supabase auth redirect URLs

### DNS Configuration
Point your domain to the new Lovable deployment.

## Files to Exclude from Migration

### Don't Copy These:
```
src/pages/
├── VoltScout.tsx                        # ❌ EXCLUDE
├── ComprehensiveTest.tsx                # ❌ EXCLUDE
└── Index.tsx (current multi-app)       # ❌ EXCLUDE - Create new one

src/components/
├── Auth.tsx (VoltScout version)         # ❌ EXCLUDE
├── Sidebar.tsx (VoltScout)              # ❌ EXCLUDE
└── [any VoltScout components]           # ❌ EXCLUDE

src/hooks/
└── [any VoltScout hooks]                # ❌ EXCLUDE
```

## Testing Checklist

After migration, verify:
- [ ] Authentication works (signup/login)
- [ ] Email verification works
- [ ] File uploads work (listings, documents)
- [ ] Real-time features work (messages, notifications)
- [ ] Payment processing works (if implemented)
- [ ] All VoltMarket pages load correctly
- [ ] Navigation works throughout the app
- [ ] Database permissions are correct

## Post-Migration Updates

### Branding
- Update all references from "GridBazaar" to your preferred branding
- Update email templates
- Update footer and header information

### Analytics
- Set up new analytics tracking for the standalone app
- Update any tracking IDs or configurations

### Support
- Update help/support links and contact information
- Update documentation links

This migration will result in a completely standalone GridBazaar application that can be deployed independently with its own URL and branding.