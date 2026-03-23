const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Serve frontend
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ API
app.post("/check", async (req, res) => {
    const urls = req.body.urls;
    let results = [];

    for (let url of urls) {
        try {
            const response = await axios.get(url, {
                headers: { "User-Agent": "Mozilla/5.0" },
                timeout: 10000
            });

            const $ = cheerio.load(response.data);
            $("script, style, noscript").remove();

            let text = $("body").text().replace(/\s+/g, " ").trim();

            let codeSize = response.data.length;
            let textSize = text.length;
            let ratio = textSize === 0 ? 0 : ((textSize / codeSize) * 100).toFixed(2);

            results.push({
                url,
                code: (codeSize / 1024).toFixed(2) + " KB",
                text: (textSize / 1024).toFixed(2) + " KB",
                ratio: ratio + "%"
            });

        } catch (err) {
            results.push({
                url,
                code: "Error",
                text: "Error",
                ratio: "Failed"
            });
        }
    }

    res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
