import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { storage, db } from "../config/firebase";

/**
 * Service for handling document operations with Firebase
 */
const documentService = {
  /**
   * Upload a document to Firebase Storage and save metadata to Firestore
   * @param {File} file - The file to upload
   * @param {Object} metadata - Document metadata (title, description, etc.)
   * @param {Function} progressCallback - Callback for upload progress
   * @returns {Promise} - Promise resolving to the uploaded document data
   */
  uploadDocument: async (file, metadata, progressCallback) => {
    try {
      // Create a storage reference
      const storageRef = ref(
        storage,
        `documents/${metadata.category}/${Date.now()}_${file.name}`
      );

      // Start the file upload
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Return a promise that resolves when the upload is complete
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Calculate and report progress
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (progressCallback) {
              progressCallback(progress);
            }
          },
          (error) => {
            // Handle upload errors
            reject(error);
          },
          async () => {
            // Upload completed successfully, get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Save document metadata to Firestore
            const docData = {
              ...metadata,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              fileUrl: downloadURL,
              uploadDate: new Date(),
            };

            const docRef = await addDoc(collection(db, "documents"), docData);

            // Resolve with the complete document data
            resolve({
              id: docRef.id,
              ...docData,
            });
          }
        );
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  },

  /**
   * Get all documents from Firestore
   * @param {string} category - Optional category to filter documents
   * @returns {Promise<Array>} - Promise resolving to array of documents
   */
  getDocuments: async (category = null) => {
    try {
      let documentsQuery;

      if (category) {
        documentsQuery = query(
          collection(db, "documents"),
          where("category", "==", category)
        );
      } else {
        documentsQuery = collection(db, "documents");
      }

      const querySnapshot = await getDocs(documentsQuery);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting documents:", error);
      throw error;
    }
  },

  /**
   * Delete a document from both Storage and Firestore
   * @param {string} documentId - Firestore document ID
   * @param {string} fileUrl - Storage file URL
   * @returns {Promise} - Promise resolving when deletion is complete
   */
  deleteDocument: async (documentId, fileUrl) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, "documents", documentId));

      // Delete from Storage
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);

      return { success: true };
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  },
};

export default documentService;
