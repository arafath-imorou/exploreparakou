const fs = require('fs');
const path = require('path');

const adminHtmlPath = path.join(__dirname, 'admin.html');
const adminJsPath = path.join(__dirname, 'assets', 'js', 'admin.js');

let html = fs.readFileSync(adminHtmlPath, 'utf8');

// Inject Menu Link
html = html.replace('<li><a href="#" class="nav-link" data-target="panel-culture"><i class="ph ph-mask-happy"></i> Culture</a></li>',
    '<li><a href="#" class="nav-link" data-target="panel-culture"><i class="ph ph-mask-happy"></i> Culture</a></li>\n                <li><a href="#" class="nav-link" data-target="panel-agenda"><i class="ph ph-calendar"></i> Agenda</a></li>');

// Inject Agenda Panel
const agendaPanel = `
            <!-- PANEL AGENDA -->
            <div class="admin-panel" id="panel-agenda">
                <h3 class="admin-title">Gestion de l'Agenda</h3>
                <p>Éditez les événements, festivals et concerts.</p>
                <div style="background:#f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 2rem;">
                    <h4>Ajouter un Événement</h4>
                    <form id="agenda-form" style="margin-top: 15px;">
                        <input type="hidden" id="ag-id">
                        <div class="form-group"><label>Titre (Ex: Festival Kobourou)</label><input type="text" id="ag-title" required></div>
                        <div class="form-group"><label>Catégorie (Ex: Festival International)</label><input type="text" id="ag-cat" required></div>
                        <div class="form-group"><label>Jour (Ex: 15)</label><input type="text" id="ag-dnum" required></div>
                        <div class="form-group"><label>Mois (Ex: Fév)</label><input type="text" id="ag-dmonth" required></div>
                        <div class="form-group"><label>Heure (Ex: 16:00 - 02:00)</label><input type="text" id="ag-time" required></div>
                        <div class="form-group"><label>Lieu (Ex: Place Tabéra)</label><input type="text" id="ag-loc" required></div>
                        <div class="form-group"><label>Description Courte</label><textarea id="ag-desc" rows="3" required></textarea></div>
                        <div class="form-group">
                            <label>Affiche (Photo)</label>
                            <input type="hidden" id="ag-img-old">
                            <input type="file" id="ag-img-upload" accept="image/*">
                            <div id="ag-img-preview" style="margin-top: 10px; max-width: 100px; display: none;"></div>
                        </div>
                        <button type="submit" class="btn btn-primary" id="btn-save-ag">Enregistrer</button>
                        <button type="button" class="btn btn-outline" id="btn-cancel-edit-ag" style="display:none;" onclick="cancelEditing('agenda')">Annuler</button>
                    </form>
                </div>
                <h4>Événements Existants</h4>
                <div style="overflow-x: auto;">
                    <table class="data-table">
                        <thead><tr><th>Affiche</th><th>Date</th><th>Titre</th><th>Lieu</th><th>Actions</th></tr></thead>
                        <tbody id="agenda-tbody"><tr><td colspan="5" style="text-align:center;">Chargement...</td></tr></tbody>
                    </table>
                </div>
            </div>
`;

html = html.replace('<!-- PANEL CULTURE -->', agendaPanel + '\n            <!-- PANEL CULTURE -->');
fs.writeFileSync(adminHtmlPath, html);

// Update JS
let js = fs.readFileSync(adminJsPath, 'utf8');

js = js.replace('loadCulture();', 'loadCulture();\n        loadAgenda();');
js = js.replace("setupFilePreview('cult-img-upload', 'cult-img-preview');", "setupFilePreview('cult-img-upload', 'cult-img-preview');\n    setupFilePreview('ag-img-upload', 'ag-img-preview');");

const jsAgendaLogic = `
    // --- 4. AGENDA ---
    async function loadAgenda() {
        const tbody = document.getElementById('agenda-tbody');
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Chargement...</td></tr>';
        const { data, error } = await window.supabase.from('agenda').select('*').order('created_at', { ascending: false });
        if (error) return tbody.innerHTML = \`<tr><td colspan="5">Erreur: \${error.message}</td></tr>\`;
        if (data.length === 0) return tbody.innerHTML = '<tr><td colspan="5">Aucun événement</td></tr>';
        
        tbody.innerHTML = '';
        data.forEach(t => {
            tbody.innerHTML += \`
                <tr>
                    <td><img src="\${t.image_url}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                    <td>\${t.date_number} \${t.date_month}</td>
                    <td><strong>\${t.title}</strong><br><small>\${t.category}</small></td>
                    <td>\${t.location}</td>
                    <td>
                        <button class="action-btn edit" onclick="editAgenda('\${t.id}', '\${escapeQuotes(t.title)}', '\${escapeQuotes(t.category)}', '\${escapeQuotes(t.date_number)}', '\${escapeQuotes(t.date_month)}', '\${escapeQuotes(t.time)}', '\${escapeQuotes(t.location)}', '\${escapeQuotes(t.description)}', '\${escapeQuotes(t.image_url)}')"><i class="ph ph-pencil-simple"></i></button>
                        <button class="action-btn del" onclick="deleteRecord('agenda', '\${t.id}', loadAgenda)"><i class="ph ph-trash"></i></button>
                    </td>
                </tr>\`;
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

    // --- GENERIC CRUD HELPERS ---
`;
js = js.replace('// --- GENERIC CRUD HELPERS ---', jsAgendaLogic);

// Add editAgenda function
const jsAgendaEdit = `
    window.editCulture = function(id, title, desc, img) {
        document.getElementById('cult-id').value = id;
        document.getElementById('cult-title').value = title;
        document.getElementById('cult-desc').value = desc;
        setEditPreview('cult', img);
    };

    window.editAgenda = function(id, title, cat, dnum, dmonth, time, loc, desc, img) {
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
`;
js = js.replace(/window\.editCulture = function[\s\S]*?setEditPreview\('cult', img\);\n    };/, jsAgendaEdit);

js = js.replace(/window\.cancelEditing = function\(type\) {[\s\S]*?let prefix =.*?type === 'tourisme' \? 'tour' : 'cult';/, "window.cancelEditing = function(type) {\n        let prefix = type === 'talent' ? 't' : type === 'tourisme' ? 'tour' : type === 'culture' ? 'cult' : 'ag';");
js = js.replace(/let formId =.*?type === 'tourisme' \? 'tourisme-form' : 'culture-form';/, "let formId = type === 'talent' ? 'talent-form' : type === 'tourisme' ? 'tourisme-form' : type === 'culture' ? 'culture-form' : 'agenda-form';");
js = js.replace(/document\.getElementById\(\`btn-cancel-edit-\${type === 'tourisme' \? 'tour' : type === 'culture' \? 'cult' : 'talent'}\`\)\.style\.display = "none";/, "document.getElementById(`btn-cancel-edit-${type === 'tourisme' ? 'tour' : type === 'culture' ? 'cult' : type === 'agenda' ? 'ag' : 'talent'}`).style.display = \"none\";");

fs.writeFileSync(adminJsPath, js);
console.log('Admin Agenda Setup Done.');
