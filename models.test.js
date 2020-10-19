const {Restaurant, Menu, Item, db} = require('./models')
const data = require('./restaurants.json')

// json_restaurant

beforeAll(async () => {
    await db.sync().then(async () => {
        const taskQueue = data.map(async (data) => {
                const restaurant = await Restaurant.create({name: data.name, image: data.image})
                const menus = await Promise.all(data.menus.map(async (_menu) => {
                    const items = await Promise.all(_menu.items.map(({name, price}) => Item.create({name, price})))
                    const menu = await Menu.create({title: _menu.title})
                    return menu.setItems(items)
                }))
                return await restaurant.setMenus(menus)
            })
        return Promise.all(taskQueue)
    })
})

describe('Restaurant', () => {
    test('can create restaurant', async() => {
        const restaurant = await Restaurant.create({name: 'Bravas', image: 'http://something.url'})
        expect(restaurant.id).toBe(9)
    })
})

describe('Menu', () => {
    test('can create menu', async() => {
        const menu = await Menu.create({title: 'Bocatas', restaurantId: 1})
        expect(menu.id).toBe(19)
    })
})

describe('Item', () => {
    test('can create item', async() => {
        const item = await Item.create({name: 'Tortilla con alioli', price: 6.50, menuId: 1})
        expect(item.id).toBe(85)
    })
})

describe('Relationships', () => {
    test('has many menus', async() => {
        const rest = await Restaurant.findOne({
            where: {name: "Bravas"}, include: "menus"
        })
        expect(rest.name).toBe("Bravas")
        expect(rest.menus).toBeTruthy()
    })
    test('can add a menu', async () => {
        const rest = await Restaurant.create({name: 'Bosco Pizzeria', image: 'some url'})
        const menu = await Menu.create({title: 'Pizzas'})
        await rest.addMenu(menu)
        const menus = await rest.getMenus()
        expect(menus[0].title).toBe('Pizzas')
    })
    test('has many items', async() => {
        const menu = await Menu.findOne({
            where: {title: "Bocatas"}, include: "items"
        })
        expect(menu.title).toBe("Bocatas")
        expect(menu.items).toBeTruthy()
    })
    test('can add an item', async () => {
        const menu = await Menu.findOne({
            where: {title: "Bocatas"}, include: "items"
        })
        const item = await Item.create({name: 'Jamon Iberico de Bellota con Manchego', price: 8.00})
        await menu.addItem(item)
        const items = await menu.getItems()
        expect(items[0].name).toBe('Jamon Iberico de Bellota con Manchego')
    })
    test('get an item from a menu from a restaurant', async () => {
        const rest = await Restaurant.findOne({
            where: {id: 1}, include: [{all:true, nested: true}]
        })

        expect(rest.menus[0].items[0].name).toBe('Houmous Shawarma Lamb')
    })
})