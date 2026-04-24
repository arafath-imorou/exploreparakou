document.addEventListener('DOMContentLoaded', async () => {

    const loginUI = document.getElementById('login-ui');
    const dashboardUI = document.getElementById('dashboard-ui');
    const loginForm = document.getElementById('login-form');
    const errorBox = document.getElementById('login-error');
    const logoutBtn = document.getElementById('btn-logout');

    const { data: { session } } = await supabase.auth.getSession();

    if (session) { showDashboard(); } else { showLogin(); }

    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') showDashboard();
        if (event === 'SIGNED_OUT') showLogin();
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        const btn = document.getElementById('btn-login');

        btn.innerHTML = 'Connexion...';
        errorBox.style.display = 'none';

        const { error } = await supabase.auth.signInWithPassword({ email: email, password: password });

        if (error) {
            errorBox.style.display = 'block';
            errorBox.innerText = error.message;
            btn.innerHTML = 'Se Connecter <i class="ph ph-sign-in"></i>';
        }
    });

    logoutBtn.addEventListener('click', async () => { await supabase.auth.signOut(); });

    function showDashboard() {
        loginUI.style.display = 'none';
        dashboardUI.style.display = 'flex';
        loadAllData();
    }
    function showLogin() {
        loginUI.style.display = 'flex';
        dashboardUI.style.display = 'none';
    }

    // Tab Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active-panel'));

            this.classList.add('active');
            const target = this.getAttribute('data-target');
            document.getElementById(target).classList.add('active-panel');
        });
    });

    function loadAllData() {
        loadTalents();
        loadTourisme();
        loadCulture();
        loadAgenda();
        loadHistoire();
        loadMessages();
    }

    // Tools
    window.escapeQuotes = function (str) { return str ? str.replace(/'/g, "\\'").replace(/"/g, '&quot;') : ""; };
    async function uploadImage(file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `photos/${fileName}`;
        const { error } = await window.supabase.storage.from('talents').upload(filePath, file);
        if (error) throw error;
        const { data } = window.supabase.storage.from('talents').getPublicUrl(filePath);
        return data.publicUrl;
    }
    function setupFilePreview(inputId, previewId) {
        document.getElementById(inputId).addEventListener('change', function (e) {
            const preview = document.getElementById(previewId);
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function (evt) {
                    preview.style.display = 'block';
                    preview.innerHTML = `<img src="${evt.target.result}" style="width:100%; border-radius:8px;">`;
                }
                reader.readAsDataURL(this.files[0]);
            } else { preview.style.display = 'none'; }
        });
    }

    setupFilePreview('t-img-upload', 't-img-preview');
    setupFilePreview('tour-img-upload', 'tour-img-preview');
    setupFilePreview('cult-img-upload', 'cult-img-preview');
    setupFilePreview('ag-img-upload', 'ag-img-preview');

    // --- 1. TALENTS ---
    async function loadTalents() {
        const tbody = document.getElementById('talents-tbody');
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Chargement...</td></tr>';
        const { data: talents, error } = await supabase.from('talents').select('*').order('created_at', { ascending: false });
        if (error) return tbody.innerHTML = `<tr><td colspan="4">Erreur: ${error.message}</td></tr>`;
        if (talents.length === 0) return tbody.innerHTML = '<tr><td colspan="4">Aucun talent</td></tr>';

        tbody.innerHTML = '';
        talents.forEach(t => {
            tbody.innerHTML += `
                <tr>
                    <td><img src="${t.image_url}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                    <td><strong>${t.name}</strong></td><td>${t.role}</td>
                    <td>
                        <button class="action-btn edit" onclick="editTalent('${t.id}', '${escapeQuotes(t.name)}', '${escapeQuotes(t.role)}', '${escapeQuotes(t.description)}', '${escapeQuotes(t.page_link)}', '${escapeQuotes(t.image_url)}')"><i class="ph ph-pencil-simple"></i></button>
                        <button class="action-btn del" onclick="deleteRecord('talents', '${t.id}', loadTalents)"><i class="ph ph-trash"></i></button>
                    </td>
                </tr>`;
        });
    }
    document.getElementById('talent-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        saveRecord('talent', 'talents', {
            name: document.getElementById('t-name').value,
            role: document.getElementById('t-role').value,
            description: document.getElementById('t-desc').value,
            page_link: document.getElementById('t-link').value
        }, 't-img-upload', 't-img-old', 'btn-save-talent', loadTalents);
    });

    // --- 2. TOURISME ---
    async function loadTourisme() {
        const tbody = document.getElementById('tourisme-tbody');
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Chargement...</td></tr>';
        const { data, error } = await supabase.from('tourisme').select('*').order('created_at', { ascending: false });
        if (error) return tbody.innerHTML = `<tr><td colspan="4">Erreur: ${error.message}</td></tr>`;
        if (data.length === 0) return tbody.innerHTML = '<tr><td colspan="4">Aucun site</td></tr>';

        tbody.innerHTML = '';
        data.forEach(t => {
            tbody.innerHTML += `
                <tr>
                    <td><img src="${t.image_url}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                    <td><strong>${t.title}</strong></td><td>${t.category}</td>
                    <td>
                        <button class="action-btn edit" onclick="editTourisme('${t.id}', '${escapeQuotes(t.title)}', '${escapeQuotes(t.category)}', '${escapeQuotes(t.description)}', '${escapeQuotes(t.link_details)}', '${escapeQuotes(t.link_map)}', '${escapeQuotes(t.image_url)}')"><i class="ph ph-pencil-simple"></i></button>
                        <button class="action-btn del" onclick="deleteRecord('tourisme', '${t.id}', loadTourisme)"><i class="ph ph-trash"></i></button>
                    </td>
                </tr>`;
        });
    }
    document.getElementById('tourisme-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        saveRecord('tour', 'tourisme', {
            title: document.getElementById('tour-title').value,
            category: document.getElementById('tour-cat').value,
            description: document.getElementById('tour-desc').value,
            link_details: document.getElementById('tour-link').value,
            link_map: document.getElementById('tour-map').value
        }, 'tour-img-upload', 'tour-img-old', 'btn-save-tour', loadTourisme);
    });

    // --- 3. CULTURE ---
    async function loadCulture() {
        const tbody = document.getElementById('culture-tbody');
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Chargement...</td></tr>';
        const { data, error } = await supabase.from('culture').select('*').order('created_at', { ascending: false });
        if (error) return tbody.innerHTML = `<tr><td colspan="4">Erreur: ${error.message}</td></tr>`;
        if (data.length === 0) return tbody.innerHTML = '<tr><td colspan="4">Aucun élément</td></tr>';

        tbody.innerHTML = '';
        data.forEach(t => {
            tbody.innerHTML += `
                <tr>
                    <td><img src="${t.image_url}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                    <td><strong>${t.title}</strong></td><td>${t.description}</td>
                    <td>
                        <button class="action-btn edit" onclick="editCulture('${t.id}', '${escapeQuotes(t.title)}', '${escapeQuotes(t.description)}', '${escapeQuotes(t.image_url)}')"><i class="ph ph-pencil-simple"></i></button>
                        <button class="action-btn del" onclick="deleteRecord('culture', '${t.id}', loadCulture)"><i class="ph ph-trash"></i></button>
                    </td>
                </tr>`;
        });
    }
    document.getElementById('culture-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        saveRecord('cult', 'culture', {
            title: document.getElementById('cult-title').value,
            description: document.getElementById('cult-desc').value
        }, 'cult-img-upload', 'cult-img-old', 'btn-save-cult', loadCulture);
    });


    // --- 4. AGENDA ---
    async function loadAgenda() {
        const tbody = document.getElementById('agenda-tbody');
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Chargement...</td></tr>';
        const { data, error } = await window.supabase.from('agenda').select('*').order('created_at', { ascending: false });
        if (error) return tbody.innerHTML = `<tr><td colspan="5">Erreur: ${error.message}</td></tr>`;
        if (data.length === 0) return tbody.innerHTML = '<tr><td colspan="5">Aucun événement</td></tr>';

        tbody.innerHTML = '';
        data.forEach(t => {
            tbody.innerHTML += `
                <tr>
                    <td><img src="${t.image_url}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                    <td>${t.date_number} ${t.date_month}</td>
                    <td><strong>${t.title}</strong><br><small>${t.category}</small></td>
                    <td>${t.location}</td>
                    <td>
                        <button class="action-btn edit" onclick="editAgenda('${t.id}', '${escapeQuotes(t.title)}', '${escapeQuotes(t.category)}', '${escapeQuotes(t.date_number)}', '${escapeQuotes(t.date_month)}', '${escapeQuotes(t.time)}', '${escapeQuotes(t.location)}', '${escapeQuotes(t.description)}', '${escapeQuotes(t.image_url)}')"><i class="ph ph-pencil-simple"></i></button>
                        <button class="action-btn del" onclick="deleteRecord('agenda', '${t.id}', loadAgenda)"><i class="ph ph-trash"></i></button>
                    </td>
                </tr>`;
        });
    }
    document.getElementById('agenda-form').addEventListener('submit', async (e) => {
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


    // --- 5. HISTOIRE TIMELINE ---
    async function loadHistoire() {
        const tbody = document.getElementById('histoire-tbody');
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Chargement...</td></tr>';
        // Ordering by created_at ascending so oldest added shows first, or we can order by title (alphabetical). 
        // For timeline, usually they should be retrieved by a specific date, but here we just order by creation time 
        // and let admin add them in order.
        const { data, error } = await window.supabase.from('histoire_timeline').select('*').order('created_at', { ascending: true });
        if (error) return tbody.innerHTML = `<tr><td colspan="3">Erreur: ${error.message}</td></tr>`;
        if (data.length === 0) return tbody.innerHTML = '<tr><td colspan="3">Aucune date enregistrée</td></tr>';

        tbody.innerHTML = '';
        data.forEach(t => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>${t.period}</strong></td>
                    <td>${t.title}</td>
                    <td>
                        <button class="action-btn edit" onclick="editHistoire('${t.id}', '${escapeQuotes(t.period)}', '${escapeQuotes(t.title)}', '${escapeQuotes(t.description)}')"><i class="ph ph-pencil-simple"></i></button>
                        <button class="action-btn del" onclick="deleteRecord('histoire_timeline', '${t.id}', loadHistoire)"><i class="ph ph-trash"></i></button>
                    </td>
                </tr>`;
        });
    }

    document.getElementById('histoire-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('hs-id').value;
        const payload = {
            period: document.getElementById('hs-period').value,
            title: document.getElementById('hs-title').value,
            description: document.getElementById('hs-desc').value
        };
        try {
            if (id) {
                const { error } = await window.supabase.from('histoire_timeline').update(payload).eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await window.supabase.from('histoire_timeline').insert([payload]);
                if (error) throw error;
            }
            document.getElementById('histoire-form').reset();
            document.getElementById('hs-id').value = '';
            document.getElementById('btn-cancel-edit-hs').style.display = 'none';
            document.getElementById('btn-save-hs').textContent = "Enregistrer";
            loadHistoire();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'enregistrement: " + err.message);
        }
    });

    window.editHistoire = function (id, period, title, desc) {
        document.getElementById('hs-id').value = id;
        document.getElementById('hs-period').value = period;
        document.getElementById('hs-title').value = title;
        document.getElementById('hs-desc').value = desc;
        document.getElementById('btn-cancel-edit-hs').style.display = "inline-block";
        document.getElementById('btn-save-hs').textContent = "Mettre à jour";
        document.querySelector('[data-target="panel-histoire"]').click();
    };


    // --- 6. MESSAGES (INBOX) ---
    async function loadMessages() {
        const tbody = document.getElementById('messages-tbody');
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Chargement...</td></tr>';

        const { data, error } = await window.supabase.from('messages').select('*').order('created_at', { ascending: false });
        if (error) return tbody.innerHTML = `<tr><td colspan="5">Erreur: ${error.message}</td></tr>`;
        if (data.length === 0) return tbody.innerHTML = '<tr><td colspan="5">Aucun message pour le moment.</td></tr>';

        tbody.innerHTML = '';
        data.forEach(m => {
            const dateStr = new Date(m.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            const statusIcon = m.is_read ? '<i class="ph ph-envelope-open" style="color:#aaa;"></i>' : '<i class="ph ph-envelope" style="color:var(--color-accent); font-weight:bold;"></i>';
            const plStr = encodeURIComponent(JSON.stringify(m.payload));

            tbody.innerHTML += `
                <tr style="${!m.is_read ? 'background-color:rgba(226, 177, 60, 0.05); font-weight:bold;' : ''}">
                    <td style="text-align:center; font-size:1.2rem;">${statusIcon}</td>
                    <td style="font-size:0.85rem;">${dateStr}</td>
                    <td>${m.type}</td>
                    <td>${m.contact_email}</td>
                    <td>
                        <button class="action-btn view" style="background:#eef2fb; color:var(--color-primary);" onclick="viewMessage('${m.id}', '${m.type}', '${m.contact_email}', '${plStr}')"><i class="ph ph-eye"></i></button>
                        <button class="action-btn del" onclick="deleteRecord('messages', '${m.id}', loadMessages)"><i class="ph ph-trash"></i></button>
                    </td>
                </tr>`;
        });
    }

    window.viewMessage = async function (id, type, contact, payloadStr) {
        // Mark as read in DB silently
        window.supabase.from('messages').update({ is_read: true }).eq('id', id).then(() => {
            // refresh list quietly in background after a moment
            setTimeout(loadMessages, 1000);
        });

        const payload = JSON.parse(decodeURIComponent(payloadStr));
        document.getElementById('msg-modal-title').innerText = "Nouvelle demande : " + type;
        document.getElementById('msg-modal-contact').innerHTML = "<strong>Contact :</strong> " + contact;

        // Format payload to readable HTML
        let htmlStr = "";
        for (const [key, value] of Object.entries(payload)) {
            if (typeof value === 'string' && value.startsWith('http') && key.toLowerCase().includes('image')) {
                htmlStr += `<div style="margin-top:10px; margin-bottom:10px;"><strong>${key}</strong> : <br><a href="${value}" target="_blank"><img src="${value}" style="max-width:300px; border-radius:8px; margin-top:5px; border:1px solid #ddd; object-fit:cover;"></a></div>`;
            } else {
                htmlStr += `<strong>${key}</strong> : ${value}<br><br>`;
            }
        }
        document.getElementById('msg-modal-content').innerHTML = htmlStr;

        document.getElementById('msgModal').style.display = 'flex';
    };

    window.closeMsgModal = function () {
        document.getElementById('msgModal').style.display = 'none';
        loadMessages();
    };

    // --- GENERIC CRUD HELPERS ---



    async function saveRecord(prefix, table, payload, fileId, oldImageId, btnId, reloadCallback) {
        const id = document.getElementById(`${prefix}-id`).value;
        const btn = document.getElementById(btnId);
        btn.innerText = "Traitement...";

        const fileInput = document.getElementById(fileId);
        let image_url = document.getElementById(oldImageId).value;

        if (fileInput.files && fileInput.files.length > 0) {
            try { image_url = await uploadImage(fileInput.files[0]); }
            catch (err) { alert("Erreur photo: " + err.message); btn.innerText = "Enregistrer"; return; }
        }

        if (!image_url) {
            alert("Veuillez sélectionner une photo."); btn.innerText = "Enregistrer"; return;
        }

        payload.image_url = image_url;
        let resultError;

        if (id) {
            const { error } = await supabase.from(table).update(payload).eq('id', id); resultError = error;
        } else {
            const { error } = await supabase.from(table).insert([payload]); resultError = error;
        }

        btn.innerText = "Enregistrer";
        if (resultError) alert('Erreur: ' + resultError.message);
        else {
            window.cancelEditing(prefix === "tour" ? "tourisme" : (prefix === "cult" ? "culture" : "talent"));
            reloadCallback();
        }
    }

    window.deleteRecord = async function (table, id, callback) {
        if (confirm('Voulez-vous vraiment supprimer cet élément ?')) {
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (error) alert(error.message); else callback();
        }
    };

    // EDIT UI HELPERS
    window.editTalent = function (id, name, role, desc, link, img) {
        document.getElementById('talent-id').value = id;
        document.getElementById('t-name').value = name;
        document.getElementById('t-role').value = role;
        document.getElementById('t-desc').value = desc;
        document.getElementById('t-link').value = link;
        setEditPreview('t', img);
    };
    window.editTourisme = function (id, title, cat, desc, link, map, img) {
        document.getElementById('tour-id').value = id;
        document.getElementById('tour-title').value = title;
        document.getElementById('tour-cat').value = cat;
        document.getElementById('tour-desc').value = desc;
        document.getElementById('tour-link').value = link;
        document.getElementById('tour-map').value = map;
        setEditPreview('tour', img);
    };
    window.editCulture = function (id, title, desc, img) {
        document.getElementById('cult-id').value = id;
        document.getElementById('cult-title').value = title;
        document.getElementById('cult-desc').value = desc;
        setEditPreview('cult', img);
    };

    function setEditPreview(prefix, img) {
        document.getElementById(`${prefix}-img-old`).value = img;
        document.getElementById(`${prefix}-img-upload`).value = "";
        const preview = document.getElementById(`${prefix}-img-preview`);
        preview.style.display = 'block';
        preview.innerHTML = `<img src="${img}" style="width:100%; border-radius:8px;"> <div style="font-size:0.8rem;color:#666;">Image actuelle</div>`;
        document.getElementById(`btn-cancel-edit-${prefix === 't' ? 'talent' : prefix}`).style.display = "inline-block";
        window.scrollTo(0, 0);
    }

    window.cancelEditing = function (type) {
        let prefix = type === 'talent' ? 't' : type === 'tourisme' ? 'tour' : 'cult';
        let formId = type === 'talent' ? 'talent-form' : type === 'tourisme' ? 'tourisme-form' : type === 'culture' ? 'culture-form' : type === 'histoire' ? 'histoire-form' : 'agenda-form';

        document.getElementById(formId).reset();
        document.getElementById(`${prefix}-id`).value = '';
        document.getElementById(`${prefix}-img-old`).value = '';
        document.getElementById(`${prefix}-img-preview`).style.display = 'none';
        document.getElementById(`btn-cancel-edit-${type === 'tourisme' ? 'tour' : type === 'culture' ? 'cult' : type === 'agenda' ? 'ag' : 'talent'}`).style.display = "none";
    };
});
