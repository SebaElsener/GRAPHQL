
const bodyContainer = document.getElementById('bodyContainer')
const usuario = document.getElementById('usuario')
const socket = io.connect()
let userData
let productsQty
let allProducts

// Fetch al endpoint graphql para traer datos usuario y productos
const getData = async () => {
    await fetch('/api/graphql/',
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({query:
                `
                    {
                        getByUser(user: "${usuario.value}") {
                            avatar,
                            admin,
                            _id
                            user,
                            name,
                            age,
                            address,
                            phone
                        }
                    }
                `
            })
        }
        )
        .then(res => res.json())
        .then(json => {
            userData = {
                _id: json.data.getByUser._id,
                avatar: json.data.getByUser.avatar,
                admin: json.data.getByUser.admin,
                user: json.data.getByUser.user,
                name: json.data.getByUser.name,
                age: json.data.getByUser.age,
                address: json.data.getByUser.address,
                phone: json.data.getByUser.phone
            }
        })

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
        })
        .then(res => res.json())
        .then(productos => {
            allProducts = productos.data.getProducts
            productsQty = allProducts.length
        })
}

// Function IIFE para renderizar body con los datos obtenidos de getData() y llamar a las funciones para interactuar con la pág
(async () => {
    await getData()
    await fetch('/views/partials/body.ejs')
        .then(res => res.text())
        .then(async template => {
            bodyContainer.innerHTML = ejs.render(
                template,
                {
                    allProducts: allProducts,
                    productsQty: productsQty,
                    userData: userData,
                    userName: userData.user,
                })
            //Definiendo vars DOM para carrito y acciones con productos
            const userWelcome = document.getElementsByClassName('userWelcome')
            const updateBtn = document.getElementsByClassName('updateBtn')
            const deleteBtn = document.getElementsByClassName('deleteBtn')
            const cartLinkSpan = document.getElementsByClassName('cartLinkSpan')
            const cartLink = document.getElementsByClassName('cartLink')
            const buyBtn = document.getElementsByClassName('buyBtn')
            // -- //
            //Definiendo vars DOM para centro mensajes
            const messagesForm = document.getElementById('messagesForm')
            const userEmail = document.getElementById('userEmail')
            const userName = document.getElementById('userName')
            const userPhone = document.getElementById('userPhone')
            const userAge = document.getElementById('userAge')
            const userAddress = document.getElementById('userAddress')
            const userAvatar = document.getElementById('userAvatar')
            const messagesContainer = document.getElementById('messagesContainer')
            const messagesCenterTitle = document.getElementsByClassName('messagesCenterTitle')
            const DOMmessages =
            {
                messagesForm,
                userEmail,
                userName,
                userPhone,
                userAge,
                userAddress,
                userAvatar,
                messagesContainer,
                messagesCenterTitle
            }

            await cartItems(userWelcome, cartLinkSpan, cartLink)
            await buyProduct(buyBtn, cartLink, cartLinkSpan)
            await deleteProduct(updateBtn, deleteBtn)
            await updateProduct(updateBtn)
            await messagesLogic(DOMmessages)
        })
})()

//Function para mostrar cantidad items carrito en barra navegación
const cartItems = async (userWelcome, cartLinkSpan, cartLink) => {
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
}

//Function comprar producto
const buyProduct = async (buyBtn, cartLink, cartLinkSpan) => {
    for (let i=0;i < buyBtn.length;i++) {
        buyBtn[i].addEventListener('click', async () => {
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
                                            id: "${userData._id}",
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
    }
}

//Function borrar producto
const deleteProduct = async (updateBtn, deleteBtn) => {
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
                document.location.reload()})
        })
    }
}

//Function modificar producto
const updateProduct = async (updateBtn) => {
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
}

//Lógica mensajes websocket
const messagesLogic = async (DOMmessages) => {
    const
    {
        messagesForm,
        userEmail,
        userName,
        userPhone,
        userAge,
        userAddress,
        userAvatar,
        messagesContainer,
        messagesCenterTitle
    } = DOMmessages
    //  Schema normalización mensajes
    const authorSchema = new normalizr.schema.Entity('author')
    const postSchema = new normalizr.schema.Entity('post', { author: authorSchema }, { idAttribute: '_id' })
    const postsSchema = new normalizr.schema.Entity('posts', { mensajes: [postSchema] })
    // Escuchando listado mensajes enviado por el servidor
    socket.on('allMessages', data => {
        const { normalizedMessages, originalDataLength } = data
        const denormalizedMessages = normalizr.denormalize(normalizedMessages.result, postsSchema, normalizedMessages.entities)
        const normalizedMessagesLength = JSON.stringify(normalizedMessages).length
        let compressionRatio
        originalDataLength === 2
            ? compressionRatio = 0
            : compressionRatio = ((normalizedMessagesLength * 100) / originalDataLength).toFixed(2)
        messagesCenterTitle[0].innerText = `Centro de Mensajes - Compresión: ${compressionRatio}%`
        const msgMapping = denormalizedMessages.mensajes.map(message => {
            return `<div id='messagesDiv'>
                        <div class='userDataContainer'>
                        <div class='userImgContainer'>
                            <img class='userImg' src='${message.author.avatar}' alt='[avatar usuario ${message.author.id}]' width='30px'>
                        </div>
                        <b style="color: blue" class='msgAuthor'>${message.author.id}</b>
                        <span style="color: brown">[ ${message.date} ]</span>
                        </div>
                        <div class='textContainer'>
                        <i style="color: green">=>  ${message.text}</i>
                        </div>
                    </div>`
        })
        messagesContainer.innerHTML = msgMapping.join(' ')
    })
    messagesForm.addEventListener('submit', (e) => {
        e.preventDefault()
        // La info del user se obtiene a través de un div con display=none pasado como parámetro por ejs
        newMessage = {
            author: {
                id: userEmail.innerText,
                nombre: userName.innerText,
                edad: userAge.innerText,
                direccion: userAddress.innerText,
                telefono: userPhone.innerText,
                avatar: userAvatar.innerText
            },
            text: messagesForm[0].value,
            date: new Date().toLocaleString()
        }
        socket.emit('newMessage', newMessage)
        messagesForm.reset()
    })
}