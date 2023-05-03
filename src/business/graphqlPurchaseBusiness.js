
import { DAOusers } from '../persistence/factory.js'
import { DAOcarrito } from '../persistence/factory.js'
import sendMail from '../nodemailer/mailSender.js'
import { infoLogger } from '../logger.js'
import twilioSender from '../twilio/twilioMessage.js'

const purchase = async (userName) => {
    const userData = await DAOusers.getByUser(userName)
    const cart = await DAOcarrito.getById(userData.cartId)
    const mailBodyTemplate = cart.productos.map(product => {
        return `<div>
                    <div>
                        <p><span>Producto: </span>${product.product}</p>
                        <p><span>Precio: </span>$${product.price}</p>
                        <p><span>Descripción: </span>${product.description}</p>
                    </div>
                    <div>
                        <img src='${product.thumbnail}' alt='imagen producto' width='60px'>
                    </div>
                </div>
                `
    })
    const messageSubject = `Nuevo pedido de ${userData.name} - ${userData.user}`
    sendMail(process.env.GMAILUSER, messageSubject, mailBodyTemplate.join(''))
    const smsMessage = `Hola ${userData.name}!  Su orden de compra con ID ${userData.cartId}\
        ha sido generada con exito, nos pondremos en contacto con usted.  Muchas gracias`
    twilioSender(userData.phone, messageSubject, 'whatsapp')
    twilioSender(userData.phone, smsMessage, 'sms')
    infoLogger.info(`Orden de compra con ID ${userData.cartId} generada con exito`)
    return userData.cartId
}

export default purchase