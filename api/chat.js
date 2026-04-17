export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { message, businessId, history } = req.body;
  if (!message || !businessId) return res.status(400).json({ error: "Missing fields" });

  const SB_URL = "https://sihadebsdzdbhaesdwfb.supabase.co";
  const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpaGFkZWJzZHpkYmhhZXNkd2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjczMjEsImV4cCI6MjA5MTk0MzMyMX0.8xxm2RgAxGecFtaURxTHAcMIeZ0NG9a_SIjU9PFqw68";
  const headers = { "Content-Type": "application/json", "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY };

  try {
    const [bizRes, svcRes, faqRes] = await Promise.all([
      fetch(SB_URL + "/rest/v1/businesses?id=eq." + businessId, { headers }),
      fetch(SB_URL + "/rest/v1/services?business_id=eq." + businessId, { headers }),
      fetch(SB_URL + "/rest/v1/faqs?business_id=eq." + businessId, { headers })
    ]);
    const [biz, svcs, faqs] = await Promise.all([bizRes.json(), svcRes.json(), faqRes.json()]);

   if (!biz || biz.length === 0) return res.status(404).json({ error: "Business not found" });
    const b = biz[0];

    var monthAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString();
    var countRes = await fetch(SB_URL + "/rest/v1/chat_logs?business_id=eq." + businessId + "&created_at=gte." + monthAgo + "&select=id", { headers: {...headers, "Prefer": "count=exact"} });
    var usedCount = parseInt(countRes.headers.get("content-range")?.split("/")[1] || "0");
    var limit = b.message_limit || 500;
    if (usedCount >= limit) {
      return res.status(200).json({ reply: "Palvelun kuukausiraja on täyttynyt. Ota yhteyttä korjaamoon suoraan: " + (b.phone || b.email || "") });
    }

    let info = "KORJAAMON TIEDOT:\nNimi: " + b.name + "\n";
    if (b.address) info += "Osoite: " + b.address + "\n";
    if (b.phone) info += "Puhelin: " + b.phone + "\n";
    if (b.email) info += "Sahkoposti: " + b.email + "\n";
    if (b.opening_hours) info += "Aukioloajat: " + b.opening_hours + "\n";
    if (b.extra_info) info += "Lisatiedot: " + b.extra_info + "\n";

    if (svcs.length > 0) {
      info += "\nPALVELUT JA HINNAT:\n";
      svcs.forEach(function(s) {
        var price = s.price_from && s.price_to ? s.price_from + "-" + s.price_to + " EUR" : s.price_from ? "alk. " + s.price_from + " EUR" : "Hinta sopimuksen mukaan";
        info += "- " + s.name + ": " + price + (s.description ? " (" + s.description + ")" : "") + "\n";
      });
    }

    if (faqs.length > 0) {
      info += "\nUSEIN KYSYTYT:\n";
      faqs.forEach(function(f) { info += "K: " + f.question + "\nV: " + f.answer + "\n"; });
    }

    var systemPrompt = "Olet " + b.name + " -korjaamon asiakaspalveluchatbot. Vastaa ystavallisesti ja lyhyesti (1-3 lausetta). Kayta VAIN alla olevia tietoja. Ala keksi mitaan. Jos et tieda, ohjaa soittamaan " + (b.phone || "korjaamolle") + ". Kun asiakas haluaa varata ajan, huollon tai minka tahansa palvelun, kerro etta han voi jattaa soittopyynnon painamalla alla olevaa 'Jata soittopyynto' -nappia niin korjaamo ottaa yhteytta mahdollisimman pian. Ala koskaan yrita varata aikaa itse.\n\n" + info;

    var aiMessages = [];
    if (history && Array.isArray(history)) {
      history.forEach(function(h) { aiMessages.push({ role: h.role, content: h.content }); });
    }
    aiMessages.push({ role: "user", content: message });
var apiKey = (process.env.ANTHROPIC_API_KEY || "").trim();
    if (!apiKey) return res.status(200).json({ reply: "DEBUG: API key missing" });
    if (!apiKey.startsWith("sk-ant-")) return res.status(200).json({ reply: "DEBUG: Key starts with: " + apiKey.substring(0, 10) });
    var aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 500, system: systemPrompt, messages: aiMessages })
    });
    var aiData = await aiRes.json();

    if (aiData.error) {
      return res.status(200).json({ reply: "DEBUG: " + JSON.stringify(aiData.error) });
    }

    var reply = aiData.content && aiData.content[0] && aiData.content[0].text ? aiData.content[0].text : "Ei vastausta";

    fetch(SB_URL + "/rest/v1/chat_logs", {
      method: "POST", headers: headers,
      body: JSON.stringify({ business_id: businessId, visitor_message: message, bot_response: reply })
    }).catch(function() {});

    return res.status(200).json({ reply: reply });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: e.message });
  }
}
