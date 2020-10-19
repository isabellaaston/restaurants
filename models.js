const {Sequelize, DataTypes, Model} = require('sequelize')
const db = new Sequelize('sqlite::memory:', null, null, {dialect: 'sqlite', logging: false})

class Restaurant extends Model{}
class Menu extends Model{}
class Item extends Model{}

Restaurant.init({
    name: DataTypes.STRING,
    image: DataTypes.STRING
}, {sequelize:db})

Menu.init({
    title: DataTypes.STRING,
}, {sequelize:db})

Item.init({
    name: DataTypes.STRING,
    price: DataTypes.FLOAT,
}, {sequelize:db})

Restaurant.hasMany(Menu, {as: 'menus'})
Menu.belongsTo(Restaurant)
Menu.hasMany(Item, {as: 'items'})
Item.belongsTo(Menu)

module.exports = {Restaurant, Menu, Item, db}