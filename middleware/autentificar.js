import { users } from '../repositories/autentificacion.js';


export function autentificar(req, res, next) {
    const authorizationToken = req.get('x-authorization')
  
    if (!authorizationToken) {
      return res.status(401).send({ error: 'Token de autorización no enviado. Recuerda usar el header X-Authorization' })
    }
  
    const user = users.find(user => user.token === authorizationToken)
  
    if (!user) {
      return res.status(401).send({ error: 'Token inválido' })
    }
    req.token=authorizationToken;
    next()
  }