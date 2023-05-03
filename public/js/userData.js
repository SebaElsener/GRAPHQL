
const usuario = document.getElementById('usuario')
const bodyContainer = document.getElementById('bodyContainer')
const user = usuario.value
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
                    user,
                    name,
                    address,
                    age,
                    phone,
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
                userEmail: json.data.getByUser.user,
                userName: json.data.getByUser.name,
                userAddress: json.data.getByUser.address,
                userAge: json.data.getByUser.age,
                userPhone: json.data.getByUser.phone,
                userAvatar: json.data.getByUser.avatar
            }
        })
}

// Function IIFE para renderizar body con los datos obtenidos de getData() y llamar a las funciones para interactuar con la pág
(async () => {
    await getData()
    await fetch('/views/partials/userDataBody.ejs')
        .then(res => res.text())
        .then(async template => {
            bodyContainer.innerHTML = ejs.render(
                template,
                {
                    userData: userData
                })
            //Definiendo vars DOM para datos usuario
            const userDataForm = document.getElementById('userDataForm')
            const nameLastname = document.getElementById('nameLastname')
            const direccion = document.getElementById('direccion')
            const age = document.getElementById('age')
            const phone = document.getElementById('phone')
            const avatar = document.getElementById('avatar')
            const data =
            {
                userDataForm: userDataForm,
                nameLastname: nameLastname,
                direccion: direccion,
                age: age,
                phone: phone,
                avatar: avatar,
            }
        
            await updateUser(data)
        })
})()

// Function para actualizar datos de user
const updateUser = async (data) => {
    const
    {
        userDataForm,
        nameLastname,
        direccion,
        age,
        phone,
        avatar,
    } = data

    userDataForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        const userInfoToUpdate = {
            name: nameLastname.value,
            address: direccion.value,
            age: age.value,
            phone: phone.value,
            avatar: avatar.value
        }
        await fetch('/api/graphql/',
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({query:
                    `
                    mutation {
                        updateUser (
                            id: "${userData.userId}",
                            data: { 
                                name: "${userInfoToUpdate.name}",
                                address: "${userInfoToUpdate.address}",
                                age: ${userInfoToUpdate.age},
                                phone: "${userInfoToUpdate.phone}",
                                avatar: "${userInfoToUpdate.avatar}"
                            }
                        ) { user }
                    }
                    `
                })
            })
        .then(res => res.json())
        .then(json => {
            Toastify({
                text: 'DATOS ACTUALIZADOS CON EXITO',
                offset: {
                    x: 150,
                    y: 150
                },
                duration: 5000,
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