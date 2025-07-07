import { Component, OnInit } from '@angular/core';
import { Paciente } from './pacientes.component';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, debounceTime, switchMap, first } from 'rxjs/operators';

@Component({
  selector: 'app-pacientes-form',
  templateUrl: './pacientes-form.component.html',
  styleUrls: ['./pacientes.component.scss']
})
export class PacientesFormComponent implements OnInit {
  pacienteEditando: Paciente | null = null;
  form: FormGroup;
  apiUrl = 'http://localhost:3001/pacientes';
  // apiUrl = 'https://protuario-eletronico-1.onrender.com/pacientes';

  constructor(private router: Router, private http: HttpClient, private fb: FormBuilder) {
    const nav = this.router.getCurrentNavigation();
    this.pacienteEditando = nav?.extras.state?.['paciente'] || null;
    this.form = this.fb.group({
      nome: ['', [Validators.required]],
      mae: ['', [Validators.required]],
      nascimento: ['', [Validators.required]],
      sexo: ['', [Validators.required]],
      estadoCivil: [''],
      profissao: [''],
      escolaridade: [''],
      raca: [''],
      endereco: [''],
      bairro: [''],
      municipio: [''],
      uf: ['', [Validators.pattern(/^[A-Za-z]{2}$/)]],
      cep: ['', [Validators.pattern(/^[0-9]{5}-?[0-9]{3}$/)]],
      acompanhante: [''],
      procedencia: ['']
    });

    if (this.pacienteEditando) {
      this.form.patchValue(this.pacienteEditando);
    }

    // Validação assíncrona só quando nome ou nascimento mudam
    this.form.get('nome')?.valueChanges.subscribe(() => this.checkNomeNascimentoUnico());
    this.form.get('nascimento')?.valueChanges.subscribe(() => this.checkNomeNascimentoUnico());
  }
  novoPaciente: any = {
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

  ngOnInit() { }

  checkNomeNascimentoUnico() {
    const nome = this.form.get('nome')?.value;
    const nascimento = this.form.get('nascimento')?.value;
    if (!nome || !nascimento) {
      this.form.setErrors(null);
      return;
    }
    this.http.get<Paciente[]>(`${this.apiUrl}?nome=${encodeURIComponent(nome)}&nascimento=${encodeURIComponent(nascimento)}`)
      .pipe(first())
      .subscribe(pacientes => {
        if (this.pacienteEditando && pacientes.length === 1 && pacientes[0].id === this.pacienteEditando.id) {
          this.form.setErrors(null);
        } else {
          this.form.setErrors(pacientes.length > 0 ? { nomeNascimentoDuplicado: true } : null);
        }
      }, () => {
        this.form.setErrors(null);
      });
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const paciente = this.form.value;
    if (this.pacienteEditando && this.pacienteEditando.id) {
      if (confirm('Tem certeza que deseja atualizar este registro?')) {
        this.http.put(`${this.apiUrl}/${this.pacienteEditando.id}`, paciente).subscribe(() => {
          this.router.navigate(['/']);
        });
      }
    } else {
      this.http.post(this.apiUrl, paciente).subscribe(() => {
        this.router.navigate(['/']);
      });
    }
  }

  cancelar() {
    this.router.navigate(['/']);
  }
}
