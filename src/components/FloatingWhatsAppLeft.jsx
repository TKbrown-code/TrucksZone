import React, { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import './FloatingWhatsAppLeft.css';

const FloatingWhatsAppLeft = ({ 
  phoneNumber = '+18088572794',
  message = 'Hello! I am interested in your trucks.'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltip, setTooltip] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down a bit
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    setIsVisible(window.scrollY > 100); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className={`floating-whatsapp-left ${isVisible ? 'visible' : ''}`}>
      <div 
        className={`whatsapp-tooltip-left ${tooltip ? 'show' : ''}`}
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
      >
        Chat with us on WhatsApp!
      </div>
      <button
        className="whatsapp-button-left"
        onClick={handleClick}
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp />
      </button>
    </div>
  );
};

export default FloatingWhatsAppLeft;
