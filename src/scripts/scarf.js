// src/scripts/scarf.js
const scarfScript = {
  tagName: "img",
  attributes: {
    src: "https://pixel.weaviate.cloud/a.png?x-pxid=a41b0758-a3a9-4874-a880-8b5d5a363d40",
    referrerPolicy: "no-referrer-when-downgrade",
    style: "display: none;",
    // Decorative, hidden analytics beacon: empty alt plus aria-hidden keeps it
    // out of the accessibility tree instead of leaving assistive technology to
    // announce an image with no alt attribute.
    alt: "",
    "aria-hidden": "true",
  },
};

module.exports = scarfScript;