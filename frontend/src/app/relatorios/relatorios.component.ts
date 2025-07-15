import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';
import * as jsPDF from 'jspdf';

export interface Paciente {
  id?: number;
  nome: string;
  mae: string;
  nascimento: string;
  sexo: string;
  estadoCivil: string;
  profissao: string;
  escolaridade: string;
  raca: string;
  endereco: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  acompanhante: string;
  procedencia: string;
  created_at?: string;
  updated_at?: string;
}

export interface FiltrosRelatorio {
  dataInicio?: string;
  dataFim?: string;
  sexo?: string;
  municipio?: string;
  uf?: string;
  estadoCivil?: string;
  escolaridade?: string;
}

@Component({
  selector: 'app-relatorios',
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.scss'],
  standalone: false
})
export class RelatoriosComponent implements OnInit {
  filtrosForm: FormGroup;
  pacientes: Paciente[] = [];
  pacientesFiltrados: Paciente[] = [];
  carregando = false;

  // Opções para os filtros
  opcoesSexo = [
    { value: '', label: 'Todos' },
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' }
  ];

  opcoesUF = [
    { value: '', label: 'Todos' },
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' }
  ];

  opcoesEstadoCivil = [
    { value: '', label: 'Todos' },
    { value: 'Solteiro(a)', label: 'Solteiro(a)' },
    { value: 'Casado(a)', label: 'Casado(a)' },
    { value: 'Divorciado(a)', label: 'Divorciado(a)' },
    { value: 'Viúvo(a)', label: 'Viúvo(a)' },
    { value: 'União Estável', label: 'União Estável' }
  ];

  opcoesEscolaridade = [
    { value: '', label: 'Todos' },
    { value: 'Analfabeto', label: 'Analfabeto' },
    { value: 'Ensino Fundamental Incompleto', label: 'Ensino Fundamental Incompleto' },
    { value: 'Ensino Fundamental Completo', label: 'Ensino Fundamental Completo' },
    { value: 'Ensino Médio Incompleto', label: 'Ensino Médio Incompleto' },
    { value: 'Ensino Médio Completo', label: 'Ensino Médio Completo' },
    { value: 'Ensino Superior Incompleto', label: 'Ensino Superior Incompleto' },
    { value: 'Ensino Superior Completo', label: 'Ensino Superior Completo' },
    { value: 'Pós-graduação', label: 'Pós-graduação' }
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.fb.group({
      dataInicio: [''],
      dataFim: [''],
      sexo: [''],
      municipio: [''],
      uf: [''],
      estadoCivil: [''],
      escolaridade: ['']
    });
  }

  ngOnInit() {
    this.carregarPacientes();
  }

  carregarPacientes() {
    this.carregando = true;
    const token = this.authService.getToken();
    this.http.get<any>(`${environment.apiUrl}/pacientes/reports`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.pacientes = response.data || [];
        this.aplicarFiltros();
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pacientes:', error);
        this.carregando = false;
      }
    });
  }

  aplicarFiltros() {
    this.carregando = true;
    const filtros = this.filtrosForm.value;
    const token = this.authService.getToken();
    const params = new URLSearchParams();
    if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
    if (filtros.sexo) params.append('sexo', filtros.sexo);
    if (filtros.municipio) params.append('municipio', filtros.municipio);
    if (filtros.uf) params.append('uf', filtros.uf);
    if (filtros.estadoCivil) params.append('estadoCivil', filtros.estadoCivil);
    if (filtros.escolaridade) params.append('escolaridade', filtros.escolaridade);
    const queryString = params.toString();
    const url = `${environment.apiUrl}/pacientes/reports${queryString ? '?' + queryString : ''}`;
    this.http.get<any>(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.pacientesFiltrados = response.data || [];
        this.carregando = false;
        console.log(`Filtros aplicados: ${this.pacientesFiltrados.length} pacientes encontrados`);
      },
      error: (error) => {
        console.error('Erro ao aplicar filtros:', error);
        this.carregando = false;
      }
    });
  }

  limparFiltros() {
    this.filtrosForm.reset();
    this.aplicarFiltros();
  }

  gerarRelatorioSimples() {
    const doc = new jsPDF.jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let currentY = 20;

    // Título
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Pacientes', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Informações do relatório
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data de emissão: ${new Date().toLocaleDateString('pt-BR')}`, 20, currentY);
    currentY += 5;
    doc.text(`Total de pacientes: ${this.pacientesFiltrados.length}`, 20, currentY);
    currentY += 15;

    // Cabeçalho da tabela
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    const headers = ['Nome', 'Sexo', 'Nascimento', 'Município', 'UF'];
    const colWidths = [60, 15, 25, 50, 15];
    let currentX = 20;

    headers.forEach((header, index) => {
      doc.text(header, currentX, currentY);
      currentX += colWidths[index];
    });
    currentY += 5;

    // Linha do cabeçalho
    doc.line(20, currentY, pageWidth - 20, currentY);
    currentY += 5;

    // Dados dos pacientes
    doc.setFont('helvetica', 'normal');
    this.pacientesFiltrados.forEach(paciente => {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }

      currentX = 20;
      const dados = [
        paciente.nome.substring(0, 25),
        paciente.sexo,
        new Date(paciente.nascimento).toLocaleDateString('pt-BR'),
        paciente.municipio.substring(0, 20),
        paciente.uf
      ];

      dados.forEach((dado, index) => {
        doc.text(dado, currentX, currentY);
        currentX += colWidths[index];
      });
      currentY += 5;
    });

    doc.save('relatorio-pacientes-simples.pdf');
  }

  gerarRelatorioDetalhado() {
    const doc = new jsPDF.jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let currentY = 20;

    // Título
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório Detalhado de Pacientes', pageWidth / 2, currentY, { align: 'center' });
    currentY += 15;

    // Informações do relatório
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data de emissão: ${new Date().toLocaleDateString('pt-BR')}`, 20, currentY);
    currentY += 5;
    doc.text(`Total de pacientes: ${this.pacientesFiltrados.length}`, 20, currentY);
    currentY += 15;

    // Dados detalhados de cada paciente
    doc.setFontSize(9);
    this.pacientesFiltrados.forEach((paciente, index) => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      // Separador entre pacientes
      if (index > 0) {
        doc.line(20, currentY, pageWidth - 20, currentY);
        currentY += 5;
      }

      // Dados do paciente
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${paciente.nome}`, 20, currentY);
      currentY += 5;

      doc.setFont('helvetica', 'normal');
      doc.text(`Mãe: ${paciente.mae}`, 20, currentY);
      currentY += 4;
      doc.text(`Nascimento: ${new Date(paciente.nascimento).toLocaleDateString('pt-BR')} | Sexo: ${paciente.sexo}`, 20, currentY);
      currentY += 4;
      doc.text(`Estado Civil: ${paciente.estadoCivil} | Escolaridade: ${paciente.escolaridade}`, 20, currentY);
      currentY += 4;
      doc.text(`Endereço: ${paciente.endereco}, ${paciente.bairro}`, 20, currentY);
      currentY += 4;
      doc.text(`Município: ${paciente.municipio} - ${paciente.uf} | CEP: ${paciente.cep}`, 20, currentY);
      currentY += 4;
      doc.text(`Profissão: ${paciente.profissao} | Raça: ${paciente.raca}`, 20, currentY);
      currentY += 8;
    });

    doc.save('relatorio-pacientes-detalhado.pdf');
  }

  imprimirResumo() {
    const printContent = this.gerarHtmlResumo();
    const printWindow = window.open('', '_blank');

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Resumo de Pacientes</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { text-align: center; color: #333; }
              .info { margin-bottom: 20px; }
              table { width: 100vw !important; border-collapse: collapse; margin-top: 20px; page-break-inside: auto; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; word-break: break-word; }
              th { background-color: #f2f2f2; font-weight: bold; }
              tr { page-break-inside: avoid; page-break-after: auto; }
              @media print { body { margin: 0; } table { width: 100vw !important; page-break-inside: auto; } tr { page-break-inside: avoid; page-break-after: auto; } th, td { word-break: break-word; } }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }

  getQuantidadeFeminino(): number {
    return this.pacientesFiltrados.filter(p => p.sexo === 'F').length;
  }

  getQuantidadeMasculino(): number {
    return this.pacientesFiltrados.filter(p => p.sexo === 'M').length;
  }

  getQuantidadeMunicipios(): number {
    return new Set(this.pacientesFiltrados.map(p => p.municipio)).size;
  }

  private gerarHtmlResumo(): string {
    let html = `
      <h1>Resumo de Pacientes</h1>
      <div class="info">
        <p><strong>Data de emissão:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        <p><strong>Total de pacientes:</strong> ${this.pacientesFiltrados.length}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Sexo</th>
            <th>Nascimento</th>
            <th>Município</th>
            <th>UF</th>
          </tr>
        </thead>
        <tbody>
    `;

    this.pacientesFiltrados.forEach(paciente => {
      html += `
        <tr>
          <td>${paciente.nome}</td>
          <td>${paciente.sexo}</td>
          <td>${new Date(paciente.nascimento).toLocaleDateString('pt-BR')}</td>
          <td>${paciente.municipio}</td>
          <td>${paciente.uf}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    return html;
  }
}
