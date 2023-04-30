
import { Router as router} from 'express'
import {
    mainPageRender,
    productsForm,
    getProductById,
    postProduct,
    updateProductById,
    deleteProductById
} from '../controller/productsController.js'
import adminUser from '../middleware/adminUser.js'

const routeProducts = new router()

// Renderiza página pincipal
routeProducts.get('/', mainPageRender)

// Renderiza furmulario ingreso nuevos productos
routeProducts.get('/form', productsForm)

// devuelve un producto según su id
routeProducts.get('/:id', getProductById)

// recibe y agrega un producto, y lo devuelve con su id asignado
routeProducts.post('/', adminUser, postProduct)

// recibe y actualiza un producto según su id
routeProducts.put('/:id', adminUser, updateProductById)

// elimina un producto según su id
routeProducts.delete('/:id', adminUser, deleteProductById)

export default routeProducts