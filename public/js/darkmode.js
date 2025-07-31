const DarkMode = {
    init() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            this.enableDarkMode(false);
        } else {
            this.disableDarkMode(false);
        }
        
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                e.matches ? this.enableDarkMode(false) : this.disableDarkMode(false);
            }
        });
    },
    
    toggle() {
        document.documentElement.classList.contains('dark') ? this.disableDarkMode() : this.enableDarkMode();
    },
    
    enableDarkMode(savePreference = true) {
        document.documentElement.classList.add('dark');
        if (savePreference) {
            localStorage.setItem('theme', 'dark');
        }
        this.updateToggleIcons();
        document.dispatchEvent(new CustomEvent('darkModeChanged', { detail: { isDark: true } }));
    },
    
    disableDarkMode(savePreference = true) {
        document.documentElement.classList.remove('dark');
        if (savePreference) {
            localStorage.setItem('theme', 'light');
        }
        this.updateToggleIcons();
        document.dispatchEvent(new CustomEvent('darkModeChanged', { detail: { isDark: false } }));
    },
    
    updateToggleIcons() {
        const isDark = document.documentElement.classList.contains('dark');
        document.querySelectorAll('.dark-mode-toggle').forEach(toggle => {
            const moonIcon = toggle.querySelector('.moon-icon');
            const sunIcon = toggle.querySelector('.sun-icon');
            if (moonIcon && sunIcon) {
                moonIcon.style.display = isDark ? 'none' : 'block';
                sunIcon.style.display = isDark ? 'block' : 'none';
            }
        });
    }
};

DarkMode.init();
window.DarkMode = DarkMode;
