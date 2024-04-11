import express from 'express'
import { scrypt, randomBytes, randomUUID } from 'node:crypto'

//import json from 'express'

const app = express()

app.use(express.json())


const users = [{
	username: 'admin',
	name: 'Gustavo Alfredo Marín Sáez',
	password: '1b6ce880ac388eb7fcb6bcaf95e20083:341dfbbe86013c940c8e898b437aa82fe575876f2946a2ad744a0c51501c7dfe6d7e5a31c58d2adc7a7dc4b87927594275ca235276accc9f628697a4c00b4e01' // certamen123
}]
const todos = []

app.use(express.static('public'))

// Su código debe ir aquí...

// Middleware de autenticación
const autentificar = (req, res, next) => {
	const autHeader = req.headers['x-authorization'];
	const usuario = users.find(u => u.token === autHeader)
	if(usuario.token !== autHeader){
		return res.status(401).send('No se proporcionó token de autentificación');
	}
	req.user = usuario;// almacenar el usuario en el obj par uso posterior
	next()
/*
	//const token = autHeader.replace('Bearer ', '');
	const token = autHeader.split(' ')[1];
	const user = users.find(user => user.token === token);
	if (!user) {
	return res.status(401).send('Token de autentificación inválido');
	}

	req.user = user;// almacenar el usuario en el obj par uso posterior
	next();*/
};
// Middleware para validad formato
function validarFormato(req, res, next) {
    const { username, password } = req.body;
    if (typeof username !== 'string' || typeof password !== 'string' || username.trim() === '' || password.trim() === '') {
        return res.status(400).send("username y/o password no proporcionados en el formato correcto");
    }
    next();
}
  
// Ruta principal API para hellow word
app.get('/api', autentificar,(req, res) => {
	res.set('Content-Type', 'text/plain');
	res.status(200).send('Hello World!');
});
		
//validar usuario y contraseña
app.post('/api/login', validarFormato, (req, res) => {
	const { username, password } = req.body;

	const user = users.find(user => user.username === username);
	if (!user) {
		return res.status(401).send('Usuario no encontrado');
	}
	
	const [salt, key] = user.password.split(':');
	scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) {
            return res.status(500).send('problemas servidor'); // Contraseña incorrecta;
        }
		 
        if (derivedKey.toString('hex') !== key) {
			return res.status(401).send('Contraseña incorrecta o usuario incorrecto'); // Contraseña incorrecta
        }
		/*
			const [salt, key] = user.password.split(':');
			const buffer = await scrypt(password, Buffer.from(salt, 'hex'), 64,);
			const hashedPassword = Buffer.from(key, 'hex').toString('hex'); 
		
			if (hashedPassword !== buffer.toString('hex')) {
			return res.status(401).json({ message: 'Contraseña incorrecta' });
			}
		*/
		const token = randomBytes(48).toString('hex');
		user.token = token;
  
		res.status(200).json({
		username: user.username,
		name: user.name,
		token: token
		});
	});
  });
  
  //Listar todos los ítems
 
	app.get('/api/todos', autentificar, (req, res) => {
		res.setHeader('Content-Type', 'application/json');
	  
		 const tareas = todos.map(todo => ({
		  id: todo.id.toString(),
		  title: todo.title,
		  completed: todo.completed
		}));
	  
		res.status(200).json(tareas);
	  });

	//Obtener un ítem individual
	app.get('/api/todos/:id', autentificar,(req, res) => {
	res.setHeader('Content-Type', 'application/json')
	const itemId = req.params.id;//items a filtrar
	//
	const itemIndex = todos.findIndex(item => todos.id === itemId);
  
	if (itemIndex === -1) {
	  return res.status(404).json({ message: 'Ítem no encontrado' });
	}
  
	res.status(200).json([{
		id:todos[itemIndex].id,
		title:  todos[itemIndex].title,
		completed: todos[itemIndex].completed
		}]);
	
	//res.status(200).json(todos);
  });

  // creacion de un item
	app.post('/api/todos', autentificar, (req, res) => {
	const { title } = req.body;
	res.setHeader('Content-Type', 'application/json')
	
	if (!title) {
	  return res.status(400).json({ message: 'la actividad es obligatorio' });
	}
  
	const nuevoItemId = randomUUID().toString(); // Generar ID único
	const nuevoItem = {
	  id: nuevoItemId,
	  title: title,
	  completed: false
	};
  
	todos.push(nuevoItem);
	res.status(201).json(nuevoItem);
  });
  
  
  //actualizar un items
  app.put('/api/todos/:id', autentificar, (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	const itemId = req.params.id;
	const title = req.body.title; 
	const completed = req.body.completed;
  
	// Validar los formatos de title y completed
	if (title !== undefined && typeof title !== 'string') {
	  return res.status(400).json({ message: 'El título debe ser una cadena de texto' });
	}
	if (completed !== undefined && typeof completed !== 'boolean') {
	  return res.status(400).json({ message: 'El campo completed debe ser un booleano' });
	}
  
	const itemIndex = todos.findIndex(item => item.id === itemId);
  
	if (itemIndex === -1) {
	  return res.status(404).json({ message: 'Ítem no encontrado' });
	}
  
	const updatedItem = {
	  ...todos[itemIndex], // Conservar propiedades existentes
	  title: title || todos[itemIndex].title, // Actualizar title solo si se envía
	  completed: completed !== undefined ? completed : todos[itemIndex].completed // Actualizar completed solo si se envía
	};
  
	todos[itemIndex] = updatedItem;
	res.status(200).json(updatedItem);
  });

  // Ruta para eliminar un ítem
  app.delete("/api/todos/:id", autentificar,  (req, res) => {
	const itemId = req.params.id;
	const itemIndex = todos.findIndex(item => item.id === itemId);
  
	if (itemIndex === -1) {
		return res.status(404).json({ message: 'Ítem no encontrado' });
	  }
	  else{
		todos.splice(itemIndex, 1);
    	res.status(204).send();
	  }
	});
  //});
  
// ... hasta aquí


export default app