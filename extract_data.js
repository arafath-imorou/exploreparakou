// Script d'extraction des données depuis l'ancienne base Supabase
// et génération d'un fichier SQL pour restauration sur ITACORE2

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const OLD_URL = "https://aneucltybifkuitpjyqd.supabase.co";
const OLD_KEY = "sb_publishable_Qsgkbx2vwAP3G7VPJoSA0Q_fxIl9ygl";

const supabase = createClient(OLD_URL, OLD_KEY);

const TABLES = ['talents', 'agenda', 'culture', 'tourisme', 'histoire_timeline', 'messages'];

function escapeStr(val) {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
    return `'${String(val).replace(/'/g, "''")}'`;
}

async function extractAll() {
    let sql = `-- Script de restauration Explore Parakou -> ITACORE2 / explore_parakou\n`;
    sql += `-- Généré le ${new Date().toLocaleString('fr-FR')}\n\n`;
    let totalRows = 0;

    for (const table of TABLES) {
        console.log(`📦 Extraction de la table: ${table}...`);
        const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: true });

        if (error) {
            console.warn(`  ⚠️  Erreur sur ${table}: ${error.message}`);
            sql += `-- ERREUR sur ${table}: ${error.message}\n\n`;
            continue;
        }

        if (!data || data.length === 0) {
            console.log(`  ℹ️  Aucune donnée dans ${table}.`);
            sql += `-- Pas de données dans explore_parakou.${table}\n\n`;
            continue;
        }

        console.log(`  ✅ ${data.length} lignes trouvées.`);
        totalRows += data.length;

        const cols = Object.keys(data[0]).join(', ');
        sql += `-- Table: ${table} (${data.length} lignes)\n`;
        sql += `INSERT INTO explore_parakou.${table} (${cols}) VALUES\n`;

        const rows = data.map(row => {
            const vals = Object.values(row).map(escapeStr).join(', ');
            return `(${vals})`;
        });

        sql += rows.join(',\n') + '\nON CONFLICT (id) DO NOTHING;\n\n';
    }

    fs.writeFileSync('restore_data.sql', sql, 'utf8');
    console.log(`\n🎉 Extraction terminée ! ${totalRows} lignes au total.`);
    console.log(`📄 Fichier généré : restore_data.sql`);
    console.log(`\n👉 Exécutez-le dans le SQL Editor de ITACORE2.`);
}

extractAll().catch(console.error);
