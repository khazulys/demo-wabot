// Password Toggle Module
export class PasswordToggle {
    constructor() {
        this.toggleBtn = null;
        this.passwordInput = null;
        this.eyeIcon = null;
        this.eyeOffIcon = null;
        this.isPasswordVisible = false;
    }

    init() {
        this.toggleBtn = document.getElementById('togglePassword');
        this.passwordInput = document.getElementById('password');
        this.eyeIcon = document.getElementById('eyeIcon');
        this.eyeOffIcon = document.getElementById('eyeOffIcon');

        if (this.toggleBtn && this.passwordInput) {
            this.bindEvents();
            console.log('PasswordToggle module initialized');
        }
    }

    bindEvents() {
        this.toggleBtn.addEventListener('click', () => this.togglePassword());
        
        // Add keyboard support
        this.toggleBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.togglePassword();
            }
        });
    }

    togglePassword() {
        this.isPasswordVisible = !this.isPasswordVisible;
        
        // Toggle input type
        this.passwordInput.type = this.isPasswordVisible ? 'text' : 'password';
        
        // Toggle icons
        if (this.isPasswordVisible) {
            this.eyeIcon.classList.remove('hidden');
            this.eyeOffIcon.classList.add('hidden');
        } else {
            this.eyeIcon.classList.add('hidden');
            this.eyeOffIcon.classList.remove('hidden');
        }

        // Update aria-label for accessibility
        this.toggleBtn.setAttribute(
            'aria-label', 
            this.isPasswordVisible ? 'Sembunyikan password' : 'Tampilkan password'
        );

        // Add visual feedback
        this.addToggleFeedback();
    }

    addToggleFeedback() {
        // Add a subtle animation to indicate the toggle action
        this.toggleBtn.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            this.toggleBtn.style.transform = 'scale(1)';
        }, 100);
    }
}