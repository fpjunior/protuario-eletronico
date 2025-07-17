import { Component } from '@angular/core';
// Import necessário para o modal
// import { PacientesFormComponent } from '../pacientes/pacientes-form.component';

@Component({
  selector: 'app-novo-atendimento',
  templateUrl: './novo-atendimento.component.html',
  standalone: false,
})
export class NovoAtendimentoComponent {
  filtroPaciente: string = '';
  pacientesFiltrados: any[] = [];
  pacienteSelecionado: any = null;
  motivo: string = '';
  observacoes: string = '';
  mensagem: string = '';

  exibirCadastroPaciente: boolean = false;

  // Simulação de pacientes (substitua por chamada ao serviço real)
  pacientes: any[] = [
    { nome: 'João Silva', nascimento: new Date(1980, 5, 20) },
    { nome: 'Maria Souza', nascimento: new Date(1992, 10, 3) },
    { nome: 'Carlos Oliveira', nascimento: new Date(1975, 2, 15) }
  ];

  ngOnInit() {
    this.filtrarPacientes();
  }

  abrirCadastroPaciente() {
    this.exibirCadastroPaciente = true;
  }

  fecharCadastroPaciente() {
    this.exibirCadastroPaciente = false;
  }

  filtrarPacientes() {
    const filtro = this.filtroPaciente?.toLowerCase() || '';
    this.pacientesFiltrados = filtro
      ? this.pacientes.filter(p => p.nome.toLowerCase().includes(filtro))
      : [];
  }

  selecionarPaciente(paciente: any) {
    this.pacienteSelecionado = paciente;
    this.filtroPaciente = paciente.nome;
    this.pacientesFiltrados = [];
  }

  registrar() {
    if (!this.pacienteSelecionado || !this.motivo) {
      this.mensagem = 'Selecione um paciente e informe o motivo.';
      return;
    }
    // Aqui você faria a chamada ao backend para registrar o atendimento
    this.mensagem = 'Atendimento registrado com sucesso!';
    // Limpar campos
    this.motivo = '';
    this.observacoes = '';
    this.pacienteSelecionado = null;
    this.filtroPaciente = '';
    this.pacientesFiltrados = [];
  }

  // Atualizar lista de pacientes filtrados ao digitar
  onFiltroPacienteChange() {
    this.filtrarPacientes();
  }
}
