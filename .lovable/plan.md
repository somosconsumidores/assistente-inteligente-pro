

# Correcoes no Mestre dos Produtos

## Problema 1: Preco divergente entre chat e cards

**Causa raiz:** A IA gera um preco medio no chat (ex: R$ 18.999 para a Samsung). Depois, o frontend busca precos em tempo real via `search-product-prices`, que retorna um preco medio diferente (ex: R$ 6.993) baseado em resultados de Google Shopping que podem incluir modelos diferentes ou tamanhos menores. O card sobrescreve o preco original da IA pelo preco em tempo real, causando a divergencia.

**Solucao:** No hook `useProductChat.ts`, na funcao `fetchProductsFromDatabase`, usar o preco salvo no banco (que corresponde ao preco mostrado no chat pela IA) como preco principal do card. Os precos em tempo real serao exibidos apenas como informacao complementar (menor preco encontrado), sem substituir o preco medio original.

### Arquivo: `src/hooks/useProductChat.ts`
- Na transformacao dos produtos (linhas ~70-100), manter `product.price_average` como preco principal
- Usar o preco em tempo real apenas para preencher `priceSource` e `link` (URL da loja com menor preco)
- Nao sobrescrever `priceValue` com `priceData.average_price`

---

## Problema 2: "Ver Ofertas" bloqueado pelo Google

**Causa raiz:** O botao "Ver Ofertas" redireciona para `google.com/search?tbm=shop`, que bloqueia requisicoes vindas de iframes (ERR_BLOCKED_BY_RESPONSE). Alem disso, as URLs retornadas pelo `search-product-prices` estao vazias (`""`).

**Solucao:** Alterar o fallback no `ProductActions.tsx` para buscar diretamente no Mercado Livre ou Amazon Brasil em vez do Google Shopping, que sao sites que nao bloqueiam redirecionamento.

### Arquivo: `src/components/product/ProductActions.tsx`
- Trocar o fallback de Google Shopping para busca no Mercado Livre: `https://lista.mercadolivre.com.br/{produto}`
- Adicionar um segundo botao "Amazon" que abre `https://www.amazon.com.br/s?k={produto}`

---

## Problema 3: Tracos (dashes) no topo do chat

**Causa raiz:** O `FormattedMessage.tsx` faz parsing de tabelas Markdown. Quando a IA retorna uma tabela, a linha separadora (`|---|---|---|`) e interpretada como uma linha de dados da tabela, renderizando celulas com tracos (`---`).

**Solucao:** No `FormattedMessage.tsx`, adicionar um filtro na funcao `parseTableContent` para ignorar linhas separadoras de tabela (linhas que contem apenas `|`, `-`, `:` e espacos).

### Arquivo: `src/components/FormattedMessage.tsx`
- Na funcao `parseTableContent`, ao verificar se uma linha e uma table row (linha 57), adicionar condicao para excluir linhas separadoras: linhas onde todas as celulas contem apenas tracos e dois-pontos
- Filtrar as celulas apos o split por `|` para remover celulas que sejam apenas tracos

---

## Resumo das Alteracoes

| Arquivo | Mudanca |
|---------|---------|
| `src/hooks/useProductChat.ts` | Usar preco do banco como principal, real-time apenas como complemento |
| `src/components/product/ProductActions.tsx` | Trocar Google Shopping por Mercado Livre e Amazon |
| `src/components/FormattedMessage.tsx` | Filtrar linhas separadoras de tabela no parser |

