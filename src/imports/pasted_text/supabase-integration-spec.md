# INTEGRAÇÃO COM SUPABASE

O sistema deve ser projetado desde o início considerando uma futura implementação utilizando **Supabase como Backend as a Service (BaaS)**.

O Figma deve representar visualmente todos os fluxos que posteriormente serão conectados ao Supabase.

A arquitetura deverá considerar:

* Supabase Auth;
* PostgreSQL;
* Supabase Storage;
* Supabase Realtime;
* Row Level Security (RLS);
* Edge Functions, quando necessário;
* API do Supabase;
* autenticação por sessão;
* controle de permissões por usuário;
* estrutura multi-tenant para múltiplas barbearias.

---

# 1. AUTENTICAÇÃO

Utilizar o Supabase Auth como referência para autenticação.

Criar fluxos para:

### Cliente

* cadastro;
* login;
* logout;
* recuperação de senha;
* alteração de senha;
* atualização de perfil.

### Barbeiro / Administrador

* cadastro;
* login;
* recuperação de senha;
* logout;
* gerenciamento de sessão.

### Administrador da plataforma

* login administrativo;
* recuperação de acesso;
* logout;
* controle de sessão.

Métodos que poderão ser suportados:

* E-mail e senha;
* Google;
* outros provedores futuramente.

---

# 2. ESTRUTURA MULTI-TENANT

O sistema deverá ser pensado como um SaaS multi-tenant.

Cada barbearia deverá possuir um identificador único:

**barbershop_id**

Todos os dados relacionados à barbearia deverão estar associados a esse identificador.

Exemplo:

Barbearia A

→ clientes
→ barbeiros
→ serviços
→ agendamentos
→ pagamentos
→ avaliações
→ horários
→ configurações

Barbearia B

→ clientes
→ barbeiros
→ serviços
→ agendamentos
→ pagamentos
→ avaliações
→ horários
→ configurações

Um administrador de uma barbearia **não poderá visualizar os dados de outra barbearia**.

---

# 3. BANCO DE DADOS POSTGRESQL

Projetar o sistema considerando tabelas semelhantes às seguintes:

### profiles

* id;
* user_id;
* nome;
* telefone;
* avatar_url;
* tipo_usuario;
* created_at;
* updated_at.

Tipos de usuário:

* customer;
* barber;
* barbershop_admin;
* platform_admin.

---

### barbershops

* id;
* owner_id;
* nome;
* descricao;
* logo_url;
* cover_url;
* telefone;
* whatsapp;
* instagram;
* endereco;
* bairro;
* cidade;
* estado;
* latitude;
* longitude;
* status;
* created_at;
* updated_at.

Status:

* ativa;
* pendente;
* suspensa;
* cancelada.

---

### barbershop_members

Relacionar usuários com barbearias.

Campos:

* id;
* barbershop_id;
* user_id;
* role;
* status;
* created_at.

Roles:

* owner;
* admin;
* barber;
* receptionist.

---

### services

* id;
* barbershop_id;
* nome;
* descricao;
* preco;
* duracao_minutos;
* imagem_url;
* ativo;
* created_at;
* updated_at.

---

### barbers

* id;
* barbershop_id;
* profile_id;
* especialidade;
* descricao;
* foto_url;
* ativo;
* created_at.

---

### working_hours

Armazenar os horários de funcionamento da barbearia.

Campos:

* id;
* barbershop_id;
* dia_semana;
* hora_inicio;
* hora_fim;
* intervalo_inicio;
* intervalo_fim;
* ativo.

---

### barber_working_hours

Permitir horários individuais para cada barbeiro.

Campos:

* id;
* barber_id;
* dia_semana;
* hora_inicio;
* hora_fim;
* intervalo_inicio;
* intervalo_fim;
* ativo.

---

### blocked_times

Representar horários bloqueados.

Campos:

* id;
* barbershop_id;
* barber_id;
* data;
* hora_inicio;
* hora_fim;
* motivo;
* created_at.

---

### customers

* id;
* barbershop_id;
* profile_id;
* observacoes;
* created_at;
* updated_at.

---

### appointments

Tabela principal de agendamentos.

Campos:

* id;
* barbershop_id;
* customer_id;
* barber_id;
* service_id;
* data;
* hora_inicio;
* hora_fim;
* valor;
* status;
* observacoes;
* created_at;
* updated_at.

Status:

* pending;
* confirmed;
* checked_in;
* in_progress;
* completed;
* cancelled;
* no_show.

---

# 4. DISPONIBILIDADE EM TEMPO REAL

A disponibilidade exibida para o cliente deverá ser baseada nos dados reais da agenda.

O sistema deverá considerar:

* horário de funcionamento;
* horário individual do barbeiro;
* duração do serviço;
* agendamentos existentes;
* horários bloqueados;
* folgas;
* feriados;
* férias;
* cancelamentos.

O Supabase Realtime poderá ser utilizado para atualizar a agenda.

Exemplo:

Cliente A está visualizando:

**15:00 — Disponível**

Outro cliente realiza o agendamento.

O horário deverá passar automaticamente para:

🔴 **Indisponível**

sem necessidade de atualizar manualmente a tela.

---

# 5. ROW LEVEL SECURITY

Projetar a aplicação considerando políticas de **Row Level Security (RLS)**.

### Cliente

Pode:

* visualizar barbearias públicas;
* visualizar serviços ativos;
* visualizar barbeiros ativos;
* visualizar disponibilidade;
* criar seus próprios agendamentos;
* visualizar seus próprios agendamentos;
* cancelar seus próprios agendamentos;
* avaliar atendimentos realizados.

Não pode:

* acessar dados internos da barbearia;
* acessar financeiro;
* acessar outros clientes;
* alterar serviços;
* alterar agenda de barbeiros.

---

### Barbeiro

Pode:

* visualizar sua agenda;
* visualizar seus atendimentos;
* visualizar clientes relacionados aos seus atendimentos;
* atualizar status do atendimento;
* bloquear seus horários.

---

### Administrador da barbearia

Pode acessar somente os dados da própria:

**barbershop_id**

Pode:

* gerenciar agenda;
* gerenciar clientes;
* gerenciar serviços;
* gerenciar barbeiros;
* gerenciar horários;
* visualizar financeiro;
* visualizar relatórios;
* configurar a barbearia;
* gerenciar assinatura.

---

### Administrador da plataforma

Possui acesso administrativo global.

Pode visualizar:

* todas as barbearias;
* todos os usuários;
* assinaturas;
* pagamentos;
* métricas;
* planos;
* relatórios gerais.

---

# 6. SUPABASE STORAGE

Utilizar Supabase Storage como referência para armazenamento de imagens.

Criar estrutura conceitual:

### barbershops

* logos;
* capas;
* fotos.

### profiles

* avatars.

### services

* imagens dos serviços.

### barbers

* fotos dos profissionais.

### reviews

* fotos enviadas pelos clientes.

As telas do Figma devem representar upload, preview, substituição e exclusão dessas imagens.

---

# 7. ASSINATURAS

Criar estrutura preparada para integração com um gateway de pagamento posteriormente.

Não armazenar dados sensíveis de cartão diretamente no Supabase.

O sistema deverá possuir conceitos de:

### subscriptions

* id;
* barbershop_id;
* plan_id;
* status;
* current_period_start;
* current_period_end;
* created_at;
* updated_at.

Status:

* trialing;
* active;
* past_due;
* cancelled;
* expired.

---

# 8. PLANOS

Criar tabela conceitual:

### plans

* id;
* nome;
* descricao;
* preco_mensal;
* limite_barbeiros;
* limite_recursos;
* ativo.

Exemplo:

Básico
R$49,90/mês

Profissional
R$79,90/mês

Premium
R$129,90/mês

---

# 9. WEBHOOKS E PAGAMENTOS

Preparar o design para que futuramente um gateway de pagamento envie informações ao sistema.

Fluxo:

Cliente/barbearia realiza pagamento

↓

Gateway processa

↓

Webhook

↓

Backend/Edge Function

↓

Supabase

↓

Atualiza assinatura

↓

Dashboard mostra:

🟢 **Assinatura ativa**

---

# 10. NOTIFICAÇÕES

Criar estrutura visual para notificações relacionadas aos dados do Supabase.

Eventos:

* novo agendamento;
* agendamento confirmado;
* cancelamento;
* alteração de horário;
* lembrete;
* pagamento aprovado;
* pagamento pendente;
* assinatura próxima do vencimento;
* avaliação recebida.

---

# 11. AUDITORIA

Criar conceito de:

### audit_logs

Registrar ações importantes.

Exemplo:

**Lucas alterou o preço do serviço Corte**

Antes:

R$25

Depois:

R$30

Data:

04/09/2026 14:30

Isso deverá existir principalmente para ações administrativas.

---

# 12. DASHBOARD EM TEMPO REAL

O dashboard da barbearia deverá ser preparado para receber dados do Supabase.

Exemplo:

**Agendamentos hoje**

12

Quando um novo agendamento for criado:

12 → 13

automaticamente.

O mesmo conceito deve ser aplicado a:

* faturamento;
* agenda;
* clientes;
* cancelamentos;
* ocupação.

---

# 13. ESTADOS DE CONEXÃO

Criar componentes para representar:

### Conectado

🟢 Dados sincronizados

### Sincronizando

🔄 Sincronizando dados...

### Offline

⚠️ Sem conexão

### Erro

❌ Não foi possível carregar os dados.

Botão:

**Tentar novamente**

---

# 14. CONFIGURAÇÃO DO SUPABASE

Criar uma tela conceitual dentro da documentação/protótipo chamada:

**Configuração do Backend**

Mostrar:

Supabase Project

**Conectado**

Database

🟢 Conectado

Authentication

🟢 Ativo

Storage

🟢 Ativo

Realtime

🟢 Ativo

RLS

🟢 Ativo

Essa tela deve ser apenas uma representação visual para futura implementação.

Não permitir que usuários comuns visualizem chaves secretas ou credenciais.

---

# 15. ARQUITETURA CONCEITUAL

Representar no projeto a seguinte arquitetura:

CLIENTE

↓

Aplicativo Mobile / Web

↓

API / Supabase Client

↓

SUPABASE

├── Authentication
├── PostgreSQL
├── Row Level Security
├── Storage
├── Realtime
└── Edge Functions

↓

SERVIÇOS EXTERNOS

├── Gateway de pagamento
├── WhatsApp
├── E-mail
├── Google Maps
└── Serviços de notificação

---

# 16. IMPORTANTE

O protótipo do Figma não deve fingir que o Supabase já está conectado.

O objetivo é criar **interfaces e fluxos preparados para a integração real posteriormente**.

Todos os dados exibidos no protótipo podem ser fictícios, mas devem seguir a estrutura de dados que será utilizada posteriormente no Supabase.

O projeto deve ser desenvolvido pensando em:

**Escalabilidade + Segurança + Multi-tenancy + Realtime + SaaS + Mobile + Web.**

O resultado final deve permitir que um desenvolvedor consiga olhar o protótipo e compreender claramente quais telas posteriormente serão alimentadas pelo Supabase.
