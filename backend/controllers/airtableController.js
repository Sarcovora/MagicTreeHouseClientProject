// controllers/airtableController.js
const airtableService = require('../services/airtableService');
const cloudinaryService = require('../services/cloudinaryService');

const sanitizeFilename = (name = 'document') =>
    name.replace(/[^a-z0-9.\-_]/gi, '_');

// Helper for handling async route errors
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next); // Pass errors to global handler
};

const handleGetAllSeasons = asyncHandler(async (req, res) => {
    const seasons = await airtableService.getAllSeasons();
    res.json(seasons);
});

const handleGetProjectsBySeason = asyncHandler(async (req, res) => {
    const { season } = req.params;
    if (!season) {
        return res.status(400).json({ message: 'Season parameter is required.' });
    }
    // Basic sanitization/validation could go here
    const encodedSeason = decodeURIComponent(season); // Handle URL encoding like %20 if needed
    const projects = await airtableService.getProjectsBySeason(encodedSeason);
    res.json(projects);
});

const handleGetProjectDetails = asyncHandler(async (req, res, next) => {
    const { recordId } = req.params;
    if (!recordId) {
        return res.status(400).json({ message: 'Record ID parameter is required.' });
    }
    try {
        const projectDetails = await airtableService.getProjectDetails(recordId);
        if (!projectDetails) {
            // This case might be handled by the service throwing an error now
            return res.status(404).json({ message: 'Project not found.' });
        }
        res.json(projectDetails);
    } catch (error) {
        // Catch specific 'Project not found' error from service
        if (error.message === 'Project not found.') {
            return res.status(404).json({ message: 'Project not found.' });
        }
        next(error); // Pass other errors to global handler
    }
});

const handleAddSeason = asyncHandler(async (req, res) => {
    const { seasonName } = req.body;
    if (!seasonName || typeof seasonName !== 'string' || seasonName.trim() === '') {
        return res.status(400).json({ message: 'Valid seasonName (string) is required in the request body.' });
    }
    try {
        const result = await airtableService.addSeasonOption(seasonName.trim());
        // Success is now indicated by the message, not checking for existing
        res.status(200).json(result); // Send the success message from the service
    } catch (error) {
        // Catch specific errors if needed, otherwise let the global handler manage
        console.error(`Controller error adding season '${seasonName}':`, error.message);
        // Send a generic error or pass to global handler
        res.status(500).json({ message: error.message || 'Failed to process season addition request.' });
        // Or just use next(error);
    }
});

const handleAddProject = asyncHandler(async (req, res) => {
    const projectData = req.body;

    // Basic validation (can be more sophisticated)
    if (!projectData || typeof projectData !== 'object' || Object.keys(projectData).length === 0) {
        return res.status(400).json({ message: 'Project data is required in the request body.' });
    }
    // You might add more specific checks here based on required fields from FIELD_MAP.apiToAirtable

    const newProject = await airtableService.addProject(projectData);
    res.status(201).json(newProject); // Respond with the newly created project data
});

const handleUpdateProject = asyncHandler(async (req, res) => {
    const { recordId } = req.params;
    const projectData = req.body;

    // Basic validation
    if (!recordId) {
        return res.status(400).json({ message: 'Record ID parameter is required.' });
    }
    if (!projectData || typeof projectData !== 'object' || Object.keys(projectData).length === 0) {
        return res.status(400).json({ message: 'Project data is required in the request body.' });
    }

    try {
        const updatedProject = await airtableService.updateProject(recordId, projectData);
        res.json(updatedProject); // Respond with the updated project data
    } catch (error) {
        // Catch specific 'Project not found' error from service
        if (error.message.includes('Record not found')) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        throw error; // Re-throw other errors to be handled by asyncHandler
    }
});

const handleDeleteSeason = asyncHandler(async (req, res) => {
    const { seasonId } = req.params;
    if (!seasonId) {
        return res.status(400).json({ message: 'Season ID parameter is required.' });
    }

    const normalizedSeason = decodeURIComponent(seasonId).trim();
    if (!normalizedSeason) {
        return res.status(400).json({ message: 'Season ID parameter must be a non-empty string.' });
    }

    try {
        const result = await airtableService.deleteSeasonOption(normalizedSeason);
        res.json(result);
    } catch (error) {
        console.error(`Controller error deleting season '${seasonId}':`, error.message);
        const statusCode = error.statusCode ?? 500;
        res.status(statusCode).json({ message: error.message || 'Failed to delete season.' });
    }
});

const handleGetLandownerProject = asyncHandler(async (req, res) => {
    // req.user is set by authentication middleware
    if (!req.user || !req.user.email) {
        return res.status(401).json({ message: "User email not found in token." });
    }

    const { email } = req.user;
    try {
        const project = await airtableService.findProjectByEmail(email);
        if (!project) {
            return res.status(404).json({ message: "No project found for this email." });
        }
        res.json(project);
    } catch (error) {
        console.error(`Error fetching project for email ${email}:`, error);
        res.status(500).json({ message: "Failed to fetch landowner project." });
    }
});

const handleUploadProjectDocument = asyncHandler(async (req, res) => {
    const { recordId } = req.params;
    const { documentType, filename, contentType, data } = req.body || {};

    // --- Permission Check ---
    // If not admin, ensure they own the project AND are only uploading 'draftMap'
    if (req.user && !req.user.admin) { // Assuming auth middleware sets req.user.admin or similar
        // Note: req.userProfile might be set by requireAdmin, but for mixed routes we rely on token or lookup
        // Ideally, we should fetch permission first.
        // Let's assume non-admin users can ONLY touch their own project.
        
        // 1. Verify ownership if we haven't already (e.g., via middleware). 
        // For simplicity, let's fetch the project by email and compare IDs
        if (!req.user.email) {
             return res.status(401).json({ message: "Unauthorized." });
        }
        
        // Strict check: Landowners can ONLY upload 'draftMap'
        if (documentType !== 'draftMap') {
            return res.status(403).json({ message: "Landowners can only edit the Draft Map." });
        }

        const project = await airtableService.findProjectByEmail(req.user.email);
        if (!project || project.id !== recordId) {
            return res.status(403).json({ message: "Access denied to this project." });
        }
    }
    // --- End Permission Check ---

    if (!recordId) {
        return res.status(400).json({ message: 'Record ID parameter is required.' });
    }
    if (!documentType) {
        return res.status(400).json({ message: 'documentType is required.' });
    }
    if (!data) {
        return res.status(400).json({ message: 'File data is required.' });
    }

    // --- Auto-Renaming for Draft Maps ---
    // User Requirement: [Owner Last Name or Site Name]_DraftMap_v0 (v1, v2...)
    let finalFilename = filename;
    
    if (documentType === 'draftMap') {
        try {
            // Need current project state to calculate version
            const currentProject = await airtableService.getProjectDetails(recordId);
            const ownerName = currentProject.ownerLastName || currentProject.siteName || 'Project';
            const safeOwnerName = ownerName.replace(/[^a-zA-Z0-9]/g, '');
            
            const existingAttachments = currentProject.draftMap || [];
            // Version = count of existing attachments (0 if none exist, 1 if 1 exists, etc.)
            const version = existingAttachments.length;
            
            // finalFilename: OwnerName_DraftMap_vX.pdf
            // We assume the extension from the original filename or contentType
            const originalExt = filename?.split('.').pop() || (contentType === 'application/pdf' ? 'pdf' : 'dat');
            
            finalFilename = `${safeOwnerName}_DraftMap_v${version}.${originalExt}`;
            console.log(`[DraftMap] Renaming upload to: ${finalFilename} (Version ${version})`);
        } catch (err) {
            console.error("Failed to generate versioned filename:", err);
            // Fallback to original name if fetch fails
        }
    }

    const safeName = sanitizeFilename(finalFilename || `${documentType}-${Date.now()}`);
    const cleanedContentType = contentType || 'application/octet-stream';

    if (!cloudinaryService.isConfigured()) {
        return res.status(500).json({ message: 'Cloudinary is not configured. Set CLOUDINARY_URL or cloud name/key/secret.' });
    }

    let cloudinaryAsset = null;

    try {
        const buffer = Buffer.from(data, 'base64');
        // Check if file is PDF based on detected type or extension
        const isPdf = cleanedContentType === 'application/pdf' || (filename && filename.toLowerCase().endsWith('.pdf'));
        const resourceType = isPdf ? 'raw' : 'auto';

        cloudinaryAsset = await cloudinaryService.uploadBuffer(buffer, {
            folder: 'project-uploads',
            filename: safeName,
            resource_type: resourceType,
        });

        // Use public secureUrl directly (Security settings now allow PDF delivery)
        const attachmentUrl = cloudinaryAsset.secureUrl;

        const {
            project: updatedProject,
            apiKey: projectFieldKey,
            attachmentUrl: finalAttachmentUrl,
            hosted,
        } = await airtableService.attachDocumentToProject(recordId, documentType, {
            url: attachmentUrl,
            filename: finalFilename || safeName, // Use the versioned name here
            contentType: cleanedContentType,
        });

        const resolvedFieldKey = projectFieldKey || documentType;
        const projectFieldValue = updatedProject?.[resolvedFieldKey];
        const projectFileUrl = Array.isArray(projectFieldValue)
            ? projectFieldValue[0]
            : projectFieldValue;
        const finalFileUrl = projectFileUrl || attachmentUrl || cloudinaryAsset.secureUrl;

        // Give Airtable time to fetch the file before cleanup (longer for slower file types)
        const baseDeleteDelay = Number(process.env.CLOUDINARY_DELETE_DELAY_MS || 60000);
        const slowDeleteDelay = Number(process.env.CLOUDINARY_DELETE_DELAY_MS_SLOW || 300000);
        const deleteDelayMs = hosted ? baseDeleteDelay : slowDeleteDelay;
        if (cloudinaryAsset.publicId) {
            setTimeout(() => {
                cloudinaryService.deleteAsset(cloudinaryAsset.publicId);
            }, deleteDelayMs);
        }

        res.json({
            success: true,
            documentType,
            hosted: Boolean(hosted),
            fileUrl: finalFileUrl,
            project: updatedProject,
        });
    } catch (error) {
        console.error(`Controller error uploading document for ${recordId}:`, error);
        // Cleanup temp asset if Airtable failed after upload
        if (cloudinaryAsset?.publicId) {
            await cloudinaryService.deleteAsset(cloudinaryAsset.publicId);
        }
        res.status(500).json({ message: error.message || 'Failed to upload project document.' });
    }
});

const handleDeleteProjectDocument = asyncHandler(async (req, res) => {
    const { recordId, documentType } = req.params;

    // --- Permission Check ---
    if (req.user && !req.user.admin) {
        // User requested: "make it so that the landowner cannot delete anything"
        return res.status(403).json({ message: "Landowners cannot delete documents. Please upload a new version instead." });
    }
    // --- End Permission Check ---

    if (!recordId) {
        return res.status(400).json({ message: 'Record ID parameter is required.' });
    }
    if (!documentType) {
        return res.status(400).json({ message: 'documentType is required.' });
    }

    try {
        const updatedProject = await airtableService.detachDocumentFromProject(recordId, documentType);
        res.json({
            success: true,
            documentType,
            project: updatedProject,
        });
    } catch (error) {
        console.error(`Controller error deleting document for ${recordId}:`, error);
        res.status(500).json({ message: error.message || 'Failed to delete project document.' });
    }
});

const handleAddDraftMapComment = asyncHandler(async (req, res) => {
    const { recordId } = req.params;
    const { comment } = req.body;

    // --- Permission Check ---
    // User requested: "I want only the landwoner to be able to send comments to the admin."
    // Admin should view but NOT send.
    if (req.user && req.user.admin) {
        // req.user.admin is likely boolean true/false.
        // If checking strictly for admin attempting to POST:
        return res.status(403).json({ message: "Admins cannot post comments here." });
    }
    
    // Landowner check:
    if (!req.user || !req.user.email) {
        return res.status(401).json({ message: "Unauthorized." });
    }
    const project = await airtableService.findProjectByEmail(req.user.email);
    if (!project || project.id !== recordId) {
        return res.status(403).json({ message: "Access denied to this project." });
    }
    // --- End Permission Check ---

    if (!comment || typeof comment !== 'string' || comment.trim() === '') {
        return res.status(400).json({ message: "Comment is required." });
    }

    try {
        // 1. Fetch current project to get existing comments
        const currentProject = await airtableService.getProjectDetails(recordId);
        const existingComments = currentProject.draftMapComments || "";

        // 2. Format new comment entry
        const dateStr = new Date().toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true
        });
        const newEntry = `[${dateStr}] ${comment.trim()}\n\n`;

        // 3. Prepend to existing text
        const updatedComments = newEntry + existingComments;

        // 4. Update Airtable
        const updatedProject = await airtableService.updateProject(recordId, {
            draftMapComments: updatedComments
        });

        res.json({
            success: true,
            project: updatedProject
        });

    } catch (error) {
        console.error(`Error adding draft map comment for ${recordId}:`, error);
        res.status(500).json({ message: "Failed to add comment." });
    }
});

module.exports = {
    handleGetAllSeasons,
    handleGetProjectsBySeason,
    handleGetProjectDetails,
    handleAddSeason,
    handleAddProject,
    handleUpdateProject,
    handleDeleteSeason,
    handleUploadProjectDocument,
    handleDeleteProjectDocument,
    handleGetLandownerProject,
    handleAddDraftMapComment,
};
