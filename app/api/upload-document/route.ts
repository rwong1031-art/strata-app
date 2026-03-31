import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Default MIME types accepted by the upload endpoint.
const defaultAllowedTypes = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

// Allow additional MIME types from environment variable for extensions.
const allowedTypes = new Set<string>([
  ...defaultAllowedTypes,
  ...(process.env.UPLOAD_ALLOWED_MIME_TYPES
    ? process.env.UPLOAD_ALLOWED_MIME_TYPES.split(',').map((t) => t.trim()).filter(Boolean)
    : []),
])

// String version of allowed types for error reporting.
const allowedTypesList = Array.from(allowedTypes).join(', ')

/**
 * POST /api/upload-document
 *
 * Expected formData fields:
 * - file: File (required)
 * - strataId: string (required)
 * - uploadedBy: string (optional)
 * - documentType: string (optional, for category metadata)
 *
 * Description:
 * 1. Validate request fields.
 * 2. Check MIME type allow list.
 * 3. Upload file to Supabase storage bucket.
 * 4. Store document metadata in `documents` table.
 * 5. Roll back uploaded file if metadata insert fails.
 * 6. Return success JSON with inserted row.
 */
export async function POST(request: Request) {
  try {
    // Parse incoming multipart/form-data
    const formData = await request.formData()
    const file = formData.get('file')

    // Validate a file was included in the request.
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file MIME type against allow list.
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported MIME type: ${file.type}`,
          allowedTypes: allowedTypesList,
        },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing Supabase server environment variables' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Convert uploaded File to a Buffer for Supabase storage upload.
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = `uploads/${Date.now()}-${file.name}`

    // Save file to the configured Supabase storage bucket.
    const { data, error } = await supabase.storage
      .from('strata-documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      // Storage upload failed; report and stop.
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      )
    }

    // Required `strataId` field used for document association.
    const strataId = formData.get('strataId')
    if (!strataId || typeof strataId !== 'string') {
      return NextResponse.json(
        { error: 'Missing strataId' },
        { status: 400 }
      )
    }

    // Optional uploader name, stored if present.
    const uploadedBy = formData.get('uploadedBy')
    const uploadedByValue =
      typeof uploadedBy === 'string' && uploadedBy.length > 0
        ? uploadedBy
        : null

    // Create metadata record that links uploaded object to strata.
    const { data: docRow, error: dbError } = await supabase
      .from('documents')
      .insert({
        strata_id: strataId,
        file_name: file.name,
        storage_path: data.path,
        mime_type: file.type || null,
        uploaded_by: uploadedByValue,
        status: 'uploaded',
      })
      .select()
      .single()

    if (dbError) {
      // clean up uploaded file if DB insert fails
      await supabase.storage.from('strata-documents').remove([filePath])

      // Return detailed DB error for easier debug.
      return NextResponse.json(
        {
          error: dbError.message,
          details: dbError,
          uploaded: true,
          storagePath: data.path,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, document: docRow }, { status: 200 })
  } catch (error) {
    console.error('Upload route crashed:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}