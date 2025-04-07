/**
 * Abstract storage service that can be easily switched between local storage and Firebase
 */
class StorageService {
  /**
   * Upload a document to storage
   * @param {File} file - The file to upload
   * @param {Object} metadata - Document metadata
   * @param {Function} progressCallback - Callback for upload progress
   * @returns {Promise} - Promise resolving to the uploaded document data
   */
  async uploadDocument(file, metadata, progressCallback) {
    try {
      // Simulate upload progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        if (progressCallback) progressCallback(progress);
        if (progress >= 100) clearInterval(progressInterval);
      }, 300);

      // Create a local URL for the file
      const fileUrl = URL.createObjectURL(file);

      // Create document data
      const docData = {
        id: Date.now().toString(),
        ...metadata,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: fileUrl,
        uploadDate: new Date(),
        localFilePath: `documents/${metadata.category}/${Date.now()}_${
          file.name
        }`,
      };

      // Save to local storage
      const documents = this.getDocumentsFromStorage();
      documents.push(docData);
      localStorage.setItem("documents", JSON.stringify(documents));

      // Save the actual file to IndexedDB
      await this.saveFileToIndexedDB(file, docData.localFilePath);

      return docData;
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  }

  /**
   * Get all documents from storage
   * @param {string} category - Optional category filter
   * @returns {Array} - Array of documents
   */
  getDocuments(category = null) {
    try {
      const documents = this.getDocumentsFromStorage();

      if (category && category !== "All Documents") {
        return documents.filter((doc) => doc.category === category);
      }

      return documents;
    } catch (error) {
      console.error("Error getting documents:", error);
      return [];
    }
  }

  /**
   * Delete a document from storage
   * @param {string} documentId - Document ID
   * @returns {Promise} - Promise resolving when deletion is complete
   */
  async deleteDocument(documentId) {
    try {
      const documents = this.getDocumentsFromStorage();
      const docIndex = documents.findIndex((doc) => doc.id === documentId);

      if (docIndex !== -1) {
        const docToDelete = documents[docIndex];

        // Remove from local storage
        documents.splice(docIndex, 1);
        localStorage.setItem("documents", JSON.stringify(documents));

        // Remove from IndexedDB
        await this.deleteFileFromIndexedDB(docToDelete.localFilePath);

        // Revoke object URL to prevent memory leaks
        URL.revokeObjectURL(docToDelete.fileUrl);
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }

  /**
   * Helper method to get documents from localStorage
   * @returns {Array} - Array of documents
   */
  getDocumentsFromStorage() {
    const documentsString = localStorage.getItem("documents");

    // Make sure we ALWAYS return an array, even if storage is empty
    if (!documentsString) {
      return [];
    }

    try {
      return JSON.parse(documentsString) || [];
    } catch (error) {
      console.error("Error parsing documents from storage:", error);
      // Return empty array on error instead of corrupted data
      return [];
    }
  }

  /**
   * Save file to IndexedDB for local storage
   * @param {File} file - The file to save
   * @param {string} path - The path to save the file to
   * @returns {Promise} - Promise resolving when save is complete
   */
  saveFileToIndexedDB(file, path) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("DocumentsDB", 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("files")) {
          db.createObjectStore("files", { keyPath: "path" });
        }
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(["files"], "readwrite");
        const store = transaction.objectStore("files");

        const fileData = {
          path: path,
          data: file,
          timestamp: new Date().getTime(),
        };

        const storeRequest = store.put(fileData);

        storeRequest.onsuccess = () => resolve();
        storeRequest.onerror = () =>
          reject(new Error("Failed to save file to IndexedDB"));
      };

      request.onerror = () => reject(new Error("Failed to open IndexedDB"));
    });
  }

  /**
   * Delete file from IndexedDB
   * @param {string} path - The path of the file to delete
   * @returns {Promise} - Promise resolving when deletion is complete
   */
  deleteFileFromIndexedDB(path) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("DocumentsDB", 1);

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(["files"], "readwrite");
        const store = transaction.objectStore("files");

        const deleteRequest = store.delete(path);

        deleteRequest.onsuccess = () => resolve();
        deleteRequest.onerror = () =>
          reject(new Error("Failed to delete file from IndexedDB"));
      };

      request.onerror = () => reject(new Error("Failed to open IndexedDB"));
    });
  }

  /**
   * Get collaborators for a document
   * @param {string} documentId - Document ID
   * @returns {Array} - Array of collaborators
   */
  getDocumentCollaborators(documentId) {
    try {
      // In a real app, this would fetch from your database
      // For now, we'll return mock data
      return [
        {
          id: 1,
          name: "Jane Doe",
          role: "Landowner",
          email: "jane.doe@example.com",
          phone: "+1 (555) 123-4567",
          avatar: null,
        },
        {
          id: 2,
          name: "Alvin Doe",
          role: "Landowner",
          email: "alvin.doe@example.com",
          phone: "+1 (555) 987-6543",
          avatar: null,
        },
        {
          id: 3,
          name: "Theodore Doe",
          role: "TreeFolks Admin",
          email: "theodore.doe@treefolks.org",
          phone: "+1 (555) 456-7890",
          avatar: null,
        },
      ];
    } catch (error) {
      console.error("Error getting document collaborators:", error);
      return [];
    }
  }

  /**
   * Add a collaborator to a document
   * @param {string} documentId - Document ID
   * @param {Object} collaborator - Collaborator data
   * @returns {Promise} - Promise resolving when addition is complete
   */
  async addDocumentCollaborator(documentId, collaborator) {
    try {
      // In a real app, this would update your database
      console.log(
        `Adding collaborator to document ${documentId}:`,
        collaborator
      );
      return { success: true };
    } catch (error) {
      console.error("Error adding document collaborator:", error);
      throw error;
    }
  }

  /**
   * Remove a collaborator from a document
   * @param {string} documentId - Document ID
   * @param {string} collaboratorId - Collaborator ID
   * @returns {Promise} - Promise resolving when removal is complete
   */
  async removeDocumentCollaborator(documentId, collaboratorId) {
    try {
      // In a real app, this would update your database
      console.log(
        `Removing collaborator ${collaboratorId} from document ${documentId}`
      );
      return { success: true };
    } catch (error) {
      console.error("Error removing document collaborator:", error);
      throw error;
    }
  }

  /**
   * Add a document to storage
   * @param {Object} document - Document to add
   * @returns {Promise} - Promise resolving to added document
   */
  async addDocument(document) {
    try {
      // Get existing documents
      const documents = this.getDocumentsFromStorage();

      // Add new document (with new ID)
      const newDocument = {
        ...document,
        id: document.id || this.generateId(),
        createdAt: document.createdAt || new Date().toISOString(),
      };

      // IMPORTANT: Append to existing array, don't replace it
      documents.push(newDocument);

      // Save updated documents array back to storage
      localStorage.setItem("documents", JSON.stringify(documents));

      // Save file to IndexedDB if needed
      if (document.file && document.localFilePath) {
        await this.saveFileToIndexedDB(document.file, document.localFilePath);
      }

      return newDocument;
    } catch (error) {
      console.error("Error adding document:", error);
      throw error;
    }
  }

  /**
   * Get documents from storage with working file URLs
   * @param {string} category - Optional category filter
   * @returns {Promise<Array>} - Array of documents with working file URLs
   */
  async getDocuments(category = null) {
    try {
      const documents = this.getDocumentsFromStorage();

      // For each document with a localFilePath, ensure it has a working fileUrl
      const docsWithUrls = await Promise.all(
        documents.map(async (doc) => {
          if (doc.localFilePath) {
            // Get file from IndexedDB
            const file = await this.getFileFromIndexedDB(doc.localFilePath);
            if (file) {
              // If old blob URL exists, revoke it
              if (doc.fileUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(doc.fileUrl);
              }
              // Create new blob URL
              doc.fileUrl = URL.createObjectURL(
                new Blob([file], { type: doc.fileType })
              );
            }
          }
          return doc;
        })
      );

      // Filter by category if provided
      if (category) {
        return docsWithUrls.filter((doc) => doc.category === category);
      }

      return docsWithUrls;
    } catch (error) {
      console.error("Error getting documents:", error);
      return [];
    }
  }

  /**
   * Get file from IndexedDB
   * @param {string} path - File path
   * @returns {Promise<Blob|null>} File blob or null if not found
   */
  getFileFromIndexedDB(path) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("DocumentsDB", 1);

      request.onerror = () => {
        console.error("IndexedDB error");
        resolve(null);
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(["files"], "readonly");
        const store = transaction.objectStore("files");
        const getRequest = store.get(path);

        getRequest.onsuccess = () => {
          resolve(getRequest.result?.data || null);
        };

        getRequest.onerror = () => {
          console.error("Error getting file from IndexedDB");
          resolve(null);
        };
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("files")) {
          db.createObjectStore("files", { keyPath: "path" });
        }
      };
    });
  }
}

export default new StorageService();
