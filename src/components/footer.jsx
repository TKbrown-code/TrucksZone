import { Truck, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import "../styles/footer.css";
import logo from "../assets/Logo.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

export default function Footer() {


  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Company Info */}
          <div className="company-info">
            <div className="company-logo">
              <div className="logo-icon">
                <img src={logo} alt="logo" />
              </div>
              <span className="company-name">TrucksZone</span>
            </div>
            <p className="company-description">
              Your trusted partner for premium commercial and personal trucks. Quality, reliability, and service you can count on.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <Facebook />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <Instagram />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <Linkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="section-title">Quick Links</h3>
            <ul className="quick-links-list">
              <li>
                <a href="#features" className="quick-link">
                  Features
                </a>
              </li>
              <li>
                <a href="#inventory" className="quick-link">
                  Feature Products
                </a>
              </li>
              <li>
                <a href="#about" className="quick-link">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="quick-link">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="quick-link">
                  Financing
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="section-title">Contact Info</h3>
            <ul className="contact-info">
              <li className="contact-item">
                <Phone  />
                <div className="contact-details">
                  <p className="contact-label">Phone</p>
                  <a href="tel:+18088572794" className="contact-link">
                    +1(808)857-2794
                  </a>
                </div>
              </li>
              <li className="contact-item">
                <FontAwesomeIcon icon={faEnvelope}  />
                <div className="contact-details">
                  <p className="contact-label">Email</p>
                  <a href="mailto:truckzone678@gmail.com" className="contact-link">
                    truckzone678@gmail.com
                  </a>
                </div>
              </li>
              <li className="contact-item">
                <MapPin  />
                <div className="contact-details">
                  <p className="contact-label">Address</p>
                  <p className="contact-text">Hawaii / USA</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bottom-bar">
          <p className="copyright">
            &copy; {new Date().getFullYear()} TrucksZone. All Rights Reserved
          </p>
          <div className="legal-links">
            <a href="#" className="legal-link">
              Privacy Policy
            </a>
            <a href="#" className="legal-link">
              Terms of Service
            </a>
            <a href="#" className="legal-link">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
