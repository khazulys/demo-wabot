// Form Validation Module
export class FormValidation {
    constructor() {
        this.form = null;
        this.usernameInput = null;
        this.passwordInput = null;
        this.validationRules = {
            username: {
                required: true,
                minLength: 3,
                pattern: /^[a-zA-Z0-9_]+$/,
                message: ''
            },
            password: {
                required: true,
                minLength: 6,
                pattern: /^(?=.*[a-zA-Z])(?=.*\d)/,
                message: ''
            }
        };
    }

    init() {
        this.form = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');

        if (this.form && this.usernameInput && this.passwordInput) {
            this.bindEvents();
            console.log('FormValidation module initialized');
        }
    }

    bindEvents() {
        // Real-time validation on input
        this.usernameInput.addEventListener('input', () => this.validateField('username'));
        this.usernameInput.addEventListener('blur', () => this.validateField('username'));
        
        this.passwordInput.addEventListener('input', () => this.validateField('password'));
        this.passwordInput.addEventListener('blur', () => this.validateField('password'));

        // Form submission validation
        this.form.addEventListener('submit', (e) => this.validateForm(e));
    }

    validateField(fieldName) {
        const input = fieldName === 'username' ? this.usernameInput : this.passwordInput;
        const rules = this.validationRules[fieldName];
        const value = input.value.trim();

        // Remove existing error styling
        this.clearFieldError(input);

        // Check if field is required and empty
        if (rules.required && !value) {
            if (input === document.activeElement) return; // Don't show error while typing
            this.showFieldError(input, `${this.getFieldLabel(fieldName)} tidak boleh kosong`);
            return false;
        }

        // Check minimum length
        if (value && rules.minLength && value.length < rules.minLength) {
            this.showFieldError(input, `${this.getFieldLabel(fieldName)} minimal ${rules.minLength} karakter`);
            return false;
        }

        // Check pattern
        if (value && rules.pattern && !rules.pattern.test(value)) {
            this.showFieldError(input, rules.message);
            return false;
        }

        // Field is valid
        this.showFieldSuccess(input);
        return true;
    }

    validateForm(event) {
        const isUsernameValid = this.validateField('username');
        const isPasswordValid = this.validateField('password');

        if (!isUsernameValid || !isPasswordValid) {
            event.preventDefault();
            return false;
        }

        return true;
    }

    showFieldError(input, message) {
        // Add error styling to input
        input.classList.remove('border-gray-300', 'border-green-300');
        input.classList.add('border-red-300', 'focus:ring-red-500', 'focus:border-red-500');

        // Create or update error message
        let errorElement = input.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('p');
            errorElement.className = 'field-error mt-1 text-sm text-red-600';
            input.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    showFieldSuccess(input) {
        // Add success styling to input
        input.classList.remove('border-gray-300', 'border-red-300', 'focus:ring-red-500', 'focus:border-red-500');
        input.classList.add('border-green-300', 'focus:ring-green-500', 'focus:border-green-500');

        // Remove error message
        this.clearFieldError(input);
    }

    clearFieldError(input) {
        // Reset input styling
        input.classList.remove('border-red-300', 'border-green-300', 'focus:ring-red-500', 'focus:border-red-500', 'focus:ring-green-500', 'focus:border-green-500');
        input.classList.add('border-gray-300');

        // Remove error message
        const errorElement = input.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    getFieldLabel(fieldName) {
        const labels = {
            username: 'Username',
            password: 'Password'
        };
        return labels[fieldName] || fieldName;
    }

    // Public method to check if form is valid
    isFormValid() {
        return this.validateField('username') && this.validateField('password');
    }

    // Public method to reset form validation
    resetValidation() {
        this.clearFieldError(this.usernameInput);
        this.clearFieldError(this.passwordInput);
    }
}