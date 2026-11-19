/**
 * Explore Parakou - Moteur de Navigation, Cache & Expérience Mobile
 */

// 1. Initialisation Service Worker pour le cache instantané
if ('serviceWorker' in navigator && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(() => {})
            .catch(() => {});
    });
}

// 2. Préchargement proactif en mémoire (In-Memory Page Cache)
const pageMemoryCache = new Set();

function prefetchPage(url) {
    if (!url || pageMemoryCache.has(url)) return;
    if (url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('javascript:')) return;
    if (url.includes('admin.html') || url.includes('restaurer.html')) return;
    if (url.includes('://') && !url.startsWith(window.location.origin)) return;

    pageMemoryCache.add(url);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
}

// Préchargement proactif dès le démarrage des pages principales
window.addEventListener('DOMContentLoaded', () => {
    const corePages = [
        'index.html',
        'histoire.html',
        'tourisme.html',
        'culture.html',
        'talents.html',
        'agenda.html',
        'investir.html',
        'medias.html',
        'contact.html'
    ];
    corePages.forEach((p) => {
        try {
            const fullUrl = new URL(p, window.location.href).href;
            prefetchPage(fullUrl);
        } catch (e) {}
    });
});

// Préchargement immédiat au survol / touchstart
document.addEventListener('mouseover', (e) => {
    const anchor = e.target.closest('a');
    if (anchor && anchor.href && anchor.origin === window.location.origin) {
        prefetchPage(anchor.href);
    }
}, { passive: true });

document.addEventListener('touchstart', (e) => {
    const anchor = e.target.closest('a');
    if (anchor && anchor.href && anchor.origin === window.location.origin) {
        prefetchPage(anchor.href);
    }
}, { passive: true });

// 3. Gestion fluide des ancres internes (#)
document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    // Gestion propre des ancres sur la même page
    if (href.startsWith('#')) {
        const targetElement = document.querySelector(href);
        if (targetElement) {
            e.preventDefault();
            closeMobileMenu();
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// 4. Mobile Menu & Navigation Helpers
function closeMobileMenu() {
    const nav = document.querySelector('.nav');
    const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
    if (nav && nav.classList.contains('active')) {
        nav.classList.remove('active');
        document.body.classList.remove('menu-open');
        if (mobileMenuBtn) {
            mobileMenuBtn.innerText = 'Menu';
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
    }
}

function openMobileMenu() {
    const nav = document.querySelector('.nav');
    const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
    if (nav) {
        nav.classList.add('active');
        document.body.classList.add('menu-open');
        if (mobileMenuBtn) {
            mobileMenuBtn.innerText = 'Fermer';
            mobileMenuBtn.setAttribute('aria-expanded', 'true');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');

    let navBackdrop = document.querySelector('.nav-backdrop');
    if (!navBackdrop) {
        navBackdrop = document.createElement('div');
        navBackdrop.className = 'nav-backdrop';
        document.body.appendChild(navBackdrop);
    }

    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (nav.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        navBackdrop.addEventListener('click', closeMobileMenu);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav.classList.contains('active')) {
                closeMobileMenu();
            }
        });

        // Fermer le tiroir uniquement lors d'un clic sur une ancre interne à la page (#)
        nav.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        // Fermer automatiquement le tiroir si la fenêtre est agrandie au-delà de 900px
        window.addEventListener('resize', () => {
            if (window.innerWidth > 900 && nav.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    // Gestion de l'état "scrolled" du header au défilement
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
});
