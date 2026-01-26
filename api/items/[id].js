    let items = [
    { id: 1, name: 'Item 1', description: 'Description for Item 1' },
    { id: 2, name: 'Item 2', description: 'Description for Item 2' },
    { id: 3, name: 'Item 3', description: 'Description for Item 3' }
    ];

    export default function handler(req, res) {
    const { id } = req.query;
    const item = items.find(item => item.id === parseInt(id));

    if (req.method === 'GET') {
        if (item) {
        res.status(200).json(item);
        } else {
        res.status(404).json({ message: 'Item not found' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    }