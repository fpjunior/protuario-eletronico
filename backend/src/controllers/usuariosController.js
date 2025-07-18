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

  async update(req, res) {
    try {
      const { id } = req.params;
      const { email, senha, nome, nivel } = req.body;
      if (!email || !nome) {
        return res.status(400).json({ error: 'Campos obrigatórios: email, nome' });
      }
      // Verifica se o email já existe em outro usuário
      const userWithEmail = await Usuario.findByEmail(email);
      if (userWithEmail && userWithEmail.id != id) {
        return res.status(409).json({ error: 'Email já está em uso por outro usuário' });
      }
      // Monta dados para atualização
      const updateData = { email, nome, nivel };
      if (senha) updateData.senha = senha;
      const usuarioAtualizado = await Usuario.update(id, updateData);
      if (!usuarioAtualizado) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      res.json(usuarioAtualizado.toPublicJSON());
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};

export default usuariosController;
