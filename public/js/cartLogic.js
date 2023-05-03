
const usuario = document.getElementById('usuario')
const bodyContainer = document.getElementById('bodyContainer')
const user = usuario.value
let cart
let productsQty
let userData

// Fetch al endpoint de gaphql para obtener datos
const getData = async () => {
    await fetch('/api/graphql',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({query:
                `
                {
                    getByUser(user: "${user}") {
                    _id,
                    cartId,
                    user,
                    name
                    }
                }
                `
            })
        })
        .then(res => res.json())
        .then(json => {
            userData = {
                userId: json.data.getByUser._id,
                userCartId: json.data.getByUser.cartId,
                userEmail: json.data.getByUser.user,
                userName: json.data.getByUser.name
            }
        })

    if (userData.userCartId !== '') {
        await fetch('/api/graphql/',
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({query:
                `
                {
                    getCartById(id: "${userData.userCartId}") {
                        productos {
                            _id,
                            product,
                            price,
                            stock,
                            description,
                            thumbnail
                        }
                    }
                }
                `
            })
        })
        .then(res => res.json())
        .then(getCart => {
            cart = getCart.data.getCartById.productos
            productsQty = cart.length
        })
    }
}

// Function IIFE para renderizar body con los datos obtenidos de getData() y llamar a las funciones para interactuar con la pág
(async () => {
    await getData()
    await fetch('/views/partials/cartBody.ejs')
        .then(res => res.text())
        .then(async template => {
            bodyContainer.innerHTML = ejs.render(
                template,
                {
                    cart: cart,
                    productsQty: productsQty,
                    userData: userData
                })
            //Definiendo vars DOM para carrito
            const products = document.getElementsByClassName('products')
            const deleteProductBtn = document.getElementsByClassName('deleteProductBtn')
            const deleteCartBtn = document.getElementsByClassName('deleteCartBtn')
            const endPurchaseBtn = document.getElementById('endPurchaseBtn')
            const emptyCart = document.getElementsByClassName('emptyCart')
            const backLink = document.getElementsByClassName('backLink')

            if (emptyCart[0]) {
                endPurchaseBtn.style.display = 'none'
                deleteCartBtn[0].style.display = 'none'
                backLink[0].style.display = 'none'
            }

            await emptyUserCart(deleteCartBtn)
            await deleteProductFromCart(deleteProductBtn, products)
            await generatePurchaseOrder(endPurchaseBtn)

        })
})()

// Function vaciar carrito
const emptyUserCart = async (deleteCartBtn) => {
    deleteCartBtn[0].addEventListener('click', async () => {
        // Delete ID carrito en documento user
        await fetch('/api/graphql/',
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({query:
                    `
                    mutation {
                        updateUser (
                            id: "${userData.userId}",
                            data: { cartId: "" }
                        ) { cartId }
                    }
                    `
                })
            })
            .then(res => res.json())
            .then(json => console.log(json.data.updateUser))
        // Delete carrito
        await fetch('/api/graphql/',
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({query:
                    `
                    mutation {
                        deleteCart
                            (id:"${userData.userCartId}")
                        { _id }
                    }
                    `
                })
            })
            .then(res => res.json())
            .then(json => {
                console.log(json.data.deleteCart)
                document.location.reload()
            })
    })
}

// Function borrar producto según su id
const deleteProductFromCart = async (deleteProductBtn, products) => {
    for (let i=0;i < deleteProductBtn.length;i++) {
        deleteProductBtn[i].addEventListener('click', async () => {
            await fetch('/api/graphql',
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({query:
                        `
                        mutation {
                            removeProductFromCart
                            (
                                productId: {_id: "${deleteProductBtn[i].id}"},
                                cartId: "${userData.userCartId}"
                            )
                            {
                                productos {
                                    _id,
                                    product,
                                    price,
                                    description,
                                    stock,
                                    thumbnail
                                }
                            }
                        }
                        `
                    })
                })
            .then(res => res.json())
            .then(cart => {
                const cartProds = cart.data.removeProductFromCart.productos.map(product => {
                        return `<div class='productDiv'>
                                    <div class='productContainer'>
                                        <p class='productContainerP'><span class='productContainerSpan'>Producto: </span>${product.product}</p>
                                        <p class='productContainerP'><span class='productContainerSpan'>Precio: </span>$${product.price}</p>
                                        <p class='productContainerP'><span class='productContainerSpan'>Descripción: </span>${product.description}</p>
                                        <p class='productContainerP'><span class='productContainerSpan'>Stock: </span>${product.stock}</p>
                                    </div>
                                    <div class='thumbnailContainer'>
                                        <img class='thumbnail thumbnailImg' src='${product.thumbnail}' alt='imagen producto' width='60px'>
                                    </div>
                                    <div class='deleteProductBtnContainer'>
                                        <button class='deleteProductBtn' id='${product.id}'>Eliminar</button>
                                    </div>
                                </div>
                                `
                })
                products[0].innerHTML = cartProds.join('') || `<p class='emptyCart'>Carrito vacío</p>`
                document.location.reload()
            })
        })
    }
}

// Function generar orden de compra
const generatePurchaseOrder = async (endPurchaseBtn) => {
    endPurchaseBtn.addEventListener('click', async () => {
        document.location.href = '/api/purchase'
    })
}