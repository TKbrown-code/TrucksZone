import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';

const TruckMediaUploader = ({ truckId }) => {
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [primaryImage, setPrimaryImage] = useState('');

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    setVideoFiles(prev => [...prev, ...files]);
  };

  const uploadFile = async (file, type) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `trucks/${truckId}/${type}s/${fileName}`;

    const bucket = type === 'image' ? 'truck_images' : 'truck_videos';

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { filePath, publicUrl };
  };

  const saveMediaToDatabase = async (mediaData, type) => {
    if (type === 'image') {
      const { error } = await supabase
        .from('truck_images')
        .insert({
          truck_id: truckId,
          image_url: mediaData.publicUrl,
          is_primary: primaryImage === mediaData.publicUrl
        });
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('truck_videos')
        .insert({
          truck_id: truckId,
          video_url: mediaData.publicUrl,
          type: 'walkaround'
        });
      if (error) throw error;
    }
  };

  const handleUpload = async () => {
    if (!truckId) {
      await Swal.fire('Error', 'Please save truck details first', 'error');
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      // Upload images
      for (let i = 0; i < imageFiles.length; i++) {
        const mediaData = await uploadFile(imageFiles[i], 'image');
        await saveMediaToDatabase(mediaData, 'image');
        setProgress(((i + 1) / (imageFiles.length + videoFiles.length)) * 100);
      }

      // Upload videos
      for (let i = 0; i < videoFiles.length; i++) {
        const mediaData = await uploadFile(videoFiles[i], 'video');
        await saveMediaToDatabase(mediaData, 'video');
        setProgress(((imageFiles.length + i + 1) / (imageFiles.length + videoFiles.length)) * 100);
      }

      await Swal.fire('Success!', 'Upload complete!', 'success');
      setImageFiles([]);
      setVideoFiles([]);
    } catch (error) {
      await Swal.fire('Error', 'Error uploading files: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="media-uploader">
      <h3>Upload Media</h3>
      
      <div className="upload-section">
        <h4>Images</h4>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          disabled={uploading}
        />
        <div className="file-list">
          {imageFiles.map((file, index) => (
            <div key={index} className="file-item">
              <input
                type="radio"
                name="primaryImage"
                checked={primaryImage === URL.createObjectURL(file)}
                onChange={() => setPrimaryImage(URL.createObjectURL(file))}
              />
              <img 
                src={URL.createObjectURL(file)} 
                alt={file.name} 
                className="thumbnail" 
              />
              <span>{file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
            </div>
          ))}
        </div>
      </div>

      <div className="upload-section">
        <h4>Videos</h4>
        <input
          type="file"
          accept="video/*"
          multiple
          onChange={handleVideoUpload}
          disabled={uploading}
        />
        <div className="file-list">
          {videoFiles.map((file, index) => (
            <div key={index} className="file-item">
              <video width="150" controls>
                <source src={URL.createObjectURL(file)} type={file.type} />
                Your browser does not support the video tag.
              </video>
              <span>{file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
            </div>
          ))}
        </div>
      </div>

      {uploading && (
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || (imageFiles.length === 0 && videoFiles.length === 0)}
        className="upload-button"
      >
        {uploading ? "Uploading..." : "Upload Media"}
      </button>
    </div>
  );
};

export default TruckMediaUploader;