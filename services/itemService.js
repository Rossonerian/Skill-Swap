// Deprecated shim: use `src/services/itemService.ts` instead.
const API_URL = '/api/items';

export const getItems = async () => {
    console.warn('Deprecated services/itemService.js: use src/services/itemService.ts');
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch items');
        return await res.json();
    } catch (err) {
        console.error(err);
        return [];
    }
};

export const createItem = async (item) => {
    console.warn('Deprecated services/itemService.js: use src/services/itemService.ts');
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
        if (!res.ok) throw new Error('Failed to create item');
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
};

export const getItemById = async (id) => {
    console.warn('Deprecated services/itemService.js: use src/services/itemService.ts');
    try {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error('Failed to fetch item');
        return await res.json();
    } catch (err) {
        console.error(err);
        return null;
    }
};
