import React from 'react';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import UserChat from '../components/userDashboard/userChat';
import UserProfile from '../components/userDashboard/userProfile';
import UserSettings from '../components/userDashboard/userSettings';
import UserTruckRequest from '../components/userDashboard/UserTruckRequest';
import {useAuth} from  "../contexts/AuthContext"
import Swal from 'sweetalert2';

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
  faTimes,
  faComment,
  faCommentAlt,
  faPaperPlane,
  faX,
  faHamburger,
  faList,
  faHome
} from '@fortawesome/free-solid-svg-icons'

import "../styles/Dashboard.css"

export default function Dashboard() {
    const {user, logout} = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [option, setOption] = useState(location.state?.newValue || "profile");
    const [opendrop, setOpenDrop] = useState(false);
    const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    if (location.state && location.state.newValue) {
        setOption(location.state.newValue); 
    }
  }, [location.state]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); 

  const isMobile = windowSize.width < 768; 

    return (
        <div className='userDashboard'>
            <div className="mobilenav" >
                <button onClick={() =>  setOpenDrop(!opendrop)}><FontAwesomeIcon icon={faList}/></button>
                <h2>TrucksZone</h2>
            </div>
            <div className='userDashboardcontainer'>
                {isMobile ? 
                <>
                    {opendrop && (
                    <aside className='aside-mobile-dashoard'>
                    <div className="asideupper">
                        <div className="asideheader">
                            <div>
                                <h2>Dashboard</h2>
                                <button onClick={() => setOpenDrop(!opendrop)}><FontAwesomeIcon icon={faX}/></button>
                            </div>
                            <p>TrucksZone</p>
                        </div>
                        <div className="asidebuttons">
                            <button onClick={() => navigate("/")}><FontAwesomeIcon icon={faHome}/> Home</button>
                            <button className={option ===  "profile" ?  "active" : ""} onClick={() => {setOption("profile"); setOpenDrop(false)}}><FontAwesomeIcon icon={faUser}/> Profile</button>
                            <button className={option ===  "chat" ? "active" :  ""} onClick={() => {setOption("chat"); setOpenDrop(false)}}><FontAwesomeIcon icon={faComment}/>   Chats</button>
                            <button className={option ===  "request" ? "active" : ""} onClick={() => {setOption("request"); setOpenDrop(false)}}><FontAwesomeIcon icon={faPaperPlane}/> Request</button>
                            <button className={option ===  "settings" ? "active" : ""} onClick={() => {setOption("settings"); setOpenDrop(false)}}><FontAwesomeIcon icon={faCog}/> Settings</button>
                        </div>
                    </div>
                    <div className="asidedowner">
                        <span>example@email.com</span>
                        <button onClick={logout}><FontAwesomeIcon icon={faSignOut}/>Logout</button>
                    </div>
                </aside>
                )}
                </> : 
                <>
                    <aside>
                    <div className="asideupper">
                        <div className="asideheader">
                                <h2>Dashboard</h2>
                            <p>TrucksZone</p>
                        </div>
                        <div className="asidebuttons">
                            <button onClick={() => navigate("/")}><FontAwesomeIcon icon={faHome}/> Home</button>
                            <button className={option ===  "profile" ? "active" : ""} onClick={() => setOption("profile")}><FontAwesomeIcon icon={faUser}/> Profile</button>
                            <button className={option ===  "chat" ? "active" : ""} onClick={() => setOption("chat")}><FontAwesomeIcon icon={faComment}/>   Chats</button>
                            <button className={option ===  "request" ? "active" : ""} onClick={() => setOption("request")}><FontAwesomeIcon icon={faPaperPlane}/> Request</button>
                            <button className={option ===  "settings" ? "active" : ""} onClick={() => setOption("settings")}><FontAwesomeIcon icon={faCog}/> Settings</button>
                        </div>
                    </div>
                    <div className="asidedowner">
                        <span>example@email.com</span>
                        <button onClick={logout}><FontAwesomeIcon icon={faSignOut}/>Logout</button>
                    </div>
                </aside>
                </>}
                
                <main>
                    {option === "profile" && <UserProfile/>}
                    {option === "chat" && <UserChat truckdata={location.state?.truckdata} />}
                    {option === "request" && <UserTruckRequest/>}
                    {option === "settings" && <UserSettings />}
                </main>
            </div>
        </div>
    );
}

