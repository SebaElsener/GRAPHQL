
const products = document.getElementsByClassName('products')
const deleteProductBtn = document.getElementsByClassName('deleteProductBtn')
const deleteCartBtn = document.getElementsByClassName('deleteCartBtn')
const endPurchaseBtn = document.getElementById('endPurchaseBtn')
const emptyCart = document.getElementsByClassName('emptyCart')
const backLink = document.getElementsByClassName('backLink')
const userTitle = document.getElementsByClassName('userTitle')

const user = userTitle[0].innerText
let userCartId
let userId
let userName
let userEmail

if (emptyCart[0]) {
    endPurchaseBtn.style.display = 'none'
    deleteCartBtn[0].style.display = 'none'
    backLink[0].style.display = 'none'
}

const userData = async () => {
    // Traer ID user y ID carrito asociado al user
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
            userId = json.data.getByUser._id
            userCartId = json.data.getByUser.cartId
            userEmail = json.data.getByUser.user
            userName = json.data.getByUser.name
        })
}

// Evento vaciar carrito
deleteCartBtn[0].addEventListener('click', async () => {
    await userData()
    // Delete ID carrito en documento user
    await fetch('/api/graphql/',
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({query:
                `
                mutation {
                    updateUser (
                        id: "${userId}",
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
                        (id:"${userCartId}")
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

// Evento borrar producto según su id
for (let i=0;i < deleteProductBtn.length;i++) {
    deleteProductBtn[i].addEventListener('click', async () => {
        await fetch('/api/graphql',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({query:
                    `
                    {
                        getByUser(user: "${user}") {
                            cartId
                        }
                    }
                    `
                })
            })
        .then(res => res.json())
        .then(json => {
            userCartId = json.data.getByUser.cartId
        })
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
                            cartId: "${userCartId}"
                        )
                        {
                            productos {
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

// Evento generar orden de compra
endPurchaseBtn.addEventListener('click', async () => {
    document.location.href = '/api/carrito/purchase'
})