import https from "https";

const pages = ["", "home", "blank", "team-members-1", "home-1", "team-members", "inquiry-services-page"];

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(data));
      res.on("error", () => resolve(""));
    });
  });
}

async function run() {
  for (const p of pages) {
    const url = `https://albina200707.wixsite.com/my-site-3/${p}`;
    const data = await fetchUrl(url);
    const titleMatch = data.match(/<title>([^<]*)<\/title>/i);
    const text = data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    
    // Wix documents, buttons, links
    const docLinks = [...data.matchAll(/href="([^"]+)"/g)]
      .map((m) => m[1])
      .filter((h) => !h.startsWith("https://static.parastorage") && !h.startsWith("#"));

    const wixImgs = [...data.matchAll(/static\.wixstatic\.com\/media\/([a-zA-Z0-9_~-]+)/g)]
      .map((m) => m[1]);

    console.log(`\n========================================`);
    console.log(`PAGE: ${p || "ROOT"} (Title: ${titleMatch ? titleMatch[1] : "N/A"})`);
    console.log(`TEXT: ${text.slice(0, 1500)}`);
    console.log(`DOC/LINKS:`, [...new Set(docLinks)].slice(0, 10));
    console.log(`MEDIA:`, [...new Set(wixImgs)].slice(0, 5));
  }
}

run();
