import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useModal } from "../../contexts/ModalContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { SubmitBtn } from "../Ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock, faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import "../../styles/Auth.css";

export default function Login({ isLogin }) {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login, authError } = useAuth();
  const { showModal, hideModal } = useModal();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    Swal.fire({
      title: "Please wait...",
      text: "Authenticating your credentials...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const data = await login(loginData);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: data.message || "Login successful!",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        navigate("/dashboard");
      });
    } catch (err) {
      console.error("Login error:", err);
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text:
          err.message ||
          authError ||
          "An error occurred during login. Please try again.",
        confirmButtonText: "Try Again",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formcontainer">

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">
            <FontAwesomeIcon icon={faUser} />
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={loginData.email}
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
            value={loginData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            disabled={loading}
          />
        </div>

        <div className="policy">
          <div className="policies">
            <input type="checkbox" name="checkbox"/>
            <span style={{color: "black"}}>Remember me</span>
          </div>
          <div className="passwordforgotten">
            <span>Password Forgotten?</span>
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
            "Login"
          )}
        </SubmitBtn>
      </form>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
}
