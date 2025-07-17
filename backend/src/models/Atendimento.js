import db from '../config/database.js';

class Atendimento {
  static async criar({ pacienteId, motivo, observacoes }) {
    const status = 'triagem pendente';
    const result = await db.query(
      `INSERT INTO atendimentos (paciente_id, motivo, status, observacoes)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [pacienteId, motivo, status, observacoes || null]
    );
    return result.rows[0];
  }

  static async listarPorPaciente(pacienteId) {
    const result = await db.query(
      `SELECT * FROM atendimentos WHERE paciente_id = $1 ORDER BY data_hora_chegada DESC`,
      [pacienteId]
    );
    return result.rows;
  }
}

export default Atendimento;
