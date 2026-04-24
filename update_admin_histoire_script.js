const fs = require('fs');
const path = require('path');

const adminHtmlPath = path.join(__dirname, 'admin.html');
const adminJsPath = path.join(__dirname, 'assets', 'js', 'admin.js');

let html = fs.readFileSync(adminHtmlPath, 'utf8');

// Inject Menu Link
html = html.replace('<li><a href="#" class="nav-link" data-target="panel-agenda"><i class="ph ph-calendar"></i> Agenda</a></li>',
    '<li><a href="#" class="nav-link" data-target="panel-agenda"><i class="ph ph-calendar"></i> Agenda</a></li>\n                <li><a href="#" class="nav-link" data-target="panel-histoire"><i class="ph ph-clock-counter-clockwise"></i> Histoire</a></li>');

// Inject Histoire Panel
const hsPanel = `
            <!-- PANEL HISTOIRE -->
            <div class="admin-panel" id="panel-histoire">
                <h3 class="admin-title">Ligne du Temps - Histoire</h3>
                <p>Ajoutez des dates clés à la frise chronologique de la ville.</p>
                <div style="background:#f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 2rem;">
                    <h4>Ajouter une Époque</h4>
                    <form id="histoire-form" style="margin-top: 15px;">
                        <input type="hidden" id="hs-id">
                        <div class="form-group"><label>Période / Année (Ex: XVIe Siècle)</label><input type="text" id="hs-period" required></div>
                        <div class="form-group"><label>Titre de l'événement (Ex: Fondation du royaume)</label><input type="text" id="hs-title" required></div>
                        <div class="form-group"><label>Description exhaustive</label><textarea id="hs-desc" rows="4" required></textarea></div>
                        <button type="submit" class="btn btn-primary" id="btn-save-hs">Enregistrer</button>
                        <button type="button" class="btn btn-outline" id="btn-cancel-edit-hs" style="display:none;" onclick="cancelEditing('histoire')">Annuler</button>
                    </form>
                </div>
                <h4>Chronologie Existant</h4>
                <div style="overflow-x: auto;">
                    <table class="data-table">
                        <thead><tr><th>Période</th><th>Titre</th><th>Actions</th></tr></thead>
                        <tbody id="histoire-tbody"><tr><td colspan="3" style="text-align:center;">Chargement...</td></tr></tbody>
                    </table>
                </div>
            </div>
`;

html = html.replace('<!-- PANEL AGENDA -->', hsPanel + '\n            <!-- PANEL AGENDA -->');
fs.writeFileSync(adminHtmlPath, html);


// Update JS
let js = fs.readFileSync(adminJsPath, 'utf8');

js = js.replace('loadAgenda();', 'loadAgenda();\n        loadHistoire();');

const jsHistoireLogic = `
    // --- 5. HISTOIRE TIMELINE ---
    async function loadHistoire() {
        const tbody = document.getElementById('histoire-tbody');
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Chargement...</td></tr>';
        // Ordering by created_at ascending so oldest added shows first, or we can order by title (alphabetical). 
        // For timeline, usually they should be retrieved by a specific date, but here we just order by creation time 
        // and let admin add them in order.
        const { data, error } = await window.supabase.from('histoire_timeline').select('*').order('created_at', { ascending: true });
        if (error) return tbody.innerHTML = \`<tr><td colspan="3">Erreur: \${error.message}</td></tr>\`;
        if (data.length === 0) return tbody.innerHTML = '<tr><td colspan="3">Aucune date enregistrée</td></tr>';
        
        tbody.innerHTML = '';
        data.forEach(t => {
            tbody.innerHTML += \`
                <tr>
                    <td><strong>\${t.period}</strong></td>
                    <td>\${t.title}</td>
                    <td>
                        <button class="action-btn edit" onclick="editHistoire('\${t.id}', '\${escapeQuotes(t.period)}', '\${escapeQuotes(t.title)}', '\${escapeQuotes(t.description)}')"><i class="ph ph-pencil-simple"></i></button>
                        <button class="action-btn del" onclick="deleteRecord('histoire_timeline', '\${t.id}', loadHistoire)"><i class="ph ph-trash"></i></button>
                    </td>
                </tr>\`;
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

    window.editHistoire = function(id, period, title, desc) {
        document.getElementById('hs-id').value = id;
        document.getElementById('hs-period').value = period;
        document.getElementById('hs-title').value = title;
        document.getElementById('hs-desc').value = desc;
        document.getElementById('btn-cancel-edit-hs').style.display = "inline-block";
        document.getElementById('btn-save-hs').textContent = "Mettre à jour";
        document.querySelector('[data-target="panel-histoire"]').click();
    };

    // --- GENERIC CRUD HELPERS ---
`;
js = js.replace('// --- GENERIC CRUD HELPERS ---', jsHistoireLogic);

js = js.replace(/window\.cancelEditing = function\(type\) {[\s\S]*?let prefix =.*?type === 'talent' \? 't' : type === 'tourisme' \? 'tour' : type === 'culture' \? 'cult' : 'ag';/, "window.cancelEditing = function(type) {\n        let prefix = type === 'talent' ? 't' : type === 'tourisme' ? 'tour' : type === 'culture' ? 'cult' : type === 'histoire' ? 'hs' : 'ag';");
js = js.replace(/let formId =.*?type === 'talent' \? 'talent-form' : type === 'tourisme' \? 'tourisme-form' : type === 'culture' \? 'culture-form' : 'agenda-form';/, "let formId = type === 'talent' ? 'talent-form' : type === 'tourisme' ? 'tourisme-form' : type === 'culture' ? 'culture-form' : type === 'histoire' ? 'histoire-form' : 'agenda-form';");

// For Histoire, we don't need to clear Image.
const imgClearRegex = /if \(imgPreview\) imgPreview\.style\.display = "none";\n        if \(imgOld\) imgOld\.value = "";/;
js = js.replace(imgClearRegex, `if (imgPreview) imgPreview.style.display = "none";
        if (imgOld) imgOld.value = "";
        if (type === 'histoire') {
            document.getElementById('btn-cancel-edit-hs').style.display = "none";
            document.getElementById('btn-save-hs').textContent = "Enregistrer";
            document.getElementById('histoire-form').reset();
            document.getElementById('hs-id').value = '';
            return;
        }
`);

fs.writeFileSync(adminJsPath, js);
console.log('Admin Histoire Setup Done.');
