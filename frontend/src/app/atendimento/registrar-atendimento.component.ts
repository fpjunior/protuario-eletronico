import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AtendimentoService } from '../services/atendimento.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registrar-atendimento',
  templateUrl: './registrar-atendimento.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class RegistrarAtendimentoComponent {
  pacienteId: number;
  motivo = '';
  observacoes = '';
  loading = false;
  mensagem = '';

  constructor(
    private atendimentoService: AtendimentoService,
    @Inject(MAT_DIALOG_DATA) public data: { pacienteId: number }
  ) {
    this.pacienteId = data.pacienteId;
  }

  registrar() {
    if (!this.motivo) {
      this.mensagem = 'Motivo é obrigatório.';
      return;
    }
    this.loading = true;
    this.atendimentoService.registrarAtendimento({
      pacienteId: this.pacienteId,
      motivo: this.motivo,
      observacoes: this.observacoes
    }).subscribe({
      next: () => {
        this.mensagem = 'Atendimento registrado com sucesso!';
        this.motivo = '';
        this.observacoes = '';
        this.loading = false;
      },
      error: err => {
        this.mensagem = err.error?.error || 'Erro ao registrar atendimento.';
        this.loading = false;
      }
    });
  }
}
