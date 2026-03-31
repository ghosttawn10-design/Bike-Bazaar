import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "uploads";

let _client: ReturnType<typeof createClient> | null = null;

function getClient() {
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });
  }
  return _client;
}

export async function ensureBucketExists() {
  const supabase = getClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    await supabase.storage.createBucket(BUCKET, { public: true });
  }
}

export async function uploadToSupabase(
  fileBuffer: Buffer,
  filename: string,
  mimetype: string
): Promise<string> {
  const supabase = getClient();
  await ensureBucketExists();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, fileBuffer, {
      contentType: mimetype,
      upsert: true,
    });

  if (error) throw new Error(`Supabase storage upload failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}
