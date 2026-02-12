

# Fix Energy Cost Calculation with Fixed Price Contract

## Problem

When a fixed energy price is set (e.g., $52/MWh), the model still uses actual pool prices ($60-100+/MWh) to calculate energy costs, resulting in a 7c+/kWh rate. A fixed-price contract means the facility pays the contract rate, not the pool rate -- so energy cost should be capped at the fixed price.

Additionally, with a fixed energy price, price-based curtailment is pointless (you pay $52/MWh regardless of pool price), so the entire downtime budget should go to 12CP avoidance.

## Current Bug (Line 300 in `usePowerModelCalculator.ts`)

```
poolEnergyTotal += rec.poolPrice * mwh;  // WRONG when fixed price is set
```

This always uses the actual pool price. With a $52/MWh contract and 45MW running 700+ hours/month, this should be $52 x 45 = $2,340/hour, not $80+ x 45 = $3,600+/hour.

## Changes to `src/hooks/usePowerModelCalculator.ts`

### 1. Fix Pool Energy Calculation (Critical)

When `fixedPriceCAD > 0`, use the fixed price instead of pool price for the energy cost:

```typescript
// Line 300 area - change to:
const effectivePrice = params.fixedPriceCAD > 0 ? params.fixedPriceCAD : rec.poolPrice;
poolEnergyTotal += effectivePrice * mwh;
```

This directly caps the energy component at $52/MWh (or whatever the user sets).

### 2. Fix Operating Reserve Calculation

Operating reserve (12.5% surcharge) should also be based on the effective price, not the raw pool price. With a fixed contract at $52/MWh, OR = 12.5% x $52 = $6.50/MWh, not 12.5% x $80+ = $10+/MWh.

### 3. Fix Curtailment Logic for Fixed Price Mode

When `fixedPriceCAD > 0`, price-based curtailment saves nothing (you pay $52 whether pool is $200 or $30). The downtime budget should go 100% to 12CP avoidance:

- Skip the price-curtailment step entirely
- Allocate all `maxDowntimeHours` to 12CP avoidance
- The `cost-optimized` strategy becomes equivalent to `12cp-priority` (since price spikes don't cost extra)

### 4. Fix Breakeven Calculation

With a fixed price, the "breakeven pool price" concept changes. The breakeven becomes: the fixed price minus marginal costs, which is a static value. Update the breakeven display to show the effective rate rather than a meaningless pool-price breakeven.

### 5. Fix Curtailment Savings Calculation  

The existing savings formula `(poolPrice - fixedPrice) * cap` is correct conceptually -- it shows what the facility would have paid at pool vs. what they actually pay. But since the facility pays $0 during curtailed hours (not running), the savings should be: `fixedPrice * cap` (the cost avoided by not running) if the purpose is "money saved by shutting down", or kept as-is if the purpose is "pool exposure avoided."

The correct interpretation: during curtailment, the facility avoids paying the fixed contract price. So curtailment savings = `fixedPriceCAD * cap` per curtailed hour (you don't consume, so you don't pay).

## Math Verification (45MW, $52/MWh fixed, 95% uptime)

**Energy cost per running hour:** $52 x 45MW = $2,340/hr

**Monthly (730 hrs, 95% = 693 running):**
- Pool Energy: 693 x $2,340 = $1,619,820
- Operating Reserve (12.5%): $202,478
- Bulk Metered Energy ($1.23/MWh): 693 x 45 x $1.23 = $38,360
- Regional Metered Energy ($0.93/MWh): 693 x 45 x $0.93 = $29,014
- All other DTS/Fortis charges: ~$750k fixed
- Total monthly: ~$2.6M
- Per kWh: ~$2.6M / (693 x 45,000 kWh) = ~8.3c/kWh

At $52/MWh the energy component alone is 5.2c/kWh. With transmission, distribution, and DTS charges added, the all-in rate will be higher than 5.2c but significantly lower than the current 7c+ because the pool price spikes are eliminated.

## Expected Result

With $52/MWh fixed price:
- Energy component: ~5.2c/kWh (down from 6-8c variable)
- All-in rate: ~6-7c/kWh (down from 7c+) depending on demand charges
- All downtime hours focused on 12CP avoidance for maximum transmission savings

## Files to Modify

1. `src/hooks/usePowerModelCalculator.ts` -- Fix energy cost calc, curtailment logic, and breakeven for fixed price mode

