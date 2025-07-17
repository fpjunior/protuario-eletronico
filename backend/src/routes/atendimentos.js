import express from 'express';
import controller from '../controllers/atendimentosController.js';

const router = express.Router();
router.post('/', controller.registrar);
router.get('/:pacienteId', controller.listarPorPaciente);

export default router;
