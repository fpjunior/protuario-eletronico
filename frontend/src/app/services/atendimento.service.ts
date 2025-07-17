import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AtendimentoService {
  constructor(private http: HttpClient) {}

  registrarAtendimento(dto: { pacienteId: number; motivo: string; observacoes?: string }) {
    return this.http.post('http://localhost:3001/api/atendimentos', dto);
  }
}
