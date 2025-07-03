import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
  cpf: string;
}

@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.scss']
})
export class PacientesComponent implements OnInit {
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
    procedencia: '',
    cpf: ''
  };
  pacienteEditando: Paciente | null = null;
  filtroNome: string = '';
  colunas = [
    'nome', 'mae', 'nascimento', 'sexo', 'estadoCivil', 'profissao', 'escolaridade', 'raca',
    'endereco', 'bairro', 'municipio', 'uf', 'cep', 'acompanhante', 'procedencia', 'acoes'
  ];
  apiUrl = 'http://localhost:3001/pacientes';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.listarPacientes();
  }

  listarPacientes() {
    this.http.get<Paciente[]>(
      this.apiUrl).subscribe(
        pacientes => {
          this.pacientes = pacientes;
          console.log('Pacientes carregados:', this.pacientes);
        }
      );
  }

  adicionarPaciente() {
    if (this.pacienteEditando && this.pacienteEditando.id) {
      // Confirmação antes de atualizar
      if (confirm('Tem certeza que deseja atualizar este registro?')) {
        this.http.put<Paciente>(`${this.apiUrl}/${this.pacienteEditando.id}`, this.novoPaciente).subscribe(() => {
          this.novoPaciente = { nome: '', mae: '', nascimento: '', sexo: '', estadoCivil: '', profissao: '', escolaridade: '', raca: '', endereco: '', bairro: '', municipio: '', uf: '', cep: '', acompanhante: '', procedencia: '', cpf: '' };
          this.pacienteEditando = null;
          this.listarPacientes();
        });
      }
    } else {
      // Adicionar novo paciente
      this.http.post<Paciente>(this.apiUrl, this.novoPaciente).subscribe(() => {
        this.novoPaciente = { nome: '', mae: '', nascimento: '', sexo: '', estadoCivil: '', profissao: '', escolaridade: '', raca: '', endereco: '', bairro: '', municipio: '', uf: '', cep: '', acompanhante: '', procedencia: '', cpf: '' };
        this.listarPacientes();
      });
    }
  }

  editarPaciente(paciente: Paciente) {
    this.pacienteEditando = paciente;
    this.novoPaciente = { ...paciente };
  }

  removerPaciente(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
      this.listarPacientes();
      if (this.pacienteEditando && this.pacienteEditando.id === id) {
        this.pacienteEditando = null;
        this.novoPaciente = { nome: '', mae: '', nascimento: '', sexo: '', estadoCivil: '', profissao: '', escolaridade: '', raca: '', endereco: '', bairro: '', municipio: '', uf: '', cep: '', acompanhante: '', procedencia: '', cpf: '' };
      }
    });
  }

  cancelarEdicao() {
    this.pacienteEditando = null;
    this.novoPaciente = { nome: '', mae: '', nascimento: '', sexo: '', estadoCivil: '', profissao: '', escolaridade: '', raca: '', endereco: '', bairro: '', municipio: '', uf: '', cep: '', acompanhante: '', procedencia: '', cpf: '' };
  }

  get pacientesFiltrados(): Paciente[] {
    if (!this.filtroNome.trim()) return this.pacientes;
    return this.pacientes.filter(p =>
      p.nome.toLowerCase().includes(this.filtroNome.trim().toLowerCase())
    );
  }
}
