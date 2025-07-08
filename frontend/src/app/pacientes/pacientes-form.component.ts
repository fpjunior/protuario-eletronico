import { Component, OnInit } from '@angular/core';
import { Paciente } from './pacientes.component';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, switchMap, map, first } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-pacientes-form',
  templateUrl: './pacientes-form.component.html',
  styleUrls: ['./pacientes.component.scss']
})
export class PacientesFormComponent implements OnInit {
  pacienteEditando: Paciente | null = null;
  form: FormGroup;
  loading = false;
  apiUrl = environment.apiUrl + '/pacientes';

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
    }, { asyncValidators: [this.duplicidadeValidator()] });

    if (this.pacienteEditando) {
      this.form.patchValue(this.pacienteEditando);
    }
  }

  ngOnInit() { }

  duplicidadeValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const nome = control.get('nome')?.value;
      const mae = control.get('mae')?.value;
      const nascimento = control.get('nascimento')?.value;
      if (!nome || !mae || !nascimento) return of(null);
      const params = `?nome=${encodeURIComponent(nome)}&mae=${encodeURIComponent(mae)}&nascimento=${encodeURIComponent(nascimento)}`;
      return this.http.get<Paciente[]>(`${this.apiUrl}${params}`)
        .pipe(
          debounceTime(300),
          map(pacientes => {
            if (this.pacienteEditando && pacientes.length === 1 && pacientes[0].id === this.pacienteEditando.id) {
              return null;
            }
            return pacientes.length > 0 ? { duplicado: true } : null;
          }),
          first()
        );
    };
  }

  salvar() {
    if (this.form.invalid || this.form.pending) {
      this.form.markAllAsTouched();
      return;
    }
    const paciente = this.form.value;
    this.loading = true;

    if (this.pacienteEditando && this.pacienteEditando.id) {
      if (confirm('Tem certeza que deseja atualizar este registro?')) {
        this.http.put(`${this.apiUrl}/${this.pacienteEditando.id}`, paciente).subscribe({
          next: () => {
            this.loading = false;
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.loading = false;
            alert(err?.error?.error || 'Erro ao atualizar paciente.');
          }
        });
      } else {
        this.loading = false;
      }
    } else {
      this.http.post(this.apiUrl, paciente).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.loading = false;
          alert(err?.error?.error || 'Erro ao cadastrar paciente.');
        }
      });
    }
  }

  cancelar() {
    this.router.navigate(['/']);
  }
}
