// Vercel serverless funkcija. Naudoja SUPABASE_SERVICE_ROLE_KEY, gali skaityti visus įrašus, apeidama RLS.
// Prieiga apsaugota slaptažodžiu (ADMIN_PASSWORD aplinkos kintamasis).

const { createClient } = require("@supabase/supabase-js");

module.exports = async (req, res) => {
  const password = req.query.password || req.headers["x-admin-password"];

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Neteisingas slaptažodis." });
    return;
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from("responses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ results: data });
};
