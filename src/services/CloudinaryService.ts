// src/services/CloudinaryService.ts

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.error("Cloudinary credentials are not set in environment variables.");
}

/**
 * Uploads a file (image/video) to Cloudinary via the REST API.
 * @param file The File object to upload.
 * @param fileType 'image' or 'video' to set the resource type in the URL.
 * @returns The public secure URL of the uploaded file.
 */
export const uploadMedia = async (file: File, fileType: 'image' | 'video'): Promise<string> => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error("Cloudinary setup is incomplete.");
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    // Optional: Add a folder or tags for better organization in Cloudinary
    formData.append('folder', 'grad-app-tracker/posts');
    // formData.append('tags', `user_${userId}, ${fileType}`); 

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${fileType}/upload`;

    try {
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Cloudinary Upload Error:", errorData);
            throw new Error(errorData.error?.message || `Cloudinary upload failed with status ${response.status}`);
        }

        const data = await response.json();
        // Cloudinary returns the secure URL of the asset
        return data.secure_url; 
        
    } catch (error) {
        // Re-throw the error for the consuming hook to handle the failure/rollback
        console.error("Network or parsing error during Cloudinary upload:", error);
        throw new Error("Failed to upload media due to a network error.");
    }
};