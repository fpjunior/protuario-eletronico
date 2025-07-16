import express from 'express';
import usuariosController from '../controllers/usuariosController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Apenas admin pode criar/listar usuários
router.get('/', auth(['admin', 'editor']), usuariosController.list);
router.post('/', auth(['admin', 'editor']), usuariosController.create);

export default router;
