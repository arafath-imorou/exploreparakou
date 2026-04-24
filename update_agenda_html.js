const fs = require('fs');
const path = require('path');

const agendaHtmlPath = path.join(__dirname, 'agenda.html');
let html = fs.readFileSync(agendaHtmlPath, 'utf8');

// The section `À ne pas manquer` has a wrapper:
// <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:30px; margin-bottom:60px;" class="featured-grid">
//   <div class="event-card-premium featured-card" style="height:auto;"> ... </div>
//   <div style="display:flex; flex-direction:column; gap:30px;">
//      <div class="event-card-premium"> ... </div>
//      <div class="event-card-premium"> ... </div>
//   </div>
// </div>

// The section `Ce Week-end` has:
// <div class="grid-3"> ... </div>

// Let's replace the content of #today
html = html.replace(/<div style="display:grid; grid-template-columns: 1\.5fr 1fr; gap:30px; margin-bottom:60px;"\s+class="featured-grid">[\s\S]*?<\/div>\s*<\/div>\s*<!-- Section: Weekend -->/,
    `<div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:30px; margin-bottom:60px;" class="featured-grid dynamic-featured">
    <p>Chargement des événements à la une...</p>
</div>
<!-- Section: Weekend -->`);

html = html.replace(/<div class="grid-3">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/,
    `<div class="grid-3 dynamic-weekend"><p>Chargement des autres événements...</p></div></div></section>`);

if (!html.includes('loadDynamicAgenda')) {
    html = html.replace('</body>', `
    <script>
    document.addEventListener('DOMContentLoaded', async () => {
        const featGrid = document.querySelector('.dynamic-featured');
        const weekendGrid = document.querySelector('.dynamic-weekend');

        let { data: events, error } = await window.supabase.from('agenda').select('*').order('created_at', { ascending: false });
        if(error || !events || events.length === 0) {
            if(featGrid) featGrid.innerHTML = '<p>Aucun événement programmé pour le moment.</p>';
            if(weekendGrid) weekendGrid.innerHTML = '';
            return;
        }

        // Split events
        const firstEvent = events[0] || null;
        const featuredRightEvents = events.slice(1, 3);
        const remainingEvents = events.slice(3);

        if(featGrid) {
            featGrid.innerHTML = '';
            if(firstEvent) {
                featGrid.innerHTML += \`
                    <div class="event-card-premium featured-card" style="height:auto;">
                        <div class="card-image-container" style="height:400px;">
                            <img src="\${firstEvent.image_url}" alt="\${firstEvent.title}">
                            <div class="date-badge-floating">
                                <span class="date-number">\${firstEvent.date_number}</span>
                                <span class="date-month">\${firstEvent.date_month}</span>
                            </div>
                            <span style="position:absolute; bottom:20px; left:20px; background:#E2B13C; color:#0A192F; padding:5px 15px; font-weight:700; border-radius:4px; text-transform:uppercase; font-size:0.8rem;">À la une</span>
                        </div>
                        <div class="card-content">
                            <span class="event-category-sm">\${firstEvent.category}</span>
                            <h3 class="event-title" style="font-size:2rem;">\${firstEvent.title}</h3>
                            <p style="margin-bottom:20px; font-size:1.1rem; color:#555;">\${firstEvent.description}</p>
                            <div class="event-meta" style="flex-direction:row; flex-wrap:wrap; gap:20px;">
                                <span><i class="ph ph-map-pin"></i> \${firstEvent.location}</span>
                                <span><i class="ph ph-clock"></i> \${firstEvent.time}</span>
                            </div>
                            <div class="card-actions-row">
                                <button class="btn-card-primary" style="padding:15px;">Réserver</button>
                                <button class="btn-card-icon"><i class="ph ph-share-network"></i></button>
                            </div>
                        </div>
                    </div>
                \`;
            }

            if(featuredRightEvents.length > 0) {
                let rightHtml = '<div style="display:flex; flex-direction:column; gap:30px;">';
                featuredRightEvents.forEach(ev => {
                    rightHtml += \`
                        <div class="event-card-premium">
                            <div class="card-image-container" style="height:180px;">
                                <img src="\${ev.image_url}" alt="\${ev.title}">
                                <div class="date-badge-floating">
                                    <span class="date-number">\${ev.date_number}</span>
                                    <span class="date-month">\${ev.date_month}</span>
                                </div>
                            </div>
                            <div class="card-content">
                                <span class="event-category-sm">\${ev.category}</span>
                                <h3 class="event-title">\${ev.title}</h3>
                                <div class="event-meta">
                                    <span><i class="ph ph-map-pin"></i> \${ev.location}</span>
                                    <span><i class="ph ph-clock"></i> \${ev.time}</span>
                                </div>
                                <div class="card-actions-row">
                                    <button class="btn-card-primary">Détails</button>
                                </div>
                            </div>
                        </div>
                    \`;
                });
                rightHtml += '</div>';
                featGrid.innerHTML += rightHtml;
            }
        }

        if(weekendGrid) {
            weekendGrid.innerHTML = '';
            if(remainingEvents.length > 0) {
                remainingEvents.forEach(ev => {
                    weekendGrid.innerHTML += \`
                        <div class="event-card-premium">
                            <div class="card-image-container">
                                <img src="\${ev.image_url}" alt="\${ev.title}">
                                <div class="date-badge-floating">
                                    <span class="date-number">\${ev.date_number}</span>
                                    <span class="date-month">\${ev.date_month}</span>
                                </div>
                            </div>
                            <div class="card-content">
                                <span class="event-category-sm">\${ev.category}</span>
                                <h3 class="event-title">\${ev.title}</h3>
                                <div class="event-meta">
                                    <span><i class="ph ph-map-pin"></i> \${ev.location}</span>
                                    <span><i class="ph ph-clock"></i> \${ev.time}</span>
                                </div>
                                <div class="card-actions-row">
                                    <button class="btn-card-primary">Détails</button>
                                </div>
                            </div>
                        </div>
                    \`;
                });
            } else {
                weekendGrid.innerHTML = '<p>Revenez bientôt pour plus d\'événements.</p>';
            }
        }
    });
    </script>
</body>`);
}

fs.writeFileSync(agendaHtmlPath, html);
console.log('Agenda Public Page Updated');
