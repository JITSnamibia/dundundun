/**
 * @file app.js
 * @description Main application script for the SEO Fix Guide.
 */

import { glossaryTerms } from './glossary.js';

const App = {
    // Cache of DOM elements
    $: {
        header: document.getElementById('header'),
        themeToggle: document.getElementById('themeToggle'),
        progressBarFill: document.querySelector('.progress-bar__fill'),
        backToTopButton: document.getElementById('backToTop'),
        glossaryTerms: document.querySelectorAll('.glossary-term'),
        modal: document.getElementById('glossaryModal'),
        modalTitle: document.getElementById('modalTerm'),
        modalDefinition: document.getElementById('modalDefinition'),
        modalCloseBtn: document.getElementById('modalClose'),
        checklistItems: document.querySelectorAll('.checklist-checkbox'),
        checklistProgress: document.getElementById('checklistProgress'),
        checklistScore: document.getElementById('checklistScore'),
    },

    state: {
        lastScrollY: window.scrollY,
        ticking: false,
    },

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.themeManager.init();
            this.scrollManager.init();
            this.modalManager.init();
            this.checklistManager.init();
        });
    },

    // Manages the color theme
    themeManager: {
        init() {
            const savedTheme = localStorage.getItem('color-scheme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            this.setTheme(savedTheme);
            App.$.themeToggle.addEventListener('click', () => this.toggleTheme());
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

    // Manages all scroll-related features
    scrollManager: {
        init() {
            window.addEventListener('scroll', () => {
                if (!App.state.ticking) {
                    window.requestAnimationFrame(() => {
                        this.handleScroll();
                        App.state.ticking = false;
                    });
                    App.state.ticking = true;
                }
            });
        },
        handleScroll() {
            const currentScrollY = window.scrollY;
            
            // Handle header visibility
            if (currentScrollY > 100 && currentScrollY > App.state.lastScrollY) {
                App.$.header.classList.add('hidden');
            } else {
                App.$.header.classList.remove('hidden');
            }

            // Update progress bar
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            App.$.progressBarFill.style.width = `${(currentScrollY / docHeight) * 100}%`;

            // Handle back-to-top button
            App.$.backToTopButton.classList.toggle('visible', currentScrollY > 300);

            App.state.lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
        },
    },

    // Manages the interactive glossary modal
    modalManager: {
        init() {
            App.$.glossaryTerms.forEach(term => {
                term.addEventListener('click', (e) => {
                    const termKey = e.currentTarget.dataset.term;
                    this.openModal(termKey);
                });
            });

            App.$.modalCloseBtn.addEventListener('click', () => this.closeModal());
            App.$.modal.addEventListener('click', (e) => {
                if (e.target === App.$.modal) this.closeModal();
            });
        },
        openModal(termKey) {
            const data = glossaryTerms[termKey];
            if (!data) return;

            App.$.modalTitle.textContent = data.term;
            App.$.modalDefinition.textContent = data.definition;
            App.$.modal.classList.add('visible');
            document.body.style.overflow = 'hidden';
        },
        closeModal() {
            App.$.modal.classList.remove('visible');
            document.body.style.overflow = '';
        },
    },

    // Manages the interactive checklist
    checklistManager: {
        init() {
            this.loadState(); // Load saved state first
            App.$.checklistItems.forEach(item => {
                item.addEventListener('change', () => this.update());
            });
            this.update(); // Initial update on page load
        },
        update() {
            const checkedCount = Array.from(App.$.checklistItems).filter(i => i.checked).length;
            const totalCount = App.$.checklistItems.length;
            const score = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

            App.$.checklistScore.textContent = `${score}%`;
            App.$.checklistProgress.style.width = `${score}%`;
            App.$.checklistProgress.style.backgroundColor = score === 100 ? 'var(--color-success)' : 'var(--color-primary)';

            this.saveState();
        },
        saveState() {
            const state = Array.from(App.$.checklistItems).map(item => ({ id: item.id, checked: item.checked }));
            localStorage.setItem('checklistState', JSON.stringify(state));
        },
        loadState() {
            const state = JSON.parse(localStorage.getItem('checklistState'));
            if (state) {
                state.forEach(item => {
                    const checkbox = document.getElementById(item.id);
                    if (checkbox) checkbox.checked = item.checked;
                });
            }
        },
    },
};

App.init();