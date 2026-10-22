import { Finding } from "../types";

// Achados de uma auditoria de aplicação web. Dados inventados para ilustrar o painel.
// Os críticos de Controle de Acesso aparecem primeiro de propósito: é onde quase sempre
// está o vazamento que ninguém procura.
export const FINDINGS: Finding[] = [
  {
    id: "SEN-001",
    title: "Usuário autenticado acessa pedido de outro cliente pelo ID",
    category: "Controle de Acesso",
    severity: "critica",
    status: "aberto",
    area: "GET /api/pedidos/{id}",
    description:
      "O endpoint de pedidos confia no ID da URL e não confere se o pedido pertence a quem fez a requisição. Qualquer conta logada alcança o pedido de qualquer outra apenas trocando o número.",
    risk:
      "Dado de compra, endereço e valor de todos os clientes expostos a qualquer conta ativa. É o tipo de falha que vaza a base inteira sem deixar rastro de invasão.",
    fix:
      "Checar na camada de serviço se o pedido pertence ao usuário da sessão, não só se a sessão existe. Aplicar a mesma regra a todo endpoint que recebe um ID.",
    reproducao:
      "Autenticado como cliente A, requisitar o ID de um pedido do cliente B. Passo a passo completo no relatório.",
    discovered: "2026-10-18",
    owner: "Backend",
  },
  {
    id: "SEN-002",
    title: "Edição de perfil aceita trocar o papel do usuário",
    category: "Controle de Acesso",
    severity: "critica",
    status: "em_correcao",
    area: "PUT /api/usuarios/{id}",
    description:
      "O formulário de perfil envia o campo de papel junto com nome e telefone, e o servidor grava o que chega. Um usuário comum consegue se promover a administrador na própria requisição.",
    risk:
      "Qualquer cliente vira administrador e passa a ver e mudar tudo. Uma conta comprometida deixa de ser um problema de uma conta.",
    fix:
      "Nunca aceitar o papel vindo do cliente. Definir papel só em fluxo de administração, com lista explícita de campos que o próprio usuário pode alterar.",
    reproducao:
      "Interceptar o salvamento de perfil e incluir o campo de papel. Detalhes no relatório.",
    discovered: "2026-10-18",
    owner: "Backend",
  },
  {
    id: "SEN-003",
    title: "Sessão não expira após troca de senha",
    category: "Autenticação",
    severity: "alta",
    status: "aberto",
    area: "POST /api/auth/senha",
    description:
      "Ao trocar a senha, as sessões antigas continuam válidas. Quem já estava dentro permanece dentro mesmo depois de a vítima trocar a senha.",
    risk:
      "Depois de um vazamento de senha, trocar a senha não expulsa o invasor, que era justamente o objetivo da troca.",
    fix:
      "Invalidar todas as sessões ativas na troca de senha e forçar novo login em todos os dispositivos.",
    reproducao:
      "Abrir duas sessões, trocar a senha em uma e seguir navegando na outra.",
    discovered: "2026-10-17",
    owner: "Backend",
  },
  {
    id: "SEN-004",
    title: "Recuperação de senha permite enumerar e-mails cadastrados",
    category: "Autenticação",
    severity: "media",
    status: "aberto",
    area: "POST /api/auth/recuperar",
    description:
      "A tela de recuperação responde de forma diferente para e-mail cadastrado e não cadastrado, o que entrega a lista de quem tem conta.",
    risk:
      "Facilita montar uma lista de alvos reais antes de tentar invadir, e expõe que uma pessoa específica usa a plataforma.",
    fix:
      "Responder sempre a mesma mensagem, com o mesmo tempo de resposta, independente de o e-mail existir.",
    reproducao:
      "Comparar a resposta para um e-mail real e um inventado.",
    discovered: "2026-10-17",
    owner: "Backend",
  },
  {
    id: "SEN-005",
    title: "Token de sessão sem marcação segura no cookie",
    category: "Configuração",
    severity: "alta",
    status: "aberto",
    area: "Cookie de sessão",
    description:
      "O cookie de sessão não vem com as marcações que impedem leitura por script e envio fora do site, então fica mais fácil de ser roubado.",
    risk:
      "Um único ponto de script injetado em qualquer página passa a conseguir levar a sessão do usuário embora.",
    fix:
      "Marcar o cookie como HttpOnly, Secure e SameSite, e revisar o tempo de vida da sessão.",
    reproducao:
      "Inspecionar o cookie de sessão no navegador.",
    discovered: "2026-10-16",
    owner: "Infraestrutura",
  },
  {
    id: "SEN-006",
    title: "Upload de arquivo aceita qualquer extensão",
    category: "Configuração",
    severity: "alta",
    status: "em_correcao",
    area: "POST /api/arquivos",
    description:
      "O envio de comprovantes não valida o tipo real do arquivo, só o nome. Dá para subir um arquivo executável disfarçado.",
    risk:
      "Abre caminho para hospedar conteúdo malicioso no próprio domínio da plataforma, com a confiança que o domínio carrega.",
    fix:
      "Validar o tipo real do conteúdo, limitar extensões, servir o arquivo de um domínio separado e sem execução.",
    reproducao:
      "Subir um arquivo com extensão trocada e observar o aceite.",
    discovered: "2026-10-16",
    owner: "Backend",
  },
  {
    id: "SEN-007",
    title: "Lista de clientes paginada sem limite por conta",
    category: "Controle de Acesso",
    severity: "alta",
    status: "aberto",
    area: "GET /api/clientes",
    description:
      "A busca de clientes filtra na tela, mas a resposta da API traz a base toda paginada, sem restringir ao que a conta deveria ver.",
    risk:
      "O filtro visual esconde o problema. A base inteira sai pela API para quem olhar a resposta direto.",
    fix:
      "Filtrar no servidor pelo escopo da conta, nunca confiar no filtro aplicado só na tela.",
    reproducao:
      "Chamar a API de clientes sem o filtro da interface.",
    discovered: "2026-10-15",
    owner: "Backend",
  },
  {
    id: "SEN-008",
    title: "Mensagem de erro expõe estrutura interna do banco",
    category: "Exposição de Dados",
    severity: "media",
    status: "aberto",
    area: "Tratamento de erro global",
    description:
      "Quando algo quebra, a resposta devolve o erro bruto, com nomes de tabelas e caminhos internos.",
    risk:
      "Entrega um mapa de como o sistema é feito por dentro, o que encurta muito o trabalho de quem quer entrar.",
    fix:
      "Mensagem genérica para o usuário, detalhe só no log interno, nunca na resposta.",
    reproducao:
      "Forçar um erro de validação e ler a resposta.",
    discovered: "2026-10-15",
    owner: "Backend",
  },
  {
    id: "SEN-009",
    title: "Campo de busca reflete entrada sem tratamento",
    category: "Injeção",
    severity: "alta",
    status: "aberto",
    area: "Busca do catálogo",
    description:
      "O que a pessoa digita na busca volta na página sem tratamento, o que permite injetar script que roda no navegador de quem abrir o link.",
    risk:
      "Um link preparado rouba a sessão de quem clicar, inclusive de um administrador.",
    fix:
      "Tratar a saída ao renderizar e aplicar política de conteúdo que bloqueie script externo.",
    reproducao:
      "Buscar por um trecho de script e observar a página.",
    discovered: "2026-10-14",
    owner: "Frontend",
  },
  {
    id: "SEN-010",
    title: "Exportação de relatório sem verificação de permissão",
    category: "Controle de Acesso",
    severity: "critica",
    status: "aberto",
    area: "GET /api/relatorios/export",
    description:
      "A exportação de relatórios financeiros está acessível a qualquer conta logada, não só ao perfil financeiro.",
    risk:
      "Faturamento e dados sensíveis saem em um clique para quem não deveria nem ver a tela.",
    fix:
      "Exigir o papel financeiro no servidor antes de gerar o arquivo, registrar quem exportou.",
    reproducao:
      "Acessar a rota de exportação com uma conta comum.",
    discovered: "2026-10-14",
    owner: "Backend",
  },
  {
    id: "SEN-011",
    title: "Limite de tentativas de login ausente",
    category: "Autenticação",
    severity: "media",
    status: "corrigido",
    area: "POST /api/auth/login",
    description:
      "O login não limita tentativas, o que deixa testar senhas em massa contra uma conta.",
    risk:
      "Contas com senha fraca caem por tentativa e erro, sem ninguém perceber.",
    fix:
      "Limitar tentativas por conta e por origem, com espera progressiva e alerta.",
    reproducao:
      "Repetir tentativas de senha contra a mesma conta.",
    discovered: "2026-10-13",
    owner: "Backend",
  },
  {
    id: "SEN-012",
    title: "Senha guardada com algoritmo fraco",
    category: "Criptografia",
    severity: "alta",
    status: "em_correcao",
    area: "Armazenamento de credenciais",
    description:
      "As senhas estão guardadas com um método antigo e rápido de quebrar, em vez de um próprio para senhas.",
    risk:
      "Se o banco vazar, as senhas viram texto aberto em pouco tempo, e muita gente repete senha entre serviços.",
    fix:
      "Migrar para um algoritmo moderno de hash de senha, com custo ajustável, e reidratar no próximo login.",
    reproducao:
      "Revisar o formato de armazenamento das credenciais.",
    discovered: "2026-10-13",
    owner: "Backend",
  },
  {
    id: "SEN-013",
    title: "Webhook de pagamento sem validação de assinatura",
    category: "Lógica de Negócio",
    severity: "critica",
    status: "aberto",
    area: "POST /api/webhooks/pagamento",
    description:
      "O aviso de pagamento aprovado é aceito sem conferir se veio mesmo do provedor. Dá para confirmar um pedido sem ter pago.",
    risk:
      "Pedido liberado sem pagamento real. O prejuízo é direto e some no volume.",
    fix:
      "Validar a assinatura do provedor em todo webhook e conferir o valor contra o pedido antes de liberar.",
    reproducao:
      "Enviar um aviso de pagamento forjado ao endpoint.",
    discovered: "2026-10-12",
    owner: "Backend",
  },
  {
    id: "SEN-014",
    title: "Cupom de desconto aceita valor negativo",
    category: "Lógica de Negócio",
    severity: "media",
    status: "aberto",
    area: "POST /api/carrinho/cupom",
    description:
      "O cálculo de desconto não trava valores fora da faixa, e um cupom manipulado consegue baixar o total abaixo de zero.",
    risk:
      "Compra sai de graça ou gera crédito indevido, de novo um prejuízo que se esconde no fluxo normal.",
    fix:
      "Validar faixa do desconto no servidor e recalcular o total sempre do lado de cá.",
    reproducao:
      "Aplicar um cupom com valor fora da faixa esperada.",
    discovered: "2026-10-12",
    owner: "Backend",
  },
  {
    id: "SEN-015",
    title: "Painel administrativo acessível sem segundo fator",
    category: "Autenticação",
    severity: "alta",
    status: "aberto",
    area: "/admin",
    description:
      "O acesso administrativo depende só de senha. Sem segundo fator, uma senha vazada abre o painel inteiro.",
    risk:
      "O painel é a chave do reino. Uma senha comprometida entrega tudo de uma vez.",
    fix:
      "Exigir segundo fator para todo acesso administrativo e registrar logins por origem.",
    reproducao:
      "Entrar no painel apenas com usuário e senha.",
    discovered: "2026-10-11",
    owner: "Infraestrutura",
  },
  {
    id: "SEN-016",
    title: "Backup acessível em pasta pública",
    category: "Exposição de Dados",
    severity: "critica",
    status: "aberto",
    area: "armazenamento público",
    description:
      "Um backup antigo do banco ficou em uma pasta de arquivos aberta, alcançável por link direto.",
    risk:
      "A base inteira, de uma data anterior, disponível para download por quem achar o caminho.",
    fix:
      "Remover o arquivo, fechar a pasta, revisar o que mais foi publicado ali e girar as credenciais expostas.",
    reproducao:
      "Acessar o caminho do backup pelo link direto.",
    discovered: "2026-10-11",
    owner: "Infraestrutura",
  },
  {
    id: "SEN-017",
    title: "Chave de integração visível no código do navegador",
    category: "Exposição de Dados",
    severity: "alta",
    status: "aberto",
    area: "pacote do frontend",
    description:
      "Uma chave de serviço externo está embutida no código que vai para o navegador, visível a qualquer visitante.",
    risk:
      "A chave pode ser usada por terceiros, gerando custo ou acesso em nome da plataforma.",
    fix:
      "Mover a chave para o servidor, nunca expor no pacote do navegador, e girar a chave atual.",
    reproducao:
      "Procurar a chave no código entregue ao navegador.",
    discovered: "2026-10-10",
    owner: "Frontend",
  },
  {
    id: "SEN-018",
    title: "Notificação por e-mail permite forjar remetente interno",
    category: "Configuração",
    severity: "media",
    status: "aberto",
    area: "envio de e-mail",
    description:
      "O domínio de e-mail não tem as proteções que impedem terceiros de enviar mensagens se passando pela plataforma.",
    risk:
      "Golpe de phishing com o nome da plataforma, difícil de o cliente distinguir do real.",
    fix:
      "Configurar as políticas de autenticação de e-mail do domínio e monitorar os relatórios.",
    reproducao:
      "Checar as políticas publicadas do domínio de e-mail.",
    discovered: "2026-10-10",
    owner: "Infraestrutura",
  },
  {
    id: "SEN-019",
    title: "Comentário em pedido não trata entrada de texto",
    category: "Injeção",
    severity: "media",
    status: "corrigido",
    area: "comentários de pedido",
    description:
      "O campo de observação do pedido guardava o texto sem tratamento, e ele voltava bruto no painel da equipe.",
    risk:
      "Um pedido preparado conseguia rodar script na tela de quem atendia.",
    fix:
      "Tratar a saída ao exibir e limitar o conteúdo aceito no campo.",
    reproducao:
      "Registrar um comentário com script e abrir no painel.",
    discovered: "2026-10-09",
    owner: "Frontend",
  },
  {
    id: "SEN-020",
    title: "Rota de API antiga ainda ativa sem autenticação",
    category: "Controle de Acesso",
    severity: "alta",
    status: "aberto",
    area: "GET /api/v1/usuarios",
    description:
      "Uma versão antiga da API continua no ar e não exige login, embora a versão atual já exija.",
    risk:
      "A porta nova está trancada, a velha ficou aberta ao lado, e é por ela que se entra.",
    fix:
      "Desligar a versão antiga ou colocá-la atrás da mesma autenticação da atual.",
    reproducao:
      "Acessar a rota da versão antiga sem credenciais.",
    discovered: "2026-10-09",
    owner: "Backend",
  },
  {
    id: "SEN-021",
    title: "Falta registro de acesso a dados sensíveis",
    category: "Configuração",
    severity: "baixa",
    status: "aberto",
    area: "trilha de auditoria",
    description:
      "Acessos a dados sensíveis não deixam registro, então, se algo vazar, não há como saber por onde nem por quem.",
    risk:
      "Sem trilha, um incidente vira investigação no escuro, e a plataforma não consegue provar o que aconteceu.",
    fix:
      "Registrar acesso a dados sensíveis com quem, quando e o quê, guardado fora do alcance comum.",
    reproducao:
      "Verificar se há trilha ao acessar um dado sensível.",
    discovered: "2026-10-08",
    owner: "Infraestrutura",
  },
  {
    id: "SEN-022",
    title: "Convite de equipe não expira",
    category: "Autenticação",
    severity: "baixa",
    status: "reteste_ok",
    area: "convites de equipe",
    description:
      "O link de convite para a equipe continuava válido por tempo indefinido depois de enviado.",
    risk:
      "Um convite reencaminhado ou vazado abria acesso meses depois, sem ninguém notar.",
    fix:
      "Dar prazo curto ao convite e invalidar ao primeiro uso.",
    reproducao:
      "Usar um link de convite antigo.",
    discovered: "2026-10-07",
    owner: "Backend",
  },
  {
    id: "SEN-023",
    title: "Cabeçalhos de segurança ausentes nas respostas",
    category: "Configuração",
    severity: "baixa",
    status: "corrigido",
    area: "respostas HTTP",
    description:
      "As respostas não trazem os cabeçalhos que endurecem o navegador contra ataques comuns.",
    risk:
      "O navegador fica sem as travas que evitariam parte dos ataques de página.",
    fix:
      "Adicionar os cabeçalhos de segurança padrão e a política de conteúdo em todas as respostas.",
    reproducao:
      "Inspecionar os cabeçalhos de uma resposta qualquer.",
    discovered: "2026-10-07",
    owner: "Infraestrutura",
  },
  {
    id: "SEN-024",
    title: "Versão de biblioteca com falha conhecida",
    category: "Configuração",
    severity: "media",
    status: "aberto",
    area: "dependências",
    description:
      "Uma biblioteca usada no projeto está em versão com falha pública já corrigida nas versões novas.",
    risk:
      "Falha conhecida é a mais fácil de explorar, porque o passo a passo já está publicado.",
    fix:
      "Atualizar a biblioteca e colocar checagem de dependências no fluxo de entrega.",
    reproducao:
      "Comparar a versão em uso com as versões corrigidas.",
    discovered: "2026-10-06",
    owner: "Backend",
  },
];
