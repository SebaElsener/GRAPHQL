
const bodyContainer = document.getElementById('bodyContainer')
let adminArray = []
let deleteArray = []
let allUsers = []

// Fetch al endpoint de gaphql para obtener datos
const getData = async () => {
    await fetch('/api/graphql',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({query:
                `
                {
                    getUsers {
                        user,
                        _id,
                        admin
                    }
                }
                `
            })
        })
        .then(res => res.json())
        .then(json => {
            allUsers = json.data.getUsers
        })
}

// Function IIFE para renderizar body con los datos obtenidos de getData() y llamar a las funciones para interactuar con la pág
(async () => {
    await getData()
    await fetch('/views/partials/usersAdminBody.ejs')
        .then(res => res.text())
        .then(async template => {
            bodyContainer.innerHTML = ejs.render(
                template,
                {
                    allUsers: allUsers
                })
            //Definiendo vars DOM para datos usuarios
            const usersAdminMakeUserAdmin = document.getElementsByClassName('usersAdminMakeUserAdmin')
            const usersAdminDeleteUser = document.getElementsByClassName('usersAdminDeleteUser')
            const usersForm = document.getElementById('usersForm')
            const usersAdminTd = document.getElementsByClassName('usersAdminTd')
            // Deshabilitar los checkbox eliminar y administrador del usuario admin
            for (let i=0; i<usersAdminTd.length; i++) {
                if (usersAdminTd[i].innerText === 'admin@admin.com') {
                    usersAdminTd[i].parentElement.children[1].children[0].disabled = 'true'
                    usersAdminTd[i].parentElement.children[2].children[0].disabled = 'true'
                }
            }
            
            generateUsersToDeleteAndMakeAdmin(usersAdminMakeUserAdmin, adminArray)
            generateUsersToDeleteAndMakeAdmin(usersAdminDeleteUser, deleteArray)

            await makeAdminAndDeleteUsers(usersForm)

        })
})()

// Function para registrar en un array los users tildados como admin o para ser eliminados
const generateUsersToDeleteAndMakeAdmin = (HTMLCollection, array) => {
    for (let i=0; i<HTMLCollection.length; i++) {
        HTMLCollection[i].addEventListener('change', (e) => {
            const userToMakeAdmin = {
                user: e.target.id,
                admin: e.target.checked
            }
            const userIndex = array.findIndex(user => user.user === userToMakeAdmin.user)
            if (userIndex === -1) { array.push(userToMakeAdmin) }
            else {
                array[userIndex].admin = userToMakeAdmin.admin
            }
        })
    }
}

// Function para hacer admin o eliminar usuarios
const makeAdminAndDeleteUsers = async (usersForm) => {
    usersForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        if (adminArray.length !== 0) {

            const dataToFetch = adminArray.map(user => {
                return `{user: "${user.user}", admin: "${user.admin}"}`
            })

            await fetch('/api/graphql/',
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({query:
                    `
                    mutation{
                        updateUsersAdmin(data:[${dataToFetch}])
                    { __typename }
                    }
                    `
                })
            })
            .then(res => res.json())
            .then(json => {
                getToast('DATOS ACTUALIZADOS CON EXITO')
            })
        }

        if (deleteArray.length !== 0) {
            const usersToDelete = []
            deleteArray.map(user => { if (user.admin) { usersToDelete.push(user.user.slice(7)) } })

            const dataToFetch = usersToDelete.map(user => {
                return `{user: "${user}"}`
            })

            await fetch('/api/graphql/',
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({query:
                    `
                    mutation{
                        deleteUsers(data:[${dataToFetch}])
                    { __typename }
                    }
                    `
                })
            })
            .then(res => res.json())
            .then(json => { 
                getToast('USUARIOS ELIMINADOS CON EXITO')
            })
        }
    })
}

const getToast = (text) => {
    Toastify({
        text: text,
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
        },
        callback: reload()
    }).showToast()
}

const reload = () => {
    setTimeout(() => {
        usersForm.reset()
        document.location.reload()
    }, 3000)
}