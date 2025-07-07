import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerificationRequest {
  verificationType: 'identity' | 'company' | 'financial' | 'accredited_investor'
  submissionData: Record<string, any>
  documents?: Array<{
    documentType: string
    filename: string
    contentType: string
  }>
}

interface VerificationReview {
  verificationId: string
  status: 'approved' | 'rejected'
  reviewerNotes?: string
  expiresAt?: string
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
        if (action === 'status') {
          return await handleGetVerificationStatus(supabase, user.id)
        } else if (action === 'requirements') {
          const type = url.searchParams.get('type')
          return await handleGetVerificationRequirements(type)
        } else if (action === 'pending') {
          return await handleGetPendingVerifications(supabase, user.id)
        }
        break

      case 'POST':
        if (action === 'submit') {
          return await handleSubmitVerification(req, supabase, user.id)
        } else if (action === 'review') {
          return await handleReviewVerification(req, supabase, user.id)
        } else if (action === 'upload-document') {
          return await handleUploadVerificationDocument(req, supabase, user.id)
        }
        break

      case 'PUT':
        if (pathSegments.includes('verification')) {
          const verificationId = pathSegments[pathSegments.length - 1]
          return await handleUpdateVerification(verificationId, req, supabase, user.id)
        }
        break
    }

    return new Response('Not found', { status: 404, headers: corsHeaders })

  } catch (error) {
    console.error('Verification system error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleSubmitVerification(req: Request, supabase: any, userId: string) {
  const verificationData: VerificationRequest = await req.json()

  // Check if user already has pending/approved verification of this type
  const { data: existingVerification } = await supabase
    .from('voltmarket_verifications')
    .select('id, status')
    .eq('user_id', userId)
    .eq('verification_type', verificationData.verificationType)
    .in('status', ['pending', 'in_review', 'approved'])
    .single()

  if (existingVerification) {
    if (existingVerification.status === 'approved') {
      throw new Error('You already have an approved verification of this type')
    } else {
      throw new Error('You already have a pending verification of this type')
    }
  }

  // Validate submission data based on verification type
  const validationResult = validateVerificationData(verificationData.verificationType, verificationData.submissionData)
  if (!validationResult.valid) {
    throw new Error(`Invalid submission data: ${validationResult.errors.join(', ')}`)
  }

  // Create verification record
  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1) // Verifications expire after 1 year

  const { data: verification, error: verificationError } = await supabase
    .from('voltmarket_verifications')
    .insert({
      user_id: userId,
      verification_type: verificationData.verificationType,
      submission_data: verificationData.submissionData,
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single()

  if (verificationError) {
    throw new Error(`Failed to create verification: ${verificationError.message}`)
  }

  // Create upload URLs for documents if provided
  let documentUploadUrls = []
  if (verificationData.documents && verificationData.documents.length > 0) {
    for (const doc of verificationData.documents) {
      const filename = `verification-${verification.id}-${Date.now()}-${doc.filename}`
      const filePath = `verifications/${userId}/${filename}`

      const { data: uploadUrl, error: uploadError } = await supabase
        .storage
        .from('documents')
        .createSignedUploadUrl(filePath)

      if (!uploadError) {
        documentUploadUrls.push({
          documentType: doc.documentType,
          filename: doc.filename,
          uploadUrl: uploadUrl.signedUrl,
          filePath
        })

        // Create document record
        await supabase
          .from('voltmarket_verification_documents')
          .insert({
            verification_id: verification.id,
            document_type: doc.documentType,
            file_path: filePath,
            filename: doc.filename
          })
      }
    }
  }

  // Create notification for admins
  await createAdminNotification(supabase, verification)

  return new Response(
    JSON.stringify({ 
      verification,
      documentUploadUrls,
      message: 'Verification submitted successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetVerificationStatus(supabase: any, userId: string) {
  const { data: verifications, error } = await supabase
    .from('voltmarket_verifications')
    .select(`
      *,
      documents:voltmarket_verification_documents(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch verification status: ${error.message}`)
  }

  // Group by verification type to get latest status
  const verificationStatus = verifications.reduce((acc: any, verification: any) => {
    const type = verification.verification_type
    if (!acc[type] || new Date(verification.created_at) > new Date(acc[type].created_at)) {
      acc[type] = verification
    }
    return acc
  }, {})

  return new Response(
    JSON.stringify({ verificationStatus }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetVerificationRequirements(verificationType: string | null) {
  if (!verificationType) {
    throw new Error('Verification type is required')
  }

  const requirements = getVerificationRequirements(verificationType)

  return new Response(
    JSON.stringify({ requirements }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleReviewVerification(req: Request, supabase: any, reviewerId: string) {
  const reviewData: VerificationReview = await req.json()

  // Check if reviewer is admin (this should be expanded with proper role checking)
  const { data: reviewerProfile } = await supabase
    .from('voltmarket_profiles')
    .select('role')
    .eq('user_id', reviewerId)
    .single()

  if (!reviewerProfile || reviewerProfile.role !== 'admin') {
    throw new Error('Insufficient permissions to review verifications')
  }

  // Update verification
  const { data: verification, error: updateError } = await supabase
    .from('voltmarket_verifications')
    .update({
      status: reviewData.status,
      reviewer_notes: reviewData.reviewerNotes,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      expires_at: reviewData.expiresAt
    })
    .eq('id', reviewData.verificationId)
    .select(`
      *,
      user:voltmarket_profiles!user_id(*)
    `)
    .single()

  if (updateError) {
    throw new Error(`Failed to update verification: ${updateError.message}`)
  }

  // Create notification for user
  await supabase
    .from('voltmarket_notifications')
    .insert({
      user_id: verification.user_id,
      type: 'verification_update',
      title: 'Verification Status Updated',
      message: `Your ${verification.verification_type} verification has been ${reviewData.status}`,
      data: {
        verification_id: verification.id,
        verification_type: verification.verification_type,
        status: reviewData.status
      }
    })

  // Start background process to send email notification
  EdgeRuntime.waitUntil(sendVerificationStatusEmail(supabase, verification))

  return new Response(
    JSON.stringify({ 
      verification,
      message: 'Verification reviewed successfully'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function validateVerificationData(verificationType: string, submissionData: Record<string, any>) {
  const errors = []

  switch (verificationType) {
    case 'identity':
      if (!submissionData.fullName) errors.push('Full name is required')
      if (!submissionData.dateOfBirth) errors.push('Date of birth is required')
      if (!submissionData.idType) errors.push('ID type is required')
      if (!submissionData.idNumber) errors.push('ID number is required')
      break

    case 'company':
      if (!submissionData.companyName) errors.push('Company name is required')
      if (!submissionData.registrationNumber) errors.push('Registration number is required')
      if (!submissionData.jurisdiction) errors.push('Jurisdiction is required')
      if (!submissionData.businessAddress) errors.push('Business address is required')
      break

    case 'financial':
      if (!submissionData.netWorth) errors.push('Net worth is required')
      if (!submissionData.annualIncome) errors.push('Annual income is required')
      if (!submissionData.liquidAssets) errors.push('Liquid assets is required')
      break

    case 'accredited_investor':
      if (!submissionData.accreditationType) errors.push('Accreditation type is required')
      if (!submissionData.certificationDate) errors.push('Certification date is required')
      break

    default:
      errors.push('Invalid verification type')
  }

  return { valid: errors.length === 0, errors }
}

function getVerificationRequirements(verificationType: string) {
  const requirements = {
    identity: {
      title: 'Identity Verification',
      description: 'Verify your identity to access premium features',
      requiredData: [
        'Full legal name',
        'Date of birth',
        'Government-issued ID type',
        'ID number',
        'Current address'
      ],
      requiredDocuments: [
        'Government-issued photo ID (passport, driver\'s license, etc.)',
        'Proof of address (utility bill, bank statement, etc.)'
      ],
      processingTime: '1-3 business days',
      validityPeriod: '1 year'
    },
    company: {
      title: 'Company Verification',
      description: 'Verify your business entity for corporate transactions',
      requiredData: [
        'Legal company name',
        'Registration number',
        'Jurisdiction of incorporation',
        'Business address',
        'Industry type'
      ],
      requiredDocuments: [
        'Certificate of incorporation',
        'Articles of association',
        'Recent company registry extract',
        'Proof of business address'
      ],
      processingTime: '3-5 business days',
      validityPeriod: '1 year'
    },
    financial: {
      title: 'Financial Verification',
      description: 'Verify your financial capacity for large transactions',
      requiredData: [
        'Net worth',
        'Annual income',
        'Liquid assets',
        'Source of funds'
      ],
      requiredDocuments: [
        'Bank statements (last 3 months)',
        'Tax returns (last 2 years)',
        'Investment account statements',
        'Letter from financial advisor/CPA'
      ],
      processingTime: '5-7 business days',
      validityPeriod: '6 months'
    },
    accredited_investor: {
      title: 'Accredited Investor Verification',
      description: 'Verify your accredited investor status for exclusive opportunities',
      requiredData: [
        'Accreditation type',
        'Certification date',
        'Certifying entity',
        'Professional qualifications (if applicable)'
      ],
      requiredDocuments: [
        'Accredited investor certificate',
        'Professional licenses (if applicable)',
        'Financial statements or tax returns',
        'Third-party verification letter'
      ],
      processingTime: '5-10 business days',
      validityPeriod: '1 year'
    }
  }

  return requirements[verificationType as keyof typeof requirements] || null
}

async function createAdminNotification(supabase: any, verification: any) {
  // Get all admin users
  const { data: admins } = await supabase
    .from('voltmarket_profiles')
    .select('user_id')
    .eq('role', 'admin')

  if (admins && admins.length > 0) {
    const notifications = admins.map((admin: any) => ({
      user_id: admin.user_id,
      type: 'verification_update',
      title: 'New Verification Submission',
      message: `A new ${verification.verification_type} verification has been submitted`,
      data: {
        verification_id: verification.id,
        verification_type: verification.verification_type,
        user_id: verification.user_id
      }
    }))

    await supabase
      .from('voltmarket_notifications')
      .insert(notifications)
  }
}

async function sendVerificationStatusEmail(supabase: any, verification: any) {
  try {
    const { data: profile } = await supabase
      .from('voltmarket_profiles')
      .select('email, company_name')
      .eq('user_id', verification.user_id)
      .single()

    if (!profile?.email) return

    await supabase.functions.invoke('send-email', {
      body: {
        to: profile.email,
        subject: 'Verification Status Update - VoltMarket',
        template: 'verification_status',
        data: {
          recipientName: profile.company_name,
          verificationType: verification.verification_type,
          status: verification.status,
          reviewerNotes: verification.reviewer_notes
        }
      }
    })
  } catch (error) {
    console.error('Failed to send verification status email:', error)
  }
}

async function handleGetPendingVerifications(supabase: any, reviewerId: string) {
  // Check if reviewer is admin
  const { data: reviewerProfile } = await supabase
    .from('voltmarket_profiles')
    .select('role')
    .eq('user_id', reviewerId)
    .single()

  if (!reviewerProfile || reviewerProfile.role !== 'admin') {
    throw new Error('Insufficient permissions')
  }

  const { data: verifications, error } = await supabase
    .from('voltmarket_verifications')
    .select(`
      *,
      user:voltmarket_profiles!user_id(*),
      documents:voltmarket_verification_documents(*)
    `)
    .in('status', ['pending', 'in_review'])
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch pending verifications: ${error.message}`)
  }

  return new Response(
    JSON.stringify({ verifications }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUpdateVerification(verificationId: string, req: Request, supabase: any, userId: string) {
  const updateData = await req.json()

  // Only allow users to update their own pending verifications
  const { data: verification, error } = await supabase
    .from('voltmarket_verifications')
    .update(updateData)
    .eq('id', verificationId)
    .eq('user_id', userId)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update verification: ${error.message}`)
  }

  return new Response(
    JSON.stringify({ verification }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUploadVerificationDocument(req: Request, supabase: any, userId: string) {
  const { verificationId, documentType, filename, contentType } = await req.json()

  // Verify user owns the verification
  const { data: verification } = await supabase
    .from('voltmarket_verifications')
    .select('id')
    .eq('id', verificationId)
    .eq('user_id', userId)
    .single()

  if (!verification) {
    throw new Error('Verification not found or access denied')
  }

  // Create upload URL
  const timestamp = Date.now()
  const uniqueFilename = `verification-${verificationId}-${timestamp}-${filename}`
  const filePath = `verifications/${userId}/${uniqueFilename}`

  const { data: uploadUrl, error: uploadError } = await supabase
    .storage
    .from('documents')
    .createSignedUploadUrl(filePath)

  if (uploadError) {
    throw new Error(`Failed to create upload URL: ${uploadError.message}`)
  }

  // Create document record
  const { data: document, error: docError } = await supabase
    .from('voltmarket_verification_documents')
    .insert({
      verification_id: verificationId,
      document_type: documentType,
      file_path: filePath,
      filename: uniqueFilename
    })
    .select()
    .single()

  if (docError) {
    throw new Error(`Failed to create document record: ${docError.message}`)
  }

  return new Response(
    JSON.stringify({
      document,
      uploadUrl: uploadUrl.signedUrl
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}