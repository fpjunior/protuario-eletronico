import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="attention-dialog">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      <div mat-dialog-content>{{ data.message }}</div>
      <div mat-dialog-actions class="flex justify-center gap-4 mt-6">
        <button mat-raised-button color="primary" (click)="confirmar()" class="btn-confirm">Sim</button>
        <button mat-raised-button color="warn" (click)="cancelar()" class="btn-cancel">Não</button>
      </div>
    </div>
  `,
  styles: [`
    .attention-dialog {
      background: #fffde7;
      color: #795548;
      border-radius: 10px;
      padding: 24px 16px;
      text-align: center;
      font-size: 1.1em;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }
    .btn-confirm, .btn-cancel {
      min-width: 120px;
      font-size: 1.1em;
      font-weight: bold;
      padding: 10px 0;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.10);
      letter-spacing: 0.5px;
    }
    .btn-confirm {
      background: #ffe082;
      color: #795548;
      border: 1px solid #ffd54f;
    }
    .btn-confirm:hover {
      background: #ffd54f;
    }
    .btn-cancel {
      background: #fff;
      color: #d32f2f;
      border: 1px solid #d32f2f;
    }
    .btn-cancel:hover {
      background: #ffd4d4;
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) {}

  confirmar() {
    this.dialogRef.close(true);
  }

  cancelar() {
    this.dialogRef.close(false);
  }
}
