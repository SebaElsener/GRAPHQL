
import { buildSchema } from 'graphql'

export const schemas = buildSchema (`
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

    type Admin {
        user: String,
        admin: String
    }

    input AdminInput {
        user: String,
        admin: String
    }

    type DeleteUsers {
        user: String
    }

    input DeleteUsersInput {
        user: String
    }

    type Query {
        getProducts: [Product],
        getUsers: [User],
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
        updateUser(id: ID!, data: UserInput): User,
        updateUsersAdmin(data: [AdminInput]): Admin,
        deleteUsers(data: [DeleteUsersInput]): DeleteUsers
        purchaseOrder(user: String!): User
    }
`)