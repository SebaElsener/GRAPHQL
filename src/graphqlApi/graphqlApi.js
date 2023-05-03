
import { productsRepo } from '../persistence/factory.js'
import { DAOusers } from '../persistence/factory.js'
import { DAOcarrito } from '../persistence/factory.js'
import purchase from '../business/graphqlPurchaseBusiness.js'

export default class GraphqlApi {

    getProducts = async () => {
        return await productsRepo.getAll()
    }

    getUsers = async () => {
        return await DAOusers.getAll()
    }
    
    addProduct = async ({ data }) => {
        return await productsRepo.save(data)
    }
    
    deleteProduct = async ({ id }) => {
        const productToDelete = await productsRepo.getById(id)
        if (productToDelete !== null) {
            await productsRepo.deleteById(id)
            return productToDelete
        }
    }
    
    updateProduct = async ({ id, data }) => {
        await productsRepo.updateById(id, data)
        return await productsRepo.getById(id)
    }
    
    getByUser = async ({ user }) => {
        return await DAOusers.getByUser(user)
    }
    
    saveCart = async () => {
        const newCart = {
            timestamp: Date.now().toLocaleString(),
            productos: []
        }
        return await DAOcarrito.save(newCart)
    }
    
    updateUser = async ({ id, data }) => {
        return await DAOusers.updateById(id, data)
    }
    
    addProductToCart = async ({ cartId, productId }) => {
        const product = await productsRepo.getById(productId)
        return await DAOcarrito.addProductById(cartId, product)
    }
    
    getCartById = async ({ id }) => {
        return await DAOcarrito.getById(id)
    }
    
    deleteCart = async ({ id }) => {
        return await DAOcarrito.deleteById(id)
    }
    
    removeProductFromCart = async ({ productId, cartId }) => {
        const product = await productsRepo.getById(productId)
        return await DAOcarrito.deleteProductById(cartId, product)
    }
    
    updateUsersAdmin = async ({ data }) => {
        return await DAOusers.updateUsersAdmin(data)
    }
    
    deleteUsers = async ({ data }) => {
        const users = data.map(user => {
            return user.user
        })
        return await DAOusers.deleteUsers(users)
    }
    
    purchaseOrder = async ({ user }) => {
        return await purchase(user)
    }

}