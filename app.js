// DOM Elements
const progressBar = document.getElementById('progressBar');
const progressFill = progressBar.querySelector('.progress-bar__fill');
const header = document.getElementById('header');
const themeToggle = document.getElementById('themeToggle');
const navLinks = document.querySelectorAll('.nav-link');
const steps = document.querySelectorAll('.step');
const copyButtons = document.querySelectorAll('.copy-btn');
const checklistItems = document.querySelectorAll('.checklist-checkbox');

// State
let lastScrollY = 0;
let ticking = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initProgressBar();
    initScrollAnimations();
    initNavigation();
    initCopyButtons();
    initChecklist();
    initHeaderScroll();
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('color-scheme') || 'light';
    setTheme(savedTheme);
    
    themeToggle.addEventListener('click', toggleTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-color-scheme', theme);
    const icon = themeToggle.querySelector('.theme-toggle__icon');
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    
    // Store theme preference
    try {
        localStorage.setItem('color-scheme', theme);
    } catch (e) {
        // localStorage not available, ignore
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-color-scheme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Add a subtle animation to the toggle button
    themeToggle.style.transform = 'scale(0.9)';
    setTimeout(() => {
        themeToggle.style.transform = 'scale(1)';
    }, 150);
}

// Progress Bar
function initProgressBar() {
    window.addEventListener('scroll', updateProgressBar);
}

function updateProgressBar() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    progressFill.style.width = `${Math.min(scrollPercent, 100)}%`;
}

// Scroll Animations
function initScrollAnimations() {
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
    
    steps.forEach(step => {
        observer.observe(step);
    });
}

// Navigation
function initNavigation() {
    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Update active navigation link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
    const scrollPosition = window.scrollY + header.offsetHeight + 100;
    
    let currentSection = '';
    steps.forEach(step => {
        const stepTop = step.offsetTop;
        const stepHeight = step.offsetHeight;
        
        if (scrollPosition >= stepTop && scrollPosition < stepTop + stepHeight) {
            currentSection = step.id;
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// Header Scroll Behavior
function initHeaderScroll() {
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(handleHeaderScroll);
            ticking = true;
        }
    });
}

function handleHeaderScroll() {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            // Scrolling down - hide header
            header.classList.add('hidden');
        } else {
            // Scrolling up - show header
            header.classList.remove('hidden');
        }
    } else {
        // At top - always show header
        header.classList.remove('hidden');
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
}

// Copy to Clipboard
function initCopyButtons() {
    copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const textToCopy = button.getAttribute('data-copy');
            
            try {
                await navigator.clipboard.writeText(textToCopy);
                showCopySuccess(button);
            } catch (err) {
                // Fallback for older browsers
                fallbackCopyToClipboard(textToCopy, button);
            }
        });
    });
}

function showCopySuccess(button) {
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.classList.add('copied');
    
    setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('copied');
    }, 2000);
}

function fallbackCopyToClipboard(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopySuccess(button);
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        button.textContent = 'Copy failed';
        setTimeout(() => {
            button.textContent = 'Copy';
        }, 2000);
    }
    
    document.body.removeChild(textArea);
}

// Checklist Management
function initChecklist() {
    checklistItems.forEach(checkbox => {
        checkbox.addEventListener('change', updateChecklistProgress);
    });
    
    // Load saved checklist state
    loadChecklistState();
}

function updateChecklistProgress() {
    const checkedItems = Array.from(checklistItems).filter(item => item.checked);
    const totalItems = checklistItems.length;
    const progress = (checkedItems.length / totalItems) * 100;
    
    // Save checklist state
    saveChecklistState();
    
    // Optional: Show completion message
    if (progress === 100) {
        showCompletionMessage();
    }
}

function saveChecklistState() {
    const checklistState = Array.from(checklistItems).map(item => ({
        id: item.id,
        checked: item.checked
    }));
    
    try {
        localStorage.setItem('checklist-state', JSON.stringify(checklistState));
    } catch (e) {
        // localStorage not available, ignore
    }
}

function loadChecklistState() {
    try {
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
    } catch (e) {
        // localStorage not available or invalid data, ignore
    }
}

function showCompletionMessage() {
    // Create a temporary success message
    const message = document.createElement('div');
    message.className = 'completion-message';
    message.innerHTML = `
        <div class="completion-content">
            <span class="completion-icon">🎉</span>
            <span class="completion-text">Great job! You've completed all the steps.</span>
        </div>
    `;
    
    // Add styles for the completion message
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-success);
        color: var(--color-btn-primary-text);
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(message);
    
    // Animate in
    setTimeout(() => {
        message.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        message.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(message);
        }, 300);
    }, 4000);
}

// Smooth scrolling for all internal links
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link) {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const headerHeight = header.offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
});

// Add hover effects to interactive elements
function addHoverEffects() {
    const interactiveElements = document.querySelectorAll('.btn, .tool-card, .toc__item, .step-card');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.style.transform = 'translateY(-2px)';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translateY(0)';
        });
    });
}

// Initialize hover effects after DOM is loaded
document.addEventListener('DOMContentLoaded', addHoverEffects);

// Keyboard Navigation Support
document.addEventListener('keydown', (e) => {
    // Navigate with arrow keys when focus is on navigation
    if (e.target.classList.contains('nav-link')) {
        const navLinksArray = Array.from(navLinks);
        const currentIndex = navLinksArray.indexOf(e.target);
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % navLinksArray.length;
            navLinksArray[nextIndex].focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = currentIndex === 0 ? navLinksArray.length - 1 : currentIndex - 1;
            navLinksArray[prevIndex].focus();
        }
    }
    
    // Quick navigation with number keys
    if (e.key >= '1' && e.key <= '5' && !e.target.matches('input, textarea')) {
        const stepNumber = parseInt(e.key);
        const stepId = ['understanding', 'console-setup', 'sitemap', 'troubleshooting', 'checklist'][stepNumber - 1];
        const targetElement = document.getElementById(stepId);
        
        if (targetElement) {
            const headerHeight = header.offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
});

// Performance optimization: Debounced scroll handler
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll-heavy functions
const debouncedProgressUpdate = debounce(updateProgressBar, 10);
const debouncedNavUpdate = debounce(updateActiveNavLink, 100);

// Replace the original event listeners with debounced versions
window.removeEventListener('scroll', updateProgressBar);
window.removeEventListener('scroll', updateActiveNavLink);
window.addEventListener('scroll', debouncedProgressUpdate);
window.addEventListener('scroll', debouncedNavUpdate);

// Error handling for better user experience
window.addEventListener('error', (e) => {
    console.error('An error occurred:', e.error);
    // Could add user-friendly error messages here
});

// Add loading state management
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('loaded');
    
    // Add a small delay to ensure smooth animations
    setTimeout(() => {
        document.body.classList.add('ready');
    }, 100);
});

// Intersection Observer for better performance
const createOptimizedObserver = (callback, options = {}) => {
    const defaultOptions = {
        threshold: 0.1,
        rootMargin: '50px'
    };
    
    return new IntersectionObserver(callback, { ...defaultOptions, ...options });
};

// Add visual feedback for user interactions
function addVisualFeedback() {
    const buttons = document.querySelectorAll('.btn, .copy-btn, .theme-toggle');
    
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.appendChild(ripple);
            
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        });
    });
}

// Add ripple animation CSS
const rippleStyles = document.createElement('style');
rippleStyles.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyles);

// Initialize visual feedback
document.addEventListener('DOMContentLoaded', addVisualFeedback);