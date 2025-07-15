# 🚀 Plano de Migração Angular 15 → Angular 19/20

## 📊 **Estado Atual:**
- Angular: **15.2.0** 
- Angular CLI: **13.3.11** ⚠️ (muito defasado!)
- Angular Material: **15.2.9**
- TypeScript: **4.9.4**

## 🎯 **Estado Desejado:**
- Angular: **19.x** (estável) ou **20.x** (mais recente)
- Angular CLI: **19.x/20.x**
- Angular Material: **19.x/20.x**
- TypeScript: **5.6+**

---

## 📋 **ESTRATÉGIA DE MIGRAÇÃO:**

### **Opção 1: Migração Gradual (RECOMENDADA) 🐢**
Migrar versão por versão para evitar breaking changes:
- 15 → 16 → 17 → 18 → 19 → 20

### **Opção 2: Migração Direta (ARRISCADA) ⚡**
Pular direto para Angular 19/20 e corrigir erros conforme aparecem.

---

## 🔧 **PLANO DE EXECUÇÃO - OPÇÃO 1 (GRADUAL):**

### **PASSO 1: Backup e Preparação**
```bash
# Fazer backup do projeto atual
git add . && git commit -m "backup: Antes da migração Angular"

# Verificar se tudo está funcionando
npm install
npm start
```

### **PASSO 2: Angular 15 → 16**
```bash
# Atualizar CLI globalmente
npm install -g @angular/cli@16

# No diretório frontend
npx ng update @angular/core@16 @angular/cli@16 @angular/material@16
```

### **PASSO 3: Angular 16 → 17**
```bash
npx ng update @angular/core@17 @angular/cli@17 @angular/material@17
```

### **PASSO 4: Angular 17 → 18**
```bash
npx ng update @angular/core@18 @angular/cli@18 @angular/material@18
```

### **PASSO 5: Angular 18 → 19**
```bash
npx ng update @angular/core@19 @angular/cli@19 @angular/material@19
```

### **PASSO 6: Angular 19 → 20 (Opcional)**
```bash
npx ng update @angular/core@20 @angular/cli@20 @angular/material@20
```

---

## 🔧 **PLANO DE EXECUÇÃO - OPÇÃO 2 (DIRETA):**

### **PASSO 1: Backup**
```bash
git add . && git commit -m "backup: Antes da migração Angular direta"
```

### **PASSO 2: Migração Direta**
```bash
# Atualizar CLI globalmente
npm install -g @angular/cli@latest

# Limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json

# Migração direta
npx ng update @angular/core@latest @angular/cli@latest @angular/material@latest
```

---

## ⚠️ **POSSÍVEIS BREAKING CHANGES:**

### **Angular 16:**
- **Standalone Components** (padrão)
- **New Control Flow** (@if, @for, @switch)

### **Angular 17:**
- **New Application Builder** (Vite/esbuild)
- **SSR melhorado**

### **Angular 18:**
- **Material 3 Design System**
- **Zoneless Change Detection** (experimental)

### **Angular 19:**
- **Signals estáveis**
- **Novos lifecycle hooks**

---

## 🧪 **TESTES APÓS CADA MIGRAÇÃO:**

```bash
# 1. Build deve funcionar
npm run build

# 2. Testes devem passar
npm test

# 3. Aplicação deve iniciar
npm start

# 4. Funcionalidades críticas:
# - Login/Logout
# - Cadastro de pacientes
# - Geração de PDF
# - Recuperação de senha
```

---

## 🔧 **CORREÇÕES PROVÁVEIS NECESSÁRIAS:**

### **1. Imports atualizados:**
```typescript
// Antes (Angular 15)
import { NgModule } from '@angular/core';

// Depois (Angular 17+)
import { Component } from '@angular/core';
```

### **2. Standalone Components:**
```typescript
// Novo padrão Angular 17+
@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `...`
})
```

### **3. New Control Flow:**
```html
<!-- Antes -->
<div *ngIf="mostrar">Conteúdo</div>
<div *ngFor="let item of lista">{{item}}</div>

<!-- Depois (Angular 17+) -->
@if (mostrar) {
  <div>Conteúdo</div>
}
@for (item of lista; track item.id) {
  <div>{{item}}</div>
}
```

---

## 🎯 **RECOMENDAÇÃO:**

**MIGRAÇÃO GRADUAL (Opção 1)** por ser mais segura, especialmente considerando:
- ✅ Projeto em produção funcionando
- ✅ Funcionalidades críticas (PDF, email)
- ✅ Menos risco de quebrar funcionalidades

**Quer que eu execute a migração gradual passo a passo? 🚀**
