# Como Gerar o APK

## Pré-requisitos

1. Conta gratuita em [expo.dev](https://expo.dev)
2. Node.js instalado

## Configuração Inicial

### 1. Configure as variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://ceianaxbpeihqmyuvmlm.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
EXPO_PUBLIC_BRAPI_TOKEN=seu_token_brapi (opcional)
```

### 2. Instale o EAS CLI

```bash
npm install -g eas-cli
```

### 3. Login no Expo

```bash
eas login
```

## Gerar APK (Build na Nuvem - Gratuito)

### APK para teste (preview):

```bash
cd AppFinanceiro-RN
eas build -p android --profile preview
```

> Isso irá:
> - Enviar o código para a nuvem do Expo
> - Compilar o APK remotamente (sem precisar de Android Studio)
> - Gerar um link de download do APK (~10-20 minutos)

### APK de produção:

```bash
eas build -p android --profile production
```

## Rodar Localmente (para desenvolvimento)

### Com Expo Go (mais rápido):

```bash
cd AppFinanceiro-RN
npm start
```

Escaneia o QR Code com o app Expo Go no seu celular.

### Com emulador Android:

```bash
npm run android
```

## Estrutura do Projeto

```
AppFinanceiro-RN/
├── app/                    # Telas (Expo Router)
│   ├── (auth)/            # Login, Cadastro
│   └── (tabs)/            # Dashboard, Transações, Objetivos, Carteira, Fixos, Perfil
├── src/
│   ├── components/ui/     # Componentes reutilizáveis
│   ├── lib/
│   │   ├── hooks/         # useAuth, useTransactions, useGoals, useStocks, useFixedExpenses
│   │   ├── supabase/      # Cliente Supabase
│   │   └── utils/         # Formatação, BRAPI
│   ├── theme/             # Cores
│   └── types/             # TypeScript types
├── eas.json               # Configuração de build
└── app.json               # Configuração Expo
```
