import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { PacientesFormComponent } from './pacientes-form.component';

describe('PacientesFormComponent', () => {
  let component: PacientesFormComponent;
  let fixture: ComponentFixture<PacientesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PacientesFormComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(PacientesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve desabilitar o botão Gerar PDF se campos obrigatórios estiverem vazios', () => {
    component.form.get('nome')?.setValue('');
    component.form.get('mae')?.setValue('');
    component.form.get('nascimento')?.setValue('');
    component.form.get('sexo')?.setValue('');
    component.form.get('uf')?.setValue('');
    fixture.detectChanges();
    expect(component.form.valid).toBeFalse();
  });

  it('deve habilitar o botão Gerar PDF se todos os obrigatórios estiverem preenchidos', () => {
    component.form.get('nome')?.setValue('Teste');
    component.form.get('mae')?.setValue('Mae Teste');
    component.form.get('nascimento')?.setValue('2000-01-01');
    component.form.get('sexo')?.setValue('M');
    component.form.get('uf')?.setValue('PE');
    fixture.detectChanges();
    expect(component.form.valid).toBeTrue();
  });

  it('não deve gerar PDF se o formulário estiver inválido', () => {
    spyOn(window, 'alert');
    component.form.get('nome')?.setValue('');
    component.form.get('mae')?.setValue('');
    component.form.get('nascimento')?.setValue('');
    component.form.get('sexo')?.setValue('');
    component.form.get('uf')?.setValue('');
    fixture.detectChanges();
    component.imprimirPacientePDF();
    expect(window.alert).toHaveBeenCalledWith('Por favor, preencha todos os campos obrigatórios antes de gerar o PDF.');
  });
});
