const SUPABASE_URL = "https://ampktfwcpopkomrsckjm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_FMDalRvzL6h5zW_4fTXt5g_I4dvctkD";

// Initialisation globale du client avec le schéma explore_parakou
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    db: {
        schema: 'explore_parakou'
    }
});
console.log("Supabase Client Initialized - ITACORE2 / explore_parakou");
