import Atendimento from '../models/Atendimento.js';
import db from '../config/database.js';

const registrar = async (req, res) => {
  const { pacienteId, motivo, observacoes } = req.body;
  if (!pacienteId || !motivo) {
    return res.status(400).json({ error: 'pacienteId e motivo são obrigatórios.' });
  }
  // Valida se paciente existe
  const paciente = await db.query('SELECT id FROM pacientes WHERE id = $1', [pacienteId]);
  if (paciente.rowCount === 0) {
    return res.status(404).json({ error: 'Paciente não encontrado.' });
  }
  // Cria atendimento
  const atendimento = await Atendimento.criar({ pacienteId, motivo, observacoes });
  return res.status(201).json(atendimento);
};

const listarPorPaciente = async (req, res) => {
  const pacienteId = req.params.pacienteId;
  const atendimentos = await Atendimento.listarPorPaciente(pacienteId);
  res.json(atendimentos);
};

const listarDoDia = async (req, res) => {
  // Busca atendimentos do dia atual
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0);
  const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
  const result = await db.query(
    `SELECT a.*, p.nome as paciente_nome, p.nascimento as paciente_nascimento
     FROM atendimentos a
     JOIN pacientes p ON p.id = a.paciente_id
     WHERE a.data_hora_chegada BETWEEN $1 AND $2
     ORDER BY a.data_hora_chegada DESC`,
    [inicio, fim]
  );
  res.json(result.rows);
};

export default { registrar, listarPorPaciente, listarDoDia };
