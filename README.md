# 🚗 Wancar Veículos — Vitrine + Painel Administrativo

Sistema completo de vitrine de veículos com painel administrativo, integração com **Asaas** (pagamentos) e **Supabase** (banco de dados e auth).

## 📋 Sobre o Projeto

Sistema desenvolvido para a **Wancar Veículos** — uma vitrine online de carros e motos com:

- **Site público** — vitrine com filtros, busca e detalhes dos veículos
- **Painel admin** — cadastro, edição e gestão completa de veículos
- **Assinatura mensal** — cobrança recorrente via Asaas (boleto, PIX ou cartão)
- **Autenticação** — login via Supabase Auth
- **Webhook** — atualização automática do status de pagamento

## 🚀 Stack

| Camada | Tecnologia |
|--------|-----------|
| **Framework** | Next.js 15 (App Router + React Server Components) |
| **Linguagem** | TypeScript 5 |
| **UI** | Tailwind CSS + shadcn/ui + Radix UI |
| **Estado** | TanStack Query (React Query) |
| **Banco** | Supabase (PostgreSQL + Auth + Storage) |
| **Pagamentos** | Asaas (boleto, PIX, cartão) |
| **Ícones** | Lucide React |
| **Toast** | Sonner |

## 📁 Estrutura

```
vitrine-veiculos/
├── public/                 # Assets estáticos
├── scripts/                # Scripts utilitários
├── src/
│   ├── app/                # Rotas (App Router)
│   │   ├── (admin)/        # Área administrativa
│   │   ├── (auth)/         # Login, recuperação de senha
│   │   ├── (public)/       # Site público
│   │   └── api/            # Route Handlers (webhooks, auth)
│   ├── actions/            # Server Actions
│   ├── components/         # Componentes React
│   ├── hooks/              # Hooks customizados
│   ├── lib/                # Utilitários e clients
│   │   ├── asaas/          # Client HTTP do Asaas
│   │   ├── supabase/       # Clients Supabase (browser, server, admin)
│   │   └── validations/    # Schemas Zod
│   ├── services/           # Camada de serviços (dados)
│   └── types/              # Tipos TypeScript
├── .env.example            # Template de env vars
├── next.config.mjs         # Config Next.js
├── tailwind.config.ts      # Config Tailwind
└── tsconfig.json           # Config TypeScript
```

## 🛠️ Instalação

### 1. Clona o repositório

```bash
git clone https://github.com/SEU-USER/vitrine-veiculos.git
cd vitrine-veiculos
```

### 2. Instala as dependências

```bash
npm install
```

### 3. Configura as variáveis de ambiente

Copia o `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

E preenche com seus valores:

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço (bypassa RLS) |
| `ASAAS_API_URL` | URL da API do Asaas (sandbox ou produção) |
| `ASAAS_API_KEY` | Chave de API do Asaas |
| `ASAAS_WEBHOOK_TOKEN` | Token do webhook |
| `ASAAS_NOTIFICATION_PHONE` | Telefone pra notificações |

**⚠️ Sobre a `ASAAS_API_KEY`:**
- No `.env.local` local, coloque **sem o `$`** (o código adiciona).
- No painel do Cloudflare/Vercel, cole **com o `$`**.

### 4. Roda o projeto

```bash
npm run dev
```

Acessa [http://localhost:3000](http://localhost:3000).

## 🔌 Integrações

### Supabase

**Banco de dados** com as tabelas:
- `veiculos` — veículos cadastrados
- `marcas`, `modelos`, `cores`, `motores`, `opcionais` — catálogos
- `subscribers` — assinantes do sistema
- `profiles` — perfis de usuário
- `user_roles` — roles (admin, user)

**Auth:** email/senha com recuperação.

**Storage:** imagens dos veículos no bucket `veiculos`.

### Asaas

**Pagamentos recorrentes** via:
- **Boleto** — gera boleto mensal
- **PIX** — QR Code a cada mês
- **Cartão de crédito** — cobrança automática

**Webhook** processa eventos:
- `PAYMENT_RECEIVED` / `PAYMENT_CONFIRMED` — libera acesso
- `PAYMENT_OVERDUE` — inicia tolerância
- `PAYMENT_REFUNDED` / `PAYMENT_DELETED` — revoga acesso
- `SUBSCRIPTION_DELETED` / `SUBSCRIPTION_INACTIVATED` — revoga acesso

**URL do webhook:** `https://seudominio.com/api/webhooks/asaas`

## 📜 Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Roda em desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Roda build de produção |
| `npm run lint` | Roda ESLint |
| `npx tsc --noEmit` | Verifica tipos TypeScript |

## 🔒 Segurança

- **RLS (Row Level Security)** ativo no Supabase
- **Service Role Key** nunca exposta ao cliente
- **Webhook do Asaas** validado por token
- **Validação** de CPF/CNPJ antes de criar customers
- **HTTPS** obrigatório em produção

## 👨‍💻 Autor

**Luiz Corsini**
- Site: [bindvalue.dev](https://www.bindvalue.dev)
- Email: luizcorsini@bindvalue.dev

## 📄 Licença

Projeto proprietário — **Wancar Veículos**. Todos os direitos reservados.