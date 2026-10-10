(function() {
    const storageKey = 'code-theme';
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    function readStoredTheme() {
        try {
            const theme = localStorage.getItem(storageKey);
            return theme === 'dark' || theme === 'light' ? theme : null;
        } catch (error) {
            return root.dataset.theme || null;
        }
    }

    function writeTheme(theme) {
        try {
            localStorage.setItem(storageKey, theme);
        } catch (error) {
            root.dataset.theme = theme;
        }
    }

    function effectiveTheme() {
        return readStoredTheme() || (mediaQuery.matches ? 'dark' : 'light');
    }

    function updateToggles() {
        const isDark = effectiveTheme() === 'dark';
        document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
            button.setAttribute('aria-pressed', String(isDark));
            button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
            button.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';

            const icon = button.querySelector('i');
            if (icon) {
                icon.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
            }

            const label = button.querySelector('span');
            if (label) {
                label.textContent = isDark ? 'Light mode' : 'Dark mode';
            }
        });
    }

    function setTheme(theme) {
        root.dataset.theme = theme;
        writeTheme(theme);
        updateToggles();
    }

    document.addEventListener('DOMContentLoaded', function() {
        updateToggles();

        document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
            button.addEventListener('click', function() {
                setTheme(effectiveTheme() === 'dark' ? 'light' : 'dark');
            });
        });

        mediaQuery.addEventListener('change', function() {
            if (!readStoredTheme()) {
                updateToggles();
            }
        });
    });
})();
