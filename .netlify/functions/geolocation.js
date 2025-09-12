exports.handler = async (event) => {
  try {
    // Netlify provides geo data in a base64 encoded header
    const geoData = JSON.parse(
      Buffer.from(event.headers["x-nf-geo"], "base64").toString("utf-8")
    );
    const countryCode = geoData.country?.code || null;

    return {
      statusCode: 200,
      body: JSON.stringify({ country: countryCode }),
    };
  } catch (error) {
    console.error("Error parsing geolocation data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to determine location" }),
    };
  }
};
