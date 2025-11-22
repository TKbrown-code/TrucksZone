import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const TruckDocuments = ({ truckId }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [newDocName, setNewDocName] = useState('');

  useEffect(() => {
    if (truckId) {
      fetchDocuments();
    }
  }, [truckId]);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('truck_documents')
      .select('*')
      .eq('truck_id', truckId);

    if (error) {
      console.error('Error fetching documents:', error);
      return;
    }

    setDocuments(data || []);
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !newDocName) return;

    try {
      setUploading(true);
      
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `trucks/${truckId}/documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('truck-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('truck-documents')
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('truck_documents')
        .insert([{
          truck_id: truckId,
          name: newDocName,
          document_url: publicUrl
        }]);

      if (dbError) throw dbError;

      // Refresh documents list
      fetchDocuments();
      setNewDocName('');
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error uploading document: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      const doc = documents.find(d => d.id === id);
      if (!doc) return;

      // Delete from storage
      const filePath = doc.document_url.split('/').pop();
      const { error: storageError } = await supabase.storage
        .from('truck-documents')
        .remove([`trucks/${truckId}/documents/${filePath}`]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('truck_documents')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // Refresh documents list
      fetchDocuments();
      alert('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document: ' + error.message);
    }
  };

  return (
    <div className="truck-documents">
      <h3>Documents</h3>
      
      <div className="upload-document">
        <input
          type="text"
          placeholder="Document name"
          value={newDocName}
          onChange={(e) => setNewDocName(e.target.value)}
          disabled={uploading}
        />
        <label className="btn-upload">
          {uploading ? 'Uploading...' : 'Select Document'}
          <input
            type="file"
            onChange={handleDocumentUpload}
            disabled={uploading || !newDocName}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div className="documents-list">
        {documents.map(doc => (
          <div key={doc.id} className="document-item">
            <a 
              href={doc.document_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="document-link"
            >
              {doc.name}
            </a>
            <button
              onClick={() => deleteDocument(doc.id)}
              className="btn-delete"
              disabled={uploading}
            >
              Delete
            </button>
          </div>
        ))}
        {documents.length === 0 && (
          <p className="no-documents">No documents uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default TruckDocuments;