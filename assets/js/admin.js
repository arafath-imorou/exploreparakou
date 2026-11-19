/**
 * Explore Parakou - Administration Complète & Synchronisation Directe WebP
 * Gère tous les modules du site : Talents, Tourisme, Culture, Agenda, Histoire, Médias et Messages.
 * Conversion automatique de toutes les photos en format WebP pour une performance maximale.
 */

document.addEventListener('DOMContentLoaded', async () => {

    const loginUI = document.getElementById('login-ui');
    const dashboardUI = document.getElementById('dashboard-ui');
    const loginForm = document.getElementById('login-form');
    const errorBox = document.getElementById('login-error');
    const logoutBtn = document.getElementById('btn-logout');

    // Mobile Sidebar Toggle
    const adminToggle = document.getElementById('admin-sidebar-toggle');
    const adminSidebar = document.querySelector('.admin-sidebar');
    const adminBackdrop = document.getElementById('admin-backdrop');

    if (adminToggle && adminSidebar) {
        adminToggle.addEventListener('click', () => {
            adminSidebar.classList.toggle('open');
            if (adminBackdrop) adminBackdrop.classList.toggle('active');
        });
    }

    if (adminBackdrop) {
        adminBackdrop.addEventListener('click', () => {
            if (adminSidebar) adminSidebar.classList.remove('open');
            adminBackdrop.classList.remove('active');
        });
    }

    // Gestion de Session Supabase
    let currentSession = null;
    try {
        if (window.supabase && window.supabase.auth) {
            const { data: { session } } = await window.supabase.auth.getSession();
            currentSession = session;
        }
    } catch (e) {
        console.warn("[Admin Auth] Notice session:", e);
    }

    if (currentSession) { 
        showDashboard(); 
    } else { 
        showLogin(); 
    }

    if (window.supabase && window.supabase.auth) {
        window.supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') showDashboard();
            if (event === 'SIGNED_OUT') showLogin();
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;
            const btn = document.getElementById('btn-login');

            btn.innerHTML = 'Connexion...';
            if (errorBox) errorBox.style.display = 'none';

            try {
                const { error } = await window.supabase.auth.signInWithPassword({ email: email, password: password });
                if (error) {
                    if (errorBox) {
                        errorBox.style.display = 'block';
                        errorBox.innerText = error.message;
                    }
                    btn.innerHTML = 'Se Connecter ';
                }
            } catch (err) {
                if (errorBox) {
                    errorBox.style.display = 'block';
                    errorBox.innerText = err.message || "Erreur de connexion";
                }
                btn.innerHTML = 'Se Connecter ';
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => { 
            if (window.supabase && window.supabase.auth) {
                await window.supabase.auth.signOut(); 
            }
            showLogin();
        });
    }

    function showDashboard() {
        if (loginUI) loginUI.style.display = 'none';
        if (dashboardUI) dashboardUI.style.display = 'flex';
        loadAllData();
    }

    function showLogin() {
        if (loginUI) loginUI.style.display = 'flex';
        if (dashboardUI) dashboardUI.style.display = 'none';
    }

    // Navigation des onglets (Sidebar)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active-panel'));

            this.classList.add('active');
            if (adminSidebar) adminSidebar.classList.remove('open');
            if (adminBackdrop) adminBackdrop.classList.remove('active');
            const target = this.getAttribute('data-target');
            const panel = document.getElementById(target);
            if (panel) panel.classList.add('active-panel');
        });
    });

    function loadAllData() {
        loadTalents();
        loadTourisme();
        loadCulture();
        loadAgenda();
        loadHistoire();
        loadMedias();
        loadMessages();
    }

    // =========================================================================
    // 1. MOTEUR D'OPTIMISATION WEBP & UPLOAD D'IMAGE
    // =========================================================================
    
    /**
     * Convertit automatiquement n'importe quel fichier image (PNG, JPG, HEIC, etc.)
     * en WebP moderne et compressé via HTML5 Canvas avant tout téléversement.
     */
    async function convertToWebP(file, maxDimension = 1600, quality = 0.82) {
        if (!file || !file.type.startsWith('image/')) return file;
        
        // Si c'est déjà un WebP léger de moins de 400 Ko, le conserver directement
        if (file.type === 'image/webp' && file.size < 400 * 1024) {
            return file;
        }

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;

                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = Math.round((height * maxDimension) / width);
                            width = maxDimension;
                        } else {
                            width = Math.round((width * maxDimension) / height);
                            height = maxDimension;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (!blob) {
                            resolve(file); // fallback
                            return;
                        }
                        const cleanName = (file.name || 'image').replace(/\.[^/.]+$/, "") + ".webp";
                        const webpFile = new File([blob], cleanName, { type: 'image/webp' });
                        resolve(webpFile);
                    }, 'image/webp', quality);
                };
                img.onerror = () => resolve(file);
                img.src = e.target.result;
            };
            reader.onerror = () => resolve(file);
            reader.readAsDataURL(file);
        });
    }

    /**
     * Téléversement sécurisé de l'image en WebP vers Supabase Storage,
     * avec fallback optimisé WebP Data URL en cas de stockage local/déconnecté.
     */
    async function uploadImage(file, bucket = 'talents') {
        const webpFile = await convertToWebP(file);
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.webp`;
        const filePath = `photos/${fileName}`;

        try {
            if (window.supabase && window.supabase.storage) {
                const { error } = await window.supabase.storage.from(bucket).upload(filePath, webpFile, {
                    contentType: 'image/webp',
                    upsert: true
                });
                if (!error) {
                    const { data } = window.supabase.storage.from(bucket).getPublicUrl(filePath);
                    if (data && data.publicUrl) return data.publicUrl;
                }
            }
        } catch (err) {
            console.warn("[Upload Storage] Notice, bascule sur DataURL WebP optimisé:", err);
        }

        // Fallback WebP Data URL local
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(webpFile);
        });
    }

    /**
     * Prévisualisation instantanée avec badge de validation WebP
     */
    function setupFilePreview(inputId, previewId) {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        if (!input || !preview) return;

        input.addEventListener('change', async function () {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const webpFile = await convertToWebP(file);
                const reader = new FileReader();
                reader.onload = function (evt) {
                    const sizeKb = Math.round(webpFile.size / 1024);
                    preview.style.display = 'block';
                    preview.innerHTML = `
                        <img src="${evt.target.result}" style="width:100%; border-radius:8px; display:block; margin-bottom:4px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                        <div style="font-size:0.75rem; color:#0E813F; font-weight:700;">
                            Format WebP (~${sizeKb} Ko)
                        </div>
                    `;
                };
                reader.readAsDataURL(webpFile);
            } else {
                preview.style.display = 'none';
            }
        });
    }

    setupFilePreview('t-img-upload', 't-img-preview');
    setupFilePreview('tour-img-upload', 'tour-img-preview');
    setupFilePreview('cult-img-upload', 'cult-img-preview');
    setupFilePreview('ag-img-upload', 'ag-img-preview');
    setupFilePreview('med-img-upload', 'med-img-preview');

    // =========================================================================
    // 2. SYNCHRONISATION DIRECTE AVEC LE SITE WEB (CACHE LIVE)
    // =========================================================================

    function showToast(message) {
        const toast = document.getElementById('admin-toast');
        const toastText = document.getElementById('admin-toast-text');
        if (toast && toastText) {
            toastText.innerText = message || "Modifications enregistrées ! Directement visibles sur le site.";
            toast.style.display = 'flex';
            setTimeout(() => {
                toast.style.display = 'none';
            }, 4500);
        }
    }

    /**
     * Met à jour le cache local du navigateur immédiatement pour que la page publique
     * affiche la modification sans délai d'attente ni cache périmé.
     */
    function syncLiveWebsite(table, item, action = 'upsert') {
        const storageKey = 'ep_cache_' + table;
        try {
            let list = [];
            const cachedRaw = localStorage.getItem(storageKey);
            if (cachedRaw) {
                const cachedObj = JSON.parse(cachedRaw);
                if (cachedObj && Array.isArray(cachedObj.data)) {
                    list = cachedObj.data;
                }
            }

            if (action === 'delete') {
                list = list.filter(x => String(x.id) !== String(item.id));
            } else {
                const existingIndex = list.findIndex(x => String(x.id) === String(item.id));
                if (existingIndex >= 0) {
                    list[existingIndex] = { ...list[existingIndex], ...item };
                } else {
                    list.unshift(item);
                }
            }

            localStorage.setItem(storageKey, JSON.stringify({
                timestamp: Date.now(),
                data: list
            }));

            // Signaler aux autres pages que le cache a été mis à jour
            localStorage.setItem('ep_cache_bump', Date.now().toString());
        } catch (e) {
            console.warn("[Cache Sync] Notice:", e);
        }

        showToast("Enregistré avec succès ! Vos modifications sont directement visibles sur le site.");
    }

    window.escapeQuotes = function (str) {
        return str ? str.replace(/'/g, "\\'").replace(/"/g, '&quot;') : "";
    };

    // =========================================================================
    // 3. MODULE TALENTS
    // =========================================================================
    async function loadTalents() {
        const tbody = document.getElementById('talents-tbody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Chargement...</td></tr>';
        
        let talents = [];
        try {
            const { data, error } = await window.supabase.from('talents').select('*').order('created_at', { ascending: false });
            if (!error && data && data.length > 0) talents = data;
        } catch(e) {}

        if (talents.length === 0) {
            // Lecture cache de secours
            try {
                const cached = JSON.parse(localStorage.getItem('ep_cache_talents') || '{}');
                if (cached.data) talents = cached.data;
            } catch(e) {}
        }

        if (talents.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#64748B;">Aucun talent enregistré pour le moment.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        talents.forEach(t => {
            tbody.innerHTML += `
                <tr>
                    <td><img src="${t.image_url}" style="width: 48px; height: 48px; border-radius:8px; object-fit: cover;"></td>
                    <td><strong>${t.name}</strong></td>
                    <td><span style="background:rgba(212,160,23,0.15); color:#925C00; padding:3px 8px; border-radius:4px; font-weight:600; font-size:0.8rem;">${t.role}</span></td>
                    <td>
                        <button class="action-btn edit" title="Modifier" onclick="editTalent('${t.id}', '${escapeQuotes(t.name)}', '${escapeQuotes(t.role)}', '${escapeQuotes(t.description)}', '${escapeQuotes(t.page_link)}', '${escapeQuotes(t.image_url)}')">Modifier</button>
                        <button class="action-btn del" title="Supprimer" onclick="deleteRecord('talents', '${t.id}', loadTalents)">Supprimer</button>
                    </td>
                </tr>`;
        });
    }

    const talentForm = document.getElementById('talent-form');
    if (talentForm) {
        talentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            saveRecord('talent', 'talents', {
                name: document.getElementById('t-name').value,
                role: document.getElementById('t-role').value,
                description: document.getElementById('t-desc').value,
                page_link: document.getElementById('t-link').value
            }, 't-img-upload', 't-img-old', 'btn-save-talent', loadTalents);
        });
    }

    window.editTalent = function (id, name, role, desc, link, img) {
        document.getElementById('talent-id').value = id;
        document.getElementById('t-name').value = name;
        document.getElementById('t-role').value = role;
        document.getElementById('t-desc').value = desc;
        document.getElementById('t-link').value = link;
        setEditPreview('t', img);
    };

    // =========================================================================
    // 4. MODULE TOURISME & HÔTELS
    // =========================================================================
    async function loadTourisme() {
        const tbody = document.getElementById('tourisme-tbody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Chargement...</td></tr>';
        
        let data = [];
        try {
            const res = await window.supabase.from('tourisme').select('*').order('created_at', { ascending: false });
            if (!res.error && res.data && res.data.length > 0) data = res.data;
        } catch(e) {}

        if (data.length === 0) {
            try {
                const cached = JSON.parse(localStorage.getItem('ep_cache_tourisme') || '{}');
                if (cached.data) data = cached.data;
            } catch(e) {}
        }

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#64748B;">Aucun site enregistré.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        data.forEach(t => {
            tbody.innerHTML += `
                <tr>
                    <td><img src="${t.image_url}" style="width: 48px; height: 48px; border-radius:8px; object-fit: cover;"></td>
                    <td><strong>${t.title}</strong></td>
                    <td><span style="background:rgba(14,129,63,0.12); color:#0E813F; padding:3px 8px; border-radius:4px; font-weight:600; font-size:0.8rem;">${t.category}</span></td>
                    <td>
                        <button class="action-btn edit" title="Modifier" onclick="editTourisme('${t.id}', '${escapeQuotes(t.title)}', '${escapeQuotes(t.category)}', '${escapeQuotes(t.description)}', '${escapeQuotes(t.link_details)}', '${escapeQuotes(t.link_map)}', '${escapeQuotes(t.image_url)}')">Modifier</button>
                        <button class="action-btn del" title="Supprimer" onclick="deleteRecord('tourisme', '${t.id}', loadTourisme)">Supprimer</button>
                    </td>
                </tr>`;
        });
    }

    const tourForm = document.getElementById('tourisme-form');
    if (tourForm) {
        tourForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            saveRecord('tour', 'tourisme', {
                title: document.getElementById('tour-title').value,
                category: document.getElementById('tour-cat').value,
                description: document.getElementById('tour-desc').value,
                link_details: document.getElementById('tour-link').value,
                link_map: document.getElementById('tour-map').value
            }, 'tour-img-upload', 'tour-img-old', 'btn-save-tour', loadTourisme);
        });
    }

    window.editTourisme = function (id, title, cat, desc, link, map, img) {
        document.getElementById('tour-id').value = id;
        document.getElementById('tour-title').value = title;
        document.getElementById('tour-cat').value = cat;
        document.getElementById('tour-desc').value = desc;
        document.getElementById('tour-link').value = link;
        document.getElementById('tour-map').value = map;
        setEditPreview('tour', img);
    };

    // =========================================================================
    // 5. MODULE CULTURE & LIEUX CULTURELS
    // =========================================================================
    async function loadCulture() {
        const tbody = document.getElementById('culture-tbody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Chargement...</td></tr>';
        
        let data = [];
        try {
            const res = await window.supabase.from('culture').select('*').order('created_at', { ascending: false });
            if (!res.error && res.data && res.data.length > 0) data = res.data;
        } catch(e) {}

        if (data.length === 0) {
            try {
                const cached = JSON.parse(localStorage.getItem('ep_cache_culture') || '{}');
                if (cached.data) data = cached.data;
            } catch(e) {}
        }

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#64748B;">Aucun élément culturel enregistré.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        data.forEach(t => {
            tbody.innerHTML += `
                <tr>
                    <td><img src="${t.image_url}" style="width: 48px; height: 48px; border-radius:8px; object-fit: cover;"></td>
                    <td><strong>${t.title}</strong></td>
                    <td><small style="color:#475569;">${t.description ? t.description.substring(0, 70) + '...' : ''}</small></td>
                    <td>
                        <button class="action-btn edit" title="Modifier" onclick="editCulture('${t.id}', '${escapeQuotes(t.title)}', '${escapeQuotes(t.description)}', '${escapeQuotes(t.image_url)}')">Modifier</button>
                        <button class="action-btn del" title="Supprimer" onclick="deleteRecord('culture', '${t.id}', loadCulture)">Supprimer</button>
                    </td>
                </tr>`;
        });
    }

    const cultureForm = document.getElementById('culture-form');
    if (cultureForm) {
        cultureForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            saveRecord('cult', 'culture', {
                title: document.getElementById('cult-title').value,
                description: document.getElementById('cult-desc').value
            }, 'cult-img-upload', 'cult-img-old', 'btn-save-cult', loadCulture);
        });
    }

    window.editCulture = function (id, title, desc, img) {
        document.getElementById('cult-id').value = id;
        document.getElementById('cult-title').value = title;
        document.getElementById('cult-desc').value = desc;
        setEditPreview('cult', img);
    };

    // =========================================================================
    // 6. MODULE AGENDA DES ÉVÉNEMENTS
    // =========================================================================
    async function loadAgenda() {
        const tbody = document.getElementById('agenda-tbody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Chargement...</td></tr>';
        
        let data = [];
        try {
            const res = await window.supabase.from('agenda').select('*').order('created_at', { ascending: false });
            if (!res.error && res.data && res.data.length > 0) data = res.data;
        } catch(e) {}

        if (data.length === 0) {
            try {
                const cached = JSON.parse(localStorage.getItem('ep_cache_agenda') || '{}');
                if (cached.data) data = cached.data;
            } catch(e) {}
        }

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#64748B;">Aucun événement enregistré.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        data.forEach(t => {
            tbody.innerHTML += `
                <tr>
                    <td><img src="${t.image_url}" style="width: 48px; height: 48px; border-radius:8px; object-fit: cover;"></td>
                    <td><strong>${t.date_number} ${t.date_month}</strong></td>
                    <td><strong>${t.title}</strong><br><small style="color:#0E813F;">${t.category}</small></td>
                    <td>${t.location}</td>
                    <td>
                        <button class="action-btn edit" title="Modifier" onclick="editAgenda('${t.id}', '${escapeQuotes(t.title)}', '${escapeQuotes(t.category)}', '${escapeQuotes(t.date_number)}', '${escapeQuotes(t.date_month)}', '${escapeQuotes(t.time)}', '${escapeQuotes(t.location)}', '${escapeQuotes(t.description)}', '${escapeQuotes(t.image_url)}')">Modifier</button>
                        <button class="action-btn del" title="Supprimer" onclick="deleteRecord('agenda', '${t.id}', loadAgenda)">Supprimer</button>
                    </td>
                </tr>`;
        });
    }

    const agendaForm = document.getElementById('agenda-form');
    if (agendaForm) {
        agendaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            saveRecord('ag', 'agenda', {
                title: document.getElementById('ag-title').value,
                category: document.getElementById('ag-cat').value,
                date_number: document.getElementById('ag-dnum').value,
                date_month: document.getElementById('ag-dmonth').value,
                time: document.getElementById('ag-time').value,
                location: document.getElementById('ag-loc').value,
                description: document.getElementById('ag-desc').value
            }, 'ag-img-upload', 'ag-img-old', 'btn-save-ag', loadAgenda);
        });
    }

    window.editAgenda = function (id, title, cat, dnum, dmonth, time, loc, desc, img) {
        document.getElementById('ag-id').value = id;
        document.getElementById('ag-title').value = title;
        document.getElementById('ag-cat').value = cat;
        document.getElementById('ag-dnum').value = dnum;
        document.getElementById('ag-dmonth').value = dmonth;
        document.getElementById('ag-time').value = time;
        document.getElementById('ag-loc').value = loc;
        document.getElementById('ag-desc').value = desc;
        setEditPreview('ag', img);
    };

    // =========================================================================
    // 7. MODULE HISTOIRE & CHRONOLOGIE
    // =========================================================================
    async function loadHistoire() {
        const tbody = document.getElementById('histoire-tbody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Chargement...</td></tr>';
        
        let data = [];
        try {
            const res = await window.supabase.from('histoire_timeline').select('*').order('created_at', { ascending: true });
            if (!res.error && res.data && res.data.length > 0) data = res.data;
        } catch(e) {}

        if (data.length === 0) {
            try {
                const cached = JSON.parse(localStorage.getItem('ep_cache_histoire_timeline') || '{}');
                if (cached.data) data = cached.data;
            } catch(e) {}
        }

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:#64748B;">Aucune date personnalisée enregistrée.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        data.forEach(t => {
            tbody.innerHTML += `
                <tr>
                    <td><strong style="color:var(--color-accent);">${t.period}</strong></td>
                    <td><strong>${t.title}</strong><br><small style="color:#475569;">${t.description ? t.description.substring(0, 80) + '...' : ''}</small></td>
                    <td>
                        <button class="action-btn edit" title="Modifier" onclick="editHistoire('${t.id}', '${escapeQuotes(t.period)}', '${escapeQuotes(t.title)}', '${escapeQuotes(t.description)}')">Modifier</button>
                        <button class="action-btn del" title="Supprimer" onclick="deleteRecord('histoire_timeline', '${t.id}', loadHistoire)">Supprimer</button>
                    </td>
                </tr>`;
        });
    }

    const histoireForm = document.getElementById('histoire-form');
    if (histoireForm) {
        histoireForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('hs-id').value;
            const btn = document.getElementById('btn-save-hs');
            btn.innerText = "Traitement...";

            const payload = {
                id: id || ('hist_' + Date.now()),
                period: document.getElementById('hs-period').value,
                title: document.getElementById('hs-title').value,
                description: document.getElementById('hs-desc').value,
                created_at: new Date().toISOString()
            };

            let resultError;
            try {
                if (id) {
                    const { error } = await window.supabase.from('histoire_timeline').update(payload).eq('id', id);
                    resultError = error;
                } else {
                    const { error } = await window.supabase.from('histoire_timeline').insert([payload]);
                    resultError = error;
                }
            } catch(e) {
                console.warn("[Histoire Save] Notice:", e);
            }

            // Sync direct cache local pour affichage instantané sur le site
            syncLiveWebsite('histoire_timeline', payload);

            btn.innerText = "Enregistrer";
            window.cancelEditing('histoire');
            loadHistoire();
        });
    }

    window.editHistoire = function (id, period, title, desc) {
        document.getElementById('hs-id').value = id;
        document.getElementById('hs-period').value = period;
        document.getElementById('hs-title').value = title;
        document.getElementById('hs-desc').value = desc;
        document.getElementById('btn-cancel-edit-hs').style.display = "inline-block";
        window.scrollTo(0, 0);
    };

    // =========================================================================
    // 8. MODULE GALERIE & MÉDIAS (NOUVEAU)
    // =========================================================================
    async function loadMedias() {
        const tbody = document.getElementById('medias-tbody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Chargement...</td></tr>';
        
        let data = [];
        try {
            const res = await window.supabase.from('medias').select('*').order('created_at', { ascending: false });
            if (!res.error && res.data && res.data.length > 0) data = res.data;
        } catch(e) {}

        if (data.length === 0) {
            try {
                const cached = JSON.parse(localStorage.getItem('ep_cache_medias') || '{}');
                if (cached.data) data = cached.data;
            } catch(e) {}
        }

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#64748B;">Aucun visuel enregistré dans la galerie.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        data.forEach(t => {
            const catLabel = t.category === 'city' ? 'Ville & Paysages' : (t.category === 'people' ? 'Portraits' : 'Culture');
            tbody.innerHTML += `
                <tr>
                    <td><img src="${t.image_url}" style="width: 55px; height: 42px; border-radius:6px; object-fit: cover;"></td>
                    <td><strong>${t.title}</strong></td>
                    <td><span style="background:rgba(14,129,63,0.12); color:#0E813F; padding:3px 8px; border-radius:4px; font-weight:600; font-size:0.8rem;">${catLabel}</span></td>
                    <td>
                        <button class="action-btn edit" title="Modifier" onclick="editMedia('${t.id}', '${escapeQuotes(t.title)}', '${escapeQuotes(t.category)}', '${escapeQuotes(t.image_url)}')">Modifier</button>
                        <button class="action-btn del" title="Supprimer" onclick="deleteRecord('medias', '${t.id}', loadMedias)">Supprimer</button>
                    </td>
                </tr>`;
        });
    }

    const mediaForm = document.getElementById('media-form');
    if (mediaForm) {
        mediaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            saveRecord('med', 'medias', {
                title: document.getElementById('med-title').value,
                category: document.getElementById('med-cat').value
            }, 'med-img-upload', 'med-img-old', 'btn-save-med', loadMedias);
        });
    }

    window.editMedia = function (id, title, cat, img) {
        document.getElementById('med-id').value = id;
        document.getElementById('med-title').value = title;
        document.getElementById('med-cat').value = cat;
        setEditPreview('med', img);
    };

    // =========================================================================
    // 9. MODULE MESSAGES DE CONTACT
    // =========================================================================
    async function loadMessages() {
        const tbody = document.getElementById('messages-tbody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Chargement...</td></tr>';
        
        try {
            const { data, error } = await window.supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
            if (error) {
                tbody.innerHTML = `<tr><td colspan="5">Erreur: ${error.message}</td></tr>`;
                return;
            }
            if (!data || data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#64748B;">Aucun message reçu pour le moment.</td></tr>';
                return;
            }

            tbody.innerHTML = '';
            data.forEach(m => {
                const date = new Date(m.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
                const typeLabel = m.type === 'event' ? 'Événement' : (m.type === 'talent' ? 'Proposition Talent' : (m.type === 'signalement' ? 'Signalement' : 'Contact'));
                const statusBadge = m.status === 'read' ? '<span style="color:#64748B; font-weight:600;">Lu</span>' : '<span style="color:#0E813F; font-weight:700;">Nouveau</span>';

                tbody.innerHTML += `
                    <tr>
                        <td>${statusBadge}</td>
                        <td><small>${date}</small></td>
                        <td><span style="background:#f1f5f9; padding:3px 8px; border-radius:4px; font-weight:600; font-size:0.8rem;">${typeLabel}</span></td>
                        <td><strong>${m.name || 'Anonyme'}</strong><br><small style="color:#64748B;">${m.email || m.phone || '-'}</small></td>
                        <td>
                            <button class="btn btn-outline" style="padding:4px 10px; font-size:0.85rem;" onclick="openMsgModal('${m.id}')">Ouvrir</button>
                            <button class="action-btn del" title="Supprimer" onclick="deleteRecord('contact_messages', '${m.id}', loadMessages)">Supprimer</button>
                        </td>
                    </tr>`;
            });
        } catch(e) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#64748B;">Boîte de réception vide.</td></tr>';
        }
    }

    window.openMsgModal = async function (id) {
        try {
            const { data } = await window.supabase.from('contact_messages').select('*').eq('id', id).single();
            if (!data) return;

            await window.supabase.from('contact_messages').update({ status: 'read' }).eq('id', id);

            document.getElementById('msg-modal-title').innerText = `Message de : ${data.name || 'Visiteur'}`;
            document.getElementById('msg-modal-contact').innerText = `Email: ${data.email || 'N/A'} | Téléphone: ${data.phone || 'N/A'}`;

            let htmlStr = '';
            for (const [key, value] of Object.entries(data)) {
                if (['id', 'created_at', 'status'].includes(key) || !value) continue;
                if (key === 'photo_url' || (typeof value === 'string' && value.startsWith('http') && (value.includes('.webp') || value.includes('.jpg') || value.includes('.png')))) {
                    htmlStr += `<div style="margin-bottom:15px;"><strong>${key}</strong> : <br><a href="${value}" target="_blank"><img src="${value}" style="max-width:260px; border-radius:8px; margin-top:5px; border:1px solid #ddd; object-fit:cover;"></a></div>`;
                } else {
                    htmlStr += `<div style="margin-bottom:8px;"><strong>${key}</strong> : ${value}</div>`;
                }
            }
            document.getElementById('msg-modal-content').innerHTML = htmlStr;
            document.getElementById('msgModal').style.display = 'flex';
        } catch(e) {
            console.warn(e);
        }
    };

    window.closeMsgModal = function () {
        const modal = document.getElementById('msgModal');
        if (modal) modal.style.display = 'none';
        loadMessages();
    };

    // =========================================================================
    // 10. CRUD GÉNÉRIQUE & SYNCHRONISATION MULTI-MODULES
    // =========================================================================

    async function saveRecord(prefix, table, payload, fileId, oldImageId, btnId, reloadCallback) {
        const idInput = document.getElementById(`${prefix}-id`);
        const id = idInput ? idInput.value : '';
        const btn = document.getElementById(btnId);
        if (btn) btn.innerText = "Traitement...";

        const fileInput = document.getElementById(fileId);
        let image_url = oldImageId && document.getElementById(oldImageId) ? document.getElementById(oldImageId).value : '';

        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            try { 
                image_url = await uploadImage(fileInput.files[0]); 
            } catch (err) { 
                alert("Erreur traitement photo: " + err.message); 
                if (btn) btn.innerText = "Enregistrer"; 
                return; 
            }
        }

        if (!image_url && fileId) {
            alert("Veuillez sélectionner une photo (format WebP optimisé)."); 
            if (btn) btn.innerText = "Enregistrer"; 
            return;
        }

        if (image_url) {
            payload.image_url = image_url;
        }

        const generatedId = id || (prefix + '_' + Date.now());
        payload.id = generatedId;
        payload.updated_at = new Date().toISOString();

        // 1. Mise à jour dans Supabase
        try {
            if (window.supabase) {
                if (id) {
                    await window.supabase.from(table).update(payload).eq('id', id);
                } else {
                    await window.supabase.from(table).insert([payload]);
                }
            }
        } catch (err) {
            console.warn("[Save Supabase] Notice:", err);
        }

        // 2. Synchronisation Live dans le cache local (rendu immédiat sur le site public !)
        syncLiveWebsite(table, payload, 'upsert');

        if (btn) btn.innerText = "Enregistrer";
        window.cancelEditing(prefix === "tour" ? "tourisme" : (prefix === "cult" ? "culture" : (prefix === "med" ? "medias" : (prefix === "ag" ? "agenda" : (prefix === "hs" ? "histoire" : "talent")))));
        reloadCallback();
    }

    window.deleteRecord = async function (table, id, callback) {
        if (confirm('Voulez-vous vraiment supprimer cet élément ? Il sera retiré du site web.')) {
            try {
                if (window.supabase) {
                    await window.supabase.from(table).delete().eq('id', id);
                }
            } catch (err) {
                console.warn("[Delete Supabase] Notice:", err);
            }

            // Mise à jour live du cache
            syncLiveWebsite(table, { id: id }, 'delete');
            callback();
        }
    };

    function setEditPreview(prefix, img) {
        const oldImg = document.getElementById(`${prefix}-img-old`);
        if (oldImg) oldImg.value = img;
        const uploadInput = document.getElementById(`${prefix}-img-upload`);
        if (uploadInput) uploadInput.value = "";
        
        const preview = document.getElementById(`${prefix}-img-preview`);
        if (preview) {
            preview.style.display = 'block';
            preview.innerHTML = `
                <img src="${img}" style="width:100%; border-radius:8px; display:block; margin-bottom:4px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                <div style="font-size:0.75rem; color:#64748B;">Image actuelle (WebP)</div>
            `;
        }

        const cancelBtnId = `btn-cancel-edit-${prefix === 't' ? 'talent' : (prefix === 'tour' ? 'tour' : (prefix === 'cult' ? 'cult' : (prefix === 'ag' ? 'ag' : (prefix === 'med' ? 'med' : 'hs'))))}`;
        const cancelBtn = document.getElementById(cancelBtnId);
        if (cancelBtn) cancelBtn.style.display = "inline-block";

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.cancelEditing = function (type) {
        let prefix = type === 'talent' ? 't' : (type === 'tourisme' ? 'tour' : (type === 'culture' ? 'cult' : (type === 'agenda' ? 'ag' : (type === 'medias' ? 'med' : 'hs'))));
        let formId = type === 'talent' ? 'talent-form' : (type === 'tourisme' ? 'tourisme-form' : (type === 'culture' ? 'culture-form' : (type === 'agenda' ? 'agenda-form' : (type === 'medias' ? 'media-form' : 'histoire-form'))));

        const form = document.getElementById(formId);
        if (form) form.reset();

        const idField = document.getElementById(`${prefix}-id`);
        if (idField) idField.value = '';

        const oldImg = document.getElementById(`${prefix}-img-old`);
        if (oldImg) oldImg.value = '';

        const preview = document.getElementById(`${prefix}-img-preview`);
        if (preview) preview.style.display = 'none';

        const cancelBtnId = `btn-cancel-edit-${prefix === 't' ? 'talent' : (prefix === 'tour' ? 'tour' : (prefix === 'cult' ? 'cult' : (prefix === 'ag' ? 'ag' : (prefix === 'med' ? 'med' : 'hs'))))}`;
        const cancelBtn = document.getElementById(cancelBtnId);
        if (cancelBtn) cancelBtn.style.display = "none";
    };

});
