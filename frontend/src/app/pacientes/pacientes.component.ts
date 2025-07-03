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
    this.http.post<Paciente>(this.apiUrl, this.novoPaciente).subscribe(() => {
      this.novoPaciente = {
        nome: '', mae: '', nascimento: '', sexo: '', estadoCivil: '', profissao: '', escolaridade: '', raca: '', endereco: '', bairro: '', municipio: '', uf: '', cep: '', acompanhante: '', procedencia: '', cpf: ''
      };
      this.listarPacientes();
    });
  }

  removerPaciente(id: number) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => this.listarPacientes());
  }
}
