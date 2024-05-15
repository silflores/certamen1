import express from 'express'
import todosController from './controllers/todos.js'
import autenController from './controllers/autentificacion.js';

const app = express()

app.use(express.static('public'))
app.use(express.json())


app.use('/api', todosController)
app.use('/api', autenController);

app.get('/api', (req, res) => {
  res.type('text/plain')
  res.send('Hello World!')
})

export default app

/*import express from 'express'
import TodosController from "../controllers/todos.js"



const app = express()
app.use(express.json());

app.use(express.static('public'))


app.get('/api', (req, res) => {
	res.set('Content-Type', 'text/plain');
	res.status(200).send('Hello World!');
});

function validarFormato(req, res, next) {
    const { username, password } = req.body;
    if (typeof username !== 'string' || typeof password !== 'string' || username.trim() === '' || password.trim() === '') {
        return res.status(400).send("username y/o password no proporcionados en el formato correcto");
    }
    next();
}




// Middleware de autenticación
const autentificar = (req, res, next) => {
	const autHeader = req.headers['x-authorization'];

	if (!autHeader){
		return res.status(401).send('no se encuentra la cabecera autorización');
	}
	
	const usuario = users.find(u => u.token === autHeader)

	if(!usuario){
		return res.status(401).send('No se proporcionó token de autentificación');
	}
	req.user = usuario;// almacenar el usuario en el obj par uso posterior
	next()

};
// Middleware para validad formato

  
// Ruta principal API para hellow word
app.get('/api', (req, res) => {
	res.type('text/plain')
	res.end('Hello World!')
})
		

app.use("/api/todos",TodosController);
export default app */
