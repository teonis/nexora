# Clinical AI Assistant — TODO

## Banco de Dados & Schema
- [x] Tabela patients (pacientes)
- [x] Tabela consultations (consultas)
- [x] Tabela soap_notes (notas SOAP)
- [x] Tabela documents (documentos gerados)
- [x] Tabela exam_uploads (exames/laudos enviados)
- [x] Tabela chat_messages (mensagens Charcot IA)
- [x] Migrar schema com pnpm db:push

## Design System & Layout
- [x] Paleta de cores elegante (tons de azul-ardósia, branco, cinza-frio)
- [x] Tipografia refinada (Inter + Playfair Display)
- [x] ClinicalLayout com sidebar médica responsiva
- [x] Página de login/autenticação (Home.tsx)
- [x] Componente de aviso LGPD/IA (disclaimer)

## Dashboard Principal
- [x] Visão geral das consultas do dia
- [x] Pacientes recentes
- [x] Atalhos rápidos (Nova Consulta, Novo Paciente, Charcot IA)
- [x] Estatísticas rápidas (total pacientes, consultas hoje, documentos gerados)

## Gerenciamento de Pacientes
- [x] Listagem de pacientes com busca e filtros
- [x] Cadastro completo de paciente (dados pessoais, contato, histórico)
- [x] Página de perfil do paciente com abas
- [x] Histórico de consultas por paciente

## Módulo de Consulta
- [x] Iniciar nova consulta vinculada a paciente
- [x] Gravação de áudio com controles (iniciar/parar)
- [x] Transcrição via Whisper API (com fallback manual)
- [x] Geração automática de nota SOAP via LLM
- [x] Editor de nota SOAP (revisão e ajuste manual)
- [x] Finalizar consulta e salvar documentação
- [x] Deleção automática do áudio após processamento (LGPD)

## Assistente Charcot IA
- [x] Interface de chat contextual por consulta
- [x] Contexto do paciente e consulta atual injetado no prompt
- [x] Disclaimer automático em todas as respostas
- [x] Histórico de mensagens da sessão
- [x] Página standalone do Charcot IA

## Upload e Análise de Exames
- [x] Upload de PDF ou imagem de exame/laudo
- [x] Extração de contexto via LLM (análise do documento)
- [x] Exibição do resumo extraído
- [x] Associação ao paciente e consulta

## Geração e Exportação de Documentos
- [x] Geração de evolução clínica completa
- [x] Geração de prescrição estruturada
- [x] Geração de pedido de exames
- [x] Geração de atestado médico
- [x] Exportação em TXT
- [x] Exportação/impressão em PDF (via janela de impressão do navegador)
- [x] Página centralizada de documentos clínicos

## Conformidade LGPD
- [x] Aviso de consentimento de gravação na tela de consulta
- [x] Deleção automática do arquivo de áudio após transcrição
- [x] Disclaimer visível em todas as respostas de IA
- [x] Aviso no rodapé/interface sobre uso de IA como suporte

## Testes & Qualidade
- [x] Testes unitários dos routers tRPC principais (9 testes passando)
- [x] Validação de formulários com Zod
- [x] Estados de loading/erro em todas as páginas
- [x] Responsividade mobile-first

## Página de Funcionalidades
- [x] Criar página /funcionalidades com lista interativa de funcionalidades
- [x] Adicionar link "Funcionalidades" na navbar da landing page
- [x] Registrar rota /funcionalidades no App.tsx

## Melhorias Futuras (v2)
- [ ] Notificações de retorno de pacientes inativos
- [ ] Exportação de dados em CSV (admin only)
- [ ] Integração com prontuário eletrônico externo
- [ ] Assinatura digital de documentos
- [ ] Agenda de consultas com calendário
- [ ] Relatórios e analytics avançados

## Rodapé e Páginas Legais
- [x] Criar componente Footer minimalista com links para Política de Privacidade, Termos de Uso e Contato
- [x] Criar página /privacidade com política de privacidade
- [x] Criar página /termos com termos de uso
- [x] Criar página /contato com formulário de contato
- [x] Adicionar Footer na landing page e na página de funcionalidades
- [x] Registrar rotas das páginas legais no App.tsx
