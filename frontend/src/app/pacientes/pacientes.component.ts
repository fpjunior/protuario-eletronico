import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
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
}

@Component({
    selector: 'app-pacientes',
    templateUrl: './pacientes.component.html',
    styleUrls: ['./pacientes.component.scss'],
    standalone: false
})
export class PacientesComponent implements OnInit, AfterViewInit {
  pacientes: Paciente[] = [];
  novoPaciente: Paciente = {
    nome: '',
    mae: '',
    nascimento: '',
    sexo: '',
    estadoCivil: '',
    profissao: '',
    escolaridade: '',
    raca: '',
    endereco: '',
    bairro: '',
    municipio: '',
    uf: '',
    cep: '',
    acompanhante: '',
    procedencia: ''
  };
  pacienteEditando: Paciente | null = null;
  filtroNome: string = '';
  exibirFormulario = false;
  loading = false;
  colunas = [
    'acoes', 'nome', 'mae', 'nascimento', 'sexo', 'estadoCivil', 'profissao', 'escolaridade', 'raca',
    'endereco', 'bairro', 'municipio', 'uf', 'cep', 'acompanhante', 'procedencia'
  ];
  apiUrl = environment.apiUrl + '/pacientes'; // já está correto

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<Paciente>([]);
  currentUser: any = null;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.listarPacientes();
    // Carregar informações do usuário atual
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });

    // Configurar filtro personalizado para a tabela
    this.dataSource.filterPredicate = (paciente: Paciente, filter: string) => {
      return paciente.nome.toLowerCase().includes(filter.toLowerCase());
    };
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  listarPacientes() {
    this.loading = true;
    this.http.get<Paciente[]>(this.apiUrl).subscribe({
      next: (pacientes) => {
        this.pacientes = pacientes;
        this.dataSource.data = pacientes;
        // Garante que o paginator é associado após atualizar os dados
        setTimeout(() => {
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pacientes:', error);
        this.loading = false;
      }
    });
  }

  mostrarFormularioCadastro() {
    this.exibirFormulario = true;
    this.pacienteEditando = null;
    this.novoPaciente = { nome: '', mae: '', nascimento: '', sexo: '', estadoCivil: '', profissao: '', escolaridade: '', raca: '', endereco: '', bairro: '', municipio: '', uf: '', cep: '', acompanhante: '', procedencia: '' };
  }

  adicionarPaciente() {
    if (this.pacienteEditando && this.pacienteEditando.id) {
      // Confirmação antes de atualizar
      if (confirm('Tem certeza que deseja atualizar este registro?')) {
        this.loading = true;
        this.http.put<Paciente>(`${this.apiUrl}/${this.pacienteEditando.id}`, this.novoPaciente).subscribe({
          next: () => {
            this.novoPaciente = { nome: '', mae: '', nascimento: '', sexo: '', estadoCivil: '', profissao: '', escolaridade: '', raca: '', endereco: '', bairro: '', municipio: '', uf: '', cep: '', acompanhante: '', procedencia: '' };
            this.pacienteEditando = null;
            this.exibirFormulario = false;
            this.listarPacientes();
          },
          error: (error) => {
            console.error('Erro ao atualizar paciente:', error);
            this.loading = false;
          }
        });
      }
    } else {
      // Adicionar novo paciente
      this.loading = true;
      this.http.post<Paciente>(this.apiUrl, this.novoPaciente).subscribe({
        next: () => {
          this.novoPaciente = { nome: '', mae: '', nascimento: '', sexo: '', estadoCivil: '', profissao: '', escolaridade: '', raca: '', endereco: '', bairro: '', municipio: '', uf: '', cep: '', acompanhante: '', procedencia: '' };
          this.exibirFormulario = false;
          this.listarPacientes();
        },
        error: (error) => {
          console.error('Erro ao adicionar paciente:', error);
          this.loading = false;
        }
      });
    }
  }

  editarPaciente(paciente: Paciente) {
    this.router.navigate(['/pacientes/novo'], { state: { paciente } });
  }

  removerPaciente(id: number) {
    if (confirm('Tem certeza que deseja remover este paciente?')) {
      this.loading = true;
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.listarPacientes();
          if (this.pacienteEditando && this.pacienteEditando.id === id) {
            this.pacienteEditando = null;
            this.novoPaciente = { nome: '', mae: '', nascimento: '', sexo: '', estadoCivil: '', profissao: '', escolaridade: '', raca: '', endereco: '', bairro: '', municipio: '', uf: '', cep: '', acompanhante: '', procedencia: '' };
          }
        },
        error: (error) => {
          console.error('Erro ao remover paciente:', error);
          this.loading = false;
        }
      });
    }
  }

  cancelarEdicao() {
    this.pacienteEditando = null;
    this.novoPaciente = { nome: '', mae: '', nascimento: '', sexo: '', estadoCivil: '', profissao: '', escolaridade: '', raca: '', endereco: '', bairro: '', municipio: '', uf: '', cep: '', acompanhante: '', procedencia: '' };
    this.exibirFormulario = false;
  }

  get pacientesFiltrados(): Paciente[] {
    if (!this.filtroNome.trim()) return this.pacientes;
    return this.pacientes.filter(p =>
      p.nome.toLowerCase().includes(this.filtroNome.trim().toLowerCase())
    );
  }

  // Método para aplicar filtro na tabela
  aplicarFiltro() {
    this.dataSource.filter = this.filtroNome.trim();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Método para gerar PDF do cadastro do paciente
  imprimirPacientePDF(paciente: Paciente) {
    const doc = new jsPDF.jsPDF();

    // Configuração das fontes e cores
    doc.setFontSize(20);
    doc.setTextColor(40);

    // Cabeçalho
    doc.text('e-Prontuário Aliança-PE', 20, 20);
    doc.setFontSize(14);
    doc.text('Ficha de Cadastro do Paciente', 20, 30);

    // Linha separadora
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // Dados do paciente
    doc.setFontSize(12);
    doc.setTextColor(0);

    let yPosition = 50;
    const lineHeight = 8;

    // Dados pessoais
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS PESSOAIS', 20, yPosition);
    yPosition += lineHeight + 2;

    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${paciente.nome}`, 20, yPosition);
    yPosition += lineHeight;

    doc.text(`Nome da Mãe: ${paciente.mae}`, 20, yPosition);
    yPosition += lineHeight;

    doc.text(`Data de Nascimento: ${new Date(paciente.nascimento).toLocaleDateString('pt-BR')}`, 20, yPosition);
    yPosition += lineHeight;

    doc.text(`Sexo: ${this.formatarSexo(paciente.sexo)}`, 20, yPosition);
    yPosition += lineHeight;

    if (paciente.estadoCivil) {
      doc.text(`Estado Civil: ${paciente.estadoCivil}`, 20, yPosition);
      yPosition += lineHeight;
    }

    if (paciente.profissao) {
      doc.text(`Profissão: ${paciente.profissao}`, 20, yPosition);
      yPosition += lineHeight;
    }

    if (paciente.escolaridade) {
      doc.text(`Escolaridade: ${paciente.escolaridade}`, 20, yPosition);
      yPosition += lineHeight;
    }

    if (paciente.raca) {
      doc.text(`Raça/Cor: ${paciente.raca}`, 20, yPosition);
      yPosition += lineHeight + 5;
    }

    // Endereço
    doc.setFont('helvetica', 'bold');
    doc.text('ENDEREÇO', 20, yPosition);
    yPosition += lineHeight + 2;

    doc.setFont('helvetica', 'normal');
    if (paciente.endereco) {
      doc.text(`Endereço: ${paciente.endereco}`, 20, yPosition);
      yPosition += lineHeight;
    }

    if (paciente.bairro) {
      doc.text(`Bairro: ${paciente.bairro}`, 20, yPosition);
      yPosition += lineHeight;
    }

    if (paciente.municipio) {
      doc.text(`Município: ${paciente.municipio}`, 20, yPosition);
      yPosition += lineHeight;
    }

    if (paciente.uf) {
      doc.text(`UF: ${paciente.uf}`, 20, yPosition);
      yPosition += lineHeight;
    }

    if (paciente.cep) {
      doc.text(`CEP: ${paciente.cep}`, 20, yPosition);
      yPosition += lineHeight + 5;
    }

    // Informações adicionais
    if (paciente.acompanhante || paciente.procedencia) {
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMAÇÕES ADICIONAIS', 20, yPosition);
      yPosition += lineHeight + 2;

      doc.setFont('helvetica', 'normal');
      if (paciente.acompanhante) {
        doc.text(`Acompanhante: ${paciente.acompanhante}`, 20, yPosition);
        yPosition += lineHeight;
      }

      if (paciente.procedencia) {
        doc.text(`Procedência: ${paciente.procedencia}`, 20, yPosition);
        yPosition += lineHeight;
      }
    }

    // Rodapé
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, pageHeight - 20);
    doc.text('Sistema e-Prontuário Aliança-PE', 20, pageHeight - 10);

    // Salvar o PDF
    const nomeArquivo = `paciente_${paciente.nome.replace(/\s+/g, '_').toLowerCase()}_${new Date().getTime()}.pdf`;
    doc.save(nomeArquivo);
  }

  // Método auxiliar para formatar sexo
  private formatarSexo(sexo: string): string {
    switch (sexo) {
      case 'M': return 'Masculino';
      case 'F': return 'Feminino';
      case 'I': return 'Ignorado';
      default: return sexo;
    }
  }

  logout() {
    this.authService.logout();
  }
}
