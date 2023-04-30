
const updateBtn = document.getElementsByClassName('updateBtn')
const deleteBtn = document.getElementsByClassName('deleteBtn')
const buyBtn = document.getElementsByClassName('buyBtn')
const cartLinkSpan = document.getElementsByClassName('cartLinkSpan')
const userWelcome = document.getElementsByClassName('userWelcome')
const cartLink = document.getElementsByClassName('cartLink')
let cartId

//Evento para mostrar cantidad items carrito en barra navegación
window.addEventListener('load', async () => {
    let userCart
    await fetch('/api/graphql/',
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({query:
                `
                    {
                        getByUser(user: "${userWelcome[0].innerText}") {
                            cartId
                        }
                    }
                `
            })
        }
    )
        .then(res => res.json())
        .then(json => {
            userCart = json.data.getByUser.cartId
            cartLink[0].id = userCart
        })
    if (userCart == '') { cartLinkSpan[0].innerHTML = ': VACIO' }
    else {
        await fetch('/api/graphql',
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({query:
                    `
                        {
                            getCartById(id: "${userCart}")
                            { productos { _id } }
                        }
                    `
                })
            })
            .then(res => res.json())
            .then(cart => {
                cartLinkSpan[0].innerHTML =
                    `: ${cart === null || cart.data.getCartById.productos.length === 0
                        ? 'VACIO'
                        : cart.data.getCartById.productos.length + ' PRODUCTO(S)'}
                    `
            })
    }
})

// Evento borrar producto
for (let i=0; i < deleteBtn.length; i++) {
    deleteBtn[i].addEventListener('click', async () => {
        productId = updateBtn[i].parentElement.previousElementSibling.childNodes[1].id
        await fetch('/api/graphql/',
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({query:
                    `
                        mutation{
                            deleteProduct(id: "${productId}")
                            { _id, product }
                        }
                    `
                })
            }
        ).then(res => res.json()).then(json => {
            console.log(json)
            document.location.reload()}
        )
    })
}

// Evento modificar producto
for (let i=0; i < updateBtn.length; i++) {
    updateBtn[i].addEventListener('click', async () => {
        productId = updateBtn[i].parentElement.previousElementSibling.childNodes[1].id
        productToUpdate = {
            product: updateBtn[i].parentElement.parentElement.childNodes[1].value,
            price: updateBtn[i].parentElement.parentElement.childNodes[3].childNodes[3].value,
            stock: updateBtn[i].parentElement.parentElement.childNodes[9].childNodes[3].value,
            description: updateBtn[i].parentElement.parentElement.childNodes[7].value,
            code: updateBtn[i].parentElement.parentElement.childNodes[13].value,
            thumbnail: updateBtn[i].parentElement.parentElement.childNodes[5].childNodes[1].src
        }
        await fetch('/api/graphql/',
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({query:
                    `
                    mutation {
                        updateProduct(
                            id: "${productId}",
                            data: {
                                product: "${productToUpdate.product}",
                                price: ${productToUpdate.price},
                                stock: ${productToUpdate.stock},
                                description: "${productToUpdate.description}",
                                code: "${productToUpdate.code}",
                                thumbnail: "${productToUpdate.thumbnail}"
                            }
                        ) { product }
                    }
                    `
                })
            }
        ).then(res => res.json()).then(json => {
            Toastify({
                text: `PRODUCTO ${json.data.updateProduct.product} ACTUALIZADO CON EXITO`,
                offset: {
                    x: 150,
                    y: 150
                },
                duration: 3000,
                newWindow: false,
                close: false,
                gravity: "top", // `top` or `bottom`
                position: "left", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                  background: "linear-gradient(to right, #00b09b, #96c93d)",
                }
              }).showToast() 
        })
    })
}

// Evento comprar producto
for (let i=0;i < buyBtn.length;i++) {
    buyBtn[i].addEventListener('click', async () => {
        // fetch para traer todos los productos
        await fetch('/api/graphql/',
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({query:
                    `
                    {
                        getProducts {
                            _id,
                            product,
                            price,
                            stock,
                            description,
                            code,
                            thumbnail
                        }
                    }
                    `
                })
            }
        ).then(res => res.json())
        .then(async productos => {
            const selectedProduct = productos.data.getProducts.find(product => product._id === buyBtn[i].id)
            // Generando un nuevo carrito en caso de que no exista ninguno para el usuario logueado
            if (!cartLink[0].id) {
                await fetch('/api/graphql',
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({query:
                        `
                        mutation {
                            saveCart { _id }
                        }
                        `
                    })
                })
                    .then(res => res.json())
                    .then(async newCart => {
                        cartLink[0].id = newCart.data.saveCart._id
                        cartId = newCart.data.saveCart._id
                        await fetch('/api/graphql/',
                            {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({query:
                                    `
                                    mutation {
                                        updateUser (
                                            id: "${userWelcome[0].id}",
                                            data: { cartId: "${cartId}" }
                                        ) { cartId }
                                    }
                                    `
                                })
                            })
                            .then(res => res.json())
                            .then(json => console.log(json))
                    })
            }
            //Fetch para agregar producto comprado al carrito
            cartId = cartLink[0].id
            await fetch('/api/graphql',
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({query:
                        `
                        mutation {
                            addProductToCart(
                                cartId: "${cartId}",
                                productId: {_id: "${buyBtn[i].id}"}
                            ) { _id,
                                productos { _id }
                            }
                        }
                        `
                    })
                })
            .then(res => res.json()).then(cart => {
                const prodsQty = cart.data.addProductToCart.productos.length
                cartLinkSpan[0].innerHTML = `: ${prodsQty} PRODUCTO(S)`
            })
        })
    })
}