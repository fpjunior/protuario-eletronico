import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
  standalone: false
})
export class UsuariosComponent implements OnInit {
  usuarios: any[] = [];
  usuarioForm: FormGroup;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  niveis = [
    { value: 'admin', label: 'Administrador' },
    { value: 'editor', label: 'Editor' },
    { value: 'visualizador', label: 'Visualizador' }
  ];
  isVisualizador: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public authService: AuthService
  ) {
    this.usuarioForm = this.fb.group({
      nome: [{value: '', disabled: false}, Validators.required],
      email: [{value: '', disabled: false}, [Validators.required, Validators.email]],
      senha: [{value: '', disabled: false}, Validators.required],
      nivel: [{value: 'visualizador', disabled: false}, Validators.required]
    });
  }

  ngOnInit(): void {
    this.isVisualizador = this.authService.user?.nivel === 'visualizador';
    if (this.isVisualizador) {
      this.usuarioForm.disable();
    }
    this.listarUsuarios();
  }

  listarUsuarios() {
    this.loading = true;
    this.http.get<any[]>(`${environment.apiUrl}/usuarios`).subscribe({
      next: usuarios => {
        this.usuarios = usuarios;
        this.loading = false;
      },
      error: err => {
        this.error = 'Erro ao carregar usuários';
        this.loading = false;
      }
    });
  }

  cadastrarUsuario() {
    if (this.usuarioForm.invalid) return;
    this.loading = true;
    this.http.post(`${environment.apiUrl}/usuarios`, this.usuarioForm.value).subscribe({
      next: () => {
        this.success = 'Usuário cadastrado com sucesso!';
        this.usuarioForm.reset({ nivel: 'visualizador' });
        this.listarUsuarios();
        this.loading = false;
      },
      error: err => {
        this.error = err.error?.message || 'Erro ao cadastrar usuário';
        this.loading = false;
      }
    });
  }

  podeCadastrar() {
    return this.authService.isAdmin;
  }
}
