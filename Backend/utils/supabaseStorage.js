import supabase from '../config/supabase.js'; 

/**
 * Supabase Storage mein file upload karne aur uska temporary secure link mangwane ka function
 * Is pattern ko 'Pre-signed URL Delivery' kehte hain.
 */
export const uploadFileToSupabase = async (file, bucketName = 'connecthub-media') => {
  try {
    // Unique file name banana taake files overwrite na hon (Timestamp + Original Name)
    const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

    // 1. File ko Supabase Storage Bucket mein upload karna (using file buffer from Multer)
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Supabase Upload Error: ${uploadError.message}`);
    }

    // 2. Security Optimization: Public link ke bajaye Signed URL (jo 1 ghante mein expire ho jaye) generate karna
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(data.path, 3600); // 3600 seconds = 1 Hour valid link

    if (urlError) {
      throw new Error(`Supabase Signed URL Error: ${urlError.message}`);
    }

    // Return the secure temporary access URL
    return {
      success: true,
      filePath: data.path,
      url: signedUrlData.signedUrl
    };

  } catch (error) {
    console.error('❌ Storage Service Failed:', error.message);
    return { success: false, error: error.message };
  }
};
