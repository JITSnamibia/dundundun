/**
 * @file Main application script for the website.
 * @description This script handles all interactive features.
 */

const App = {
    // Cache of DOM elements to avoid repeated lookups
    $: {
        header: document.getElementById('header'),
        themeToggle: document.getElementById('themeToggle'),
        progressBarFill: document.querySelector('.progress-bar__fill'),
        backToTopButton: document.getElementById('backToTop'),
    },

    // Application state
    state: {
        lastScrollY: window.scrollY,
        ticking: false,
    },

    /**
     * Initializes all application modules.
     */
    init() {
        // Run as soon as the DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            this.themeManager.init();
            this.scrollManager.init();
            console.log("App initialized successfully.");
        });
    },

    /**
     * Manages the color theme of the website (light/dark mode).
     */
    themeManager: {
        init() {
            const savedTheme = localStorage.getItem('color-scheme') || this.getSystemTheme();
            this.setTheme(savedTheme);
            App.$.themeToggle.addEventListener('click', () => this.toggleTheme());
        },
        getSystemTheme() {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        },
        setTheme(theme) {
            document.documentElement.setAttribute('data-color-scheme', theme);
            App.$.themeToggle.querySelector('.theme-toggle__icon').textContent = theme === 'dark' ? '☀️' : '🌙';
            localStorage.setItem('color-scheme', theme);
        },
        toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-color-scheme');
            this.setTheme(currentTheme === 'dark' ? 'light' : 'dark');
        },
    },

    /**
     * Manages all features related to scroll events for performance.
     */
    scrollManager: {
        init() {
            window.addEventListener('scroll', () => {
                if (!App.state.ticking) {
                    window.requestAnimationFrame(() => {
                        this.handleHeaderScroll();
                        this.updateProgressBar();
                        this.handleBackToTopButton();
                        App.state.ticking = false;
                    });
                    App.state.ticking = true;
                }
            });
        },
        handleHeaderScroll() {
            const currentScrollY = window.scrollY;
            // Hide header when scrolling down, show when scrolling up
            if (currentScrollY > 100 && currentScrollY > App.state.lastScrollY) {
                App.$.header.classList.add('hidden');
            } else {
                App.$.header.classList.remove('hidden');
            }
            App.state.lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
        },
        updateProgressBar() {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (window.scrollY / docHeight) * 100;
            App.$.progressBarFill.style.width = `${scrollPercent}%`;
        },
        handleBackToTopButton() {
            if (window.scrollY > 300) {
                App.$.backToTopButton.classList.add('visible');
            } else {
                App.$.backToTopButton.classList.remove('visible');
            }
        },
    },
};

// Start the application
App.init();