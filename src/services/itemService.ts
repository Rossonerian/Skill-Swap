const API_URL = "/api/items";

export async function getItems() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch items");
    return (await res.json()) as any[];
  } catch (err) {
    console.error("itemService.getItems:", err);
    return [];
  }
}

export async function getItem(id: string) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error("Failed to fetch item");
    return (await res.json()) as any;
  } catch (err) {
    console.error("itemService.getItem:", err);
    return null;
  }
}

export async function createItem(item: any) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error("Failed to create item");
    return (await res.json()) as any;
  } catch (err) {
    console.error("itemService.createItem:", err);
    return null;
  }
}

const itemService = { getItems, getItem, createItem };
export default itemService;
