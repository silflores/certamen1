import { randomUUID } from "node:crypto";


export const todos = []

export function getTodos() {
  return todos;
}

export function getTodo(id) {
  return todos.find((todo) => todo.id === id) ?? null;
}



export function createTodo(todo) {
  const newTodo = {
    ...todo,
    id: randomUUID(),
    completed: false,
  };
  todos.push(newTodo);
  return newTodo;
}

export function updateTodo(id, todo) {
  console.log(id);
  const actualTodo = getTodo(id);
  console.log(actualTodo);
  if (!actualTodo) {
    return null;
  }
 
  actualTodo.title = todo.title ?? actualTodo.title;
  actualTodo.completed = todo.completed ?? actualTodo.completed;
  return actualTodo;
}

export function deleteTodo(id) {
  const index = todos.findIndex((m) => m.id === id);

  if (index === -1) {
    return false;
  }

  todos.splice(index, 1);
  return true;
}
