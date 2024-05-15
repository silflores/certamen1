import { scrypt } from 'node:crypto';
export const users = [
    {
      username: 'admin',
      name: 'Gustavo Alfredo Marín Sáez',
      password: '1b6ce880ac388eb7fcb6bcaf95e20083:341dfbbe86013c940c8e898b437aa82fe575876f2946a2ad744a0c51501c7dfe6d7e5a31c58d2adc7a7dc4b87927594275ca235276accc9f628697a4c00b4e01' // certamen123
    },
    {
      username: 'user',
      name: 'Gandalf',
      password: 'cc46a0a0a1320b7dd69fe26c288c9f32:bcd6c1505c8973be89c75d24184ecb9a2edb54913a18e955cfdd5a65eb63f933d2ad15acceebeccea494f4481522a074e1d60d0d58ab8ecad380988ee8ec7684'
    }
  ]

export function getuser(username) {
    return  users.find(user => user.username === username) ?? null;
  }

export function checkPassword(password, hash) {
    const [salt, key] = hash.split(':')
  
    return new Promise((resolve) => {
      scrypt(password, salt, 64, (err, derivedKey) => {
        if(err) {
          return resolve(false) // or throw mmm...
        }
  
        resolve(derivedKey.toString('hex') === key)
      })
    })
  }

// Obtener un Usuario en base a un token
export const getUsuarioAutentificar = (token) => {
  return users.find(user => user.token === token);
};


// Desloguear a un Usuario en base al token de autenticación
export const logout = (token) => {
  const index = users.findIndex(user => user.token === token);
  if (index !== -1) {
    //delete users.token;
    users[index].token = undefined;
  }
};



  
 