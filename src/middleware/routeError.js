
import { errorLogger } from "../logger.js"

const routeError = (req, res, next) => {
    if (res.status = '404') {
        const routeError = `Ruta '${req.path}' metodo '${req.method}' no implementada`
        errorLogger.warn(routeError)
        res.render('routeError', {
            badRoute: routeError
        })
    }
    next()
}

export default routeError