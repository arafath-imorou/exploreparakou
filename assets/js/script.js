/**
 * Explore Parakou - Ultra-Fast, Reactive & Mobile-Engine
 */

// 1. Initialisation Service Worker pour le cache instantané
if ('serviceWorker' in navigator && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(() => {})
            .catch(() => {});
    });
}

// 2. Moteur de navigation instantanée (Hover/Touch Prefetching)
(function initInstantPrefetch() {
    const prefetchedUrls = new Set();

    function prefetchUrl(url) {
        if (!url || prefetchedUrls.has(url)) return;
        if (url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('javascript:')) return;
        if (url.includes('://') && !url.startsWith(window.location.origin)) return;

        prefetchedUrls.add(url);
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        link.as = 'document';
        document.head.appendChild(link);
    }

    document.addEventListener('mouseover', (e) => {
        const anchor = e.target.closest('a');
        if (anchor && anchor.href && anchor.origin === window.location.origin) {
            prefetchUrl(anchor.href);
        }
    }, { passive: true });

    document.addEventListener('touchstart', (e) => {
        const anchor = e.target.closest('a');
        if (anchor && anchor.href && anchor.origin === window.location.origin) {
            prefetchUrl(anchor.href);
        }
    }, { passive: true });
})();

// 3. Barre de progression visuelle instantanée au clic
(function initProgressFeedback() {
    let progressBar = null;

    function getProgressBar() {
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = 'page-progress-bar';
            progressBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                height: 3px;
                width: 0%;
                background: linear-gradient(90deg, #D4A017, #004d40);
                z-index: 99999;
                transition: width 0.25s ease-out, opacity 0.25s ease;
                pointer-events: none;
                opacity: 0;
            `;
            document.body.appendChild(progressBar);
        }
        return progressBar;
    }

    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a');
        if (anchor && anchor.href && anchor.origin === window.location.origin && !anchor.target && !anchor.getAttribute('download')) {
            const path = anchor.pathname;
            if (path !== window.location.pathname) {
                const bar = getProgressBar();
                bar.style.opacity = '1';
                bar.style.width = '70%';
            }
        }
    });
})();

// 4. Mobile Menu & Navigation Responsiveness
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');

    // Create backdrop overlay if it doesn't exist
    let navBackdrop = document.querySelector('.nav-backdrop');
    if (!navBackdrop) {
        navBackdrop = document.createElement('div');
        navBackdrop.className = 'nav-backdrop';
        document.body.appendChild(navBackdrop);
    }

    function closeMobileMenu() {
        if (nav && nav.classList.contains('active')) {
            nav.classList.remove('active');
            document.body.classList.remove('menu-open');
            if (mobileMenuBtn) {
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) icon.classList.replace('ph-x', 'ph-list');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        }
    }

    function openMobileMenu() {
        if (nav) {
            nav.classList.add('active');
            document.body.classList.add('menu-open');
            if (mobileMenuBtn) {
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) icon.classList.replace('ph-list', 'ph-x');
                mobileMenuBtn.setAttribute('aria-expanded', 'true');
            }
        }
    }

    if (mobileMenuBtn && nav) {
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (nav.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        // Close on backdrop click
        navBackdrop.addEventListener('click', closeMobileMenu);

        // Close on any menu link click
        nav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    // Header Scroll Effect optimisé (requestAnimationFrame + passive)
    const header = document.querySelector('.header');
    if (header) {
        let isTicking = false;
        window.addEventListener('scroll', () => {
            if (!isTicking) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 30) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                    isTicking = false;
                });
                isTicking = true;
            }
        }, { passive: true });
    }

    // Smooth Scroll for Anchors
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                closeMobileMenu();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Image WebP fallback silencieux
    document.querySelectorAll('img[src$=".webp"]').forEach((img) => {
        img.addEventListener('error', function () {
            const src = this.getAttribute('src');
            if (src && src.endsWith('.webp')) {
                this.src = src.replace('.webp', '.png');
            }
        }, { once: true });
    });
});
