import { Component, OnInit, OnDestroy } from '@angular/core';
import { Paciente } from './pacientes.component';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-pacientes-form',
  templateUrl: './pacientes-form.component.html',
  styleUrls: ['./pacientes.component.scss']
})
export class PacientesFormComponent implements OnInit, OnDestroy {
  pacienteEditando: Paciente | null = null;
  form: FormGroup;
  loading = false;
  apiUrl = environment.apiUrl + '/pacientes';
  private destroy$ = new Subject<void>();
  private validationSubject = new Subject<{nome: string, mae: string}>();

  // Lista de estados brasileiros
  estadosBrasileiros = [
    { sigla: 'AC', nome: 'Acre' },
    { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' },
    { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' },
    { sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' },
    { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' },
    { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' },
    { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },
    { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' },
    { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' },
    { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' }
  ];

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
      uf: ['', [Validators.required]],
      cep: ['', [Validators.pattern(/^[0-9]{5}-?[0-9]{3}$/)]],
      acompanhante: [''],
      procedencia: ['']
    });

    if (this.pacienteEditando) {
      this.form.patchValue(this.pacienteEditando);
    }
  }

  ngOnInit() {
    // Configura o Subject para validação com debounce
    this.validationSubject.pipe(
      debounceTime(500),
      switchMap(({nome, mae}) => {
        const params = `?nome=${encodeURIComponent(nome.trim())}&mae=${encodeURIComponent(mae.trim())}`;
        return this.http.get<Paciente[]>(`${this.apiUrl}${params}`);
      }),
      takeUntil(this.destroy$)
    ).subscribe(pacientes => {
      const nomeControl = this.form.get('nome');
      if (nomeControl) {
        // Se está editando, ignora o próprio paciente
        const isDuplicate = this.pacienteEditando && pacientes.length === 1 && pacientes[0].id === this.pacienteEditando.id
          ? false
          : pacientes.length > 0;
        
        if (isDuplicate) {
          nomeControl.setErrors({ duplicado: true });
        } else {
          const errors = nomeControl.errors;
          if (errors) {
            delete errors['duplicado'];
            nomeControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
          }
        }
      }
    });

    // Quando os campos "nome" ou "mae" mudarem, emitir no Subject
    this.form.get('nome')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.checkDuplicidade();
    });

    this.form.get('mae')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.checkDuplicidade();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkDuplicidade() {
    const nome = this.form.get('nome')?.value;
    const mae = this.form.get('mae')?.value;
    
    if (nome && mae && nome.trim() !== '' && mae.trim() !== '') {
      this.validationSubject.next({nome: nome.trim(), mae: mae.trim()});
    }
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
