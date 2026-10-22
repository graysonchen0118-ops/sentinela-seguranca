import { Finding } from "../types";

// Achados de uma auditoria de integridade de um aplicativo de poker online.
// Dados inventados. As duas frentes que decidem o jogo vêm primeiro: sigilo da carta
// (ninguém vê a mão do outro) e aleatoriedade (ninguém prevê a próxima carta).
export const FINDINGS: Finding[] = [
  {
    id: "SEN-001",
    title: "Servidor envia as cartas de todos os jogadores ao aplicativo",
    category: "Sigilo de Cartas",
    severity: "critica",
    status: "aberto",
    area: "WS mesa:estado",
    description:
      "No início de cada mão o servidor manda a mão de todos os jogadores para cada aplicativo, e a tela apenas esconde as cartas dos adversários. O dado da carta alheia já chegou no dispositivo.",
    risk:
      "Um aplicativo modificado lê a carta de todo mundo sem parecer ataque. A mesa roda normal enquanto um jogador vê tudo por baixo.",
    fix:
      "A carta privada nunca sai do servidor até o showdown. Cada jogador recebe só a própria mão, e a do adversário só é revelada quando a regra manda.",
    reproducao:
      "Inspecionar o conteúdo que o servidor envia ao cliente no começo da mão. Detalhes no relatório.",
    discovered: "2026-10-22",
    owner: "Servidor de jogo",
  },
  {
    id: "SEN-002",
    title: "Embaralhamento usa gerador previsível",
    category: "Aleatoriedade (RNG)",
    severity: "critica",
    status: "aberto",
    area: "Serviço de embaralhamento",
    description:
      "O baralho é embaralhado com um gerador comum, não criptográfico, semeado por algo adivinhável. Vendo algumas cartas dá para reconstruir o estado e calcular as próximas.",
    risk:
      "Ver três cartas passa a bastar para prever o resto, como adivinhar o baralho inteiro espiando o começo.",
    fix:
      "Embaralhar com gerador criptográfico e adotar baralho justo verificável: o servidor compromete o baralho antes da mão e revela depois, sem dar como prever.",
    reproducao:
      "Analisar a fonte de aleatoriedade e a semente do embaralhamento.",
    discovered: "2026-10-22",
    owner: "Servidor de jogo",
  },
  {
    id: "SEN-003",
    title: "Histórico da mão mostra carta de quem não foi ao showdown",
    category: "Sigilo de Cartas",
    severity: "critica",
    status: "em_correcao",
    area: "GET /api/maos/{id}",
    description:
      "O replay da mão traz a carta de jogadores que desistiram antes do showdown, cartas que deveriam permanecer secretas para sempre.",
    risk:
      "Depois da mão dá para aprender o estilo e o blefe de cada adversário com a carta que ninguém deveria ver.",
    fix:
      "O histórico só expõe cartas que chegaram ao showdown. O resto nunca é devolvido, nem para o próprio dono fora de contexto.",
    reproducao:
      "Abrir o histórico de uma mão em que alguém desistiu no pré-flop.",
    discovered: "2026-10-21",
    owner: "Servidor de jogo",
  },
  {
    id: "SEN-004",
    title: "Modo espectador recebe cartas privadas",
    category: "Sigilo de Cartas",
    severity: "alta",
    status: "aberto",
    area: "WS espectador",
    description:
      "Quem assiste a mesa como espectador recebe o mesmo fluxo dos jogadores, incluindo cartas privadas que a tela esconde.",
    risk:
      "Um cúmplice assistindo de fora lê a mão de todos e passa por chat ou telefone para quem está jogando.",
    fix:
      "O fluxo do espectador é separado e só carrega o que é público: cartas comunitárias e apostas, nunca a mão de ninguém.",
    reproducao:
      "Entrar como espectador e inspecionar o fluxo recebido.",
    discovered: "2026-10-21",
    owner: "Servidor de jogo",
  },
  {
    id: "SEN-005",
    title: "Reconexão reenvia o estado completo com cartas alheias",
    category: "Sigilo de Cartas",
    severity: "alta",
    status: "aberto",
    area: "WS mesa:resync",
    description:
      "Ao cair e reconectar, o jogador recebe um resync do estado que inclui a mão dos adversários, mesmo com a mão em andamento.",
    risk:
      "Basta forçar uma reconexão no meio da mão para receber tudo que deveria estar escondido.",
    fix:
      "O resync devolve só o estado público mais a própria mão, exatamente como o início da mão corrigido.",
    reproducao:
      "Derrubar a conexão no meio de uma mão e ler o resync.",
    discovered: "2026-10-20",
    owner: "Servidor de jogo",
  },
  {
    id: "SEN-006",
    title: "Resultado da mão é calculado no aplicativo",
    category: "Integridade da Partida",
    severity: "critica",
    status: "aberto",
    area: "cliente: avaliação da mão",
    description:
      "A força da mão e o vencedor são decididos no aplicativo e enviados ao servidor, que confia no que chega.",
    risk:
      "Um cliente modificado se declara vencedor de qualquer pote. O jogo inteiro passa a ser palavra do jogador.",
    fix:
      "O servidor é a única autoridade. Ele avalia a mão, decide o vencedor e distribui o pote, e o aplicativo só mostra.",
    reproducao:
      "Alterar o resultado enviado ao servidor e observar o aceite.",
    discovered: "2026-10-20",
    owner: "Servidor de jogo",
  },
  {
    id: "SEN-007",
    title: "Saque não confere o saldo real da conta",
    category: "Caixa e Saques",
    severity: "critica",
    status: "aberto",
    area: "POST /api/caixa/saque",
    description:
      "O pedido de saque confia no saldo informado pelo aplicativo, sem reconferir o saldo real no servidor.",
    risk:
      "Dá para sacar mais do que se tem, e o prejuízo é dinheiro de verdade saindo direto do caixa.",
    fix:
      "O saque recalcula o saldo no servidor a partir do histórico de mãos e depósitos antes de liberar qualquer valor.",
    reproducao:
      "Pedir um saque com saldo informado maior que o real.",
    discovered: "2026-10-19",
    owner: "Caixa",
  },
  {
    id: "SEN-008",
    title: "Duas contas na mesma mesa pela mesma origem",
    category: "Colusão e Bots",
    severity: "alta",
    status: "aberto",
    area: "entrada na mesa",
    description:
      "O sistema não impede que contas diferentes da mesma origem sentem na mesma mesa, abrindo espaço para multiconta e colusão.",
    risk:
      "Dois lugares controlados pela mesma pessoa cercam o adversário, que perde sem nunca entender por quê.",
    fix:
      "Bloquear contas correlacionadas na mesma mesa e sinalizar padrões de colusão para revisão humana.",
    reproducao:
      "Entrar na mesma mesa com duas contas da mesma origem.",
    discovered: "2026-10-19",
    owner: "Integridade",
  },
  {
    id: "SEN-009",
    title: "Sem detecção de automação nas ações da mesa",
    category: "Colusão e Bots",
    severity: "alta",
    status: "aberto",
    area: "ações de jogo",
    description:
      "Não há checagem de ritmo e padrão nas jogadas, então um robô joga dia e noite sem ser notado.",
    risk:
      "Bots drenam as mesas com disciplina que ninguém tem, e os jogadores de verdade vão embora.",
    fix:
      "Medir ritmo, padrão e tempo de reação, desafiar o que parece automático e revisar antes de punir.",
    reproducao:
      "Rodar jogadas automatizadas e ver se algo sinaliza.",
    discovered: "2026-10-18",
    owner: "Integridade",
  },
  {
    id: "SEN-010",
    title: "Carta privada aparece nos logs do servidor",
    category: "Sigilo de Cartas",
    severity: "alta",
    status: "aberto",
    area: "logs de jogo",
    description:
      "O log de depuração registra a mão de cada jogador em texto, e esse log é acessível a mais gente do que deveria.",
    risk:
      "Quem tem acesso ao log lê a mão de todas as mesas sem nem entrar no jogo.",
    fix:
      "Nunca registrar carta privada em log. Mascarar na origem e restringir quem lê a telemetria.",
    reproducao:
      "Procurar a carta privada nas linhas de log de uma mão.",
    discovered: "2026-10-18",
    owner: "Infraestrutura",
  },
  {
    id: "SEN-011",
    title: "Baralho sem compromisso público antes da mão",
    category: "Aleatoriedade (RNG)",
    severity: "alta",
    status: "aberto",
    area: "início da mão",
    description:
      "O servidor embaralha mas não publica um compromisso do baralho antes da mão, então não há como provar depois que ele não foi mudado.",
    risk:
      "Mesmo sendo honesto, o site fica sem defesa contra a acusação de viciar, e confiança é o ativo da mesa.",
    fix:
      "Publicar o hash do baralho e a semente do jogador antes da mão, e revelar a semente do servidor no fim para qualquer um verificar.",
    reproducao:
      "Verificar se existe compromisso publicado antes de distribuir.",
    discovered: "2026-10-17",
    owner: "Servidor de jogo",
  },
  {
    id: "SEN-012",
    title: "Sessão continua válida após troca de senha",
    category: "Controle de Acesso",
    severity: "alta",
    status: "em_correcao",
    area: "POST /api/auth/senha",
    description:
      "Trocar a senha não derruba as sessões antigas, então quem já estava dentro continua dentro.",
    risk:
      "Depois de uma conta invadida, trocar a senha não expulsa o invasor, que era o objetivo.",
    fix:
      "Invalidar todas as sessões na troca de senha e exigir novo login em todos os aparelhos.",
    reproducao:
      "Abrir duas sessões, trocar a senha em uma e seguir na outra.",
    discovered: "2026-10-17",
    owner: "Backend",
  },
  {
    id: "SEN-013",
    title: "Chip dumping entre contas sem alerta",
    category: "Colusão e Bots",
    severity: "media",
    status: "aberto",
    area: "fluxo de fichas",
    description:
      "Transferências sistemáticas de fichas de uma conta para outra, perdendo de propósito, passam sem alerta.",
    risk:
      "É um caminho de lavar valor e de mover dinheiro entre contas combinadas, com a mesa de fachada.",
    fix:
      "Sinalizar perdas dirigidas e repetidas entre o mesmo par de contas para revisão.",
    reproducao:
      "Simular perdas dirigidas repetidas entre duas contas.",
    discovered: "2026-10-16",
    owner: "Integridade",
  },
  {
    id: "SEN-014",
    title: "Painel administrativo sem segundo fator",
    category: "Controle de Acesso",
    severity: "alta",
    status: "aberto",
    area: "/admin",
    description:
      "O acesso administrativo depende só de senha, sem segundo fator.",
    risk:
      "Uma senha vazada abre o painel que controla mesas, saldos e regras.",
    fix:
      "Exigir segundo fator para todo acesso administrativo e registrar login por origem.",
    reproducao:
      "Entrar no painel apenas com usuário e senha.",
    discovered: "2026-10-16",
    owner: "Infraestrutura",
  },
  {
    id: "SEN-015",
    title: "Cartas comunitárias enviadas antes da hora",
    category: "Integridade da Partida",
    severity: "critica",
    status: "aberto",
    area: "WS mesa:board",
    description:
      "O flop, o turn e o river são mandados ao aplicativo antes do momento de virar, e a tela só segura a exibição.",
    risk:
      "Um cliente modificado lê a próxima carta comunitária antes de todo mundo, e decide a aposta sabendo o futuro.",
    fix:
      "Cada carta comunitária só sai do servidor no instante em que vira, nunca adiantada.",
    reproducao:
      "Inspecionar o fluxo e procurar o board antes da revelação.",
    discovered: "2026-10-15",
    owner: "Servidor de jogo",
  },
  {
    id: "SEN-016",
    title: "Depósito confirmado sem validar o aviso de pagamento",
    category: "Caixa e Saques",
    severity: "critica",
    status: "aberto",
    area: "POST /api/caixa/webhook",
    description:
      "O aviso de depósito aprovado é aceito sem conferir se veio mesmo do provedor de pagamento.",
    risk:
      "Dá para creditar fichas sem ter pago, convertendo em saque depois. Prejuízo direto.",
    fix:
      "Validar a assinatura do provedor em todo aviso e conferir o valor antes de creditar.",
    reproducao:
      "Enviar um aviso de pagamento forjado ao endpoint.",
    discovered: "2026-10-15",
    owner: "Caixa",
  },
  {
    id: "SEN-017",
    title: "Tempo de ação revela a força da mão",
    category: "Integridade da Partida",
    severity: "media",
    status: "aberto",
    area: "temporização das ações",
    description:
      "O servidor repassa o tempo exato que cada um levou para agir, e esse tempo entrega padrão de mão forte ou fraca.",
    risk:
      "Um jogador atento lê a hesitação do outro com precisão e ganha vantagem que não deveria existir.",
    fix:
      "Padronizar e arredondar a temporização repassada, sem expor o tempo cru.",
    reproducao:
      "Comparar o tempo repassado com a força real da mão ao showdown.",
    discovered: "2026-10-14",
    owner: "Servidor de jogo",
  },
  {
    id: "SEN-018",
    title: "Reconhecimento de rosto do saque pode ser burlado por foto",
    category: "Caixa e Saques",
    severity: "media",
    status: "corrigido",
    area: "verificação de saque",
    description:
      "A verificação de identidade no saque aceitava uma foto estática no lugar da pessoa.",
    risk:
      "Uma conta roubada era esvaziada com uma foto do titular, sem a pessoa presente.",
    fix:
      "Exigir prova de vida na verificação e cruzar com o histórico da conta.",
    reproducao:
      "Apresentar uma foto estática na verificação.",
    discovered: "2026-10-13",
    owner: "Caixa",
  },
  {
    id: "SEN-019",
    title: "Semente do jogador ignorada no embaralhamento",
    category: "Aleatoriedade (RNG)",
    severity: "media",
    status: "aberto",
    area: "baralho justo",
    description:
      "Mesmo onde existe semente do jogador, ela não entra de fato no embaralhamento, então só o servidor decide o baralho.",
    risk:
      "O jogador não tem como influenciar nem conferir, e a verificação de baralho justo vira enfeite.",
    fix:
      "Combinar a semente do servidor e a do jogador no embaralhamento, e documentar como qualquer um refaz a conta.",
    reproducao:
      "Mudar a semente do jogador e ver se o baralho muda.",
    discovered: "2026-10-13",
    owner: "Servidor de jogo",
  },
  {
    id: "SEN-020",
    title: "Cabeçalhos de segurança ausentes nas respostas",
    category: "Configuração",
    severity: "baixa",
    status: "corrigido",
    area: "respostas HTTP",
    description:
      "As respostas não trazem os cabeçalhos que endurecem o navegador contra ataques comuns.",
    risk:
      "O navegador fica sem travas que evitariam parte dos ataques de página.",
    fix:
      "Adicionar os cabeçalhos de segurança padrão e a política de conteúdo em todas as respostas.",
    reproducao:
      "Inspecionar os cabeçalhos de uma resposta qualquer.",
    discovered: "2026-10-12",
    owner: "Infraestrutura",
  },
  {
    id: "SEN-021",
    title: "Convite para mesa privada não expira",
    category: "Controle de Acesso",
    severity: "baixa",
    status: "reteste_ok",
    area: "convites de mesa",
    description:
      "O link de convite para uma mesa privada seguia válido por tempo indefinido.",
    risk:
      "Um convite reencaminhado deixava um estranho entrar em mesa fechada semanas depois.",
    fix:
      "Dar prazo curto ao convite e invalidar ao primeiro uso.",
    reproducao:
      "Usar um link de convite antigo.",
    discovered: "2026-10-11",
    owner: "Backend",
  },
  {
    id: "SEN-022",
    title: "Falta registro de quem acessou dados de jogador",
    category: "Configuração",
    severity: "baixa",
    status: "aberto",
    area: "trilha de auditoria",
    description:
      "Acessos internos a dados sensíveis de jogador não deixam trilha, então um incidente vira investigação no escuro.",
    risk:
      "Sem registro, não há como saber por onde nem por quem um dado vazou.",
    fix:
      "Registrar acesso a dado sensível com quem, quando e o quê, guardado fora do alcance comum.",
    reproducao:
      "Acessar um dado sensível e verificar se há trilha.",
    discovered: "2026-10-11",
    owner: "Infraestrutura",
  },
];
