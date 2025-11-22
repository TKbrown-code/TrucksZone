// src/components/Ui/Button.jsx
import { motion } from "framer-motion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane} from '@fortawesome/free-solid-svg-icons';

const baseStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "10px 20px",
  border: "none",
  borderRadius: "10px",
  fontWeight: "600",
  fontSize: "15px",
  cursor: "pointer",
  color: "#fff",
  userSelect: "none",
  transition: "all 0.3s ease-in-out",
  outline: "none",
};

const variants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

function getBg(bg, fallback) {
  if (bg === "transparent") return "transparent";
  if (bg) return bg;
  return fallback;
}

function getBorder(bg) {
  return bg === "transparent" ? "2px solid #ffd700" : "none";
}

function BaseBtn({ text, fontSize="16px", icon, onClick, width = "auto", padding = "10px", bg = "seagreen", fallbackBg, textColor = "white" }) {
  return (
    <motion.button
      whileHover="hover"
      whileTap="tap"
      variants={variants}
      onClick={onClick}
      style={{
        ...baseStyle,
        width,
        padding,
        background: getBg(bg, fallbackBg),
        border: getBorder(bg),
        color: bg === "transparent" ? fallbackBg : textColor,
        boxShadow: bg === "transparent" ? "none" : "0 4px 10px rgba(0,0,0,0.3)",
        fontSize
      }}
    >
      {icon && <span style={{ fontSize }}><FontAwesomeIcon icon={icon}/></span>}
      {text}
    </motion.button>
  );
}

// Button Variants
export const RegularBtn = (props) => (
  <BaseBtn {...props} fallbackBg="linear-gradient(135deg, #444, #111)" />
);

export const SubmitBtn = (props) => (
  <BaseBtn {...props} fallbackBg="linear-gradient(135deg, #007bff, #0056b3)" />
);

export const AgreeBtn = (props) => (
  <BaseBtn {...props} fallbackBg="linear-gradient(135deg, #28a745, #1c7430)" />
);

export const OpenBtn = (props) => (
  <BaseBtn {...props} fallbackBg="linear-gradient(135deg, #ffb400, #cc8a00)" />
);

export const CloseBtn = (props) => (
  <BaseBtn {...props} fallbackBg="linear-gradient(135deg, #dc3545, #a71d2a)" />
);
