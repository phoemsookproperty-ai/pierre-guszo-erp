import { createClient } from '@/lib/supabase/client';

/**
 * Uploads a file to a private Supabase Storage bucket.
 * Bucket name defaults to 'customer-attachments'.
 */
export async function uploadPrivateFile(
  file: File,
  folderPath: string,
  bucketName = 'customer-attachments'
) {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `${folderPath}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;
  return data.path; // Return the storage path
}

/**
 * Generates a temporary secure signed URL to retrieve private images.
 * Defaults to 3600 seconds (1 hour).
 */
export async function getPrivateFileSignedUrl(
  filePath: string,
  expiresInSeconds = 3600,
  bucketName = 'customer-attachments'
) {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, expiresInSeconds);

  if (error) throw error;
  return data.signedUrl;
}

/**
 * Simple image compression helper.
 * Compresses an image file using HTML Canvas.
 */
export async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      resolve(file); // Non-images bypass compression
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas compilation failed'));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
