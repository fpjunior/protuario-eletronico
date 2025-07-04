import { Component, OnInit } from '@angular/core';
import { Paciente } from './pacientes.component';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pacientes-form',
  templateUrl: './pacientes-form.component.html',
  styleUrls: ['./pacientes.component.scss']
})
export class PacientesFormComponent implements OnInit {
  pacienteEditando: Paciente | null = null;
  novoPaciente: Paciente = {
    nome: '', mae: '', nascimento: '', sexo: '', estadoCivil: '', profissao: '', escolaridade: '', raca: '', endereco: '', bairro: '', municipio: '', uf: '', cep: '', acompanhante: '', procedencia: ''
  };
  // apiUrl = 'http://localhost:3001/pacientes';
  apiUrl = 'https://protuario-eletronico-1.onrender.com/pacientes';

  constructor(private router: Router, private http: HttpClient) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state && nav.extras.state['paciente']) {
      this.pacienteEditando = nav.extras.state['paciente'];
      this.novoPaciente = {
        id: this.pacienteEditando?.id,
        nome: this.pacienteEditando?.nome || '',
        mae: this.pacienteEditando?.mae || '',
        nascimento: this.pacienteEditando?.nascimento || '',
        sexo: this.pacienteEditando?.sexo || '',
        estadoCivil: this.pacienteEditando?.estadoCivil || '',
        profissao: this.pacienteEditando?.profissao || '',
        escolaridade: this.pacienteEditando?.escolaridade || '',
        raca: this.pacienteEditando?.raca || '',
        endereco: this.pacienteEditando?.endereco || '',
        bairro: this.pacienteEditando?.bairro || '',
        municipio: this.pacienteEditando?.municipio || '',
        uf: this.pacienteEditando?.uf || '',
        cep: this.pacienteEditando?.cep || '',
        acompanhante: this.pacienteEditando?.acompanhante || '',
        procedencia: this.pacienteEditando?.procedencia || ''
      };
    }
  }

  ngOnInit() {}

  salvar() {
    if (this.pacienteEditando && this.pacienteEditando.id) {
      if (confirm('Tem certeza que deseja atualizar este registro?')) {
        this.http.put(`${this.apiUrl}/${this.pacienteEditando.id}`, this.novoPaciente).subscribe(() => {
          this.router.navigate(['/']);
        });
      }
    } else {
      this.http.post(this.apiUrl, this.novoPaciente).subscribe(() => {
        this.router.navigate(['/']);
      });
    }
  }

  cancelar() {
    this.router.navigate(['/']);
  }
}
