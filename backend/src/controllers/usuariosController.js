import Usuario from '../models/Usuario.js';

const usuariosController = {
  async list(req, res) {
    try {
      const usuarios = await Usuario.findAll();
      res.json(usuarios.map(u => u.toPublicJSON()));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const { email, senha, nome, nivel } = req.body;
      if (!email || !senha || !nome) {
        return res.status(400).json({ error: 'Campos obrigatórios: email, senha, nome' });
      }
      const usuario = await Usuario.create({ email, senha, nome, nivel });
      res.status(201).json(usuario.toPublicJSON());
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // (Opcional) Atualizar e deletar usuários podem ser implementados conforme necessidade
};

export default usuariosController;
