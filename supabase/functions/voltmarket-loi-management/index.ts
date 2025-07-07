import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LOIRequest {
  listingId: string
  sellerId: string
  offerAmount: number
  earnestMoney?: number
  closingTimelineDays?: number
  contingencies?: string[]
  termsAndConditions?: string
  message?: string
  expiresAt?: string
}

interface LOIResponse {
  loiId: string
  status: 'accepted' | 'rejected' | 'counter_offered'
  responseMessage?: string
  counterOfferAmount?: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      throw new Error('Invalid auth token')
    }

    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const action = pathSegments[pathSegments.length - 1]

    switch (req.method) {
      case 'GET':
        if (action === 'list') {
          return await handleListLOIs(req, supabase, user.id)
        } else if (pathSegments.includes('loi')) {
          const loiId = pathSegments[pathSegments.length - 1]
          return await handleGetLOI(loiId, supabase, user.id)
        }
        break

      case 'POST':
        if (action === 'create') {
          return await handleCreateLOI(req, supabase, user.id)
        } else if (action === 'respond') {
          return await handleRespondToLOI(req, supabase, user.id)
        } else if (action === 'generate-template') {
          return await handleGenerateLOITemplate(req, supabase, user.id)
        }
        break

      case 'PUT':
        if (pathSegments.includes('loi')) {
          const loiId = pathSegments[pathSegments.length - 1]
          return await handleUpdateLOI(loiId, req, supabase, user.id)
        }
        break

      case 'DELETE':
        if (pathSegments.includes('loi')) {
          const loiId = pathSegments[pathSegments.length - 1]
          return await handleWithdrawLOI(loiId, supabase, user.id)
        }
        break
    }

    return new Response('Not found', { status: 404, headers: corsHeaders })

  } catch (error) {
    console.error('LOI management error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleCreateLOI(req: Request, supabase: any, userId: string) {
  const loiData: LOIRequest = await req.json()

  // Verify listing exists and get seller info
  const { data: listing, error: listingError } = await supabase
    .from('voltmarket_listings')
    .select('id, created_by, title, asking_price')
    .eq('id', loiData.listingId)
    .single()

  if (listingError) {
    throw new Error('Listing not found')
  }

  if (listing.created_by === userId) {
    throw new Error('Cannot submit LOI for your own listing')
  }

  // Create LOI
  const { data: loi, error: loiError } = await supabase
    .from('voltmarket_lois')
    .insert({
      listing_id: loiData.listingId,
      buyer_id: userId,
      seller_id: listing.created_by,
      offer_amount: loiData.offerAmount,
      earnest_money: loiData.earnestMoney,
      closing_timeline_days: loiData.closingTimelineDays,
      contingencies: loiData.contingencies,
      terms_and_conditions: loiData.termsAndConditions,
      message: loiData.message,
      expires_at: loiData.expiresAt
    })
    .select()
    .single()

  if (loiError) {
    throw new Error(`Failed to create LOI: ${loiError.message}`)
  }

  // Create notification for seller
  await supabase
    .from('voltmarket_notifications')
    .insert({
      user_id: listing.created_by,
      type: 'loi_received',
      title: 'New Letter of Intent Received',
      message: `You have received a LOI for ${listing.title} with an offer of $${loiData.offerAmount.toLocaleString()}`,
      data: {
        loi_id: loi.id,
        listing_id: loiData.listingId,
        offer_amount: loiData.offerAmount
      }
    })

  // Start background process to send email notification
  EdgeRuntime.waitUntil(sendLOINotificationEmail(supabase, listing.created_by, loi, listing))

  return new Response(
    JSON.stringify({ 
      loi,
      message: 'LOI submitted successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleRespondToLOI(req: Request, supabase: any, userId: string) {
  const responseData: LOIResponse = await req.json()

  // Verify LOI exists and user is the seller
  const { data: loi, error: loiError } = await supabase
    .from('voltmarket_lois')
    .select(`
      *,
      listing:voltmarket_listings(title, created_by),
      buyer:voltmarket_profiles!buyer_id(company_name)
    `)
    .eq('id', responseData.loiId)
    .eq('seller_id', userId)
    .single()

  if (loiError) {
    throw new Error('LOI not found or access denied')
  }

  if (loi.status !== 'pending') {
    throw new Error('LOI has already been responded to')
  }

  // Update LOI with response
  const { data: updatedLoi, error: updateError } = await supabase
    .from('voltmarket_lois')
    .update({
      status: responseData.status,
      response_message: responseData.responseMessage,
      counter_offer_amount: responseData.counterOfferAmount,
      responded_at: new Date().toISOString()
    })
    .eq('id', responseData.loiId)
    .select()
    .single()

  if (updateError) {
    throw new Error(`Failed to update LOI: ${updateError.message}`)
  }

  // Create notification for buyer
  const notificationMessage = getResponseNotificationMessage(responseData.status, responseData.counterOfferAmount)
  
  await supabase
    .from('voltmarket_notifications')
    .insert({
      user_id: loi.buyer_id,
      type: 'loi_response',
      title: 'LOI Response Received',
      message: notificationMessage,
      data: {
        loi_id: loi.id,
        listing_id: loi.listing_id,
        status: responseData.status,
        counter_offer_amount: responseData.counterOfferAmount
      }
    })

  // Start background process to send email notification
  EdgeRuntime.waitUntil(sendLOIResponseNotificationEmail(supabase, loi.buyer_id, updatedLoi, loi.listing))

  return new Response(
    JSON.stringify({ 
      loi: updatedLoi,
      message: 'Response sent successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleListLOIs(req: Request, supabase: any, userId: string) {
  const url = new URL(req.url)
  const type = url.searchParams.get('type') || 'all' // 'sent', 'received', 'all'

  let query = supabase
    .from('voltmarket_lois')
    .select(`
      *,
      listing:voltmarket_listings(
        id, title, asking_price, location, power_capacity_mw,
        images:voltmarket_listing_images(image_url)
      ),
      buyer_profile:voltmarket_profiles!buyer_id(company_name, profile_image_url),
      seller_profile:voltmarket_profiles!seller_id(company_name, profile_image_url)
    `)

  if (type === 'sent') {
    query = query.eq('buyer_id', userId)
  } else if (type === 'received') {
    query = query.eq('seller_id', userId)
  } else {
    query = query.or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
  }

  const { data: lois, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch LOIs: ${error.message}`)
  }

  return new Response(
    JSON.stringify({ lois }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetLOI(loiId: string, supabase: any, userId: string) {
  const { data: loi, error } = await supabase
    .from('voltmarket_lois')
    .select(`
      *,
      listing:voltmarket_listings(*),
      buyer_profile:voltmarket_profiles!buyer_id(*),
      seller_profile:voltmarket_profiles!seller_id(*),
      documents:voltmarket_loi_documents(*)
    `)
    .eq('id', loiId)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .single()

  if (error) {
    throw new Error('LOI not found or access denied')
  }

  return new Response(
    JSON.stringify({ loi }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGenerateLOITemplate(req: Request, supabase: any, userId: string) {
  const { listingId, offerAmount, contingencies } = await req.json()

  // Get listing details
  const { data: listing, error: listingError } = await supabase
    .from('voltmarket_listings')
    .select('*')
    .eq('id', listingId)
    .single()

  if (listingError) {
    throw new Error('Listing not found')
  }

  // Get buyer profile
  const { data: buyerProfile, error: profileError } = await supabase
    .from('voltmarket_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (profileError) {
    throw new Error('Buyer profile not found')
  }

  // Generate LOI template
  const template = generateLOITemplate(listing, buyerProfile, offerAmount, contingencies)

  return new Response(
    JSON.stringify({ template }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function generateLOITemplate(listing: any, buyer: any, offerAmount: number, contingencies: string[]) {
  const currentDate = new Date().toLocaleDateString()
  const expirationDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()

  return `
LETTER OF INTENT

Date: ${currentDate}

TO: ${listing.seller_company || 'Property Owner'}
RE: ${listing.title}
    ${listing.location}

FROM: ${buyer.company_name}

Dear Property Owner,

This Letter of Intent ("LOI") outlines the principal terms and conditions under which ${buyer.company_name} ("Buyer") is prepared to purchase the above-referenced property ("Property") from you ("Seller").

PRINCIPAL TERMS:

1. PURCHASE PRICE: $${offerAmount.toLocaleString()} USD

2. EARNEST MONEY: $${Math.min(offerAmount * 0.02, 100000).toLocaleString()} USD to be deposited within 5 business days of execution of definitive purchase agreement.

3. CONTINGENCIES:
${contingencies.map(c => `   - ${c}`).join('\n')}

4. CLOSING: Approximately 60-90 days from execution of definitive purchase agreement.

5. DUE DILIGENCE PERIOD: 45 days from execution of definitive purchase agreement.

6. EXPIRATION: This LOI expires at 5:00 PM on ${expirationDate}.

This LOI is non-binding except for the confidentiality and exclusivity provisions below. The parties intend to execute a definitive purchase agreement containing customary terms and conditions for transactions of this type.

CONFIDENTIALITY: All information exchanged in connection with this transaction shall be kept confidential.

EXCLUSIVITY: Seller agrees not to negotiate with any other potential buyers for a period of 30 days from acceptance of this LOI.

If these terms are acceptable, please sign and return this LOI.

Sincerely,

${buyer.company_name}

ACCEPTED:

_________________________    Date: __________
Seller

_________________________    Date: __________
Buyer: ${buyer.company_name}
`.trim()
}

function getResponseNotificationMessage(status: string, counterOfferAmount?: number) {
  switch (status) {
    case 'accepted':
      return 'Your LOI has been accepted! Next steps will be communicated shortly.'
    case 'rejected':
      return 'Your LOI has been declined. Thank you for your interest.'
    case 'counter_offered':
      return `A counter offer has been made${counterOfferAmount ? ` for $${counterOfferAmount.toLocaleString()}` : ''}. Please review the details.`
    default:
      return 'Your LOI has been reviewed.'
  }
}

async function sendLOINotificationEmail(supabase: any, userId: string, loi: any, listing: any) {
  try {
    // Get user's profile for email
    const { data: profile } = await supabase
      .from('voltmarket_profiles')
      .select('email, company_name')
      .eq('user_id', userId)
      .single()

    if (!profile?.email) return

    // Call email service
    await supabase.functions.invoke('send-email', {
      body: {
        to: profile.email,
        subject: 'New LOI Received - VoltMarket',
        template: 'loi_received',
        data: {
          recipientName: profile.company_name,
          listingTitle: listing.title,
          offerAmount: loi.offer_amount,
          loiId: loi.id
        }
      }
    })
  } catch (error) {
    console.error('Failed to send LOI notification email:', error)
  }
}

async function sendLOIResponseNotificationEmail(supabase: any, userId: string, loi: any, listing: any) {
  try {
    const { data: profile } = await supabase
      .from('voltmarket_profiles')
      .select('email, company_name')
      .eq('user_id', userId)
      .single()

    if (!profile?.email) return

    await supabase.functions.invoke('send-email', {
      body: {
        to: profile.email,
        subject: 'LOI Response Received - VoltMarket',
        template: 'loi_response',
        data: {
          recipientName: profile.company_name,
          listingTitle: listing.title,
          status: loi.status,
          responseMessage: loi.response_message,
          counterOfferAmount: loi.counter_offer_amount
        }
      }
    })
  } catch (error) {
    console.error('Failed to send LOI response notification email:', error)
  }
}

async function handleUpdateLOI(loiId: string, req: Request, supabase: any, userId: string) {
  const updateData = await req.json()

  // Only buyer can update pending LOIs
  const { data: loi, error } = await supabase
    .from('voltmarket_lois')
    .update(updateData)
    .eq('id', loiId)
    .eq('buyer_id', userId)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update LOI: ${error.message}`)
  }

  return new Response(
    JSON.stringify({ loi }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleWithdrawLOI(loiId: string, supabase: any, userId: string) {
  const { data: loi, error } = await supabase
    .from('voltmarket_lois')
    .update({ status: 'withdrawn' })
    .eq('id', loiId)
    .eq('buyer_id', userId)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to withdraw LOI: ${error.message}`)
  }

  return new Response(
    JSON.stringify({ loi, message: 'LOI withdrawn successfully' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}