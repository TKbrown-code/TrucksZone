import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import "../styles/backtotop.css";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="back-to-top-container">
      <button
        onClick={scrollToTop}
        className={`back-to-top ${isVisible ? 'visible' : ''}`}
        aria-label="Back to top"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <ChevronUp className="back-to-top-icon" />
      </button>
      {showTooltip && isVisible && (
        <div className="back-to-top-tooltip show">
          Back to Top
        </div>
      )}
    </div>
  );
}
