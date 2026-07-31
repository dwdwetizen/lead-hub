# Lead Hub

Quero completar o frontend existente do LocalWay OS, concentrando o trabalho exclusivamente em três módulos:

Prospecção

Follow-up

CRM

IMPORTANTE:

Não altere Dashboard, Mapa de Calor ou Volume de Busca.

Reutilize exatamente o design system, sidebar, header, cores, tipografia, responsividade e densidade visual já existentes.

Não crie landing page.

Não entregue telas vazias ou placeholders.

Implemente todas as interações visuais usando dados simulados centralizados.

Não conecte Supabase nem APIs externas.

Organize o código para o frontend ser posteriormente integrado a um backend existente em Next.js, Supabase, Google Places, Google Agenda e Grok.

Não altere o framework, roteamento, estrutura ou gerenciador de pacotes do projeto.

Tudo precisa funcionar em desktop e celular.

Textos em português do Brasil.

OBJETIVO VISUAL

Quero uma interface SaaS premium, compacta e rápida, inspirada na qualidade de Linear, Attio, Stripe Dashboard e CRMs modernos.

Evite:

Cards excessivamente altos.

Espaços vazios exagerados.

Gradientes roxos.

Aparência genérica de aplicativo criado por IA.

Tabelas largas no celular.

Modais para ações que podem acontecer diretamente na linha do lead.

PROSPECÇÃO

A rota deve ser /prospeccao.

Ao entrar, abrir diretamente a aba “Presencial”.

Criar três abas:

Presencial

Online

Arquivados

PROSPECÇÃO PRESENCIAL

Adicionar um botão “Cadastrar lead” com formulário contendo:

Empresa

Segmento

Cidade

Endereço

Telefone

WhatsApp

Nome do funcionário ou atendente

Nome do decisor

E-mail

Observações

Mostrar os leads em uma lista compacta. Cada linha deve exibir:

Empresa

Segmento

Telefone ou WhatsApp

Nome do contato

Data do último contato

Próxima ação

Contagem regressiva

Indicador de urgência

Resultado

Ações rápidas

Não usar cards altos. A linha pode expandir para mostrar informações complementares.

Ações diretamente na linha:

Não atendeu

Retornar depois

Sem interesse

Arquivar

NÃO ATENDEU

Ao clicar:

Registrar visualmente a tentativa.

Manter o lead na Prospecção.

Programar automaticamente uma nova tentativa para amanhã.

Mostrar confirmação: “Nova tentativa agendada para amanhã”.

Atualizar imediatamente o indicador de urgência.

RETORNAR DEPOIS

Ao clicar:

Abrir um pequeno popover ancorado ao botão, sem abrir uma página nova.

Mostrar opções rápidas: Hoje, Amanhã, próximos dias.

Incluir calendário completo para selecionar uma data mais distante.

Mês e ano automáticos.

Permitir observação opcional.

Confirmar com “Agendar retorno”.

Após confirmar, indicar visualmente que o lead será enviado ao Follow-up.

Atualizar a interface imediatamente.

SEM INTERESSE

Ao clicar:

Solicitar uma confirmação simples.

Permitir registrar uma observação.

Manter histórico do resultado.

Oferecer ação separada para arquivar.

ARQUIVAR

Arquivar não significa excluir.

Mostrar confirmação.

Enviar o lead para a aba “Arquivados”.

Na aba Arquivados, permitir restaurar.

Não criar botão de exclusão definitiva para colaboradores.

SISTEMA DE URGÊNCIA

Criar um componente reutilizável UrgencyBadge.

Regras:

Vermelho: atrasado, contato para hoje ou amanhã.

Amarelo: contato em dois ou três dias.

Verde: contato em quatro dias ou mais.

Cinza: nenhuma data agendada.

Mostrar também textos automáticos:

“Atrasado há 2 dias”

“Contato hoje”

“Contato amanhã”

“Contato em 3 dias”

A urgência deve aparecer por cor, ícone e texto. Não depender somente da cor.

PROSPECÇÃO ONLINE

Criar formulário compacto com:

Segmento

Cidade ou bairro

Quantidade de empresas

Botão “Gerar leads”

Mostrar os resultados em lista, usando o mesmo componente visual da prospecção presencial.

Identificar a origem com badge “Online”.

A parte visual deve estar pronta para futuramente receber empresas da Google Places API.

FOLLOW-UP

A rota deve ser /follow-up.

Mostrar os leads enviados pela ação “Retornar depois”.

Criar uma lista compacta com:

Empresa

Nome do decisor

Telefone

WhatsApp

Data e horário do próximo contato

Contagem regressiva

Urgência

Última anotação

Indicador de existência de áudio ou resumo

Ações rápidas

Filtros:

Todos

Atrasados

Hoje

Amanhã

Esta semana

Sem data

Adicionar busca por empresa, decisor ou telefone.

Ao selecionar um lead, abrir painel lateral no desktop e bottom sheet no celular.

O painel deve mostrar:

Informações da empresa

Decisor

Histórico completo

Observações

Próximo contato

Espaço para transcrição de áudio

Resumo da IA

Dores identificadas

Objeções

Próximos passos

Roteiro recomendado para ligação

Usar dados simulados para demonstrar o resumo de IA. Manter esse conteúdo em um componente independente chamado AudioSummary.

Ações do Follow-up:

Registrar contato

Retornar novamente

Reunião marcada

Sem interesse

Arquivar

RETORNAR NOVAMENTE

Abrir o mesmo seletor rápido de data.

Atualizar urgência e contagem regressiva.

Adicionar a ação ao histórico.

REUNIÃO MARCADA

Abrir modal ou bottom sheet contendo:

Data

Horário

Duração

Nome da pessoa

Telefone

WhatsApp

E-mail

Local ou link da reunião

Observações

Mostrar a informação:

“Após confirmar, a reunião será enviada ao Google Agenda e o lead entrará no CRM.”

No frontend simulado, atualizar o estado visual imediatamente e enviar o lead para o CRM.

CRM

A rota deve ser /crm.

Criar um CRM Kanban premium, compacto e responsivo.

Etapas:

Reunião marcada

Reunião realizada

Proposta enviada

Em negociação

Pago

Perdido

Cada card deve mostrar:

Empresa

Colaborador responsável

Data da reunião

Valor estimado

Próxima ação

Tempo na etapa

Urgência

Telefone ou WhatsApp

Origem do lead

Adicionar:

Busca

Filtro por colaborador

Filtro por período

Filtro por etapa

Visão Kanban

Visão em lista

Resumo do pipeline

Negócios ativos

Ticket médio

Vendas pagas

PERMISSÕES VISUAIS

Simular dois tipos de acesso:

Gestão:

Pode movimentar cards.

Pode editar informações.

Pode visualizar todos os colaboradores.

Pode filtrar por colaborador.

Colaborador:

Visualiza somente seus leads.

Acompanha o andamento.

Não consegue arrastar nem mudar a etapa.

Mostrar aviso discreto de “Modo de acompanhamento”.

Ao mover um card para “Pago”:

Mostrar confirmação.

Atualizar a quantidade de vendas convertidas do colaborador.

Registrar a movimentação no histórico do lead.

Atualizar os indicadores do CRM.

Ao clicar em um card, abrir painel lateral com:

Dados da empresa

Responsável

Histórico

Reuniões

Proposta

Valor

Observações

Resumo da prospecção

Resumo da IA

Próxima ação

MOBILE

No celular:

Listas em vez de tabelas largas.

Abas com rolagem horizontal suave.

CRM com alternância por etapa ou Kanban horizontal.

Painéis laterais como bottom sheets.

Botões com pelo menos 44px.

Nenhuma rolagem horizontal acidental.

Ações principais acessíveis com uma mão.

Urgência sempre visível.

COMPONENTES REUTILIZÁVEIS

Criar ou complementar:

ProspectingTabs

CompactLeadRow

UrgencyBadge

StatusBadge

ReturnDatePopover

LeadDetailsPanel

FollowUpFilters

FollowUpRow

MeetingScheduler

AudioSummary

KanbanBoard

KanbanCard

PipelineMetrics

HistoryTimeline

ArchiveConfirmation

ResponsiveBottomSheet

DADOS E INTEGRAÇÃO FUTURA

Centralizar todos os dados simulados em uma pasta como:

src/mocks

src/services

Não espalhar dados estáticos pelos componentes.

Criar funções assíncronas simuladas para:

Criar lead

Atualizar resultado

Agendar retorno

Arquivar

Restaurar

Enviar ao Follow-up

Marcar reunião

Enviar ao CRM

Movimentar etapa

Registrar pagamento

Manter assinaturas simples para que essas funções sejam posteriormente substituídas pelas APIs reais sem reconstruir os componentes.

ENTREGA

Implemente completamente as três telas e todas as interações descritas.

Não responda apenas explicando o que faria. Crie os arquivos, rotas, componentes, dados simulados, estados e interações.

Ao terminar, verifique:

Todas as rotas abrem.

Nenhum menu aponta para tela vazia.

Não existem erros no console.

Desktop e mobile funcionam.

Os componentes seguem o design atual.

“Não atendeu” agenda amanhã.

“Retornar depois” abre o calendário e envia ao Follow-up.

“Reunião marcada” envia ao CRM.

A urgência muda automaticamente entre vermelho, amarelo e verde.

O colaborador não movimenta o CRM.

A gestão consegue movimentar os cards.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a041834c-003d-4aeb-9392-36d4fdaecc08).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
