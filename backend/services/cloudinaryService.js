const cloudinary = require('cloudinary').v2;

const {
    CLOUDINARY_URL,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
} = process.env;

// Configure Cloudinary using either the full URL or individual pieces
if (CLOUDINARY_URL) {
    cloudinary.config({ cloudinary_url: CLOUDINARY_URL });
} else if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: CLOUDINARY_CLOUD_NAME,
        api_key: CLOUDINARY_API_KEY,
        api_secret: CLOUDINARY_API_SECRET,
    });
}

const isConfigured = () => {
    return Boolean(cloudinary.config().cloud_name && cloudinary.config().api_key);
};

const uploadBuffer = (buffer, { folder, filename, ...options } = {}) => {
    if (!isConfigured()) {
        throw new Error('Cloudinary is not configured. Please set CLOUDINARY_URL or cloud name/key/secret.');
    }

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'auto',
                public_id: filename || undefined,
                use_filename: true,
                unique_filename: false,
                overwrite: true,
                ...options, // Allow overriding defaults (e.g. resource_type)
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve({
                    secureUrl: result.secure_url,
                    publicId: result.public_id,
                    bytes: result.bytes,
                    format: result.format,
                    version: result.version,
                    type: result.type,
                    createdAt: result.created_at,
                });
            }
        );

        uploadStream.end(buffer);
    });
};

const deleteAsset = async (publicId) => {
    if (!publicId) return;
    if (!isConfigured()) {
        throw new Error('Cloudinary is not configured. Please set CLOUDINARY_URL or cloud name/key/secret.');
    }
    try {
        await cloudinary.uploader.destroy(publicId, { invalidate: true });
    } catch (err) {
        // Log but do not throw to avoid masking upstream errors
        console.error(`Cloudinary: failed to delete asset ${publicId}:`, err.message || err);
    }
};

const getSignedUrl = (publicId, options = {}) => {
    if (!isConfigured()) return null;
    return cloudinary.url(publicId, {
        sign_url: true,
        secure: true,
        ...options,
    });
};

module.exports = {
    uploadBuffer,
    deleteAsset,
    isConfigured,
    getSignedUrl,
};
