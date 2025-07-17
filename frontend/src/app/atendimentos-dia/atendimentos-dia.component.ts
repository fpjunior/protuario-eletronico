import { Component, OnInit } from '@angular/core';
import { AtendimentoService } from '../services/atendimento.service';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-atendimentos-dia',
  templateUrl: './atendimentos-dia.component.html',
  standalone: false,
  providers: [DatePipe]
})
export class AtendimentosDiaComponent implements OnInit {
  atendimentos: any[] = [];
  filtro = '';

  constructor(private atendimentoService: AtendimentoService) {}

  ngOnInit() {
    this.carregarAtendimentos();
  }

  carregarAtendimentos() {
    // Exemplo: buscar atendimentos do dia
    this.atendimentoService.listarAtendimentosDoDia().subscribe((dados: any[]) => {
      this.atendimentos = dados;
    });
  }

  get atendimentosFiltrados() {
    if (!this.filtro) return this.atendimentos;
    return this.atendimentos.filter(a =>
      a.paciente_nome?.toLowerCase().includes(this.filtro.toLowerCase()) ||
      a.motivo?.toLowerCase().includes(this.filtro.toLowerCase())
    );
  }
}
