import React, { useState, useEffect } from 'react'
import ManageUsers from './manageusers.jsx'
import Products from './products'
import Chats from './chat'
import Settings from './seettings.jsx'
import Profile from './profile'
import TruckManagement from './truckmanagement'
import Trucklist from "./TrucksList"
import Comments from './comments'
import { supabase } from '../lib/supabase'
import Swal from 'sweetalert2'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faArrowAltCircleLeft, 
  faEnvelope, 
  faUsers, 
  faBox, 
  faMessage, 
  faUser, 
  faSignOut, 
  faCog, 
  faTruck, 
  faArrowAltCircleRight, 
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../contexts/AuthContext'

import './admin.css'

function AdminDashboard(){
    const [selectedButton, setSelectedButton] = React.useState('Profile');
    const [expended, setExpended] = React.useState(true);
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [replied, setReplied] = useState(false);
    const { user } = useAuth();

    const Controlreply = (value) => {
        setReplied(value)
    }

    // Check initial status when component loads
    useEffect(() => {
        const checkInitialStatus = async () => {
            try {
                if (!user) return;

                const { data: messages, error } = await supabase
                    .from('chat_messages')
                    .select('replied, is_admin_message')
                    .eq('is_admin_message', false)
                    .eq('receiver_id', user.id);

                if (error) throw error;

                const hasUnrepliedMessages = messages.some(msg => !msg.replied);
                setReplied(!hasUnrepliedMessages);
            } catch (err) {
                // Error checking initial status
            }
        };

        const setupRealtimeSubscription = async () => {
            try {
                // First, enable realtime for the table
                const { error: realtimeError } = await supabase
                    .channel('setup_realtime')
                    .on('postgres_changes', 
                        { 
                            event: '*', 
                            schema: 'public', 
                            table: 'chat_messages' 
                        }, 
                        (payload) => {
                            checkInitialStatus();
                        }
                    )
                    .subscribe();

                if (realtimeError) {
                    // Fallback to polling every 5 seconds
                    const pollInterval = setInterval(checkInitialStatus, 5000);
                    return () => clearInterval(pollInterval);
                }

                // Realtime subscription successful
            } catch (error) {
                // Fallback to polling
                const pollInterval = setInterval(checkInitialStatus, 5000);
                return () => clearInterval(pollInterval);
            }
        };

        checkInitialStatus();
        setupRealtimeSubscription();

        return () => {
            const channel = supabase.channel('setup_realtime');
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    // Close sidebar when clicking on a navigation item on mobile
    const handleNavClick = (buttonName) => {
        setSelectedButton(buttonName);
        if (window.innerWidth <= 768) {
            closeSidebar();
        }
    };

    // Close sidebar when clicking outside on mobile
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            const sidebar = document.querySelector('.adminDashboard__sidebar');
            const hamburger = document.querySelector('.hamburger-menu');
            
            if (sidebarOpen && !sidebar.contains(event.target) && !hamburger.contains(event.target)) {
                closeSidebar();
            }
        };

        if (sidebarOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [sidebarOpen]);

    return(
        <div className="adminDashboard">
            {/* Hamburger menu for mobile */}
            <div className='mobile-header'>
            <button className="hamburger-menu" onClick={toggleSidebar} aria-label="Toggle menu">
                <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} />
            </button>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div 
                    className="sidebar-overlay active" 
                    onClick={closeSidebar}
                    role="button"
                    aria-label="Close menu"
                    tabIndex={0}
                />
            )}

            <div className={`${expended ? "adminDashboard__sidebar" : "adminDashboard__sidebar de-expand"} ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <button className="sidebar-close" onClick={closeSidebar} aria-label="Close menu">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <div className="siderheader">
                    <h2>{expended ? "TrucksZone Admin" : ""}</h2>
                    <button className="siderheader__button" onClick={() => setExpended(!expended)}><FontAwesomeIcon icon={expended ? faArrowAltCircleLeft : faArrowAltCircleRight}/></button>
                </div>

                <div className="sidebar_buttons">
                    <div className="sidebar_buttons__menuebuttons">
                        <button className={selectedButton === 'Profile' ? 'Active' : ''} onClick={() => handleNavClick('Profile')}>
                            <FontAwesomeIcon icon={faUser} />
                            {expended && <span>Profile</span>}
                        </button>
                        <button className={selectedButton === 'Manage Users' ? 'Active' : ''} onClick={() => handleNavClick('Manage Users')}>
                            <FontAwesomeIcon icon={faUsers} />
                            {expended && <span>Manage Users</span>}
                        </button>
                        <button className={selectedButton === 'Orders' ? 'Active' : ''} onClick={() => handleNavClick('Orders')}>
                            <FontAwesomeIcon icon={faBox} />
                            {expended && <span>Upload Products</span>}
                        </button>
                        <button className={selectedButton === 'Trucks' ? 'Active' : ''} onClick={() => handleNavClick('Trucks')}>
                            <FontAwesomeIcon icon={faTruck} />
                            {expended && <span>All Products</span>}
                        </button>
                        <button style={{backgroundColor: replied === false ? 'green' : ''}} className={selectedButton === 'Chats' ? 'Active' : ''} onClick={() => handleNavClick('Chats')}>
                            <FontAwesomeIcon icon={faMessage} />
                            {expended && <span >Chats</span>}
                        </button>
                        <button className={selectedButton === 'Comments' ? 'Active' : ''} onClick={() => handleNavClick('Comments')}>
                            <FontAwesomeIcon icon={faMessage} />
                            {expended && <span>Comments</span>}
                        </button>
                        <button className={selectedButton === 'Settings' ? 'Active' : ''} onClick={() => setSelectedButton('Settings')}><FontAwesomeIcon icon={faCog} />{expended && "Settings"}</button>
                    </div>

                    <div className="sidebar_buttons__profile">
                        <span><FontAwesomeIcon icon={faEnvelope}/>{expended && "example@gmail.com"}</span>
                        <button onClick={() => localStorage.removeItem('token')}><FontAwesomeIcon icon={faSignOut} />{expended && "Sign Out"}</button>
                    </div>
                
                </div>
            </div>
            <div className={expended ? "adminDashboard__main" : "adminDashboard__main main-expand"}>
                {selectedButton === 'Profile' && <Profile />}
                {selectedButton === 'Manage Users' && <ManageUsers />}
                {selectedButton === 'Orders' && <TruckManagement />}
                {selectedButton === 'Trucks' && <Trucklist />}
                {selectedButton === 'Chats' && <Chats />}
                {selectedButton === 'Comments' && <Comments />}
                {selectedButton === 'Settings' && <Settings />}
            </div> 
        </div>  
    )
}

export default AdminDashboard
