import api from "./api"

// upload a pdf file
export const uploadDocument = async (file) => {
    const formData = new FormData();
    formData.append("file", file)

    const response = await api.post("/documents/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    return response.data;
}

// get all documents for current user
export const getDocuments = async () => {
    const response = await api.get("/documents");
    return response.data;
}

// get single document status
export const getDocumentStatus = async (docId) => {
    const response = await api.get(`/documents/${docId}`);
    return response.data;
}

// delete a document
export const deleteDocument = async (docId) => {
    const response = await api.delete(`/documents/${docId}`);
    return response.data;
}