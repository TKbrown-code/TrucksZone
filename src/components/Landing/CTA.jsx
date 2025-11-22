import { ArrowRight, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./styles/cta.css";

export default function CallToAction() {
  const navigate = useNavigate();

  return (
    <section className="cta-section">
      <div className="cta-container">
        <h2 className="cta-title">Ready to Drive Your Success?</h2>
        <p className="cta-subtitle">
          Get behind the wheel of a premium truck today. Our team is ready to help you find the perfect vehicle for your business.
        </p>

        <div className="cta-button-container">
          <button onClick={() => navigate("/allTrucks")} className="cta-button">
            <FileText className="cta-icon" />
            <span>Get Your Truck</span>
            <ArrowRight className="cta-arrow" />
          </button>
        </div>
      </div>
    </section>
  );
}
