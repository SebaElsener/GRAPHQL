
const usuario = document.getElementById('usuario')
const bodyContainer = document.getElementById('bodyContainer')
const user = usuario.value
let userData
let cart

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
                    avatar
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
                userAvatar: json.data.getByUser.avatar
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
        })
    }
}

// Function IIFE para renderizar body con los datos obtenidos de getData() y completar orden de compra
(async () => {
    await getData()
    await fetch('/views/partials/purchaseOrderBody.ejs')
        .then(res => res.text())
        .then(async template => {
            bodyContainer.innerHTML = ejs.render(
                template,
                {
                    cart: cart,
                    userData: userData
                })
            //Definiendo vars DOM para orden de compra
            const confirmPurchaseBtn = document.getElementById('confirmPurchaseBtn')
            const cancelPurchaseBtn = document.getElementsByClassName('cancelPurchaseBtn')

            await cancelOrder(cancelPurchaseBtn)
            await confirmOrder(confirmPurchaseBtn)
        })
})()

// Function cancelar orden y volver a home
const cancelOrder = async (cancelPurchaseBtn) => {
    cancelPurchaseBtn[0].addEventListener('click', () => {
        document.location.href = '/api/productos'
    })
}

// Function confirmar orden de compra
const confirmOrder = async (confirmPurchaseBtn) => {
    const orderMessage = 'Orden de compra generada con exito,\
    Hemos enviado un mensaje a su casilla y teléfono de registro"\
    ¡Muchas gracias!  Será redirigido a home luego de unos segundos...'

    confirmPurchaseBtn.addEventListener('click', async () => {
        await fetch('/api/graphql',
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({query:
                    `
                        mutation {
                            purchaseOrder(user: "${user}")
                            { user }
                        }
                    `
                })
            })
            .then(res => res.json())
            .then(json => {
                Toastify({
                    text: orderMessage,
                    offset: {
                        x: 150,
                        y: 150
                    },
                    duration: 7000,
                    destination: "/api/productos",
                    newWindow: false,
                    close: false,
                    gravity: "top", // `top` or `bottom`
                    position: "left", // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                    },
                    callback: async function(){
                        await deleteCart()
                        document.location.href = '/api/productos'
                    } // Callback after click
                }).showToast()
            })
    })
}

const deleteCart = async () => {
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
        .then(json => console.log(json))

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
        .then(async json => {
            console.log(json.data.deleteCart)
        })
}