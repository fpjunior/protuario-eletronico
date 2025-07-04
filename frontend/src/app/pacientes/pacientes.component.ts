import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

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
  colunas = [
    'acoes', 'nome', 'mae', 'nascimento', 'sexo', 'estadoCivil', 'profissao', 'escolaridade', 'raca',
    'endereco', 'bairro', 'municipio', 'uf', 'cep', 'acompanhante', 'procedencia'
  ];
  // apiUrl = 'http://localhost:3001/pacientes';

 apiUrl = 'https://protuario-eletronico-1.onrender.com/pacientes';

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
    this.http.get<Paciente[]>(
      this.apiUrl).subscribe(
        pacientes => {
          this.pacientes = pacientes;
          this.dataSource.data = pacientes;
          console.log('Pacientes carregados:', this.pacientes);
        }
      );
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
        this.http.put<Paciente>(`${this.apiUrl}/${this.pacienteEditando.id}`, this.novoPaciente).subscribe(() => {
          this.novoPaciente = { nome: '', mae: '', nascimento: '', sexo: '', estadoCivil: '', profissao: '', escolaridade: '', raca: '', endereco: '', bairro: '', municipio: '', uf: '', cep: '', acompanhante: '', procedencia: '' };
          this.pacienteEditando = null;
          this.exibirFormulario = false;
          this.listarPacientes();
        });
      }
    } else {
      // Adicionar novo paciente
      this.http.post<Paciente>(this.apiUrl, this.novoPaciente).subscribe(() => {
        this.novoPaciente = { nome: '', mae: '', nascimento: '', sexo: '', estadoCivil: '', profissao: '', escolaridade: '', raca: '', endereco: '', bairro: '', municipio: '', uf: '', cep: '', acompanhante: '', procedencia: '' };
        this.exibirFormulario = false;
        this.listarPacientes();
      });
    }
  }

  editarPaciente(paciente: Paciente) {
    this.router.navigate(['/pacientes/novo'], { state: { paciente } });
  }

  removerPaciente(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
      this.listarPacientes();
      if (this.pacienteEditando && this.pacienteEditando.id === id) {
        this.pacienteEditando = null;
        this.novoPaciente = { nome: '', mae: '', nascimento: '', sexo: '', estadoCivil: '', profissao: '', escolaridade: '', raca: '', endereco: '', bairro: '', municipio: '', uf: '', cep: '', acompanhante: '', procedencia: '' };
      }
    });
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
