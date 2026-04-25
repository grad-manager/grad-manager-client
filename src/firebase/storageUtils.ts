// We no longer need any Firebase imports here!

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary environment variables are missing. Check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.');
}

/**
 * Uploads a file to Cloudinary using an unsigned upload preset.
 * * @param file The File object (e.g., imageFile).
 * @param userId The current user's UID (used as a tag/public ID prefix).
 * @returns A Promise resolving to the public download URL string (Cloudinary secure URL).
 */
export const uploadFile = async (file: File, userId: string): Promise<string> => {
    // Cloudinary's recommended way to handle file uploads
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    // Optional: Use the userId to ensure the public ID is unique and traceable
    // e.g., "grad-app-profiles/lIQzzcngW0NmcsQvNhmEe0hpODM2"
    formData.append('public_id', userId); 
    
    // Optional: Add a folder specified in the upload preset
    // If you set a folder in the preset, you don't need to specify it here.
    
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    try {
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            // Cloudinary provides error details in the response body
            const errorData = await response.json();
            throw new Error(`Cloudinary upload failed: ${errorData.error.message || 'Unknown error'}`);
        }

        const data = await response.json();
        
        // The URL we need to store in Firestore is the 'secure_url'
        return data.secure_url;

    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        // Rethrow a generic error so the Signup component can handle it
        throw new Error('Failed to upload profile picture to Cloudinary.');
    }
};