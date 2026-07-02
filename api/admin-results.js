const { createClient } = require("@supabase/supabase-js");

module.exports = async (req, res) => {
  // Slaptažodis priimamas TIK per header — niekada per URL query, kad
  // neatsidurtų serverio žurnaluose ar naršyklės istorijoje.
  const password = req.headers["x-admin-password"];

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Neteisingas slaptažodis." });
    return;
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  if (req.method === "DELETE") {
    const id = req.query.id;
    if (!id) {
      res.status(400).json({ error: "Trūksta įrašo id." });
      return;
    }

    const { error } = await supabase
      .from("responses")
      .delete()
      .eq("id", id);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ success: true });
    return;
  }

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
