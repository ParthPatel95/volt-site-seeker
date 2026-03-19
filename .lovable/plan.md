

# Add "Next Module" Recommendation Component

## Overview
Create a reusable `NextModuleRecommendation` component that uses the centralized curriculum data to suggest the next module in the learning path. Place it at the bottom of each module page (before the footer).

## Component Design

**New file: `src/components/academy/NextModuleRecommendation.tsx`**

A self-contained component that accepts the current module ID as a prop. It:
1. Looks up the current module in `ACADEMY_CURRICULUM`
2. Finds the next module in array order (the learning path sequence)
3. If at the last module, suggests returning to the Academy landing page
4. Shows the next module's icon, title, description, difficulty badge, estimated time, and a "Continue Learning" link
5. Also shows a secondary suggestion (the module after next, if available) for variety

Visual design: A card section with a gradient accent border, matching the institutional style. Uses theme-aware colors (`text-foreground`, `bg-card`, `border-border`).

## Integration (13 module pages)

Add `<NextModuleRecommendation moduleId="..." />` before `<LandingFooter />` in each page:

| Page | Module ID |
|------|-----------|
| BitcoinEducation | `bitcoin` |
| AESOEducation | `aeso` |
| MiningEconomicsEducation | `mining-economics` |
| DatacenterEducation | `datacenters` |
| ElectricalInfrastructureEducation | `electrical` |
| HydroDatacenterEducation | `hydro` |
| ImmersionCoolingEducation | `immersion` |
| OperationsEducation | `operations` |
| NoiseManagementEducation | `noise` |
| StrategicOperationsMasterclass | `strategic-operations` |
| TaxesInsuranceEducation | `taxes-insurance` |
| EngineeringPermittingEducation | `engineering-permitting` |
| NetworkingEducation | `networking` |

## Files
- **Create**: `src/components/academy/NextModuleRecommendation.tsx`
- **Modify**: 13 module page files (one-line import + one-line component placement each)

