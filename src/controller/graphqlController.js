
import { buildSchema } from 'graphql'
import { productsRepo } from '../persistence/factory.js'
import { DAOusers } from '../persistence/factory.js'
import { DAOcarrito } from '../persistence/factory.js'

const schemas = buildSchema (`
    type Product {
        _id: ID,
        product: String,
        price: Float,
        stock: Float,
        description: String,
        code: String,
        thumbnail: String
    }

    type User {
        _id: ID,
        user: String,
        password: String,
        name: String,
        address: String,
        age: Float,
        phone: String,
        avatar: String,
        cartId: String,
        admin: String
    }

    type Cart {
        _id: ID,
        timestamp: String,
        productos: [Product]
    }

    input ProductInput {
        _id: ID,
        product: String,
        price: Float,
        stock: Float,
        description: String,
        code: String,
        thumbnail: String
    }

    input UserInput {
        user: String,
        password: String,
        name: String,
        address: String,
        age: Float,
        phone: String,
        avatar: String,
        cartId: String,
        admin: String
    }

    type Query {
        getProducts: [Product],
        getByUser(user: String!): User
        getCartById(id: ID!): Cart
    }

    type Mutation {
        addProduct(data: ProductInput): Product,
        deleteProduct(id: ID!): Product,
        updateProduct(id: ID!, data: ProductInput): Product,
        saveCart: Cart,
        deleteCart(id: ID!): Cart,
        removeProductFromCart(productId: ProductInput, cartId: ID!): Cart,
        addProductToCart(cartId: ID!, productId: ProductInput): Cart,
        updateUser(id: ID!, data: UserInput): User
    }
`)

const getProducts = async () => {
    return await productsRepo.getAll()
}

const addProduct = async ({ data }) => {
    return await productsRepo.save(data)
}

const deleteProduct = async ({ id }) => {
    const productToDelete = await productsRepo.getById(id)
    if (productToDelete !== null) {
        await productsRepo.deleteById(id)
        return productToDelete
    }
}

const updateProduct = async ({ id, data }) => {
    await productsRepo.updateById(id, data)
    return await productsRepo.getById(id)
}

const getByUser = async ({ user }) => {
    return await DAOusers.getByUser(user)
}

const saveCart = async () => {
    const newCart = {
        timestamp: Date.now().toLocaleString(),
        productos: []
    }
    return await DAOcarrito.save(newCart)
}

const updateUser = async ({ id, data }) => {
    return await DAOusers.updateById(id, data)
}

const addProductToCart = async ({ cartId, productId }) => {
    const product = await productsRepo.getById(productId)
    return await DAOcarrito.addProductById(cartId, product)
}

const getCartById = async ({ id }) => {
    return await DAOcarrito.getById(id)
}

const deleteCart = async ({ id }) => {
    return await DAOcarrito.deleteById(id)
}

const removeProductFromCart = async ({ productId, cartId }) => {
    const product = await productsRepo.getById(productId)
    return await DAOcarrito.deleteProductById(cartId, product)
}

const graphqlController = {
    schema: schemas,
    rootValue: {
        getProducts,
        addProduct,
        deleteProduct,
        updateProduct,
        getByUser,
        saveCart,
        updateUser,
        addProductToCart,
        getCartById,
        deleteCart,
        removeProductFromCart
    },
    graphiql: true
}

export default graphqlController