import axios from "axios";

export async function searchGoogleShopping(query) {
  try {
    const response = await axios.post(
      "https://google.serper.dev/shopping",
      { q: query, gl: "in", hl: "en" },
      {
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const items = response.data.shopping || [];
    return items.slice(0, 5).map((item) => ({
      title: item.title,
      price: item.price,
      source: item.source,
      link: item.link,
    }));
  } catch (err) {
    console.error("❌ Serper API error:", err.message);
    return [];
  }
}
