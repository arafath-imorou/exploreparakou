const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://aneucltybifkuitpjyqd.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Qsgkbx2vwAP3G7VPJoSA0Q_fxIl9ygl";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createAdmin() {
    console.log('Registering admin...');
    const { data, error } = await supabase.auth.signUp({
        email: 'groupita25@gmail.com',
        password: 'Admin123.',
    });

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Admin account created successfully!', data.user.email);
        console.log('NOTE: To allow them to log in without email verification (if enabled by default), you might need to turn off Email Confirmations in Supabase Auth Settings.');

        // Seed the database with the initial talent to keep the site looking identical!
        const initData = [{
            name: 'S.E.M. Djangoun',
            role: 'Président & Innovateur',
            description: "Président bien-aimé de la startup ITA INNOVATE et figure emblématique de l'écosystème innovant de Parakou. Inspirant les jeunes vers un tourisme durable et une technologie locale...",
            page_link: 'talent-djangoun.html',
            image_url: 'assets/images/President.jpeg'
        }];

        console.log('Seeding initial talent...');
        const res = await supabase.from('talents').insert(initData);
        if (res.error) console.error('Seed error:', res.error);
        else console.log('Seed success!');
    }
}

createAdmin();
