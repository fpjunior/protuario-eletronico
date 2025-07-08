const axios = require('axios');

const backendUrl = 'http://localhost:3001/api';
const admin = { email: 'admin@alianca.com', senha: '123456' };

const nomes = [
  'João Silva', 'Maria Souza', 'Carlos Pereira', 'Ana Lima', 'Paulo Oliveira',
  'Fernanda Costa', 'Lucas Rocha', 'Juliana Martins', 'Rafael Dias', 'Patrícia Mendes',
  'Bruno Teixeira', 'Camila Ramos', 'Eduardo Alves', 'Larissa Barbosa', 'Gabriel Pinto',
  'Amanda Cardoso', 'Vinícius Gomes', 'Beatriz Fernandes', 'Felipe Azevedo', 'Letícia Moreira'
];

const maes = [
  'Maria Silva', 'Ana Souza', 'Clara Pereira', 'Helena Lima', 'Juliana Oliveira',
  'Patrícia Costa', 'Renata Rocha', 'Sandra Martins', 'Luciana Dias', 'Cristina Mendes',
  'Teresa Teixeira', 'Marta Ramos', 'Sônia Alves', 'Paula Barbosa', 'Simone Pinto',
  'Eliane Cardoso', 'Denise Gomes', 'Cecília Fernandes', 'Adriana Azevedo', 'Tatiane Moreira'
];

async function main() {
  try {
    // Login para obter token
    const login = await axios.post(`${backendUrl}/login`, admin);
    const token = login.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    for (let i = 0; i < 20; i++) {
      // Garante nome e nascimento únicos para evitar duplicidade
      const paciente = {
        nome: nomes[i] + ' ' + (100 + i),
        mae: maes[i],
        nascimento: `1990-01-${(10 + i).toString().padStart(2, '0')}`,
        sexo: i % 2 === 0 ? 'M' : 'F',
        estadoCivil: 'Solteiro',
        profissao: 'Profissional',
        escolaridade: 'Superior',
        raca: 'Branca',
        endereco: `Rua ${i+1}, Centro`,
        bairro: 'Centro',
        municipio: 'Cidade Exemplo',
        uf: 'SP',
        cep: `01${(i+1).toString().padStart(3, '0')}-000`,
        acompanhante: '',
        procedencia: 'Residência'
      };
      try {
        const res = await axios.post(`${backendUrl}/pacientes`, paciente, { headers });
        console.log(`Paciente ${paciente.nome} cadastrado com id ${res.data.id}`);
      } catch (err) {
        console.error(`Erro ao cadastrar ${paciente.nome}:`, err.response?.data || err.message);
      }
    }
  } catch (err) {
    console.error('Erro no login:', err.response?.data || err.message);
  }
}

main();
