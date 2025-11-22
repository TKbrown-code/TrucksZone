import {RegularBtn} from "../../components/Ui/button";   
import { useNavigate } from "react-router-dom"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import "../../styles/emailConfirmation.css";

export default function EmailConfirmation() {
    const navigate = useNavigate();
    
    return (
        <div className="email-confirmation">
            <div className="email-confirmation-container">
                <div className="emailConfirmheader">
                    <h2>Cameroon Community Jinzhou Liaoning Province</h2>
                </div>
                <h1>Email Verified Successfully!</h1>
                <ul className="confirmation-message">
                    <li><FontAwesomeIcon icon={faCircleCheck} className="check-icon" /> Thank you for registering at Cameroon Jinzhou Community</li>
                    <li><FontAwesomeIcon icon={faCircleCheck} className="check-icon" /> Your application has been received and is being processed</li>
                    <li><FontAwesomeIcon icon={faCircleCheck} className="check-icon" /> You will be notified via email once approved</li>
                    <span>Notice: All New Members are required to pay their membership fee of 50 RMB for their membership card which carries your membership id use to login</span>
                </ul>
                <RegularBtn text="Return to Login" onClick={() => navigate('/')} icon={faPaperPlane}/>
            </div>
        </div>
    );

}