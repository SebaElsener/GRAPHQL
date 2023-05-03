
import { graphqlHTTP } from 'express-graphql'
import { schemas } from '../models/graphqlModels.js'
import GraphqlApi from '../graphqlApi/graphqlApi.js'

export default class graphqlController {
    constructor() {
        const resolvers = new GraphqlApi()
        return graphqlHTTP({
            schema: schemas,
            rootValue: {
                getProducts: resolvers.getProducts,
                getUsers: resolvers.getUsers,
                addProduct: resolvers.addProduct,
                deleteProduct: resolvers.deleteProduct,
                updateProduct: resolvers.updateProduct,
                getByUser: resolvers.getByUser,
                saveCart: resolvers.saveCart,
                updateUser: resolvers.updateUser,
                addProductToCart: resolvers.addProductToCart,
                getCartById: resolvers.getCartById,
                deleteCart: resolvers.deleteCart,
                removeProductFromCart: resolvers.removeProductFromCart,
                updateUsersAdmin: resolvers.updateUsersAdmin,
                deleteUsers: resolvers.deleteUsers,
                purchaseOrder: resolvers.purchaseOrder
            },
            graphiql: true
        })
    }
}