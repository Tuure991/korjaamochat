export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  var { action, businessId, data, userToken } = req.body;
  var ADMIN_EMAIL = "talkivo.ai@gmail.com";
  var SB_URL = "https://sihadebsdzdbhaesdwfb.supabase.co";
  var SB_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpaGFkZWJzZHpkYmhhZXNkd2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjczMjEsImV4cCI6MjA5MTk0MzMyMX0.8xxm2RgAxGecFtaURxTHAcMIeZ0NG9a_SIjU9PFqw68";

  try {
    var userRes = await fetch(SB_URL + "/auth/v1/user", {
      headers: { "apikey": SB_ANON, "Authorization": "Bearer " + userToken }
    });
    var user = await userRes.json();
    if (!user || user.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: "Not admin" });
    }

    var serviceKey = process.env.SUPABASE_SERVICE_KEY;
    if (!serviceKey) return res.status(500).json({ error: "Service key missing" });

    var headers = {
      "Content-Type": "application/json",
      "apikey": serviceKey,
      "Authorization": "Bearer " + serviceKey,
      "Prefer": "return=representation"
    };

    if (action === "update_business") {
      var r = await fetch(SB_URL + "/rest/v1/businesses?id=eq." + businessId, {
        method: "PATCH", headers: headers, body: JSON.stringify(data)
      });
      var d = await r.json();
      return res.status(200).json({ ok: true, data: d });
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch(e) {
    return res.status(500).json({ error: "Server error", detail: e.message });
  }
}
