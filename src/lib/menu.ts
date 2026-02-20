export const MENU_ITEMS = [
    { id: '1', name: 'Burger', price: 150 },
    { id: '2', name: 'Maggi', price: 100 },
    { id: '3', name: 'Pasta', price: 250 },
    { id: '4', name: 'Coke', price: 50 },
    { id: '5', name: 'Water Bottle', price: 20 },
    { id: '6', name: 'Tea', price: 20 },
    { id: '7', name: 'Coffee', price: 50 },
    { id: '8', name: 'Sandwich', price: 120 },
]

export function calculateOrderTotal(items: any[]): number {
    if (!Array.isArray(items)) return 0

    return items.reduce((total, item) => {
        if (typeof item === 'string') {
            const menuItem = MENU_ITEMS.find(i => i.name === item)
            return total + (menuItem?.price || 0)
        } else if (typeof item === 'object' && item.price && item.qty) {
            return total + (item.price * item.qty)
        }
        return total
    }, 0)
}
