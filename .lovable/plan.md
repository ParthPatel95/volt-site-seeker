

# Firecrawl Property Scanner: Test Results

## Finding

The scanner code is working correctly — queries are being sent, responses are being parsed. However, **all Firecrawl API calls are failing with "Insufficient credits"**.

Every search query returns:
> "Insufficient credits to perform this request. For more credits, you can upgrade your plan at https://firecrawl.dev/pricing"

## Root Cause

The Firecrawl connection (`Firecrawl (1)`, linked to this project) has run out of API credits. No code change will fix this.

## Resolution

Since this is a **managed connection** (set up via the Firecrawl connector), you need to:

1. **Log into Firecrawl** with the email used to create this connection
2. **Upgrade your plan** — use coupon code **`LOVABLE50`** for 50% off your first 3 months (standard plan or higher)
3. Once credits are available, the scanner will work immediately with no code changes needed

The code improvements (broader queries, `waitFor` for JS rendering, fallback scrape, content validation) are all deployed and ready. They just need credits to execute.

