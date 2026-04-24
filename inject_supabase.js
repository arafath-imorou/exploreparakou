const fs = require('fs');
const path = require('path');
const dir = 'c:\\Users\\HP\\Desktop\\ITA\\EXPLORE PARAKOU\\ExploreParakou';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const injection = `
    <!-- Supabase Configuration -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="assets/js/supabaseClient.js"></script>
`;

files.forEach(file => {
    const p = path.join(dir, file);
    let html = fs.readFileSync(p, 'utf8');
    if (!html.includes('supabaseClient.js')) {
        html = html.replace('</body>', injection + '</body>');
        fs.writeFileSync(p, html);
        console.log('Injected in ' + file);
    } else {
        console.log('Already in ' + file);
    }
});
