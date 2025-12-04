import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import "../styles/contacts.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faEnvelope, faMapPin, faClock } from "@fortawesome/free-solid-svg-icons";

export default function ContactPage() {

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="hero-section" data-aos="fade-up">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200"
          alt="Contact Us"
          className="hero-image"
        />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">get In Touch</h1>
          <p className="hero-subtitle">Ready to find your perfect truck? Contact us today</p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="contact-info-section">
        <div className="contact-container">
          <div className="contact-info-grid">
            <div className="contact-info-card" data-aos="fade-up" data-aos-delay="100">
              <div className="contact-icon-container">
                <FontAwesomeIcon icon={faPhone} className="contact-icon" />
              </div>
              <h3 className="contact-title">Phone</h3>
              <p className="contact-text">+1(808)8572794</p>
            </div>

            <div className="contact-info-card" data-aos="fade-up" data-aos-delay="200">
              <div className="contact-icon-container">
                <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
              </div>
              <h3 className="contact-title">Email</h3>
              <p className="contact-text">truckzone678@gmail.com</p>
            </div>

            <div className="contact-info-card" data-aos="fade-up" data-aos-delay="300">
              <div className="contact-icon-container">
                <FontAwesomeIcon icon={faMapPin} className="contact-icon" />
              </div>
              <h3 className="contact-title">Location</h3>
              <p className="contact-text">hawaii</p>
            </div>

            <div className="contact-info-card" data-aos="fade-up" data-aos-delay="400">
              <div className="contact-icon-container">
                <FontAwesomeIcon icon={faClock} className="contact-icon" />
              </div>
              <h3 className="contact-title">Hours</h3>
              <p className="contact-text">Mon-Fri: 8AM - 8PM</p>
              <p className="contact-text">Sat-Sun: 9AM - 6PM</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-form-section">
            <div className="contact-form-card" data-aos="fade-right">
              <h2 className="form-title">Send us a message</h2>
              <form className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Inquiry about..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    rows={6}
                    className="form-textarea"
                    placeholder="Tell us about your truck needs..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="submit-button"
                >
                  <Send className="submit-icon" />
                  send Message
                </button>
              </form>
            </div>

            {/* Map */}
            <div className="map-card" data-aos="fade-left">
              <h2 className="map-title">Visit our showroom</h2>
              <div className="map-container">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d214587.0415632594!2d-96.87195745!3d32.8205865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864c19f77b45974b%3A0xb9ec9ba4f647678f!2shawaii%2C%20TX!5e0!3m2!1sen!2sus!4v1635959634234!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Location Map"
                  className="map-iframe"
                ></iframe>
              </div>
              <p className="map-description">
                Visit us at hawaii to see our full inventory of trucks in person. 
                Our expert team is ready to help you find the perfect vehicle for your needs.
              </p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="directions-button"
              >
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
