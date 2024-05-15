import { Router } from "express";
import {  randomBytes } from 'node:crypto';
import {  getuser,  checkPassword, logout } from '../repositories/autentificacion.js';
import { loginSchema } from '../schemas/index.js'; // Importa el esquema de validación para el login
import { autentificar } from "../middleware/autentificar.js";
import { validarFormato} from "../middleware/validaciones.js"

const router = new Router();

router.post('/login', validarFormato  ,async (req, res) => {
  let userinput;
  try {
      userinput=loginSchema.validateSync(req.body,{
      stripUnknown: true,
    });
  } catch(ex) {
    return res.status(400).send(ex);
  }
     const { username, password } = req.body;
     const user = getuser(username, password); 
  
     if (!user) {
      return res.status(401).send('Usuario no encontrado');
    }

    if (!( await checkPassword(password, user.password))) {
      return res.status(401).send({
        error: 'Usuario y/o password incorrectos'
      })
    }
    user.token = randomBytes(48).toString('hex')

	res.send({
		username: user.username,
		name: user.name,
		token: user.token
	})
});

// Desloguear a un Usuario en base al token de autenticación
router.post('/logout', autentificar , (req, res) => {
  logout(req.token);
  res.status(204).send();
});

export default router;
