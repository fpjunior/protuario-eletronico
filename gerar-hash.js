const bcrypt = require('bcryptjs');

async function generateHash() {
  const senha = '123456';
  const hash = await bcrypt.hash(senha, 12);
  console.log('Hash gerado:', hash);
  
  // Testar se o hash funciona
  const valido = await bcrypt.compare(senha, hash);
  console.log('Hash válido:', valido);
}

generateHash();
