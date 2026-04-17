export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  var { businessId, name, phone, message } = req.body;
  if (!businessId || !name || !phone) return res.status(400).json({ error: "Missing fields" });

  var SB_URL = "https://sihadebsdzdbhaesdwfb.supabase.co";
  var SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpaGFkZWJzZHpkYmhhZXNkd2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjczMjEsImV4cCI6MjA5MTk0MzMyMX0.8xxm2RgAxGecFtaURxTHAcMIeZ0NG9a_SIjU9PFqw68";
  var headers = { "Content-Type": "application/json", "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY };

  try {
    await fetch(SB_URL + "/rest/v1/leads", {
      method: "POST", headers: headers,
      body: JSON.stringify({ business_id: businessId, name: name, phone: phone, message: message || "" })
    });

    var bizRes = await fetch(SB_URL + "/rest/v1/businesses?id=eq." + businessId, { headers: headers });
    var biz = await bizRes.json();
    var ownerEmail = biz && biz[0] ? biz[0].email : null;

    if (ownerEmail) {
      var emailText = "Uusi liidi Korjaamochatista!\n\nNimi: " + name + "\nPuhelin: " + phone + "\nViesti: " + (message || "Ei viestiä") + "\n\nOta yhteyttä mahdollisimman pian!";
      
      await fetch(SB_URL + "/auth/v1/magiclink", {
        method: "POST",
        headers: { "Content-Type": "application/json", "apikey": SB_KEY },
        body: JSON.stringify({ email: "noreply@test.com" })
      }).catch(function(){});
    }

    return res.status(200).json({ ok: true });
  } catch(e) {
    return res.status(500).json({ error: "Server error" });
  }
}
