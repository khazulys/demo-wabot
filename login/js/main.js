// Main application entry point
import { LoginForm } from './modules/loginForm.js';
import { PasswordToggle } from './modules/passwordToggle.js';
import { FormValidation } from './modules/formValidation.js';

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    const formValidation = new FormValidation();
    const loginForm = new LoginForm(formValidation);
    const passwordToggle = new PasswordToggle();
    
    // Start the application
    formValidation.init();
    loginForm.init();
    passwordToggle.init();
});
