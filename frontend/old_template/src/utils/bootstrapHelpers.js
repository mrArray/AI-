// Bootstrap JS integration helper for React components
import { useEffect, useRef } from 'react';

/**
 * Custom hook to initialize Bootstrap components on mount
 * @param {Object} options - Configuration options
 * @param {boolean} options.tooltips - Whether to initialize tooltips
 * @param {boolean} options.popovers - Whether to initialize popovers
 * @param {boolean} options.dropdowns - Whether to initialize dropdowns
 * @param {boolean} options.modals - Whether to initialize modals
 * @param {Array} options.dependencies - Dependencies array to trigger re-initialization
 */
export const useBootstrapJS = (options = {}) => {
  const {
    tooltips = true,
    popovers = true,
    dropdowns = true,
    modals = true,
    dependencies = []
  } = options;
  
  const bootstrapRef = useRef(null);
  
  useEffect(() => {
    // Import Bootstrap JS
    const bootstrap = require('bootstrap/dist/js/bootstrap.bundle.min.js');
    bootstrapRef.current = bootstrap;
    
    // Initialize tooltips if enabled
    if (tooltips) {
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
    }
    
    // Initialize popovers if enabled
    if (popovers) {
      const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
      const popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
      });
    }
    
    // Initialize dropdowns if enabled
    if (dropdowns) {
      const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
      const dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
        return new bootstrap.Dropdown(dropdownToggleEl);
      });
    }
    
    // Initialize modals if enabled
    if (modals) {
      const modalElementList = [].slice.call(document.querySelectorAll('.modal'));
      const modalList = modalElementList.map(function (modalEl) {
        return new bootstrap.Modal(modalEl);
      });
    }
    
    // Clean up on unmount
    return () => {
      // Dispose tooltips
      if (tooltips) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach(tooltip => {
          const instance = bootstrap.Tooltip.getInstance(tooltip);
          if (instance) {
            instance.dispose();
          }
        });
      }
      
      // Dispose popovers
      if (popovers) {
        const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
        popoverTriggerList.forEach(popover => {
          const instance = bootstrap.Popover.getInstance(popover);
          if (instance) {
            instance.dispose();
          }
        });
      }
    };
  }, dependencies);
  
  return bootstrapRef.current;
};

/**
 * Helper function to manually initialize a dropdown
 * @param {string} selector - CSS selector for the dropdown element
 */
export const initDropdown = (selector) => {
  const bootstrap = require('bootstrap/dist/js/bootstrap.bundle.min.js');
  const dropdownElement = document.querySelector(selector);
  if (dropdownElement) {
    return new bootstrap.Dropdown(dropdownElement);
  }
  return null;
};

/**
 * Helper function to manually initialize a modal
 * @param {string} selector - CSS selector for the modal element
 */
export const initModal = (selector) => {
  const bootstrap = require('bootstrap/dist/js/bootstrap.bundle.min.js');
  const modalElement = document.querySelector(selector);
  if (modalElement) {
    return new bootstrap.Modal(modalElement);
  }
  return null;
};

/**
 * Helper function to manually show a toast
 * @param {string} selector - CSS selector for the toast element
 */
export const showToast = (selector) => {
  const bootstrap = require('bootstrap/dist/js/bootstrap.bundle.min.js');
  const toastElement = document.querySelector(selector);
  if (toastElement) {
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    return toast;
  }
  return null;
};

export default useBootstrapJS;
