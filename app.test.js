import { expect, test, describe, beforeEach } from 'vitest';
import request from 'supertest';
import app from './app.js';
import { todos } from './repositories/todos.js';
import { users } from './repositories/autentificacion.js';

function clearToDos() {
  todos.length = 0;
}

function createToDo(item) {
  todos.push(item);
  return item;
}

function loginRequest(username = 'admin', password = 'certamen123') {
  return request(app)
    .post('/api/login')
    .send({ username, password });
}

function createItemRequest(title, token) {
  return request(app)
    .post('/api/todos')
    .set('X-Authorization', token)
    .send({ title, completed: true });
}

function updateItemRequest(id, attrs, token) {
  return request(app)
    .put('/api/todos/' + id)
    .set('X-Authorization', token)
    .send(attrs);
}

async function loginAndSetToken(context) {
  const { body } = await loginRequest();
  context.token = body.token;
}

beforeEach(clearToDos);

describe('Middleware de Autenticación', () => {
  beforeEach(loginAndSetToken);

  test('Los endpoints indicados están protegidos por un middleware de autenticación', async ({ token }) => {
    await request(app).get('/api/todos').expect(401);
    await request(app).get('/api/todos').set('X-Authorization', token).expect(200);
    await request(app).get('/api/todos/djsakldjlas').expect(401);
    await request(app).get('/api/todos/djsakldjlas').set('X-Authorization', token).expect(404);
    await request(app).post('/api/todos').expect(401);
    await request(app).post('/api/todos').set('X-Authorization', token).expect(400);
    await request(app).put('/api/todos/jdlsajdlksa').expect(401);
    await request(app).put('/api/todos/jdlsajdlksa').set('X-Authorization', token).expect(404);
    await request(app).delete('/api/todos/jdlsajdlksa').expect(401);
    await request(app).delete('/api/todos/jdlsajdlksa').set('X-Authorization', token).expect(404);
    await request(app).post('/api/logout').expect(401);
    await request(app).post('/api/logout').set('X-Authorization', token).expect(204);
  });

  test('Devuelve código de estado 401 cuando el token no existe', () => {
    return request(app).get('/api/todos')
      .set('X-Authorization', 'not-exists-in-this-realm')
      .expect(401);
  });
});

test('Hello World!', () => {
  return request(app)
    .get('/api')
    .expect('Content-Type', /text\/plain/)
    .expect(200)
    .expect('Hello World!');
});

describe('Login', () => {
  test('Se loguea correctamente', async () => {
    const { body: user } = await loginRequest()
      .expect('Content-Type', /application\/json/)
      .expect(200);

    expect.soft(user.name).toBe('Gustavo Alfredo Marín Sáez');
    expect.soft(user.username).toBe('admin');
    expect.soft(user.password).toBeUndefined();
    expect.soft(user.token).toBeTypeOf('string').toMatch(/^[0-9a-f]+$/i);
  });

  test('El token es persistido', async () => {
    const { body: loggedUser } = await loginRequest()
      .expect('Content-Type', /application\/json/)
      .expect(200);

    expect(users.find(user => user.token === loggedUser.token)).toBeDefined();
  });

  test('El token es distinto con cada logueo', async () => {
    const { body: body1 } = await loginRequest();
    const { body: body2 } = await loginRequest();

    expect.soft(body1.token).not.toBe(body2.token);
  });

  test('Devuelve código de estado 400 cuando no se envían los datos apropiados', () => {
    return loginRequest(123, false)
      .expect(400);
  });

  test('Devuelve código de estado 401 cuando el usuario no existe o contraseña incorrecta', async () => {
    await loginRequest('notadmin', 'certamen123')
      .expect(401);

    await loginRequest('admin', 'certamen1234')
      .expect(401);
  });
});

describe('Logout', () => {
  test('Se desloguea correctamente', async () => {
    const { body } = await loginRequest();

    await request(app)
      .post('/api/logout')
      .set('X-Authorization', body.token)
      .expect(204);
  });

  test('Borra el token correctamente', async () => {
    const username = 'admin';
    const { body: loggedUser } = await loginRequest(username, 'certamen123');

    await request(app)
      .post('/api/logout')
      .set('X-Authorization', loggedUser.token);

    expect(users.find(user => user.username === username).token).toBeUndefined();
  });
});

describe('Listar Ítems', () => {
  beforeEach(loginAndSetToken);

  test('Lista los ítemes previamente creados', async ({ token }) => {
    const item1 = createToDo({
      id: 'abc-1',
      title: 'TODO 1',
      completed: false
    });
    const item2 = createToDo({
      id: 'abc-2',
      title: 'TODO 2',
      completed: true
    });

    const { body: list } = await request(app)
      .get('/api/todos')
      .set('X-Authorization', token)
      .expect('Content-Type', /application\/json/)
      .expect(200);

    expect.soft(list)
      .an('array')
      .of.length(2)
      .and.deep.includes(item1)
      .and.deep.includes(item2);
  });
});

describe('Obtener Ítem', () => {
  beforeEach(loginAndSetToken);

  test('Obtiene un ítem previamente creado', async ({ token }) => {
    const createdItem = createToDo({
      id: 'abc-1',
      title: 'TODO',
      completed: false
    });

    const { body: item } = await request(app)
      .get('/api/todos/' + createdItem.id)
      .set('X-Authorization', token)
      .expect('Content-Type', /application\/json/)
      .expect(200);

    expect.soft(item).toStrictEqual(createdItem);
  });

  test('Devuelve código de estado 404 cuando un ítem no existe', async ({ token }) => {
    await request(app)
      .get('/api/todos/no-existe')
      .set('X-Authorization', token)
      .expect(404);
  });
});

describe('Creación de Ítem', () => {
  beforeEach(loginAndSetToken);

  test('Crea un item correctamente', async ({ token }) => {
    const title = 'TODO TEST';
    const { body } = await createItemRequest(title, token)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    expect.soft(body.id).toBeTypeOf('string');
    expect.soft(body.title).toBe(title);
    expect.soft(body.completed).toBe(false);
  });

  test('Devuelve código de estado 400 cuando no se envían los datos apropiados', async ({ token }) => {
    await createItemRequest(false, token).expect(400);
    await createItemRequest(undefined, token).expect(400);
    await createItemRequest(123, token).expect(400);
  });

  test('Persiste el item creado previamente', async ({ token }) => {
    const { body: newToDo } = await createItemRequest('TODO TEST 2', token);

    expect.soft(todos).deep.includes(newToDo);
  });
});

describe('Actualización de Ítem', () => {
  beforeEach(loginAndSetToken);

  test('Actualiza un item correctamente', async ({ token }) => {
    createToDo({
      id: 'abc-1',
      title: 'TODO 1',
      completed: false
    });

    const { body: itemResponse1 } = await updateItemRequest('abc-1', { title: 'NEW TODO 1' }, token)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect.soft(itemResponse1).toStrictEqual({
      id: 'abc-1',
      title: 'NEW TODO 1',
      completed: false
    });
    expect.soft(itemResponse1).toStrictEqual(todos.find(todo => todo.id === 'abc-1'));

    const { body: itemResponse2 } = await updateItemRequest('abc-1', { completed: true }, token);

    expect.soft(itemResponse2).toStrictEqual({
      id: 'abc-1',
      title: 'NEW TODO 1',
      completed: true
    });
    expect.soft(itemResponse2).toStrictEqual(todos.find(todo => todo.id === 'abc-1'));
  });

  test('Devuelve código de estado 400 cuando no se envían los datos apropiados', async ({ token }) => {
    createToDo({
      id: 'abc-1',
      title: 'TODO 1',
      completed: false
    });

    await updateItemRequest('abc-1', { title: 123 }, token)
      .expect(400);
    await updateItemRequest('abc-1', { completed: 'HELLO WORLD!' }, token)
      .expect(400);
  });

  test('Devuelve código de estado 404 cuando el ítem a actualizar no existe', ({ token }) => {
    return request(app)
      .put('/api/todos/not-exists')
      .set('X-Authorization', token)
      .send({
        title: 'UPDATED TODO',
        completed: true
      })
      .expect(404);
  });
});

describe('Borrado de Ítem', () => {
  beforeEach(loginAndSetToken);

  test('Borra un item correctamente', async ({ token }) => {
    const toDo = createToDo({
      id: 'abc-1',
      title: 'TODO',
      completed: true
    });

    await request(app)
      .delete('/api/todos/' + toDo.id)
      .set('X-Authorization', token)
      .expect(204);

    expect.soft(todos).not.deep.include(toDo);
  });

  test('Devuelve código de estado 404 cuando el ítem a borrar no existe', ({ token }) => {
    return request(app)
      .delete('/api/todos/not-exists')
      .set('X-Authorization', token)
      .expect(404);
  });
});