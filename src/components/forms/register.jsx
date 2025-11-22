import { useState, useRef } from "react";
import { RegisterUser, completeRegistration, EmailVerification } from "../../hooks/useFunctions";
import { useModal } from "../../contexts/ModalContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { SubmitBtn } from "../Ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faPaperPlane, faEnvelope } from '@fortawesome/free-solid-svg-icons';

export default function Register({isLogin}) {
  const navigate = useNavigate();
  const [RegisterData, setRegisterData] = useState({ 
    email: "", 
    password: "", 
    name: "",
    verifypassword: "" 
  });
  const [loading, setLoading] = useState(false);
  const { showModal, hideModal } = useModal();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!RegisterData.name || !RegisterData.email || !RegisterData.password || !RegisterData.verifypassword) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all required fields.',
      });
      return;
    }

    setLoading(true);

    try {
      Swal.fire({
        title: "Please wait...",
        text: "Registering you...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // First, register the user
      const edgeRes = await RegisterUser({
        email: RegisterData.email,
        password: RegisterData.password,
        verifypassword: RegisterData.verifypassword,
      });
      
      if (!edgeRes.ok) {
        const errorData = await edgeRes.json().catch(() => ({}));
        throw new Error(errorData.message || "Registration failed, Could not Sign Up. Please try again.");
      }

      const data1 = await edgeRes.json();

      Swal.fire({
        icon: "warning",
        title: "Verify your email",
        text: "Please check your email for verification link!",
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const edgeResEverify = await EmailVerification(data1);

      if(!edgeResEverify.ok) {
        const errorData = await edgeResEverify.json().catch(() => ({}));
        throw new Error(errorData.message || "Registration failed Email not confirmed. Please try again.");
      }

      const edgeRes2 = await completeRegistration(data1, RegisterData.email, RegisterData.name, RegisterData.verifypassword);

      if (!edgeRes2.ok) {
        const errorData = await edgeRes2.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create account, Could not complete. Please try again.");
      }

      const data = await edgeRes2.json();

      // Show success message
      Swal.fire({
        icon: "success",
        title: "Email Verification Successfully!",
        text: data.message || "Your account has bee successfully created!",
      })
      .then(() => {
        navigate('/dashboard');
      });
    } catch (err) {
      console.error("Registration error:", err);
      
      // Show specific error messages for common issues
      let errorMessage = err.message || "An error occurred during registration. Please try again.";
      
      if (err.message.includes('already registered')) {
        errorMessage = "This email is already registered. Please use a different email or login.";
      } else if (err.message.includes('network')) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      await Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: errorMessage,
        confirmButtonText: "Try Again"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formcontainer">
      <form onSubmit={handleSubmit}>
        <div>
            <label htmlFor="name">
                <FontAwesomeIcon icon={faUser} />
            </label>
            <input
                id="name"
                type="text"
                name="name"
                value={RegisterData.name}
                onChange={handleChange}
                placeholder="Enter your full names"
                required
                disabled={loading}
            />
        </div>

        <div>
          <label htmlFor="email">
            <FontAwesomeIcon icon={faEnvelope} />
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={RegisterData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="password">
           <FontAwesomeIcon icon={faLock} />
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={RegisterData.password}
            onChange={handleChange}
            placeholder="Enter your password (password must be at least 8 characters long)"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="verifypassword">
            <FontAwesomeIcon icon={faLock} />
          </label>
          <input
            id="verifypassword"
            type="password"
            name="verifypassword"
            value={RegisterData.verifypassword}
            onChange={handleChange}
            placeholder="Verify your password"
            required
            disabled={loading}
          />
        </div>

        <div className="policy">
          <div className="policies">
            <input type="checkbox" name="checkbox" required/>
            <span>i agree to this TrucksZone <span>Terms and policies!</span></span>
          </div>
        </div>

        <SubmitBtn
          type="submit"
          text={`${isLogin ? "Login" : "Sign Up"}`}
          bg="red"
          icon={faPaperPlane}
          disabled={loading}
          onMouseDown={(e) => {
            if (!loading) e.currentTarget.style.transform = "scale(0.98)";
          }}
          onMouseUp={(e) => {
            if (!loading) e.currentTarget.style.transform = "scale(1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {loading ? (
            <>
              <span className="spinner" style={{
                width: "1rem",
                height: "1rem",
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "white",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite"
              }}></span>
              Processing...
            </>
          ) : (
            `${isLogin ? "Login" : "Sign Up"}`
          )}
        </SubmitBtn>
      </form>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .file-upload-container {
          width: 100%;
          margin-bottom: 1rem;
        }

        .file-upload-label {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #f8f9fa;
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .file-upload-label:hover {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }

        .file-input {
          display: none;
        }

        .file-name {
          margin-left: auto;
          color: #6c757d;
          font-size: 0.9em;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 200px;
        }

        .file-error {
          color: #dc3545;
          font-size: 0.875em;
          margin-top: 5px;
        }

        .file-requirements {
          font-size: 0.75em;
          color: #6c757d;
          margin-top: 5px;
        }

        .progress {
          width: 100%;
          background-color: #f0f0f0;
          border-radius: 10px;
          margin: 10px 0;
          overflow: hidden;
        }

        .progress-bar {
          height: 20px;
          background-color: #10b981;
          border-radius: 10px;
          transition: width 0.3s;
          text-align: center;
          color: white;
          font-size: 12px;
          line-height: 20px;
        }
      `}</style>
    </div>
  );
}
