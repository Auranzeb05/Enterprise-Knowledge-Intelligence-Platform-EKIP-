import {
  supabaseAdmin,
} from "./supabaseAdmin.js";

const DOCUMENTS_BUCKET =
  process.env.SUPABASE_DOCUMENTS_BUCKET ||
  "documents";

const SIGNED_URL_EXPIRES_IN_SECONDS =
  60 * 10;

export async function uploadDocumentFile(
  buffer: Buffer,
  storagePath: string,
  mimeType: string
) {
  const {
    data,
    error,
  } =
    await supabaseAdmin.storage
      .from(
        DOCUMENTS_BUCKET
      )
      .upload(
        storagePath,
        buffer,
        {
          contentType:
            mimeType,
          upsert: false,
        }
      );

  if (error) {
    throw new Error(
      `Supabase document upload failed: ${error.message}`
    );
  }

  return data;
}

export async function createDocumentSignedUrl(
  storagePath: string
) {
  const {
    data,
    error,
  } =
    await supabaseAdmin.storage
      .from(
        DOCUMENTS_BUCKET
      )
      .createSignedUrl(
        storagePath,
        SIGNED_URL_EXPIRES_IN_SECONDS
      );

  if (error) {
    throw new Error(
      `Supabase signed URL creation failed: ${error.message}`
    );
  }

  if (
    !data?.signedUrl
  ) {
    throw new Error(
      "Supabase did not return a signed document URL"
    );
  }

  return data.signedUrl;
}

export async function deleteDocumentFile(
  storagePath: string
) {
  const {
    error,
  } =
    await supabaseAdmin.storage
      .from(
        DOCUMENTS_BUCKET
      )
      .remove([
        storagePath,
      ]);

  if (error) {
    throw new Error(
      `Supabase document deletion failed: ${error.message}`
    );
  }
}