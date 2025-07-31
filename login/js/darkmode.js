// login/js/darkmode.js - Handles user interaction for theme toggling.

const DarkModeLogin = {
    init() {
        this.toggleButton = document.getElementById('dark-mode-toggle');
        this.moonIcon = this.toggleButton?.querySelector('.moon-icon');
        this.sunIcon = this.toggleButton?.querySelector('.sun-icon');

        // Update icons on initial load to match the theme set by the inline script
        this.updateIcons();

        // Add event listener to the toggle button
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => {
                const isDark = document.documentElement.classList.contains('dark');
                if (isDark) {
                    this.disableDarkMode();
                } else {
                    this.enableDarkMode();
                }
            });
        }
    },

    enableDarkMode() {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        this.updateIcons();
    },

    disableDarkMode() {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        this.updateIcons();
    },

    updateIcons() {
        const isDark = document.documentElement.classList.contains('dark');
        if (this.moonIcon && this.sunIcon) {
            this.moonIcon.style.display = isDark ? 'none' : 'block';
            this.sunIcon.style.display = isDark ? 'block' : 'none';
        }
    }
};

// Initialize the dark mode logic when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    DarkModeLogin.init();
});