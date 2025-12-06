import { useAuth } from "../contexts/AuthContext";
import "./profile.css"
import "../styles/combined-notifications.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage,faUsers,faTruck,faDashboard } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import CryptoJS from 'crypto-js';
import {useModal} from "../contexts/ModalContext";
import Swal from "sweetalert2";

function Profile(){
    const { profile } = useAuth();
    const { logout } = useAuth();
    const [unreadMessages, setUnreadMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [newSignups, setNewSignups] = useState([]);
    const [truckRequests, setTruckRequests] = useState([]);
    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You are about to logout from your admin account!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, logout!'
        });

        if (result.isConfirmed) {
            await logout();
            Swal.fire({
                title: 'Logged Out!',
                text: 'You have been successfully logged out.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        }
    };

    // Pagination states
    const [messagesLimit, setMessagesLimit] = useState(3);
    const [signupsLimit, setSignupsLimit] = useState(3);
    const [truckRequestsLimit, setTruckRequestsLimit] = useState(3);
    const [messagesHasMore, setMessagesHasMore] = useState(true);
    const [signupsHasMore, setSignupsHasMore] = useState(true);
    const [truckRequestsHasMore, setTruckRequestsHasMore] = useState(true);

    // Generate encryption key based on conversation participants
    const getEncryptionKey = (senderId, receiverId) => {
        const sortedIds = [senderId, receiverId].sort();
        return CryptoJS.SHA256(sortedIds.join('-')).toString();
    };

    // Decrypt message
    const decryptMessage = (encryptedMessage, key) => {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedMessage, key);
            return bytes.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            return '[Encrypted message]';
        }
    };

    const fetchTruckRequests = async (limit = 3, append = false) => {
        try {
            const { data, error } = await supabase
                .from('TruckRequest')
                .select(`
                    id,
                    created_at,
                    user_id,
                    truck_id,
                    request_text,
                    trucks!truckrequest_truck_id_fkey (
                        title,
                        brand
                    ),
                    profiles!truckrequest_user_id_fkey (
                        name,
                        email
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            // Format the data with truncated IDs and username
            const formattedRequests = data.map(request => ({
                ...request,
                truncatedUserId: request.user_id ? request.user_id.substring(0, 8) : 'Unknown',
                truncatedTruckId: request.truck_id ? request.truck_id.substring(0, 8) : 'Unknown',
                userName: request.profiles?.name || 'Unknown User'
            }));

            if (append) {
                setTruckRequests(prev => [...prev, ...formattedRequests]);
            } else {
                setTruckRequests(formattedRequests);
            }
            
            // Check if there are more truck requests to load
            setTruckRequestsHasMore(data.length === limit);
        } catch (err) {
            // Error fetching truck requests
        }
    };

    const fetchUnreadMessages = async (limit = 3, append = false) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch messages where admin is the receiver and messages are from users
            const { data, error } = await supabase
                .from('chat_messages')
                .select(`
                    id,
                    message,
                    created_at,
                    sender_id,
                    receiver_id,
                    is_admin_message,
                    replied,
                    profiles!chat_messages_sender_id_fkey (
                        name,
                        email
                    )
                `)
                .eq('receiver_id', user.id)
                .eq('is_admin_message', false)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            // Decrypt messages and format them
            const decryptedMessages = data.map(msg => {
                const encryptionKey = getEncryptionKey(msg.sender_id, msg.receiver_id);
                const decryptedText = decryptMessage(msg.message, encryptionKey);
                return {
                    ...msg,
                    decryptedMessage: decryptedText,
                    senderName: msg.profiles?.name || 'Unknown User',
                    senderEmail: msg.profiles?.email || 'No email'
                };
            });

            if (append) {
                setUnreadMessages(prev => [...prev, ...decryptedMessages]);
            } else {
                setUnreadMessages(decryptedMessages);
            }
            
            // Check if there are more messages to load
            setMessagesHasMore(data.length === limit);
        } catch (err) {
            // Error fetching unread messages
        }
    };

    const fetchNewSignups = async (limit = 3, append = false) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('is_admin', false)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;

            // Filter signups to only show those within last 24 hours
            const now = new Date();
            const twentyFourHours = 24 * 60 * 60 * 1000;
            const filteredSignups = data.filter(signup => {
                const signupTime = new Date(signup.created_at);
                const timeDiff = now - signupTime;
                return timeDiff < twentyFourHours;
            });

            if (append) {
                setNewSignups(prev => [...prev, ...filteredSignups]);
            } else {
                setNewSignups(filteredSignups);
            }
            
            // Check if there are more signups to load
            setSignupsHasMore(data.length === limit);
        } catch (err) {
            // Error fetching new signups
        }
    };

    // Load more functions
    const loadMoreMessages = () => {
        const newLimit = messagesLimit + 3;
        setMessagesLimit(newLimit);
        fetchUnreadMessages(newLimit, true);
    };

    const loadMoreSignups = () => {
        const newLimit = signupsLimit + 3;
        setSignupsLimit(newLimit);
        fetchNewSignups(newLimit, true);
    };

    const loadMoreTruckRequests = () => {
        const newLimit = truckRequestsLimit + 3;
        setTruckRequestsLimit(newLimit);
        fetchTruckRequests(newLimit, true);
    };

    // Get current messages to display (limit to current limit)
    const displayedMessages = unreadMessages.filter(msg => msg.replied === false).slice(0, messagesLimit);
    const displayedSignups = newSignups.slice(0, signupsLimit);
    const displayedTruckRequests = truckRequests.slice(0, truckRequestsLimit);

    useEffect(() => {
        fetchUnreadMessages();
        fetchNewSignups();
        fetchTruckRequests();
        setupRealtimeSubscription();
    }, []);

    const setupRealtimeSubscription = useCallback(() => {
        // Listen for new signups
        const signupChannel = supabase
            .channel('profile_signups')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'profiles'
                },
                (payload) => {
                    const newUser = payload.new;
                    if (!newUser.is_admin) {
                        setNewSignups([newUser]); // Replace with only the most recent signup

                        // Clear any existing timeout
                        if (timeoutRef.current) {
                            clearTimeout(timeoutRef.current);
                        }

                        // Set timeout to clear the notification after 24 hours
                        timeoutRef.current = setTimeout(() => {
                            setNewSignups([]);
                        }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
                    }
                }
            );

        // Listen for truck requests
        const truckRequestChannel = supabase
            .channel('profile_truck_requests')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'TruckRequest'
                },
                (payload) => {
                    setTruckRequests(prev => [payload.new, ...prev].slice(0, truckRequestsLimit));
                }
            );

        // Listen for chat messages with fallback
        const setupMessageRealtime = async () => {
            try {
                const messageChannel = supabase
                    .channel('profile_messages')
                    .on('postgres_changes', 
                        { 
                            event: '*', 
                            schema: 'public', 
                            table: 'chat_messages' 
                        }, 
                        (payload) => {
                            fetchUnreadMessages();
                            fetchNewSignups();
                            fetchTruckRequests();
                        }
                    )
                    .subscribe();

                return messageChannel;
            } catch (error) {
                // Fallback to polling every 5 seconds
                const pollInterval = setInterval(fetchUnreadMessages, 5000);
                return { remove: () => clearInterval(pollInterval) };
            }
        };

        // Subscribe to all channels
        signupChannel.subscribe();
        truckRequestChannel.subscribe();
        const messageChannel = setupMessageRealtime();

        return () => {
            const signupChannel = supabase.channel('profile_signups');
            const truckRequestChannel = supabase.channel('profile_truck_requests');
            const messageChannel = supabase.channel('profile_messages');
            
            if (signupChannel) supabase.removeChannel(signupChannel);
            if (truckRequestChannel) supabase.removeChannel(truckRequestChannel);
            if (messageChannel && messageChannel.remove) {
                messageChannel.remove();
            } else if (messageChannel) {
                supabase.removeChannel(messageChannel);
            }
            
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [fetchUnreadMessages, fetchTruckRequests]);

    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('id, user_id, message, created_at, is_read')
                .eq('is_read', false) // You can change this if you want to see read notifications too
                .order('created_at', { ascending: false }).limit(1);

            if (error) throw error;
            return data;
        } catch (err) {
            return [];
        }
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            if (error) throw error;
            // Optionally, refetch notifications here if you want to immediately update the UI
        } catch (err) {
            // Error marking notification as read
        }
    };

    useEffect(() => {
        const getNotifications = async () => {
            const data = await fetchNotifications();
            setNotifications(data);
        };
        
        getNotifications();
    }, []);

    const handleNotificationClick = (notificationId) => {
        markNotificationAsRead(notificationId);
        // Navigate to user details page or show user info in modal
    };

    return(
    <>
    <div className="profile">
        <div className="profile-header">
            <h2>Welcome {profile.name} ✌️</h2>
            <div className="profile-header__button">
                <span><FontAwesomeIcon icon={faDashboard} />DashBoard</span>
                <button onClick={handleLogout}>Logout</button>   
            </div> 
        </div>
        <div className="profile-body">
            <div className="profile-body__left profile-body__left--avatar">
                <img src="https://cdn.pixabay.com/photo/2023/06/29/01/09/portrait-8095464_1280.jpg" alt="" />
            </div>
            <div className="profile-body__right profile-body__right--info">
                <h3>Profile Information</h3>
                <ul>
                    <li><strong>Name:</strong>  {profile.name}</li>
                    <li><strong>Email:</strong> {profile.email}</li>
                    <li><strong>Admin Id:</strong> {profile.user_id}</li>
                </ul>
            </div>
        </div>
        <div className="notifications">
            <h3>Notifications</h3>
            <div className="notifications__list">
                {displayedMessages.length > 0 ? (
                    <div className="notifications__item">
                        <div className="itemicon">
                            <FontAwesomeIcon icon={faMessage} className="messageicon"/>
                            <span>Messages</span>
                        </div>
                        <div className="itembody">
                            {displayedMessages.map((msg) => (
                                <div key={msg.id} className="notification-item">
                                    <p><strong>{msg.senderName}</strong>: {msg.decryptedMessage}</p>
                                    <small>{new Date(msg.created_at).toLocaleString()}</small>
                                </div>
                            ))}
                            {messagesHasMore && (
                                <div className="view-all-footer">
                                    <button className="view-all-btn" onClick={loadMoreMessages}>
                                        View More Messages
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : unreadMessages.length > 0 && (
                    <div className="notifications__item">
                        <div className="itemicon">
                            <FontAwesomeIcon icon={faMessage} className="messageicon"/>
                            <span>Messages</span>
                        </div>
                        <div className="itembody">
                            <div className="notification-item">
                                <p>No new messages</p>
                            </div>
                        </div>
                    </div>
                )}
                {displayedSignups.length > 0 ? (
                    <div className="notifications__item">
                        <div className="itemicon">
                            <FontAwesomeIcon icon={faUsers} className="usersicon"/>
                            <span>New SignUps</span>
                        </div>
                        <div className="itembody">
                            {displayedSignups.map((user) => (
                                <div key={user.user_id} className="notification-item">
                                    <p>new user signed up</p>
                                    <p><strong>username</strong> : {user.name || 'Unknown'}</p>
                                    <p><strong>email</strong> : {user.email}</p>
                                    <p><strong>Location</strong>: {user.location || 'Unknown'}</p>
                                </div>
                            ))}
                            {signupsHasMore && (
                                <div className="view-all-footer">
                                    <button className="view-all-btn" onClick={loadMoreSignups}>
                                        View More Signups
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="notifications__item">
                        <div className="itemicon">
                            <FontAwesomeIcon icon={faUsers} className="usersicon"/>
                            <span>New SignUps</span>
                        </div>
                        <div className="itembody">
                            <div className="notification-item">
                                <p>No new signups</p>
                            </div>
                        </div>
                    </div>
                )}
                {/* Truck Requests - All in One Card */}
                <div className="notifications__item">
                    <div className="itemicon">
                        <FontAwesomeIcon icon={faTruck} className="truckicon"/>
                        <span>Truck Requests</span>
                    </div>
                    <div className="itembody">
                        {displayedTruckRequests.length > 0 ? (
                            <>
                                {displayedTruckRequests.map((request) => (
                                    <div key={request.id} className="truck-request-item">
                                        <p><strong>Truck:</strong> {request.trucks?.title || 'Unknown Truck'} ({request.trucks?.brand || 'Unknown Brand'})</p>
                                        <p><strong>Request:</strong> {request.request_text || 'No request text'}</p>
                                        <p><strong>User:</strong> {request.userName} | <strong>User ID:</strong> {request.truncatedUserId} | <strong>Truck ID:</strong> {request.truncatedTruckId}</p>
                                        <small>{new Date(request.created_at).toLocaleString()}</small>
                                    </div>
                                ))}
                                {truckRequestsHasMore && (
                                    <div className="view-all-footer">
                                        <button className="view-all-btn" onClick={loadMoreTruckRequests}>
                                            View More Truck Requests
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p>No truck requests</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>    
    </>
    )
}

export default Profile