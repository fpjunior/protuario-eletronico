import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from '../../environments/environment';

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
  styleUrls: ['./pacientes.component.scss']
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
  apiUrl = environment.apiUrl;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<Paciente>([]);

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.listarPacientes();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  listarPacientes() {
    this.loading = true;
    this.http.get<Paciente[]>(
      this.apiUrl).subscribe({
        next: (pacientes) => {
          this.pacientes = pacientes;
          this.dataSource.data = pacientes;
          console.log('Pacientes carregados:', this.pacientes);
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
}
