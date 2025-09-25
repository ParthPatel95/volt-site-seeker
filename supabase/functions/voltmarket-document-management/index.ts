import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DocumentUploadRequest {
  filename: string
  contentType: string
  listingId?: string
  documentType: 'financial' | 'legal' | 'technical' | 'marketing' | 'due_diligence' | 'other'
  accessLevel: 'public' | 'registered' | 'verified' | 'private'
  isConfidential: boolean
}

interface DocumentPermissionRequest {
  documentId: string
  userId: string
  permissionType: 'view' | 'download' | 'edit' | 'admin'
  expiresAt?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
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

    // Set auth context for RLS
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      throw new Error('Invalid auth token')
    }

    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    switch (req.method) {
      case 'POST':
        if (path === 'upload') {
          return await handleDocumentUpload(req, supabase, user.id)
        } else if (path === 'permissions') {
          return await handleDocumentPermissions(req, supabase, user.id)
        }
        break

      case 'GET':
        if (path === 'list') {
          return await handleListDocuments(req, supabase, user.id)
        } else if (path && path !== 'voltmarket-document-management') {
          return await handleDownloadDocument(path, supabase, user.id)
        }
        break

      case 'DELETE':
        if (path && path !== 'voltmarket-document-management') {
          return await handleDeleteDocument(path, supabase, user.id)
        }
        break
    }

    return new Response('Not found', { status: 404, headers: corsHeaders })

  } catch (error) {
    console.error('Document management error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleDocumentUpload(req: Request, supabase: any, userId: string) {
  const uploadData: DocumentUploadRequest = await req.json()
  
  // Generate unique filename
  const timestamp = Date.now()
  const randomId = crypto.randomUUID().split('-')[0]
  const fileExtension = uploadData.filename.split('.').pop()
  const uniqueFilename = `${timestamp}-${randomId}.${fileExtension}`
  const filePath = `documents/${userId}/${uniqueFilename}`

  // Create signed URL for upload
  const { data: signedUrl, error: urlError } = await supabase
    .storage
    .from('documents')
    .createSignedUploadUrl(filePath)

  if (urlError) {
    throw new Error(`Failed to create upload URL: ${urlError.message}`)
  }

  // Store document metadata
  const { data: document, error: docError } = await supabase
    .from('voltmarket_documents')
    .insert({
      listing_id: uploadData.listingId,
      uploader_id: userId,
      filename: uniqueFilename,
      original_filename: uploadData.filename,
      file_path: filePath,
      file_size: 0, // Will be updated after upload
      mime_type: uploadData.contentType,
      document_type: uploadData.documentType,
      is_confidential: uploadData.isConfidential,
      access_level: uploadData.accessLevel
    })
    .select()
    .single()

  if (docError) {
    throw new Error(`Failed to create document record: ${docError.message}`)
  }

  return new Response(
    JSON.stringify({
      document,
      uploadUrl: signedUrl.signedUrl,
      token: signedUrl.token
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleDocumentPermissions(req: Request, supabase: any, userId: string) {
  const permissionData: DocumentPermissionRequest = await req.json()

  // Verify user owns the document
  const { data: document, error: docError } = await supabase
    .from('voltmarket_documents')
    .select('uploader_id')
    .eq('id', permissionData.documentId)
    .single()

  if (docError || document.uploader_id !== userId) {
    throw new Error('Document not found or access denied')
  }

  // Create or update permission
  const { data: permission, error: permError } = await supabase
    .from('voltmarket_document_permissions')
    .upsert({
      document_id: permissionData.documentId,
      user_id: permissionData.userId,
      permission_type: permissionData.permissionType,
      granted_by: userId,
      expires_at: permissionData.expiresAt
    })
    .select()
    .single()

  if (permError) {
    throw new Error(`Failed to create permission: ${permError.message}`)
  }

  return new Response(
    JSON.stringify({ permission }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleListDocuments(req: Request, supabase: any, userId: string) {
  const url = new URL(req.url)
  const listingId = url.searchParams.get('listingId')
  const documentType = url.searchParams.get('documentType')

  let query = supabase
    .from('voltmarket_documents')
    .select(`
      *,
      permissions:voltmarket_document_permissions(*)
    `)

  if (listingId) {
    query = query.eq('listing_id', listingId)
  }

  if (documentType) {
    query = query.eq('document_type', documentType)
  }

  const { data: documents, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch documents: ${error.message}`)
  }

  return new Response(
    JSON.stringify({ documents }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleDownloadDocument(documentId: string, supabase: any, userId: string) {
  // Check if user has access to document
  const { data: document, error: docError } = await supabase
    .from('voltmarket_documents')
    .select(`
      *,
      permissions:voltmarket_document_permissions!inner(permission_type)
    `)
    .eq('id', documentId)
    .or(`uploader_id.eq.${userId},permissions.user_id.eq.${userId}`)
    .single()

  if (docError) {
    throw new Error('Document not found or access denied')
  }

  // Create signed download URL
  const { data: signedUrl, error: urlError } = await supabase
    .storage
    .from('documents')
    .createSignedUrl(document.file_path, 3600) // 1 hour expiry

  if (urlError) {
    throw new Error(`Failed to create download URL: ${urlError.message}`)
  }

  return new Response(
    JSON.stringify({ 
      downloadUrl: signedUrl.signedUrl,
      document 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleDeleteDocument(documentId: string, supabase: any, userId: string) {
  // Verify ownership
  const { data: document, error: docError } = await supabase
    .from('voltmarket_documents')
    .select('uploader_id, file_path')
    .eq('id', documentId)
    .eq('uploader_id', userId)
    .single()

  if (docError) {
    throw new Error('Document not found or access denied')
  }

  // Delete from storage
  const { error: storageError } = await supabase
    .storage
    .from('documents')
    .remove([document.file_path])

  if (storageError) {
    console.error('Storage deletion error:', storageError)
  }

  // Delete database record
  const { error: deleteError } = await supabase
    .from('voltmarket_documents')
    .delete()
    .eq('id', documentId)

  if (deleteError) {
    throw new Error(`Failed to delete document: ${deleteError.message}`)
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}