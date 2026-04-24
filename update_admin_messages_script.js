const fs = require('fs');
const path = require('path');

const adminHtmlPath = path.join(__dirname, 'admin.html');
const adminJsPath = path.join(__dirname, 'assets', 'js', 'admin.js');

let html = fs.readFileSync(adminHtmlPath, 'utf8');

// Inject Menu Link
html = html.replace('<li><a href="#" class="nav-link" data-target="panel-histoire"><i class="ph ph-clock-counter-clockwise"></i> Histoire</a></li>',
    '<li><a href="#" class="nav-link" data-target="panel-histoire"><i class="ph ph-clock-counter-clockwise"></i> Histoire</a></li>\n                <li><a href="#" class="nav-link" data-target="panel-messages"><i class="ph ph-envelope"></i> Boîte de Réception</a></li>');

// Create Modal logic inside the panel
const msgPanel = `
            <!-- PANEL MESSAGES -->
            <div class="admin-panel" id="panel-messages">
                <h3 class="admin-title">Boîte de Réception</h3>
                <p>Consultez les demandes de contact, d'événements et de partenariats.</p>
                <div style="background:#f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 2rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px;">
                        <h4>Messages Récents</h4>
                        <button class="btn btn-outline" onclick="loadMessages()"><i class="ph ph-arrows-clockwise"></i> Rafraîchir</button>
                    </div>
                    <div style="overflow-x: auto;">
                        <table class="data-table">
                            <thead><tr><th>Statut</th><th>Date</th><th>Type</th><th>Contact</th><th>Actions</th></tr></thead>
                            <tbody id="messages-tbody"><tr><td colspan="5" style="text-align:center;">Chargement...</td></tr></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- MODAL MESSAGE -->
            <div id="msgModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; justify-content:center; align-items:center;">
                <div style="background:white; padding:30px; border-radius:12px; max-width:600px; width:90%; position:relative;">
                    <button onclick="closeMsgModal()" style="position:absolute; top:15px; right:15px; background:none; border:none; font-size:1.5rem; cursor:pointer;"><i class="ph ph-x"></i></button>
                    <h3 id="msg-modal-title" style="margin-bottom:10px; color:var(--color-primary);">Message</h3>
                    <p id="msg-modal-contact" style="color:#666; font-size:0.9rem; margin-bottom:20px;"></p>
                    <div id="msg-modal-content" style="background:#f4f6f8; padding:20px; border-radius:8px; font-size:0.95rem; line-height:1.6; white-space:pre-wrap;">
                    </div>
                    <div style="margin-top:20px; text-align:right;">
                        <button onclick="closeMsgModal()" class="btn btn-primary">Fermer</button>
                    </div>
                </div>
            </div>
`;

html = html.replace('<!-- PANEL HISTOIRE -->', msgPanel + '\n            <!-- PANEL HISTOIRE -->');
fs.writeFileSync(adminHtmlPath, html);


// Update JS
let js = fs.readFileSync(adminJsPath, 'utf8');

js = js.replace('loadHistoire();', 'loadHistoire();\n        loadMessages();');

const jsMessagesLogic = `
    // --- 6. MESSAGES (INBOX) ---
    async function loadMessages() {
        const tbody = document.getElementById('messages-tbody');
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Chargement...</td></tr>';
        
        const { data, error } = await window.supabase.from('messages').select('*').order('created_at', { ascending: false });
        if (error) return tbody.innerHTML = \`<tr><td colspan="5">Erreur: \${error.message}</td></tr>\`;
        if (data.length === 0) return tbody.innerHTML = '<tr><td colspan="5">Aucun message pour le moment.</td></tr>';
        
        tbody.innerHTML = '';
        data.forEach(m => {
            const dateStr = new Date(m.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' });
            const statusIcon = m.is_read ? '<i class="ph ph-envelope-open" style="color:#aaa;"></i>' : '<i class="ph ph-envelope" style="color:var(--color-accent); font-weight:bold;"></i>';
            const plStr = encodeURIComponent(JSON.stringify(m.payload));
            
            tbody.innerHTML += \`
                <tr style="\${!m.is_read ? 'background-color:rgba(226, 177, 60, 0.05); font-weight:bold;' : ''}">
                    <td style="text-align:center; font-size:1.2rem;">\${statusIcon}</td>
                    <td style="font-size:0.85rem;">\${dateStr}</td>
                    <td>\${m.type}</td>
                    <td>\${m.contact_email}</td>
                    <td>
                        <button class="action-btn view" style="background:#eef2fb; color:var(--color-primary);" onclick="viewMessage('\${m.id}', '\${m.type}', '\${m.contact_email}', '\${plStr}')"><i class="ph ph-eye"></i></button>
                        <button class="action-btn del" onclick="deleteRecord('messages', '\${m.id}', loadMessages)"><i class="ph ph-trash"></i></button>
                    </td>
                </tr>\`;
        });
    }

    window.viewMessage = async function(id, type, contact, payloadStr) {
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
            htmlStr += \`<strong>\${key}</strong> : \${value}\\n\\n\`;
        }
        document.getElementById('msg-modal-content').innerHTML = htmlStr;
        
        document.getElementById('msgModal').style.display = 'flex';
    };

    window.closeMsgModal = function() {
        document.getElementById('msgModal').style.display = 'none';
        loadMessages();
    };

    // --- GENERIC CRUD HELPERS ---
`;
js = js.replace('// --- GENERIC CRUD HELPERS ---', jsMessagesLogic);

fs.writeFileSync(adminJsPath, js);
console.log('Admin Messages Inbox Setup Done.');
