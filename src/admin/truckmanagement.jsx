import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';
import './truckmanagement.css';

// Import components
import TruckForm from './TruckForm';
import TruckMediaUploader from './TruckMediaUploader';
import TruckDocuments from './TruckDocuments';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';

const TruckManagement = () => {
const { id } = useParams();
  const navigate = useNavigate();
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [truckSaved, setTruckSaved] = useState(false);

  // Fetch truck data if in edit mode
  useEffect(() => {
    if (id && id !== 'new') {
      const fetchTruck = async () => {
        try {
          const { data, error } = await supabase
            .from('trucks')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          setTruck(data);
        } catch (error) {
          // Error fetching truck
        } finally {
          setLoading(false);
        }
      };

      fetchTruck();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleTruckSaved = (savedTruck) => {
    setTruck(savedTruck);
    setTruckSaved(true);
    // If this was a new truck, update the URL
    if (id === 'new') {
      navigate(`/admin/trucks/${savedTruck.id}`, { replace: true });
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const isNewTruck = id === 'new';

  return (
    <div className="truck-management">
      <div className="page-header">
        <h1>
          UPLOAD TRUCK
        </h1>
      </div>

      {!isNewTruck && (
        // In truckmanagement.jsx
<div className="truck-tabs">
  <button
    className={`tab ${activeTab === 'details' ? 'active' : ''}`}
    onClick={() => setActiveTab('details')}
  >
    Truck Details
  </button>
  <button
    className={`tab ${activeTab === 'media' ? 'active' : ''} ${!truckSaved ? 'disabled' : ''}`}
    onClick={() => truckSaved && setActiveTab('media')}
    disabled={!truckSaved}
  >
    Media
  </button>
  <button
    className={`tab ${activeTab === 'documents' ? 'active' : ''} ${!truckSaved ? 'disabled' : ''}`}
    onClick={() => truckSaved && setActiveTab('documents')}
    disabled={!truckSaved}
  >
    Documents
  </button>
</div>
      )}

      <div className="truck-content">
        {(activeTab === 'details' || !truckSaved) ? (
          <TruckForm 
            truckId={truck?.id} 
            onSave={handleTruckSaved}
            onTruckSaved={handleTruckSaved}
          />
        ) : (
          <>
            {activeTab === 'media' && (
              <div className="tab-content">
                <h2>Media Management</h2>
                <TruckMediaUploader truckId={truck.id} />
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="tab-content">
                <h2>Document Management</h2>
                <TruckDocuments truckId={truck.id} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TruckManagement;