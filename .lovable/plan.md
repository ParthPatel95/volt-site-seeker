

# Academy Content Accuracy Audit — Module-by-Module Review

This audit examines every module for hardcoded statistics, financial figures, and factual claims. Each issue is categorized as **INCORRECT** (wrong data), **OUTDATED** (was true, needs updating), or **NEEDS DISCLAIMER** (illustrative numbers presented as fact without labeling).

---

## Module 1: Bitcoin Fundamentals (`/bitcoin`)

### Verified Accurate
- 21M max supply, ~2140 last BTC mined, 3.125 BTC block reward, 2016-block difficulty adjustment, ~10 min block time — all correct
- Halving history table (2012: $12, 2016: $650, 2020: $8,500, 2024: $64,000) — accurate
- History timeline (2008 whitepaper, 2009 genesis, 2010 pizza, 2024 ETF) — all correct
- Evolution of money section (Nixon 1971) — correct
- Next halving ~April 2028, reward to 1.5625 BTC — correct

### Issues Found

| # | Section | Current Value | Correct Value | Severity |
|---|---------|---------------|---------------|----------|
| 1 | WhatIsBitcoinSection | "Over 15,000 publicly reachable nodes" | ~20,000+ (Bitnodes shows ~17-20K reachable as of 2025) | **OUTDATED** |
| 2 | WhatIsBitcoinSection | "99.98% uptime since 2009" | 99.98% is commonly cited but should note the 2010 and 2013 chain splits/bugs; more accurate to say ">99.9%" | **Minor** |
| 3 | WhatIsBitcoinSection | "800+ Contributors" | Bitcoin Core has ~900+ contributors on GitHub as of 2025 | **OUTDATED** |
| 4 | WhatIsBitcoinSection | "1.4 billion unbanked adults" | World Bank 2021 Findex says ~1.4B; still commonly cited, acceptable | OK |
| 5 | WhatIsBitcoinSection | Gold "~244,000 tons estimated remaining" | USGS estimates ~50,000-55,000 tons of below-ground reserves; 244,000 is total ever mined. Fix: "~212,000 tons mined + ~55,000 tons reserves" | **INCORRECT** |
| 6 | BitcoinEconomicsSection | "~19.8M Currently Mined" | As of early 2026 it's ~19.91M (per Blockchain Council). Should be ~19.9M | **OUTDATED** |
| 7 | BitcoinEconomicsSection | "94% Already Mined" | 19.91/21 = 94.8%, so 94% is slightly low. Should be ~95% | **OUTDATED** |
| 8 | GlobalBitcoinAdoptionSection | MicroStrategy "~528,000 BTC, ~$54B" | As of Q4 2025, Strategy holds **~713,502 BTC**. Value is BTC-price dependent. Massively outdated. | **INCORRECT** |
| 9 | GlobalBitcoinAdoptionSection | US "~213,000 BTC" seized | US established Strategic Bitcoin Reserve in March 2025. Holdings were ~198K-207K BTC at that time. The 213K figure needs verification. | **NEEDS VERIFICATION** |
| 10 | GlobalBitcoinAdoptionSection | China "~194,000 BTC" | This figure is a commonly cited estimate but unverifiable. Should be labeled "estimated" | **NEEDS DISCLAIMER** |
| 11 | GlobalBitcoinAdoptionSection | Ukraine "~46,000 BTC" donations | This is a commonly cited but likely inflated figure. Most sources cite $100M+ in crypto donations (mixed crypto, not all BTC). | **INCORRECT** |
| 12 | GlobalBitcoinAdoptionSection | Marathon Digital "~46,000 BTC" | Marathon held ~44,893 BTC as of Q3 2025. Close but needs update. | **OUTDATED** |
| 13 | GlobalBitcoinAdoptionSection | Tesla "~9,700 BTC, ~$1B" | Tesla sold ~75% of its BTC in 2022. Holdings are ~9,720 BTC — correct amount but value needs to be dynamic | OK |
| 14 | GlobalBitcoinAdoptionSection | "560M+ Bitcoin Holders" | Various estimates range from 300M-560M. Triple Coin & Chainalysis suggest ~300-400M. 560M is on the high end. | **NEEDS DISCLAIMER** |
| 15 | GlobalBitcoinAdoptionSection | "ETF AUM $120B+" | As of March 2026, US spot Bitcoin ETF AUM fluctuates significantly with BTC price. At ~$68K BTC, AUM would be lower. This was probably accurate when BTC was ~$100K. | **OUTDATED** |
| 16 | GlobalBitcoinAdoptionSection | "11 Spot ETFs approved" | There are now 12+ spot Bitcoin ETFs (including additional approvals in 2025) | **OUTDATED** |
| 17 | MiningSustainabilitySection | "48% sustainable energy" | Cambridge 2025 report says **52.4%** sustainable energy. BMC also reports ~56%+. | **INCORRECT** |
| 18 | MiningSustainabilitySection | Energy breakdown (Hydro 23%, Wind 12%, Solar 8%, Nuclear 5%, Gas 38%, Other 14%) | Cambridge 2025 data shows different breakdown. Nuclear is ~9.5%, hydro ~23% is roughly OK but the overall mix needs updating. | **OUTDATED** |
| 19 | MiningSustainabilitySection | "63% compared to flaring" | Should cite source. The figure varies by study. | **NEEDS CITATION** |
| 20 | BitcoinHistorySection | Pizza purchase "$41 at the time" | The $41 figure for 10,000 BTC is commonly cited but debatable. At the time, BTC had no established price. Most sources say "essentially $0." | **MINOR** |
| 21 | BitcoinHistorySection | "over $1 billion today" (pizza BTC) | At current ~$68K BTC, 10,000 BTC ≈ $680M, not $1B. Was true at $100K. | **OUTDATED** |
| 22 | LastReviewed | "December 2024" | Should be updated to current review date | **OUTDATED** |

---

## Module 2: Mining Infrastructure (`/datacenters`)

### Issues Found

| # | Section | Current Value | Issue | Severity |
|---|---------|---------------|-------|----------|
| 23 | MiningHardwareShowcase | "750 EH/s" network hashrate | Network hashrate as of March 2026 is variable (~800-900 EH/s). The page uses this as a **static** placeholder for calculations instead of live data. | **OUTDATED** |
| 24 | MiningHardwareShowcase | BTC price "$100,000 placeholder" | BTC is ~$68K as of today. Calculations use static $100K. These educational calculators should pull live data or label clearly as "illustrative." | **NEEDS DISCLAIMER** |
| 25 | MiningHardwareShowcase | S21 XP Hyd "$14,000" price | Hardware prices fluctuate significantly. These should be labeled "est. MSRP at launch" or "as of [date]." | **NEEDS DISCLAIMER** |
| 26 | DatacenterEconomics | "23 J/TH" miner efficiency, "750 EH/s" | Same static fallback issue. Calculator should note these are illustrative defaults. | **NEEDS DISCLAIMER** |
| 27 | DatacenterEconomics | CapEx "$700K/MW" total | This is a reasonable industry estimate but varies widely. Already has "Industry Est." badge — **OK** |
| 28 | BitcoinMiningSection | Hardware evolution "~400+ TH/s" for latest | S21 XP Hyd does 473 TH/s. "400+" is acceptable but could say "300-500+ TH/s" for range. | **Minor** |
| 29 | BitcoinMiningSection | "5-8¢ optimal electricity rate" | Industry consensus is 3-6¢ for competitive mining (post-halving). 5-8¢ is slightly high. | **OUTDATED** |

---

## Module 3: Alberta Energy Market (`/aeso-101`)

### Verified Accurate
- AESO established 2003 — correct
- Deregulation 1996 — correct  
- Energy-only market, single pool price — correct
- Price range -$60 to $999.99/MWh — correct (AESO price cap is $999.99)
- Rate 65 demand charge $7.52/kW/month — verified from FortisAlberta July 2025 schedule
- AESO tariff rates (DTS 2026 constants) — verified against AESO 2026-015T Bill Estimator
- 12CP mechanism description — accurate

### Issues Found

| # | Section | Current Value | Issue | Severity |
|---|---------|---------------|-------|----------|
| 30 | WhatIsAESOSection | "Coal-Free Grid" in 2024 | Alberta.ca confirms coal generation phased out by **early 2024**. The timeline entry is accurate. | OK |
| 31 | WhatIsAESOSection | "Peak Demand (2024): 12,500 MW" | This needs verification. AESO 2024 peak was ~12,200-12,500 MW range. Acceptable. | OK |
| 32 | WhatIsAESOSection | "~19,500 MW Installed Capacity" | AESO CSD shows installed capacity growing rapidly with renewables. As of 2025, it's likely ~21,000+ MW. | **OUTDATED** |
| 33 | WhatIsAESOSection | Mike Law quote as "President & CEO, AESO" from "AESO 2024 Market Update" | Need to verify this quote is real and attributed correctly. Fabricated quotes are a serious credibility issue. | **NEEDS VERIFICATION** |
| 34 | WhatIsAESOSection | MISO "~190 GW", PJM "~180 GW" | These are approximate and in the right ballpark. | OK |
| 35 | TwelveCPSection | "~$2.3B annual transmission cost allocation" | This figure should be verified against AESO's latest tariff filing. | **NEEDS VERIFICATION** |
| 36 | Rate65Section | Rate 63 delivery "$25-35/MWh" | This is a reasonable estimate but should cite source. | **NEEDS CITATION** |
| 37 | LastReviewed | "December 2024" | Should be updated | **OUTDATED** |

---

## Module 7: Taxes & Insurance (`/taxes-insurance`)

### Verified Accurate
- Alberta combined corporate tax rate 23% (15% federal + 8% provincial) — **correct** per Alberta.ca
- CCA Class 50 at 55% for computer equipment — **correct** per CRA
- CCA Class 8 at 20% — correct
- CCA Class 1 at 4% (10% for manufacturing) — correct
- No PST in Alberta — correct
- AIIP 1.5x first-year multiplier — correct

### Issues Found

| # | Section | Current Value | Issue | Severity |
|---|---------|---------------|-------|----------|
| 38 | PropertyInsurance | "$80M coverage, $240K/yr premium" for 45MW | These are illustrative numbers for a hypothetical 45MW facility. **Must be labeled as "Illustrative Example"** — currently presented as definitive figures. | **NEEDS DISCLAIMER** |
| 39 | LiabilityInsurance | "$5M GL, $5M Cyber, $2M D&O, $150K premium" | Same issue — illustrative for the 45MW case study. Must be labeled. | **NEEDS DISCLAIMER** |
| 40 | OperatingExpense | "$15M electricity, $2M labor" etc. | These are for the 45MW illustrative model. Some have disclaimers, some don't. | **NEEDS DISCLAIMER** |
| 41 | IncentivesCredits | "30% Clean Tech ITC" | The federal Clean Technology ITC is real (Budget 2023). Rate should be verified for current year. | **NEEDS VERIFICATION** |
| 42 | IncentivesCredits | "10% Alberta AITC" | Alberta Innovation Tax Credit exists. Rate should be verified. | **NEEDS VERIFICATION** |

---

## Cross-Module Issues

| # | Issue | Affected Modules | Severity |
|---|-------|------------------|----------|
| 43 | Static BTC price ($100K) used in calculators | Modules 2, 8 | **OUTDATED** — BTC is ~$68K today |
| 44 | Static network hashrate (750 EH/s) | Modules 2, 8 | **OUTDATED** — currently ~800-900 EH/s |
| 45 | "Last Reviewed: December 2024" on all pages | Modules 1, 3, others | **OUTDATED** — over a year old |
| 46 | Missing "Illustrative Example" disclaimers on 45MW case study numbers | Modules 7, 8, 11, 12 | **NEEDS DISCLAIMER** |

---

## Summary of Required Fixes

### Critical (Factually Incorrect — fix immediately)
1. **MicroStrategy holdings**: Update from ~528K to **~717K BTC** (as of Feb 2026)
2. **Sustainable energy %**: Update from 48% to **52.4%** (Cambridge 2025 report)
3. **Gold reserves comparison**: Fix "244,000 tons remaining" — this is total mined, not remaining
4. **Ukraine BTC donations**: Clarify this was mixed crypto, not all BTC
5. **Pizza BTC value "over $1 billion"**: At current ~$68K price, it's ~$680M

### High Priority (Outdated data)
6. **Bitcoin circulating supply**: Update "~19.8M" to **~19.9M**
7. **ETF AUM**: Update "$120B+" — recalculate at current BTC price or make dynamic
8. **AESO installed capacity**: Update "~19,500 MW" to latest figure
9. **All "Last Reviewed" dates**: Update from "December 2024"
10. **Calculator defaults**: Add clear "Illustrative defaults" labels for static BTC price and hashrate, or connect to live data hooks (which already exist in the codebase via `useBitcoinNetworkStats`)

### Medium Priority (Needs disclaimers)
11. Add "Illustrative Example — 45MW Reference Facility" badges to all Taxes & Insurance sections with specific dollar amounts
12. Add "Estimates as of [date]" labels on hardware prices
13. Add source citations for energy mix percentages
14. Verify Mike Law AESO quote attribution

### Low Priority (Minor inaccuracies)
15. Node count "15,000+" → "17,000-20,000+"
16. Contributors "800+" → "900+"
17. Bitcoin holders "560M+" — add "estimated" qualifier
18. Optimal electricity rate "5-8¢" → "3-7¢" post-halving

---

## Implementation Approach

### Phase 1 — Data corrections (highest impact)
- Update `GlobalBitcoinAdoptionSection.tsx`: MicroStrategy BTC, sustainable energy %, gold comparison, Ukraine, ETF data, pizza value
- Update `MiningSustainabilitySection.tsx`: renewable % and energy breakdown
- Update `BitcoinEconomicsSection.tsx`: circulating supply
- Update `WhatIsBitcoinSection.tsx`: node count, contributor count, gold comparison

### Phase 2 — Disclaimer system
- Add `DataQualityBadge` (already exists in codebase) with "Illustrative Example" variant to all 45MW case study figures in Taxes & Insurance module
- Add "Estimates as of Q1 2026" labels to hardware prices
- Add clear "Illustrative defaults — adjust sliders for your scenario" labels on calculators using static BTC/hashrate values

### Phase 3 — Dynamic data integration
- Wire calculators in `MiningHardwareShowcaseSection` and `DatacenterEconomicsSection` to use `useBitcoinNetworkStats()` hook (already available) instead of static `$100K / 750 EH/s`
- Update all `LastReviewed` dates to "March 2026"

### Phase 4 — Source verification
- Verify AESO Mike Law quote
- Verify $2.3B transmission cost allocation
- Verify Clean Tech ITC and Alberta AITC rates for 2026
- Add source footnotes where missing

**Estimated scope**: ~6-8 files modified, no new components needed. Most fixes are data value updates and adding existing `DataQualityBadge` components.

