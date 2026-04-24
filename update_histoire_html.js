const fs = require('fs');
const path = require('path');

const histoireHtmlPath = path.join(__dirname, 'histoire.html');
let html = fs.readFileSync(histoireHtmlPath, 'utf8');

// The CSS for the vertical timeline
const timelineCss = `
    /* Timeline CSS */
    .timeline {
        position: relative;
        max-width: 800px;
        margin: 0 auto;
        padding: 40px 0;
    }
    .timeline::after {
        content: '';
        position: absolute;
        width: 4px;
        background-color: var(--color-accent);
        top: 0;
        bottom: 0;
        left: 50%;
        margin-left: -2px;
        border-radius: 2px;
    }
    .timeline-item {
        padding: 10px 40px;
        position: relative;
        background-color: inherit;
        width: 50%;
    }
    .timeline-item.left {
        left: 0;
    }
    .timeline-item.right {
        left: 50%;
    }
    .timeline-item::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        right: -10px;
        background-color: white;
        border: 4px solid var(--color-primary);
        top: 25px;
        border-radius: 50%;
        z-index: 1;
    }
    .timeline-item.right::after {
        left: -10px;
    }
    .timeline-content {
        padding: 20px 30px;
        background-color: white;
        position: relative;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        border-top: 4px solid var(--color-primary);
    }
    .timeline-period {
        color: var(--color-accent);
        font-weight: 700;
        margin-bottom: 5px;
        display: block;
        font-size: 1.1rem;
    }
    .timeline-title {
        color: var(--color-primary);
        font-size: 1.4rem;
        margin-bottom: 15px;
    }
    .timeline-desc {
        color: #555;
        line-height: 1.6;
    }

    @media screen and (max-width: 768px) {
        .timeline::after {
            left: 31px;
        }
        .timeline-item {
            width: 100%;
            padding-left: 70px;
            padding-right: 25px;
        }
        .timeline-item.left::after, .timeline-item.right::after {
            left: 21px;
        }
        .timeline-item.right {
            left: 0%;
        }
    }
`;

// Insert CSS if not there
if (!html.includes('.timeline::after')) {
    html = html.replace('</style>', timelineCss + '\n    </style>');
}

// Insert the Section Timeline before <section class="monuments">
const timelineSection = `
        <!-- Timeline Section -->
        <section class="timeline-section" style="padding: 100px 0; background-color: #f4f6f8;">
            <div class="container">
                <div class="section-header" style="text-align:center; margin-bottom:3rem;">
                    <span style="color:var(--color-accent); font-weight:600; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:10px;">Chronologie</span>
                    <h2 style="font-size: 2.5rem; color: var(--color-primary);">Les dates clés de la Cité</h2>
                    <p style="color:#666;">Revivez les moments forts qui ont façonné Parakou.</p>
                </div>
                <div class="timeline" id="dynamic-timeline">
                    <!-- Loaded dynamically -->
                    <p style="text-align:center;">Chargement de la chronologie...</p>
                </div>
            </div>
        </section>

`;

if (!html.includes('id="dynamic-timeline"')) {
    html = html.replace('<!-- Monuments -->', timelineSection + '        <!-- Monuments -->');
}

// JS to fetch from Supabase
const scriptLoad = `
    <script>
    document.addEventListener('DOMContentLoaded', async () => {
        const timelineContainer = document.getElementById('dynamic-timeline');
        if(!timelineContainer) return;

        const { data, error } = await window.supabase.from('histoire_timeline').select('*').order('created_at', { ascending: true });
        if(error || !data || data.length === 0) {
            timelineContainer.innerHTML = '<p style="text-align:center;">Aucune date disponible pour le moment.</p>';
            return;
        }

        timelineContainer.innerHTML = '';
        data.forEach((item, index) => {
            const sideClass = (index % 2 === 0) ? 'left' : 'right';
            timelineContainer.innerHTML += \`
                <div class="timeline-item \${sideClass}">
                    <div class="timeline-content">
                        <span class="timeline-period">\${item.period}</span>
                        <h3 class="timeline-title">\${item.title}</h3>
                        <p class="timeline-desc">\${item.description}</p>
                    </div>
                </div>
            \`;
        });
    });
    </script>
</body>`;

if (!html.includes('dynamic-timeline-script')) {
    // replace closing body tag
    html = html.replace('</body>', scriptLoad);
}

fs.writeFileSync(histoireHtmlPath, html);
console.log('Histoire Timeline Section injected.');
