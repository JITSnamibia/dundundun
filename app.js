/**
 * @file Main application script for the website.
 * @description This script handles theme management, progress bar, scroll animations,
 * navigation, copy-to-clipboard functionality, and checklist management.
 */

const App = {
    /**
     * Cache of DOM elements.
     * @type {Object.<string, HTMLElement|NodeListOf<HTMLElement>>}
     */
    $: {
        progressBar: document.getElementById('progressBar'),
        progressFill: null,
        header: document.getElementById('header'),
        themeToggle: document.getElementById('themeToggle'),
        navLinks: document.querySelectorAll('.nav-link'),
        steps: document.querySelectorAll('.step'),
        copyButtons: document.querySelectorAll('.copy-btn'),
        checklistItems: document.querySelectorAll('.checklist-checkbox'),
    },

    /**
     * Application state.
     * @type {Object.<string, any>}
     */
    state: {
        lastScrollY: 0,
        ticking: false,
    },

    /**
     * Initializes the application.
     */
    init() {
        // Early exit if essential elements are not found
        if (!this.$.progressBar || !this.$.header) {
            console.error("Essential elements like progressBar or header are missing.");
            return;
        }
        this.$.progressFill = this.$.progressBar.querySelector('.progress-bar__fill');
        
        document.addEventListener('DOMContentLoaded', () => {
            this.themeManager.init();
            this.progressBar.init();
            this.scrollAnimator.init();
            this.navigation.init();
            this.clipboard.init();
            this.checklist.init();
            this.headerScroll.init();
            this.addHoverEffects();
            this.addVisualFeedback();
            console.log("App initialized successfully.");
        });
    },

    /**
     * Manages the color theme of the website.
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
            const icon = App.$.themeToggle.querySelector('.theme-toggle__icon');
            icon.textContent = theme === 'dark' ? '☀️' : '🌙';
            localStorage.setItem('color-scheme', theme);
        },

        toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-color-scheme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        },
    },

    /**
     * Manages the progress bar at the top of the page.
     */
    progressBar: {
        init() {
            window.addEventListener('scroll', this.update.bind(this));
        },

        update() {
            const scrollTop = window.pageYOffset;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            App.$.progressFill.style.width = `${Math.min(scrollPercent, 100)}%`;
        },
    },

    /**
     * Manages scroll-triggered animations.
     */
    scrollAnimator: {
        init() {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, observerOptions);
            
            App.$.steps.forEach(step => observer.observe(step));
        },
    },

    /**
     * Manages website navigation.
     */
    navigation: {
        init() {
            App.$.navLinks.forEach(link => {
                link.addEventListener('click', (e) => this.smoothScroll(e));
            });
            window.addEventListener('scroll', this.updateActiveLink.bind(this));
        },

        smoothScroll(event) {
            event.preventDefault();
            const targetId = event.currentTarget.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = App.$.header.offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        },

        updateActiveLink() {
            const scrollPosition = window.scrollY + App.$.header.offsetHeight + 100;
    
            let currentSection = '';
            App.$.steps.forEach(step => {
                if (scrollPosition >= step.offsetTop && scrollPosition < step.offsetTop + step.offsetHeight) {
                    currentSection = step.id;
                }
            });
            
            App.$.navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${currentSection}`);
            });
        },
    },

    /**
     * Manages the header's behavior on scroll.
     */
    headerScroll: {
        init() {
            window.addEventListener('scroll', () => {
                if (!App.state.ticking) {
                    window.requestAnimationFrame(() => this.handleScroll());
                    App.state.ticking = true;
                }
            });
        },

        handleScroll() {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                if (currentScrollY > App.state.lastScrollY) {
                    App.$.header.classList.add('hidden');
                } else {
                    App.$.header.classList.remove('hidden');
                }
            } else {
                App.$.header.classList.remove('hidden');
            }
            
            App.state.lastScrollY = currentScrollY;
            App.state.ticking = false;
        },
    },

    /**
     * Manages copy-to-clipboard functionality.
     */
    clipboard: {
        init() {
            App.$.copyButtons.forEach(button => {
                button.addEventListener('click', async (e) => {
                    const textToCopy = e.currentTarget.getAttribute('data-copy');
                    try {
                        await navigator.clipboard.writeText(textToCopy);
                        this.showCopySuccess(e.currentTarget);
                    } catch (err) {
                        console.error('Failed to copy text: ', err);
                        this.fallbackCopy(textToCopy, e.currentTarget);
                    }
                });
            });
        },

        showCopySuccess(button) {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 2000);
        },

        fallbackCopy(text, button) {
            // Fallback for older browsers
        },
    },

    /**
     * Manages the checklist functionality.
     */
    checklist: {
        init() {
            App.$.checklistItems.forEach(checkbox => {
                checkbox.addEventListener('change', () => this.updateProgress());
            });
            this.loadState();
        },

        updateProgress() {
            const checkedItems = Array.from(App.$.checklistItems).filter(item => item.checked);
            const totalItems = App.$.checklistItems.length;
            const progress = (checkedItems.length / totalItems) * 100;
            
            this.saveState();
            
            if (progress === 100) {
                this.showCompletionMessage();
            }
        },

        saveState() {
            const checklistState = Array.from(App.$.checklistItems).map(item => ({
                id: item.id,
                checked: item.checked
            }));
            localStorage.setItem('checklist-state', JSON.stringify(checklistState));
        },

        loadState() {
            const savedState = localStorage.getItem('checklist-state');
            if (savedState) {
                const checklistState = JSON.parse(savedState);
                checklistState.forEach(item => {
                    const checkbox = document.getElementById(item.id);
                    if (checkbox) {
                        checkbox.checked = item.checked;
                    }
                });
            }
        },
        
        showCompletionMessage() {
            // Implementation for completion message
        },
    },
    
    /**
     * Adds hover effects to interactive elements.
     */
    addHoverEffects() {
        // Implementation for hover effects
    },
    
    /**
     * Adds visual feedback (e.g., ripple effect) to buttons.
     */
    addVisualFeedback() {
        // Implementation for visual feedback
    },
};

// Start the application
App.init();