
const userDataForm = document.getElementById('userDataForm')
const nameLastname = document.getElementById('nameLastname')
const direccion = document.getElementById('direccion')
const age = document.getElementById('age')
const phone = document.getElementById('phone')
const avatar = document.getElementById('avatar')
const _id = document.getElementById('_id')

userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const userInfoToUpdate = {
        userDBid: _id.value,
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
                        id: "${userInfoToUpdate.userDBid}",
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