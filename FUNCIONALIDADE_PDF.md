# Funcionalidade de Impressão PDF - Cadastro de Pacientes

**Data:** 09 de julho de 2025

## Nova Funcionalidade Implementada

Adicionada a capacidade de gerar e imprimir cadastros de pacientes em formato PDF.

## Dependências Instaladas

```bash
npm install jspdf html2canvas
```

- **jsPDF**: Biblioteca para geração de documentos PDF
- **html2canvas**: Para captura de elementos HTML (backup, caso necessário)

## Funcionalidades Adicionadas

### 1. Impressão PDF na Listagem de Pacientes

**Localização:** `pacientes.component.html` e `pacientes.component.ts`

**Características:**
- Botão de impressão (ícone print) ao lado de editar/excluir
- Gera PDF com todos os dados do paciente cadastrado
- Nome do arquivo: `paciente_[nome]_[timestamp].pdf`

### 2. Impressão PDF no Formulário de Pacientes

**Localização:** `pacientes-form.component.html` e `pacientes-form.component.ts`

**Características:**
- Botão "Gerar PDF" no formulário
- Permite imprimir mesmo antes de salvar (preview)
- Validação: requer campos obrigatórios preenchidos

## Layout do PDF Gerado

### Estrutura do Documento:
1. **Cabeçalho**
   - Logo/Título: "e-Prontuário Aliança-PE"
   - Subtítulo: "Ficha de Cadastro do Paciente"
   - Linha separadora

2. **Seção: DADOS PESSOAIS**
   - Nome completo
   - Nome da mãe
   - Data de nascimento (formato brasileiro)
   - Sexo (formatado: Masculino/Feminino/Ignorado)
   - Estado civil (se preenchido)
   - Profissão (se preenchido)
   - Escolaridade (se preenchido)
   - Raça/Cor (se preenchido)

3. **Seção: ENDEREÇO**
   - Endereço completo
   - Bairro
   - Município
   - UF
   - CEP

4. **Seção: INFORMAÇÕES ADICIONAIS**
   - Acompanhante (se preenchido)
   - Procedência (se preenchido)

5. **Rodapé**
   - Data e hora de geração
   - Identificação do sistema

## Arquivos Modificados

### Frontend - Componente de Listagem
- `/frontend/src/app/pacientes/pacientes.component.html`
  - Adicionado botão de impressão na coluna de ações
- `/frontend/src/app/pacientes/pacientes.component.ts`
  - Import do jsPDF
  - Método `imprimirPacientePDF(paciente: Paciente)`
  - Método auxiliar `formatarSexo()`

### Frontend - Componente de Formulário
- `/frontend/src/app/pacientes/pacientes-form.component.html`
  - Adicionado botão "Gerar PDF" na seção de ações
  - Reorganização dos botões com estilos
- `/frontend/src/app/pacientes/pacientes-form.component.ts`
  - Import do jsPDF
  - Método `imprimirPacientePDF()` para dados do formulário
  - Método auxiliar `formatarSexo()`
- `/frontend/src/app/pacientes/pacientes-form.component.scss`
  - Estilos para a seção `.botoes-acao`
  - Layout dos botões com ícones

## Recursos Técnicos

### Validações
- **Listagem**: Funciona com qualquer paciente válido
- **Formulário**: Requer campos obrigatórios preenchidos

### Formatação de Dados
- Datas convertidas para formato brasileiro (dd/MM/yyyy)
- Sexo convertido para texto completo
- Campos opcionais ocultados se vazios

### Nomenclatura de Arquivos
- Padrão: `paciente_[nome_formatado]_[timestamp].pdf`
- Nome formatado: espaços substituídos por underscore, minúsculas

## Como Usar

### 1. Na Listagem de Pacientes
1. Acesse a tela de listagem de pacientes
2. Clique no ícone de impressão (print) ao lado do paciente desejado
3. O PDF será gerado e baixado automaticamente

### 2. No Formulário de Pacientes
1. Acesse ou crie um cadastro de paciente
2. Preencha os campos obrigatórios (nome, mãe, nascimento, sexo)
3. Clique no botão "Gerar PDF"
4. O PDF será gerado com os dados atuais do formulário

## Exemplo de Uso

```typescript
// Gerar PDF de um paciente específico
imprimirPacientePDF(paciente);

// Gerar PDF dos dados do formulário atual
imprimirPacientePDF();
```

## Status

✅ **FUNCIONALIDADE IMPLEMENTADA COM SUCESSO**

A funcionalidade de impressão PDF está totalmente operacional, permitindo gerar documentos profissionais dos cadastros de pacientes tanto da listagem quanto do formulário.

---

**Próximos passos sugeridos:**
- Testar em diferentes navegadores
- Adicionar opção de visualizar antes de baixar
- Incluir campos de assinatura no PDF
- Opção de enviar PDF por email
