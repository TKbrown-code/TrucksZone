import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronUp,
  faUser,
  faSearch,
  faChevronLeft,
  faChevronDown,
  faUsers,
  faEdit,
  faTrash,
  faCheck,
  faTimes,
  faMicrophone,
  faMicrophoneSlash,
  faPaperclip,
  faFile,
  faImage,
  faPlay,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import CryptoJS from 'crypto-js';
import Swal from 'sweetalert2';
import './chat.css';
import { useAuth } from '../contexts/AuthContext';

export default function Chat() {
  const {profile} = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUsersDropdown, setShowUsersDropdown] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(profile);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const realtimeChannelRef = useRef(null);

  // Generate encryption key based on conversation participants
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
      console.error('Decryption failed:', error);
      return '[Encrypted message]';
    }
  }, []);

  // load current user and profile once on mount
  /*
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user ?? null;
        if (!mounted) return;
        setCurrentUser(user);
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          setCurrentProfile(profile ?? null);
        }
      } catch (err) {
        console.error('Error fetching current user/profile', err);
      }
    })();
    return () => { mounted = false; };
  }, []);
*/
  const setupRealtimeSubscription = useCallback(() => {
    // cleanup previous channel if exists
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }

    const channelName = `chat_messages_${currentUser?.id ?? 'anon'}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = payload.new;

          // determine current user id in async-safe way
          (async () => {
            try {
              const { data } = await supabase.auth.getUser();
              const me = data?.user;
              if (!me) return;

              // only push messages that belong to the current conversation
              const belongsToConversation = (
                (newMsg.sender_id === me.id && newMsg.receiver_id === selectedUser?.user_id) ||
                (newMsg.receiver_id === me.id && newMsg.sender_id === selectedUser?.user_id)
              );

              if (belongsToConversation) {
                const media = await fetchMediaForMessage(newMsg.id);
                setMessages(prev => [...prev, { ...newMsg, chat_media: media }]);
              }
            } catch (err) {
              console.error('Realtime handler error', err);
            }
          })();
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
  }, [selectedUser, currentUser]);

  useEffect(() => {
    fetchUsers();
    const cleanup = setupRealtimeSubscription();
    return cleanup;
  }, [setupRealtimeSubscription]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.user_id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMediaForMessage = async (messageId) => {
    try {
      const { data, error } = await supabase
        .from('chat_media')
        .select('*')
        .eq('chat_id', messageId);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching media:', err);
      return [];
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_admin', false)
        .order('name', { ascending: true });

      if (error) throw error;

      // Fetch unreplied message counts for each user
      const usersWithUnrepliedCounts = await Promise.all(
        (data || []).map(async (user) => {
          try {
            const { data: unrepliedMessages, error: unrepliedError } = await supabase
              .from('chat_messages')
              .select('id')
              .eq('sender_id', user.user_id)
              .eq('is_admin_message', false)
              .eq('replied', false);

            if (unrepliedError) throw unrepliedError;

            return {
              ...user,
              unrepliedCount: (unrepliedMessages || []).length
            };
          } catch (err) {
            console.error(`Error fetching unreplied count for user ${user.user_id}:`, err);
            return {
              ...user,
              unrepliedCount: 0
            };
          }
        })
      );

      setUsers(usersWithUnrepliedCounts);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      const messagesWithMedia = await Promise.all(
        (messagesData || []).map(async (message) => {
          const media = await fetchMediaForMessage(message.id);
          return { ...message, chat_media: media };
        })
      );

      setMessages(messagesWithMedia);
    } catch (err) {
      console.error('Error fetching messages:', err);
      toast.error('Failed to load messages');
    }
  };

  const uploadFile = async (file, bucket, userId) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `chat/${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { contentType: file.type });

    if (error) throw error;

    // support different supabase clients returning different shapes
    const { data: publicData, error: publicError } = await supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (publicError) throw publicError;

    // getPublicUrl returns { publicUrl } inside data (older clients) or { publicURL }
    const publicUrl = (publicData && (publicData.publicUrl || publicData.publicURL)) || null;
    if (!publicUrl) throw new Error('Failed to get public url');

    return publicUrl;
  };

  const saveMediaToDatabase = async (chatId, mediaType, url, file) => {
    const mediaData = {
      chat_id: chatId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      created_at: new Date().toISOString()
    };

    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      await new Promise((resolve) => {
        img.onload = () => {
          mediaData.width = img.width;
          mediaData.height = img.height;
          URL.revokeObjectURL(objectUrl);
          resolve();
        };
        img.src = objectUrl;
      });
    }

    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
      const audio = document.createElement('audio');
      const objectUrl = URL.createObjectURL(file);
      await new Promise((resolve) => {
        audio.onloadedmetadata = () => {
          mediaData.duration = Math.round(audio.duration || 0);
          URL.revokeObjectURL(objectUrl);
          resolve();
        };
        audio.src = objectUrl;
      });
    }

    if (mediaType === 'voicemail') mediaData.voicemail_url = url;
    else if (mediaType === 'image') mediaData.image_url = url;
    else if (mediaType === 'file') mediaData.file_url = url;

    const { error } = await supabase
      .from('chat_media')
      .insert([mediaData]);

    if (error) throw error;
  };

  const handleInput = useCallback((e) => {
    const text = e.currentTarget.textContent || '';
    setNewMessage(text);
  }, []);

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback((e) => {
    setIsComposing(false);
    const text = e.currentTarget.textContent || '';
    setNewMessage(text);
  }, []);


  const updateRepiedStatus = async () => {
    try {
      // Find the last message from the selected user (not admin) that hasn't been replied to
      const lastUserMessage = messages
        .filter(msg => !msg.is_admin_message && msg.sender_id === selectedUser.user_id && msg.replied === false)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

      if (lastUserMessage) {
        // Update the most recent message from this user
        const { data, error } = await supabase
          .from('chat_messages')
          .update({ replied: true })
          .eq("id", lastUserMessage.id)

        if (error) throw error;

        // Update ALL previous messages from this same user to replied=true
        const { error: updateAllError } = await supabase
          .from('chat_messages')
          .update({ replied: true })
          .eq("sender_id", selectedUser.user_id)
          .eq("is_admin_message", false)
          .eq("replied", false); // Only update unreplied messages from this user

        if (updateAllError) throw updateAllError;

        // After updating, fetch fresh data to get accurate status
        const { data: freshMessages, error: fetchError } = await supabase
          .from('chat_messages')
          .select('replied, is_admin_message')
          .eq('is_admin_message', false);

        if (fetchError) throw fetchError;

        // Check if there are any remaining unreplied messages from any user
        const hasUnrepliedMessages = freshMessages.some(msg => !msg.replied);

        // Update only the specific user's unreplied count instead of refreshing all users
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.user_id === selectedUser.user_id 
              ? { ...user, unrepliedCount: 0 }
              : user
          )
        );
      }
      
    } catch (err) {
      console.error('Error updating replied status:', err);
    }
  };


  useEffect(() => {
    if (messageInputRef.current && !isComposing) {
      if (messageInputRef.current.textContent !== newMessage) {
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        const cursorAtStart = range && range.startContainer === messageInputRef.current && range.startOffset === 0;

        messageInputRef.current.textContent = newMessage;

        if (cursorAtStart && messageInputRef.current.firstChild) {
          const newRange = document.createRange();
          newRange.selectNodeContents(messageInputRef.current);
          newRange.collapse(false);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    }
  }, [newMessage, isComposing]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !selectedUser || isUploading) return;

    setIsUploading(true);
    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) throw new Error('Not authenticated');

      const encryptionKey = getEncryptionKey(user.id, selectedUser.user_id);
      const encryptedMessage = newMessage.trim() ? encryptMessage(newMessage.trim(), encryptionKey) : null;

      const messageData = {
        sender_id: user.id,
        receiver_id: selectedUser.user_id,
        message: encryptedMessage,
        // set is_admin_message based on profile
        is_admin_message: !!currentProfile?.is_admin
      };

      const { data: insertedMessage, error: messageError } = await supabase
        .from('chat_messages')
        .insert([messageData])
        .select()
        .single();

      if (messageError) throw messageError;

      if (selectedFile) {
        let mediaType = 'file';
        if (selectedFile.type.startsWith('image/')) mediaType = 'image';
        else if (selectedFile.type.startsWith('audio/')) mediaType = 'voicemail';

        const fileUrl = await uploadFile(selectedFile, 'chat_contents', selectedUser.user_id);
        await saveMediaToDatabase(insertedMessage.id, mediaType, fileUrl, selectedFile);
        
        // Fetch the message with media immediately after upload
        const media = await fetchMediaForMessage(insertedMessage.id);
        const messageWithMedia = { ...insertedMessage, chat_media: media };
        setMessages(prev => [...prev, messageWithMedia]);
      } else {
        // For text-only messages, add immediately
        setMessages(prev => [...prev, insertedMessage]);
      }

      updateRepiedStatus();  
      setNewMessage('');
      setSelectedFile(null);
      if (messageInputRef.current) messageInputRef.current.textContent = '';
      scrollToBottom(); // Scroll to show the new message
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const fileName = `voicemail-${Date.now()}.webm`;
        const file = new File([blob], fileName, { type: 'audio/webm' });
        setSelectedFile(file);
        setRecordedChunks([]);
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      setRecordedChunks(chunks);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const removeSelectedFile = () => {
    // Clean up object URL if it exists
    if (selectedFile && selectedFile.preview) {
      URL.revokeObjectURL(selectedFile.preview);
    }
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const editMessage = async (messageId, newText) => {
    if (!newText.trim()) return;

    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) throw new Error('Not authenticated');

      const message = messages.find(m => m.id === messageId);
      if (!message || message.sender_id !== user.id) {
        toast.error('You can only edit your own messages');
        return;
      }

      const encryptionKey = getEncryptionKey(message.sender_id, message.receiver_id);
      const encryptedMessage = encryptMessage(newText.trim(), encryptionKey);

      const { error } = await supabase
        .from('chat_messages')
        .update({ message: encryptedMessage })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, message: encryptedMessage } : m));
      setEditingMessageId(null);
      setEditingText('');
      toast.success('Message updated successfully');
    } catch (err) {
      console.error('Error editing message:', err);
      toast.error('Failed to edit message');
    }
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

    if (result.isConfirmed) {
      await deleteMessage(messageId);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) throw new Error('Not authenticated');

      const message = messages.find(m => m.id === messageId);
      if (!message) {
        toast.error('Message not found');
        return;
      }

      // allow deletion if sender is user or admin
      if (message.sender_id !== user.id && message.sender_id !== selectedUser?.user_id && !currentProfile?.is_admin) {
        toast.error('You can only delete messages in this conversation');
        return;
      }

      if (message.chat_media && message.chat_media.length > 0) {
        for (const media of message.chat_media) {
          try {
            const deleteFromUrl = async (url) => {
              if (!url) return;
              const bucket = 'chat_contents';
              const prefix = `/storage/v1/object/public/${bucket}/`;
              const idx = url.indexOf(prefix);
              if (idx === -1) return; // can't determine path
              const path = url.substring(idx + prefix.length);
              await supabase.storage.from(bucket).remove([path]);
            };

            await deleteFromUrl(media.image_url);
            await deleteFromUrl(media.file_url);
            await deleteFromUrl(media.voicemail_url);
          } catch (storageError) {
            console.error('Error deleting file from storage:', storageError);
          }
        }
      }

      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.filter(m => m.id !== messageId));
      toast.success('Message deleted successfully');
    } catch (err) {
      console.error('Error deleting message:', err);
      toast.error('Failed to delete message');
    }
  };

  const startEditing = (messageId, currentText) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const encryptionKey = getEncryptionKey(message.sender_id, message.receiver_id);
    const decryptedText = currentText ? decryptMessage(currentText, encryptionKey) : '';

    setEditingMessageId(messageId);
    setEditingText(decryptedText);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredUsers = users.map(user => {
    const hasUnreadMessages = messages.some(msg => msg.sender_id === user.user_id && !msg.is_admin_message);
    return { 
      ...user, 
      hasUnreadMessages,
      hasUnreplied: user.unrepliedCount > 0
    };
  }).filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp) => new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderMediaContent = (message) => {
    if (!message.chat_media || message.chat_media.length === 0) return null;
    const media = message.chat_media[0];

    return (
      <div className="message-media">
        {media.image_url && (
          <div className="media-image">
            <img src={media.image_url} alt="Shared image" />
          </div>
        )}
        {media.file_url && !media.image_url && (
          <div className="media-file">
            <FontAwesomeIcon icon={faFile} />
            <a href={media.file_url} download target="_blank" rel="noopener noreferrer">Download File</a>
            <span>{media.file_name}</span>
          </div>
        )}
        {media.voicemail_url && (
          <div className="media-voicemail">
            <audio controls className='voicemail'>
              <source src={media.voicemail_url} type="audio/webm" />
              Your browser does not support the audio element.
            </audio>
            <span>{media.file_name}</span>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="chat-loading">Loading chat...</div>;

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-header">
          <h2>Chat with Users</h2>
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="users-list">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div key={user.user_id} className={`user-item ${selectedUser?.user_id === user.user_id ? 'active' : ''} ${user.hasUnreadMessages ? 'unread' : ''} ${user.hasUnreplied ? 'unreplied' : ''}`} onClick={() => setSelectedUser(user)}>
                <div className="user-avatar"><FontAwesomeIcon icon={faUser} /></div>
                <div className="user-info">
                  <div className="user-name">{user.name || 'Unknown User'}</div>
                  <div className="user-email">{user.email}</div>
                </div>
                {user.hasUnreplied && (
                  <div className="unreplied-indicator">
                    <span className="unreplied-count">{user.unrepliedCount}</span>
                    <span className="unreplied-text">Unreplied</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-users">No users found</div>
          )}
        </div>
      </div>

      <div className="chat-main">
        {selectedUser ? (
          <>
            <div className="chat-header">
              <button className="back-button" onClick={() => setSelectedUser(null)}><FontAwesomeIcon icon={faChevronLeft} /></button>
              <div className="chat-user-info">
                <div className="user-avatar"><FontAwesomeIcon icon={faUser} /></div>
                <div>
                  <div className="user-name">{selectedUser.name || 'Unknown User'}</div>
                  <div className="user-status">Online</div>
                </div>
              </div>
            </div>

            <div className="messages-container">
              {messages.length > 0 ? (
                messages.map((message, index) => {
                  const showDate = index === 0 || formatDate(message.created_at) !== formatDate(messages[index - 1].created_at);
                  const encryptionKey = getEncryptionKey(message.sender_id, message.receiver_id);
                  const decryptedMessage = message.message ? decryptMessage(message.message, encryptionKey) : '';
                  const isOwnMessage = message.sender_id === currentUser?.id;

                  return (
                    <div key={`${message.id}-${index}`}>
                      {showDate && <div className="date-separator"><span>{formatDate(message.created_at)}</span></div>}
                      <div className={`message ${message.is_admin_message ? 'admin' : 'user'} ${isOwnMessage ? 'own' : ''}`}>
                        {editingMessageId === message.id ? (
                          <div className="message-edit-form">
                            <input type="text" value={editingText} onChange={(e) => setEditingText(e.target.value)} className="message-edit-input" autoFocus />
                            <div className="message-edit-actions">
                              <button onClick={() => editMessage(message.id, editingText)} className="message-edit-save"><FontAwesomeIcon icon={faCheck} /></button>
                              <button onClick={cancelEditing} className="message-edit-cancel"><FontAwesomeIcon icon={faTimes} /></button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {renderMediaContent(message)}
                            {decryptedMessage && <div className="message-content">{decryptedMessage}</div>}
                            <div className="message-time">
                              {formatTime(message.created_at)}
                              <div className="message-actions">
                                {message.is_admin_message && message.sender_id === currentUser?.id && (
                                  <button onClick={() => startEditing(message.id, message.message)} className="message-action-btn edit-btn" title="Edit message"><FontAwesomeIcon icon={faEdit} /></button>
                                )}
                                <button onClick={() => handleDeleteMessage(message.id)} className="message-action-btn delete-btn" title="Delete message"><FontAwesomeIcon icon={faTrash} /></button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-messages"><p>No messages yet. Start the conversation!</p></div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {selectedFile && (
              <div className="selected-file-preview">
                <div className="file-info">
                  <FontAwesomeIcon icon={selectedFile.type.startsWith('image/') ? faImage : selectedFile.type.startsWith('audio/') ? faPlay : faFile} />
                  <div className="file-details">
                    <span className="file-name">{selectedFile.name}</span>
                    <span className="file-size">{formatFileSize(selectedFile.size)}</span>
                  </div>
                  <button onClick={removeSelectedFile} className="remove-file-btn"><FontAwesomeIcon icon={faTimes} /></button>
                </div>
                {selectedFile.type.startsWith('image/') && (
                  <div className="image-preview">
                    <img src={URL.createObjectURL(selectedFile)} alt="Preview" />
                  </div>
                )}
                {selectedFile.type.startsWith('audio/') && (
                  <div className="audio-preview">
                    <audio controls>
                      <source src={URL.createObjectURL(selectedFile)} type={selectedFile.type} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={sendMessage} className="message-form">
              <div className="message-input-container">
                <div ref={messageInputRef} contentEditable onInput={handleInput} onCompositionStart={handleCompositionStart} onCompositionEnd={handleCompositionEnd} onPaste={(e) => { e.preventDefault(); const text = e.clipboardData.getData('text/plain'); document.execCommand('insertText', false, text); }} placeholder="Type your message..." className="message-input" suppressContentEditableWarning role="textbox" aria-multiline="true" />
                <div className="message-actions">
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,audio/*,.pdf,.doc,.docx,.txt" style={{ display: 'none' }} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="action-btn file-btn" title="Attach file"><FontAwesomeIcon icon={faPaperclip} /></button>
                  <button type="button" onClick={isRecording ? stopRecording : startRecording} className={`action-btn record-btn ${isRecording ? 'recording' : ''}`} title={isRecording ? 'Stop recording' : 'Record voicemail'}><FontAwesomeIcon icon={isRecording ? faMicrophoneSlash : faMicrophone} /></button>
                </div>
              </div>
              <button type="submit" className="send-button" disabled={(!newMessage.trim() && !selectedFile) || isUploading}>
                {isUploading ? <div className="loading-spinner"></div> : <FontAwesomeIcon icon={faChevronUp} />}
              </button>
            </form>
          </>
        ) : (
          <div className="chat-placeholder">
            <div className="placeholder-content">
              <button className="users-dropdown-toggle" onClick={() => setShowUsersDropdown(!showUsersDropdown)}><FontAwesomeIcon icon={faUser} className="placeholder-icon" /><span>Select Users to Chat With</span></button>
              <div className='hide-on-mobile'>
                <FontAwesomeIcon icon={faUsers} style={{fontSize:"2rem"}} />
                <h1>Select A User To Start Chatting</h1>
                <p>Note: only you can see the chats with a particular user</p>
              </div>
              <div className="users-dropdown">
                <div className="search-box">
                  <FontAwesomeIcon icon={faSearch} className='search-icon-mobile' />
                  <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="users-list">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div key={user.user_id} className={`user-item ${selectedUser?.user_id === user.user_id ? 'active' : ''} ${user.hasUnreplied ? 'unreplied' : ''}`} onClick={() => { setSelectedUser(user); setShowUsersDropdown(false); }}>
                        <div className="user-avatar"><FontAwesomeIcon icon={faUser} /></div>
                        <div className="user-info">
                          <div className="user-name">{user.name || 'Unknown User'}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                        {user.hasUnreplied && (
                          <div className="unreplied-indicator">
                            <span className="unreplied-count">{user.unrepliedCount}</span>
                            <span className="unreplied-text">Unreplied</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-users">No users found</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
