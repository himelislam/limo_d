(function() {
  'use strict';

  // Transport Booking Widget
  window.TransportBookingWidget = {
    init: function(config) {
      const {
        widgetId,
        containerId = 'transport-booking-widget',
        buttonText = 'Book a Ride',
        buttonStyle = {},
        modalStyle = {},
        baseUrl = window.location.origin
      } = config;

      if (!widgetId) {
        console.error('TransportBookingWidget: widgetId is required');
        return;
      }

      // Create button
      const button = document.createElement('button');
      button.textContent = buttonText;
      button.style.cssText = `
        background-color: #3B82F6;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
        ${Object.entries(buttonStyle).map(([key, value]) => `${key}: ${value}`).join('; ')}
      `;

      button.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#2563EB';
      });

      button.addEventListener('mouseleave', function() {
        this.style.backgroundColor = buttonStyle.backgroundColor || '#3B82F6';
      });

      // Create modal
      const modal = document.createElement('div');
      modal.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        ${Object.entries(modalStyle).map(([key, value]) => `${key}: ${value}`).join('; ')}
      `;

      const modalContent = document.createElement('div');
      modalContent.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        max-width: 500px;
        margin: 0 auto;
        background: white;
        overflow: hidden;
      `;

      const closeButton = document.createElement('button');
      closeButton.innerHTML = '×';
      closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 15px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        z-index: 10001;
        color: #666;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      `;

      const iframe = document.createElement('iframe');
      iframe.src = `${baseUrl}/widget/${widgetId}`;
      iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
      `;

      modalContent.appendChild(closeButton);
      modalContent.appendChild(iframe);
      modal.appendChild(modalContent);

      // Event listeners
      button.addEventListener('click', function() {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
      });

      closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
      });

      modal.addEventListener('click', function(e) {
        if (e.target === modal) {
          modal.style.display = 'none';
          document.body.style.overflow = 'auto';
        }
      });

      // Escape key to close
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
          modal.style.display = 'none';
          document.body.style.overflow = 'auto';
        }
      });

      // Append to container
      const container = document.getElementById(containerId);
      if (container) {
        container.appendChild(button);
        document.body.appendChild(modal);
      } else {
        console.error(`TransportBookingWidget: Container with id "${containerId}" not found`);
      }

      return {
        open: function() {
          modal.style.display = 'block';
          document.body.style.overflow = 'hidden';
        },
        close: function() {
          modal.style.display = 'none';
          document.body.style.overflow = 'auto';
        },
        destroy: function() {
          if (container && button.parentNode === container) {
            container.removeChild(button);
          }
          if (modal.parentNode === document.body) {
            document.body.removeChild(modal);
          }
        }
      };
    }
  };

  // Auto-initialize if data attributes are present
  document.addEventListener('DOMContentLoaded', function() {
    const autoInit = document.querySelector('[data-transport-widget]');
    if (autoInit) {
      const widgetId = autoInit.getAttribute('data-widget-id');
      const buttonText = autoInit.getAttribute('data-button-text') || 'Book a Ride';
      const baseUrl = autoInit.getAttribute('data-base-url') || window.location.origin;
      const containerId = autoInit.id || 'transport-booking-widget';

      if (widgetId) {
        window.TransportBookingWidget.init({
          widgetId,
          containerId,
          buttonText,
          baseUrl
        });
      }
    }
  });
})();
