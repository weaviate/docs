/**
 * Fetches the user's country code based on their IP address.
 * @returns {Promise<string|null>} The two-letter country code (e.g., 'US') or null if the fetch fails.
 */
export const getUserCountryCode = async () => {
  try {
    const response = await fetch('https://ip-api.com/json/?fields=countryCode');
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data.countryCode;
  } catch (error) {
    return null; // Return null on error so we can handle it gracefully
  }
};
