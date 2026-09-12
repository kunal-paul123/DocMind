import { useCallback, useEffect, useState } from "react";
import { deleteDocument, getDocuments, uploadDocument } from "../services/documentService";

export function useDocuments() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    // fetch all documents
    const fetchDocuments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getDocuments();
            setDocuments(data);
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to fetch documents");
        } finally {
            setLoading(false);
        }
    }, []);

    // upload a new pdf
    const upload = async (file) => {
        setUploading(true);
        setError(null);
        try {
            const newDoc = await uploadDocument(file);
            setDocuments(prev => [...prev, newDoc]);
            return newDoc;
        } catch (error) {
            setError(error.response?.data?.detail || "Failed to upload document");
            throw error;
        } finally {
            setUploading(false);
        }
    }

    // delete document
    const remove = async (docId) => {
        try {
            await deleteDocument(docId);
            setDocuments((prev) => prev.filter((d) => d.id !== docId));
        } catch (error) {
            setError(error.response?.data?.detail || "Delete Failed")
        }
    }

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments])

    return { documents, loading, uploading, error, upload, remove, refetch: fetchDocuments };
}

