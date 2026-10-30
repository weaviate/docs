// src/scripts/scarf.js
const scarfScript = {
  tagName: "img",
  attributes: {
    src: "https://pixel.weaviate.cloud/a.png?x-pxid=a41b0758-a3a9-4874-a880-8b5d5a363d40",
    referrerPolicy: "no-referrer-when-downgrade",
    style: "display: none;",
    // Decorative, hidden analytics beacon: aria-hidden is what keeps it out of
    // the accessibility tree, so assistive technology never reaches it and never
    // has to announce it.
    "aria-hidden": "true",
  },
};

module.exports = scarfScript;