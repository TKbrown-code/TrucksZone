import React, { useState, useEffect } from 'react';
import { FaComment } from 'react-icons/fa';
import './CircularFloatingMenu.css';
import './circular-menu-hides.css';

const CircularFloatingMenu = ({ 
  position = 'bottom-right'
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [currentTooltip, setCurrentTooltip] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    setIsVisible(window.scrollY > 100);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChatClick = () => {
    // Find and click the original floating chat button
    const chatButton = document.querySelector('.floating-chat-button');
    if (chatButton) {
      chatButton.click();
    } else {
      // Fallback: try to find any chat-related button
      const chatButtons = document.querySelectorAll('button[class*="chat"], button[class*="Chat"]');
      if (chatButtons.length > 0) {
        chatButtons[0].click();
      }
    }
    setIsMenuOpen(false); // Close menu after clicking
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const showTooltip = (tooltip) => {
    setCurrentTooltip(tooltip);
  };

  const hideTooltip = () => {
    setCurrentTooltip('');
  };

  return (
    <>
      <div className={`circular-floating-menu ${position} ${isVisible ? 'visible' : ''}`}>
        {/* Menu Items */}
        <div className={`menu-items ${isMenuOpen ? 'open' : ''}`}>
          {/* Chat Button - Center */}
          <div 
            className="menu-item center-item"
            onClick={handleChatClick}
            onMouseEnter={() => showTooltip('Chat with Us')}
            onMouseLeave={hideTooltip}
            title="Chat with Us"
          >
            <FaComment />
            {currentTooltip === 'Chat with Us' && (
              <div className="tooltip">Chat with Us</div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <div 
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          onMouseEnter={() => showTooltip('Menu')}
          onMouseLeave={hideTooltip}
          title="Menu"
        >
          <div className="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </div>
          {currentTooltip === 'Menu' && (
            <div className="tooltip">Menu</div>
          )}
        </div>
      </div>
    </>
  );
};

export default CircularFloatingMenu;
