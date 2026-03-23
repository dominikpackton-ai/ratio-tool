const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

function calculateRatio(html) {
    const $ = cheerio.load(html);

    $("script, style, noscript").remove();

    let text = $("body").text().replace(/\s+/g, " ").trim();

    let codeSize = html.length;
    let textSize = text.length;

    let ratio = textSize === 0 ? 0 : ((textSize / codeSize) * 100).toFixed(2);

    return { codeSize, textSize, ratio };
}

app.post("/check", async (req, res) => {
    const urls = req.body.urls;

    let results = [];

    for (let url of urls) {
        try {
            const response = await axios.get(url, {
                headers: { "User-Agent": "Mozilla/5.0" }
            });

            let result = calculateRatio(response.data);

            results.push({
                url,
                code: (result.codeSize / 1024).toFixed(2) + " KB",
                text: (result.textSize / 1024).toFixed(2) + " KB",
                ratio: result.ratio + "%"
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

app.listen(3000, () => {
    console.log("http://localhost:3000/check");
});
