# 🚀 Deploy no Render - SPEAKAI

## ✅ Pré-requisitos Completos

Todas as correções foram aplicadas:
- ✅ Banco de dados Neon configurado com SSL
- ✅ Gemini API integrada (vídeo, imagem, prompt)
- ✅ Webhook Kiwify funcionando
- ✅ Sistema de créditos implementado
- ✅ Autenticação JWT configurada
- ✅ Build de produção testado

---

## 📋 Variáveis de Ambiente no Render

Configure estas variáveis no painel do Render (Settings → Environment):

```
DATABASE_URL=postgresql://neondb_owner:npg.qzkFJIRK7Yp@ep-latest-azcmjwpt-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require

GEMINI_API_KEY=AIzaSyAZRAUkjqZT-QqZ0Tmb7XsVIBH4tOzxzEw

JWT_SECRET=000b569a-4186-416a-b140-488e94f936a7

KIWIFY_WEBHOOK_SECRET=277639b94aae80d2525c3af05e95292540b91ae27e58479dfedb16c5f0d6963d

NODE_ENV=production

PORT=5000
```

---

## 🔧 Configuração do Render

### Build Command:
```bash
npm ci && npm run build
```

### Start Command:
```bash
npm start
```

### Node Version:
```
22.16.0
```

---

## 🎯 Funcionalidades Implementadas

### 1. **Gerador de Prompt** (`/api/prompt/generate`)
- Custo: 2 créditos
- Modelo: Gemini 2.5 Flash
- Entrada: Descrição do usuário
- Saída: Prompt otimizado em português

### 2. **Gerador de Imagem** (`/api/image/generate`)
- Custo: 5 créditos
- Modelo: Gemini 2.5 Flash Image
- Entrada: Prompt + aspect ratio (16:9, 9:16, 1:1)
- Saída: Imagem em base64

### 3. **Gerador de Vídeo** (`/api/video/generate`)
- Custo: 20 créditos
- Modelo: Veo 3.1
- Modos: Text-to-Video, Image-to-Video, Reference-to-Video
- Entrada: Prompt + configurações (resolução, formato)
- Saída: URL do vídeo

### 4. **Chat IA** (`/api/chat/send-message`)
- Custo: 1 crédito por mensagem
- Modelo: Gemini 2.5 Flash
- Suporta histórico de conversas

### 5. **Sistema de Créditos**
- Webhook Kiwify: `/api/webhook/kiwify`
- Conversão: R$ 1,00 = 10 créditos
- Consulta de saldo: `/api/credits/balance`

### 6. **Autenticação**
- Registro: `/api/auth/register`
- Login: `/api/auth/login`
- JWT com expiração de 7 dias

---

## 🔗 Configuração do Webhook Kiwify

1. Acesse o painel da Kiwify
2. Vá em Configurações → Webhooks
3. Adicione a URL: `https://seu-app.onrender.com/api/webhook/kiwify`
4. Selecione eventos: `purchase.approved`, `purchase.refunded`
5. Copie o Webhook Secret e adicione no Render

---

## 🧪 Testando Após Deploy

### 1. Testar Registro
```bash
curl -X POST https://seu-app.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teste@email.com",
    "password": "senha123"
  }'
```

### 2. Testar Login
```bash
curl -X POST https://seu-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teste@email.com",
    "password": "senha123"
  }'
```

### 3. Testar Webhook Kiwify
```bash
curl -X POST https://seu-app.onrender.com/api/webhook/kiwify \
  -H "Content-Type: application/json" \
  -d '{
    "purchase_id": "test123",
    "customer_email": "teste@email.com",
    "customer_name": "Teste User",
    "product_name": "Plano Premium",
    "product_id": "prod123",
    "value": 19.00,
    "status": "approved"
  }'
```

### 4. Testar Gerador de Prompt (com token)
```bash
curl -X POST https://seu-app.onrender.com/api/prompt/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -d '{
    "userInput": "Um gato fofo brincando"
  }'
```

---

## 📊 Custos de Créditos

| Operação | Créditos | Equivalente em R$ |
|----------|----------|-------------------|
| Chat     | 1        | R$ 0,10          |
| Prompt   | 2        | R$ 0,20          |
| Imagem   | 5        | R$ 0,50          |
| Vídeo    | 20       | R$ 2,00          |

---

## 🐛 Troubleshooting

### Erro: "GEMINI_API_KEY not configured"
- Verifique se a variável está configurada no Render
- Certifique-se de que não há espaços extras

### Erro: "Database connection failed"
- Verifique se DATABASE_URL está correto
- Confirme que `sslmode=require` está na URL
- Teste a conexão no painel da Neon

### Erro: "Insufficient credits"
- Usuário precisa comprar créditos via Kiwify
- Teste o webhook manualmente
- Verifique logs do Render para ver se o webhook foi recebido

### Build falha no Render
- Verifique se todas as dependências estão em `dependencies` (não `devDependencies`)
- Confirme que `esbuild` e `vite` estão em `dependencies`
- Veja os logs completos no Render

---

## 🚀 Passos para Deploy

1. **Commit e Push**
```bash
git add .
git commit -m "fix: prepare for Render deployment with all integrations"
git push origin main
```

2. **No Render Dashboard**
   - Clique em "Manual Deploy"
   - Aguarde o build completar (3-5 minutos)
   - Verifique os logs para erros

3. **Configurar Variáveis**
   - Settings → Environment
   - Adicione todas as variáveis listadas acima
   - Clique em "Save Changes"

4. **Redeploy**
   - Após adicionar variáveis, faça um novo deploy
   - Manual Deploy → Deploy latest commit

5. **Testar**
   - Acesse a URL do app
   - Teste registro e login
   - Teste os geradores

---

## ✅ Checklist Final

- [ ] Todas as variáveis de ambiente configuradas no Render
- [ ] Build completa sem erros
- [ ] App acessível via URL do Render
- [ ] Registro de usuário funciona
- [ ] Login funciona e retorna JWT
- [ ] Webhook Kiwify configurado
- [ ] Teste de compra adiciona créditos
- [ ] Gerador de prompt funciona
- [ ] Gerador de imagem funciona
- [ ] Gerador de vídeo funciona
- [ ] Chat funciona
- [ ] Créditos são deduzidos corretamente

---

**Última atualização:** 02 de Dezembro de 2024

**Status:** ✅ Pronto para produção
