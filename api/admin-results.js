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

  if (req.method === "PATCH") {
    // Naudojama, kai adminas rankiniu būdu pažymi, ar 5-as (laisvo teksto)
    // supratimo klausimas buvo atsakytas teisingai.
    const { id, c5_correct } = req.body || {};
    if (!id || typeof c5_correct !== "boolean") {
      res.status(400).json({ error: "Trūksta id arba c5_correct (turi būti true/false)." });
      return;
    }

    const { data, error } = await supabase
      .from("responses")
      .update({ c5_correct })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ result: data });
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
