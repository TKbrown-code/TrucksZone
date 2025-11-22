import { useState } from "react";
import Login from "../components/forms/Login"
import Register from "../components/forms/register"
import {RegularBtn} from "../components/Ui/button"
import "../styles/Auth.css"
import { FaApple, FaGooglePlus, FaMicrosoft } from "react-icons/fa";  // ✔ works
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

function Auth(){
 const navigate = useNavigate();
 const [isLogin, setLogin] = useState(true);

    return(
        <>
        <div className={`${isLogin ? "AuthForms" : "AuthForms changerow"}`}>  
            <div className="AuthFormsContainer">
                <div className="formmainheader">
                    <h2>{isLogin ? "Welcome Back" : "Sign Up"}</h2>
                </div>
                <div className="providers">
                    <div className="providericon">
                        <button onClick={() => alert("Coming Soon!")}><FaGooglePlus className="p-icons"/></button>
                        <button onClick={() => alert("Coming Soon!")}><FaApple className="p-icons"/></button>
                        <button onClick={() => alert("Coming Soon!")}><FaMicrosoft className="p-icons"/></button>
                    </div>
                </div>
                <div className="formdivider">
                        <span>or</span>
                </div>
                <div className="formdivider2">
                    <span>fill up the form to {isLogin ? "Sign In" : "Sign Up"}</span>
                </div>
                {
                    isLogin ? <Login isLogin={isLogin}/> : <Register isLogin={isLogin}/>
                }
                <span className="mobilelogintoggle">{isLogin ? "Don't have an account?" : "Already have an account?"} <span style={{cursor: "pointer", color: "red"}} onClick={() => setLogin(!isLogin)}>{isLogin ? "Sign Up" : "Sign In"}</span></span>          
                <div className="backhomebtnmobile" onClick={() => navigate("/")}><span><FontAwesomeIcon icon={faArrowLeft}/> Return Home</span></div>    
            </div>
            <div className="formrightdeco">
                <div className="formoverlay">
                    <div className="formovalayheader">
                        <h2>{isLogin ? "Login to your account" : "Create an account"}</h2>
                        <p>{isLogin ? "Welcome Back to an adventure of Trucks that makes the highways brighter and safer" : "Join us in making the highways brighter and safer with Trucks Like no other"}</p>
                    </div>
                    <div className="loginchoicebtn"><span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span> <RegularBtn text={isLogin ? "Sign Up" : "Sign In"} onClick={() => setLogin(!isLogin)} bg="red"></RegularBtn></div>
                    <div className="backhomebtn" onClick={() => navigate("/")}><span><FontAwesomeIcon icon={faArrowLeft}/> Return Home</span></div>    
                </div>
                <img src="https://media.istockphoto.com/id/1465157700/photo/brightly-red-colored-semi-truck-speeding-on-a-two-lane-highway-with-cars-in-background-under.jpg?b=1&s=612x612&w=0&k=20&c=vmUpUfewz7jtLyZWkusTsTo8VSVx70RW75rOkMGv1p4=" alt="" />
            </div>
        </div>
        </>
    );
}

export default Auth