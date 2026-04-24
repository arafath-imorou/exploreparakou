const fs = require('fs');
const path = require('path');

const contactHtmlPath = path.join(__dirname, 'contact.html');
let html = fs.readFileSync(contactHtmlPath, 'utf8');

// 1. General Form
html = html.replace(/<form onsubmit="event\.preventDefault\(\); alert\('Message envoyé avec succès !'\);\">/, '<form id="form-general">');
html = html.replace('<input type="text" class="form-input" placeholder="Votre nom" required>', '<input type="text" class="form-input" id="gen-nom" placeholder="Votre nom" required>');
html = html.replace('<input type="email" class="form-input" placeholder="email@exemple.com" required>', '<input type="email" class="form-input" id="gen-email" placeholder="email@exemple.com" required>');
html = html.replace('<select class="form-input">', '<select class="form-input" id="gen-sujet">');
html = html.replace('<textarea class="form-textarea" placeholder="Votre message..." required></textarea>', '<textarea class="form-textarea" id="gen-msg" placeholder="Votre message..." required></textarea>');

// 2. Event Form
html = html.replace(/<form onsubmit="event\.preventDefault\(\); alert\('Événement soumis pour modération !'\);\">/, '<form id="form-event">');
html = html.replace('<input type="text" class="form-input" placeholder="Ex: Concert..." required>', '<input type="text" class="form-input" id="ev-nom" placeholder="Ex: Concert..." required>');
html = html.replace('<select class="form-input">', '<select class="form-input" id="ev-cat">'); // (Wait, first select in this block. To be safe, let's use a regex)

// We have multiple selects in the file. We need more precise replacements.
// Since contact.html has sections, let's inject JS that handles form submissions by selecting elements via their indices if we don't want to replace everything precisely...
// Actually, let's replace by context.
html = html.replace('<div class="form-group">\n                                <label>Catégorie</label>\n                                <select class="form-input">', '<div class="form-group">\n                                <label>Catégorie</label>\n                                <select class="form-input" id="ev-cat">');
html = html.replace('<input type="date" class="form-input" required>', '<input type="date" class="form-input" id="ev-date" required>');
html = html.replace('<input type="text" class="form-input" placeholder="Ex: Place Bio Guerra" required>', '<input type="text" class="form-input" id="ev-lieu" placeholder="Ex: Place Bio Guerra" required>');
html = html.replace('<textarea class="form-textarea" style="height:100px;" placeholder="De quoi s\'agit-il ?"', '<textarea class="form-textarea" id="ev-desc" style="height:100px;" placeholder="De quoi s\'agit-il ?"');
html = html.replace('<input type="text" class="form-input" placeholder="Pour validation" required>', '<input type="text" class="form-input" id="ev-contact" placeholder="Pour validation" required>');

// 3. Partner Form
html = html.replace(/<form onsubmit="event\.preventDefault\(\); alert\('Demande de partenariat envoyée !'\);\">/, '<form id="form-partner">');
html = html.replace('<input type="text" class="form-input"\n                                    style="background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.2); color:white;"\n                                    placeholder="Entreprise LTD" required>', '<input type="text" class="form-input" id="pt-org"\n                                    style="background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.2); color:white;"\n                                    placeholder="Entreprise LTD" required>');

html = html.replace('<input type="text" class="form-input"\n                                        style="background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.2); color:white;"\n                                        required>', '<input type="text" class="form-input" id="pt-contact"\n                                        style="background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.2); color:white;"\n                                        required>');
html = html.replace('<select class="form-input"\n                                        style="background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.2); color:white;">', '<select class="form-input" id="pt-type"\n                                        style="background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.2); color:white;">');
html = html.replace('<textarea class="form-textarea"\n                                    style="background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.2); color:white;"\n                                    placeholder="Décrivez votre proposition..." required></textarea>', '<textarea class="form-textarea" id="pt-desc"\n                                    style="background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.2); color:white;"\n                                    placeholder="Décrivez votre proposition..." required></textarea>');


// Inject logic at the end before </body>
const jsLogic = `
    <!-- Supabase Configuration -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="assets/js/supabaseClient.js"></script>
    <script>
        async function sendMessage(type, email, payload, formId, btn) {
            const originalText = btn.textContent;
            btn.textContent = "Envoi en cours...";
            btn.disabled = true;

            const { data, error } = await window.supabase.from('messages').insert([{
                type: type,
                contact_email: email,
                payload: payload
            }]);

            if (error) {
                alert("Erreur lors de l'envoi : " + error.message);
            } else {
                alert("Votre message a bien été envoyé ! Nous vous contacterons sous peu.");
                document.getElementById(formId).reset();
            }

            btn.textContent = originalText;
            btn.disabled = false;
        }

        document.addEventListener('DOMContentLoaded', () => {
             const formGen = document.getElementById('form-general');
             if(formGen) {
                 formGen.addEventListener('submit', (e) => {
                     e.preventDefault();
                     const email = document.getElementById('gen-email').value;
                     const payload = {
                         "Nom Complet": document.getElementById('gen-nom').value,
                         "Sujet": document.getElementById('gen-sujet').value,
                         "Message": document.getElementById('gen-msg').value
                     };
                     sendMessage("Contact", email, payload, 'form-general', e.target.querySelector('button[type="submit"]'));
                 });
             }

             const formEvt = document.getElementById('form-event');
             if(formEvt) {
                 formEvt.addEventListener('submit', (e) => {
                     e.preventDefault();
                     const contact = document.getElementById('ev-contact').value;
                     const payload = {
                         "Nom Evénement": document.getElementById('ev-nom').value,
                         "Catégorie": document.getElementById('ev-cat').value,
                         "Date": document.getElementById('ev-date').value,
                         "Lieu": document.getElementById('ev-lieu').value,
                         "Description": document.getElementById('ev-desc').value
                     };
                     sendMessage("Agenda", contact, payload, 'form-event', e.target.querySelector('button[type="submit"]'));
                 });
             }

             const formPt = document.getElementById('form-partner');
             if(formPt) {
                 formPt.addEventListener('submit', (e) => {
                     e.preventDefault();
                     const contact = document.getElementById('pt-contact').value;
                     const payload = {
                         "Organisation": document.getElementById('pt-org').value,
                         "Type Projet": document.getElementById('pt-type').value,
                         "Description": document.getElementById('pt-desc').value
                     };
                     sendMessage("Partenariat", contact, payload, 'form-partner', e.target.querySelector('button[type="submit"]'));
                 });
             }
        });
    </script>
</body>`;

// Avoid duplicating supabase tags if already present
if (html.includes('loadDynamicAgenda') || html.includes('supabaseClient.js')) {
    html = html.replace('<!-- Supabase Configuration -->', '');
    html = html.replace('<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>', '');
    html = html.replace('<script src="assets/js/supabaseClient.js"></script>', '');
}

html = html.replace('</body>', jsLogic);

fs.writeFileSync(contactHtmlPath, html);
console.log('Contact HTML forms connected to Supabase.');
