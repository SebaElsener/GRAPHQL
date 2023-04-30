
const confirmPurchaseBtn = document.getElementById('confirmPurchaseBtn')
const cancelPurchaseBtn = document.getElementsByClassName('cancelPurchaseBtn')
const userTitle = document.getElementsByClassName('userTitle')

let userCartId
let userId

// Cancelar orden y volver a home
cancelPurchaseBtn[0].addEventListener('click', () => {
    document.location.href = '/api/productos'
})

const orderMessage = 'Orden de compra generada con exito,\
    Hemos enviado un mensaje a su casilla y teléfono de registro"\
    ¡Muchas gracias!  Será redirigido a home luego de unos segundos...'

// Confirmar orden de compra
confirmPurchaseBtn.addEventListener('click', async () => {
    await fetch('/api/userdata/purchaseorder')
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

const deleteCart = async () => {
    // Traer ID user y ID carrito asociado al user
    const user = userTitle[0].innerText
    await fetch('/api/graphql',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({query:
                `
                {
                    getByUser(user: "${user}") {
                        _id,
                        cartId
                    }
                }
                `
            })
        })
        .then(res => res.json())
        .then(json => {
            userId = json.data.getByUser._id
            userCartId = json.data.getByUser.cartId
        })
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
                        (id:"${userCartId}")
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