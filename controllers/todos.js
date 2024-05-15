import { Router, json } from "express";
import {
  getTodo,
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../repositories/todos.js";
import {
  createTodoSchema,
  updateTodoSchema,
} from "../schemas/index.js";
 import { autentificar } from "../middleware/autentificar.js";
 import { validarFormatoinsert, validarFormatoupdate} from "../middleware/validaciones.js"


const router = Router();

router.get('/todos', autentificar, (req, res) => {
   res.status(200).json(getTodos());
  });

//Obtener un ítem individual
 router.get('/todos/:id', autentificar,(req, res) => {
  const todo=getTodo(req.params.id);
	if (!todo) {
		return res.status(404).json("Item no encontrado");
  	}
    else {
	      res.send(todo)
    }
 });

// creacion de un item
router.post('/todos', autentificar, validarFormatoinsert, (req, res) => {
     let todo;
  
    try {
      todo = createTodoSchema.validateSync(req.body, {
        stripUnknown: true,
      });
    } catch (ex) {
      return res.status(400).send(ex);
    }
  
    res.status(201).send(createTodo(todo));

  });



//actualizar un items
router.put('/todos/:id', autentificar, validarFormatoupdate, (req, res) => {
 
  const id = req.params.id;
  let validatedtodo;

  try {
    validatedtodo = updateTodoSchema.validateSync(req.body, {
      stripUnknown: true,
    });
  } catch (ex) {
    return res.status(400).send(ex);
  }
 
  const updatedTodo = updateTodo(id, validatedtodo);
  
  if (updatedTodo) {
    res.json(updatedTodo);
  } else {
    res.status(404).json("actividad no encontrada");
  }
 
 });

// Ruta para eliminar un ítem
router.delete("/todos/:id", autentificar,  (req, res) => {
 const id = req.params.id

 if (deleteTodo(id)){
  res.status(204).send();
 } else {
  res.status(404).json("Pelicula no encontrada");
 }
});



export default router;


