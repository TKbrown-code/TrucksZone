import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperPlane,
  faPaperclip,
  faSpinner,
  faUser,
  faFile,
  faImage,
  faPlay,
  faTimes,
  faEdit,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import CryptoJS from 'crypto-js';
import Swal from 'sweetalert2';
import '../../styles/userChat.css';
import { useAuth } from "../../contexts/AuthContext";

function UserChat({ truckdata }) {
  const [admin, setAdmin] = useState(null);
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [error, setError] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const realtimeChannelRef = useRef(null);

  // Generate encryption key for the conversation
  const getEncryptionKey = useCallback((senderId, receiverId) => {
    const sortedIds = [senderId, receiverId].sort();
    return CryptoJS.SHA256(sortedIds.join('-')).toString();
  }, []);

  // Encrypt message
  const encryptMessage = useCallback((message, key) => {
    return CryptoJS.AES.encrypt(message, key).toString();
  }, []);

  // Decrypt message
  const decryptMessage = useCallback((encryptedMessage, key) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      return '[Encrypted message]';
    }
  }, []);

  useEffect(() => {
    if (truckdata && truckdata.truckId) {
      const prefilledMessage = `Hello, I am interested in the truck: ${truckdata.truckBrand} ${truckdata.truckModel} (ID: ${truckdata.truckId}). Could you provide more details?`;
      setNewMessage(prefilledMessage);
    }
  }, [truckdata]);

  // Load current user and admin
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!mounted || !user) return;

        setCurrentUser(user);

        // Find admin user
        const { data: adminData, error: adminError } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_admin', true)
          .single();

        if (adminError) {
          throw adminError;
        }

        if (adminData) {
          setAdmin(adminData);
          await fetchMessages(adminData.user_id);
        } else {
          toast.error('No admin account found');
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load chat');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Set up realtime subscription
  useEffect(() => {
    if (!currentUser?.id || !admin?.user_id) return;

    const channelName = `user_chat_${currentUser.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `sender_id=eq.${admin.user_id},receiver_id=eq.${currentUser.id}`
        },
        async (payload) => {
          const newMsg = payload.new;
          if (newMsg.sender_id === admin.user_id) {
            // Decrypt the message
            const key = getEncryptionKey(newMsg.sender_id, newMsg.receiver_id);
            const decryptedContent = decryptMessage(newMsg.message, key);
            const media = await fetchMediaForMessage(newMsg.id);

            setMessages(prev => [...prev, { ...newMsg, content: decryptedContent, chat_media: media }]);
            scrollToBottom();
          }
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          // Subscription active
        }
      });

    realtimeChannelRef.current = channel;

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [currentUser?.id, admin?.user_id]);

  const fetchMediaForMessage = async (messageId) => {
    try {
      const { data, error } = await supabase
        .from('chat_media')
        .select('*')
        .eq('chat_id', messageId);

      if (error) throw error;

      // Transform the data to a consistent format
      const media = [];
      data.forEach(item => {
        if (item.image_url) {
          media.push({
            id: item.id,
            media_type: 'image',
            media_url: item.image_url,
            media_name: item.file_name || 'Image'
          });
        }
        if (item.file_url) {
          media.push({
            id: item.id,
            media_type: 'file',
            media_url: item.file_url,
            media_name: item.file_name || 'File'
          });
        }
        if (item.voicemail_url) {
          media.push({
            id: item.id,
            media_type: 'video', // Assuming voicemail_url for videos/audio
            media_url: item.voicemail_url,
            media_name: item.file_name || 'Video'
          });
        }
      });

      return media;
    } catch (err) {
      return [];
    }
  };

  const fetchMessages = async (adminId) => {

    if (!user.id || !adminId) {
      return;
    }

    try {

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${adminId}),and(sender_id.eq.${adminId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        setMessages([]);
        return;
      }

      const decryptedMessages = await Promise.all(
        data.map(async (msg) => {
          try {
            const key = getEncryptionKey(msg.sender_id, msg.receiver_id);
            const decryptedContent = msg.message ? decryptMessage(msg.message, key) : '';
            const media = await fetchMediaForMessage(msg.id);
            return { ...msg, content: decryptedContent, chat_media: media };
          } catch (err) {
            return { ...msg, content: '[Error loading message]', chat_media: [] };
          }
        })
      );

      setMessages(decryptedMessages);
    } catch (err) {
      toast.error('Failed to load messages. Please try again.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const messageContent = newMessage.trim();

    if (!messageContent || !currentUser?.id || !admin?.user_id) {
      return;
    }

    try {
      const encryptionKey = getEncryptionKey(currentUser.id, admin.user_id);
      const encryptedContent = encryptMessage(messageContent, encryptionKey);

      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            sender_id: currentUser.id,
            receiver_id: admin.user_id,
            message: encryptedContent
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Add the new message to the local state (already encrypted)
      setMessages(prev => [...prev, {
        ...data,
        content: messageContent, // Show decrypted content locally
        chat_media: [] // No media for text messages
      }]);

      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    // Clear the input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendFile = async () => {
    if (!selectedFile || !currentUser?.id || !admin?.user_id) return;

    setIsUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `chat/${currentUser.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat_contents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat_contents')
        .getPublicUrl(filePath);

      // Determine media type
      let mediaType = 'file';
      if (selectedFile.type.startsWith('image/')) {
        mediaType = 'image';
      } else if (selectedFile.type.startsWith('video/')) {
        mediaType = 'video';
      }

      const encryptionKey = getEncryptionKey(currentUser.id, admin.user_id);
      const encryptedContent = '';

      const { data: messageData, error: messageError } = await supabase
        .from('chat_messages')
        .insert([
          {
            sender_id: currentUser.id,
            receiver_id: admin.user_id,
            message: encryptedContent
          }
        ])
        .select()
        .single();

      if (messageError) throw messageError;

      // Insert into chat_media based on actual schema
      const mediaInsertData = {
        chat_id: messageData.id,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        file_type: selectedFile.type
      };

      if (mediaType === 'image') {
        mediaInsertData.image_url = publicUrl;
      } else if (mediaType === 'video') {
        mediaInsertData.voicemail_url = publicUrl; // Using voicemail_url for videos
      } else {
        mediaInsertData.file_url = publicUrl;
      }

      const { data: mediaData, error: mediaError } = await supabase
        .from('chat_media')
        .insert([mediaInsertData])
        .select()
        .single();

      if (mediaError) throw mediaError;

      // Transform for local state
      const transformedMedia = {
        id: mediaData.id,
        media_type: mediaType,
        media_url: publicUrl,
        media_name: selectedFile.name
      };

      setMessages(prev => [...prev, {
        ...messageData,
        content: null,
        chat_media: [transformedMedia]
      }]);

      // Clear selection
      setSelectedFile(null);
      setFilePreview(null);

      scrollToBottom();
      toast.success('File uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const cancelFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message.id);
    setEditContent(message.content);
  };

  const handleSaveEdit = async () => {
    if (!editingMessage || !editContent.trim()) return;

    try {
      const encryptionKey = getEncryptionKey(currentUser.id, admin.user_id);
      const encryptedContent = encryptMessage(editContent.trim(), encryptionKey);

      const { error } = await supabase
        .from('chat_messages')
        .update({ message: encryptedContent })
        .eq('id', editingMessage);

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.map(msg =>
        msg.id === editingMessage
          ? { ...msg, content: editContent.trim() }
          : msg
      ));

      setEditingMessage(null);
      setEditContent('');
      toast.success('Message updated successfully');
    } catch (err) {
      toast.error('Failed to update message');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  const handleDeleteMessage = async (messageId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      // First delete associated media
      const { error: mediaError } = await supabase
        .from('chat_media')
        .delete()
        .eq('chat_id', messageId);

      if (mediaError) {
        // Error deleting media
      }

      // Then delete the message
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Message deleted successfully');
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  const handleDeleteFile = async (mediaId, fileUrl) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      // Delete from storage
      const filePath = fileUrl.split('/').pop();
      const { error: storageError } = await supabase.storage
        .from('chat_contents')
        .remove([`chat/${currentUser.id}/${filePath}`]);

      if (storageError) {
        // Error deleting from storage
      }

      // Delete from database
      const { error } = await supabase
        .from('chat_media')
        .delete()
        .eq('id', mediaId);

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.map(msg => ({
        ...msg,
        chat_media: msg.chat_media.filter(media => media.id !== mediaId)
      })));

      toast.success('File deleted successfully');
    } catch (err) {
      toast.error('Failed to delete file');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderMediaContent = (message) => {
    if (!message.chat_media || message.chat_media.length === 0) return null;

    return (
      <div className="userchat-media">
        {message.chat_media.map((media) => (
          <div key={media.id} className="userchat-media-item">
            {media.media_type === 'image' && (
              <div style={{ position: 'relative' }}>
                <img
                  src={media.media_url}
                  alt={media.media_name}
                  className="userchat-media-image"
                />
                {message.sender_id === currentUser?.id && (
                  <button
                    onClick={() => handleDeleteFile(media.id, media.media_url)}
                    className="userchat-media-delete-btn"
                    title="Delete file"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>
            )}
            {media.media_type === 'video' && (
              <div style={{ position: 'relative' }}>
                <video controls className="userchat-media-video">
                  <source src={media.media_url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                {message.sender_id === currentUser?.id && (
                  <button
                    onClick={() => handleDeleteFile(media.id, media.media_url)}
                    className="userchat-media-delete-btn"
                    title="Delete file"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>
            )}
            {media.media_type === 'file' && (
              <div style={{ position: 'relative' }}>
                <a
                  href={media.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="userchat-media-file"
                >
                  <FontAwesomeIcon icon={faFile} />
                  <span>{media.media_name}</span>
                </a>
                {message.sender_id === currentUser?.id && (
                  <button
                    onClick={() => handleDeleteFile(media.id, media.media_url)}
                    className="userchat-media-delete-btn"
                    title="Delete file"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="userchat-loading">
        <FontAwesomeIcon icon={faSpinner} spin /> Loading chat...
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="userchat-no-admin">
        No admin available at the moment. Please try again later.
      </div>
    );
  }

  return (
    <div className="userchat-container">
      <div className="userchat-header">
        <div className="userchat-with">
          <div className="userchat-avatar">
            <FontAwesomeIcon icon={faUser} />
          </div>
          <div className="userchat-user-info">
            <h3>Admin Support</h3>
            <p>Online</p>
          </div>
        </div>
      </div>

      <div className="userchat-messages">
        {messages.length === 0 ? (
          <div className="userchat-no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`userchat-message ${
                message.sender_id === currentUser?.id
                  ? 'userchat-message-sent'
                  : 'userchat-message-received'
              }`}
            >
              {renderMediaContent(message)}
              {message.content && message.content.trim() && (
                <div className="userchat-message-content">
                  {editingMessage === message.id ? (
                    <div className="userchat-edit-form">
                      <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="userchat-edit-input"
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="userchat-save-btn"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="userchat-cancel-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                    <div className={`${
                  message.sender_id === currentUser?.id
                    ? 'userchat-message-text-sent'
                    : ''
                }`}>
                      {message.content}
                    </div>
                      {message.sender_id === currentUser?.id && (
                        <div className="userchat-message-actions">
                          <button
                            onClick={() => handleEditMessage(message)}
                            className="userchat-edit-btn"
                            title="Edit message"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="userchat-delete-btn"
                            title="Delete message"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {selectedFile && (
        <div className="userchat-file-preview">
          <div className="userchat-file-preview-content">
            {filePreview ? (
              <img
                src={filePreview}
                alt="File preview"
                className="userchat-file-preview-image"
              />
            ) : (
              <div className="userchat-file-preview-icon">
                <FontAwesomeIcon icon={faFile} />
                <span>{selectedFile.name}</span>
              </div>
            )}
          </div>
          <div className="userchat-file-preview-actions">
            <button
              type="button"
              onClick={handleSendFile}
              disabled={isUploading}
              className="userchat-send-file-btn"
            >
              {isUploading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faPaperPlane} />
              )}
            </button>
            <button
              type="button"
              onClick={cancelFile}
              disabled={isUploading}
              className="userchat-cancel-file-btn"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="userchat-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isUploading}
        />
        <button type="button" className="attach-btn" onClick={() => fileInputRef.current?.click()}>
          <FontAwesomeIcon icon={faPaperclip} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <button type="submit" disabled={!newMessage.trim() || isUploading}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </form>
    </div>
  );
}

export default UserChat;