/**
 * Explore Parakou - Ultra-Fast Tac-au-Tac SPA Engine
 */

// 1. Initialisation Service Worker pour le cache instantané
if ('serviceWorker' in navigator && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(() => {})
            .catch(() => {});
    });
}

// 2. Moteur de cache mémoire ultra-rapide (In-Memory Page Cache)
const pageMemoryCache = new Map();

async function prefetchPage(url) {
    if (!url || pageMemoryCache.has(url)) return;
    if (url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('javascript:')) return;
    if (url.includes('admin.html') || url.includes('restaurer.html')) return;
    if (url.includes('://') && !url.startsWith(window.location.origin)) return;

    try {
        const res = await fetch(url, { priority: 'low' });
        if (res.ok) {
            const text = await res.text();
            pageMemoryCache.set(url, text);
        }
    } catch (e) {}
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
        const fullUrl = new URL(p, window.location.href).href;
        prefetchPage(fullUrl);
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

// 3. Navigation Tac-au-Tac (Instant SPA Swapper sans rechargement)
async function navigateTo(url, pushState = true) {
    const targetUrl = new URL(url, window.location.href);

    // Bypass pour admin ou cartes complexes avec Leaflet
    if (targetUrl.pathname.includes('admin.html') || targetUrl.pathname.includes('carte.html')) {
        window.location.href = url;
        return;
    }

    let htmlText = pageMemoryCache.get(targetUrl.href);

    if (!htmlText) {
        try {
            const res = await fetch(targetUrl.href);
            if (!res.ok) throw new Error('Fetch failed');
            htmlText = await res.text();
            pageMemoryCache.set(targetUrl.href, htmlText);
        } catch (e) {
            window.location.href = url;
            return;
        }
    }

    // Parser le nouveau document
    const parser = new DOMParser();
    const newDoc = parser.parseFromString(htmlText, 'text/html');

    // Mise à jour du Titre
    if (newDoc.title) {
        document.title = newDoc.title;
    }

    // Mise à jour du Main en 0ms (Aucun écran blanc !)
    const currentMain = document.querySelector('main');
    const newMain = newDoc.querySelector('main');

    if (currentMain && newMain) {
        currentMain.innerHTML = newMain.innerHTML;
        currentMain.className = newMain.className;
        if (newMain.getAttribute('style')) {
            currentMain.setAttribute('style', newMain.getAttribute('style'));
        }
    }

    // Mise à jour des liens actifs dans la navigation
    const targetFileName = targetUrl.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-list a').forEach((link) => {
        const href = link.getAttribute('href');
        if (href === targetFileName || (targetFileName === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Gestion de l'historique
    if (pushState) {
        window.history.pushState({ url: targetUrl.href }, '', targetUrl.href);
    }

    // Scroll immédiat
    if (targetUrl.hash) {
        const targetElement = document.querySelector(targetUrl.hash);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Fermer le menu mobile si ouvert
    closeMobileMenu();

    // Ré-exécuter les initialisations dynamiques
    reinitializePageScripts(newDoc, targetFileName);
}

// Interception des clics sur les liens internes
document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    // Ignorer les clics avec modificateurs (nouvel onglet)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (anchor.target && anchor.target !== '_self') return;
    if (anchor.getAttribute('download')) return;

    // Hash sur la même page
    if (href.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(href);
        if (targetElement) {
            closeMobileMenu();
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
        return;
    }

    // Vérifier si c'est une URL interne
    const targetUrl = new URL(anchor.href, window.location.href);
    if (targetUrl.origin === window.location.origin && targetUrl.pathname.endsWith('.html')) {
        // Ignorer admin.html et carte.html
        if (!targetUrl.pathname.includes('admin.html') && !targetUrl.pathname.includes('carte.html')) {
            e.preventDefault();
            navigateTo(anchor.href);
        }
    }
});

// Support retour / avant du navigateur
window.addEventListener('popstate', () => {
    navigateTo(window.location.href, false);
});

// 4. Initialisations dynamiques lors du changement instantané de page
function reinitializePageScripts(newDoc, pageName) {
    // 1. Tourisme
    const visiterGrid = document.getElementById('visiter-grid');
    const sejournerGrid = document.getElementById('sejourner-grid');
    if (visiterGrid && sejournerGrid && window.fastSupabaseFetch) {
        window.fastSupabaseFetch('tourisme', () => {
            return supabase.from('tourisme').select('*').order('created_at', { ascending: false });
        }, (data) => {
            if (window.renderTourisme) {
                window.renderTourisme(data);
            }
        });
    }

    // 2. Agenda
    const featGrid = document.querySelector('.dynamic-featured');
    if (featGrid && window.fastSupabaseFetch) {
        window.fastSupabaseFetch('agenda', () => {
            return window.supabase.from('agenda').select('*').order('created_at', { ascending: false });
        }, (events) => {
            if (window.renderAgenda) {
                window.renderAgenda(events);
            }
        });
    }

    // 3. Talents
    const talentsGrid = document.getElementById('talents-grid');
    if (talentsGrid && window.fastSupabaseFetch) {
        window.fastSupabaseFetch('talents', () => {
            return supabase.from('talents').select('*').order('created_at', { ascending: false });
        }, (talents) => {
            if (window.onTalentsLoaded) {
                window.onTalentsLoaded(talents);
            }
        });
    }

    // 4. Histoire
    const timelineContainer = document.getElementById('dynamic-timeline');
    if (timelineContainer) {
        if (typeof window.initTimeline === 'function') {
            window.initTimeline();
        } else if (window.fastSupabaseFetch) {
            window.fastSupabaseFetch('histoire_timeline', () => {
                return window.supabase.from('histoire_timeline').select('*').order('created_at', { ascending: true });
            }, (data) => {
                if (window.renderTimeline) {
                    window.renderTimeline(data);
                }
            });
        }
    }

        // 5. Culture
    const cultureGrid = document.getElementById('culture-lieux-grid');
    if (cultureGrid && window.fastSupabaseFetch && window.renderCulture) {
        window.fastSupabaseFetch('culture', () => {
            return window.supabase.from('culture').select('*').order('created_at', { ascending: false });
        }, window.renderCulture);
    }

    // 6. Médias
    const mediasGrid = document.getElementById('medias-gallery-grid');
    if (mediasGrid && window.fastSupabaseFetch && window.renderMedias) {
        window.fastSupabaseFetch('medias', () => {
            return window.supabase.from('medias').select('*').order('created_at', { ascending: false });
        }, window.renderMedias);
    }

    // 7. Exécuter les scripts inline de la nouvelle page si nécessaire
    if (newDoc) {
        const scripts = newDoc.querySelectorAll('main script, body > script:not([src])');
        scripts.forEach((oldScript) => {
            const newScript = document.createElement('script');
            if (oldScript.src) {
                newScript.src = oldScript.src;
            } else {
                newScript.textContent = oldScript.textContent;
            }
            document.body.appendChild(newScript);
        });
    }
}

// 5. Mobile Menu & Navigation Helpers
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

        // Close drawer when clicking any nav link
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        // Close drawer if resized to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 900 && nav.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    // Header Scroll Throttling
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
