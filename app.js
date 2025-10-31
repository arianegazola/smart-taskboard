/**
 * ==================================================================================
 * app.js - O CÉREBRO DA APLICAÇÃO DE LISTA DE TAREFAS
 * ==================================================================================
 * Este arquivo controla toda a lógica, interações e dados da aplicação.
 * * Organização do arquivo:
 * 1. ESTADO DA APLICAÇÃO: Onde guardamos os dados em memória.
 * 2. SELETORES DOM: Nossas "âncoras" para o HTML.
 * 3. INICIALIZAÇÃO: O ponto de partida que "liga" a aplicação.
 * 4. GERENCIAMENTO DE DADOS (Estado e LocalStorage): Funções para carregar e salvar.
 * 5. FUNÇÕES PRINCIPAIS (Ações do Usuário): Funções chamadas por botões (adicionar, etc.).
 * 6. ATUALIZAÇÃO DA INTERFACE (UI): Funções que desenham a tela.
 * 7. PAINEL DE DETALHES: Funções específicas do painel de edição.
 * 8. FILTRO E VISUALIZAÇÃO: Funções para filtrar e mostrar/ocultar listas.
 * 9. FUNÇÕES UTILITÁRIAS (Helpers): Pequenas funções de ajuda.
 * ==================================================================================
 */

// ----------------------------------------------------------------------------------
// BLOCO 1: ESTADO DA APLICAÇÃO
// ----------------------------------------------------------------------------------
// Guardamos todos os dados importantes aqui, em memória, para acesso rápido.
// O LocalStorage será usado apenas como um "backup" persistente.

const LOCAL_STORAGE_KEY = "tarefas"; // Chave para salvar no localStorage

let state = {
    tarefas: [], // A lista principal de todas as tarefas
    tarefaAtual: null // Qual tarefa está sendo editada no painel de detalhes
};

// ----------------------------------------------------------------------------------
// BLOCO 2: SELETORES DE ELEMENTOS DOM (HTML)
// ----------------------------------------------------------------------------------
// Selecionamos todos os elementos do HTML que precisamos controlar
// e os guardamos em constantes para fácil acesso.

// --- Formulário de Adicionar Tarefa ---
const inputTitulo = document.getElementById("titulo-tarefa");
const inputDescricao = document.getElementById("descricao-tarefa");
const inputData = document.getElementById("data-tarefa");
const inputHorario = document.getElementById("horario-tarefa");
const selectPrioridade = document.getElementById("prioridade-tarefa");

// --- Contadores e Filtros ---
const contadorTarefas = document.getElementById("contador-tarefas");
const filtroPrioridade = document.getElementById("filtro-prioridade");

// --- Listas de Tarefas (Seções) ---
const listaAtrasadas = document.getElementById("lista-atrasadas");
const listaHoje = document.getElementById("lista-hoje");
const listaAmanha = document.getElementById("lista-amanha");
const listaFuturas = document.getElementById("lista-futuras");

// --- Seção de Concluídas (Rodapé) ---
const listaConcluidas = document.getElementById("lista-concluidas");
const contadorConcluidas = document.getElementById("contador-concluidas");
const iconeToggle = document.getElementById("icone-toggle");

// --- Painel de Detalhes (Edição) ---
const painelDetalhes = document.getElementById("painel-detalhes");
const inputTituloDetalhes = document.getElementById("input-titulo-detalhes");
const inputDescricaoDetalhes = document.getElementById("input-descricao-detalhes");
const inputDataDetalhes = document.getElementById("input-data-detalhes");
const inputHorarioDetalhes = document.getElementById("input-horario-detalhes");
const inputSubtarefaDetalhes = document.getElementById("input-subtarefa-detalhes");
const listaSubtarefasDetalhes = document.getElementById("lista-subtarefas-detalhes");


// ----------------------------------------------------------------------------------
// BLOCO 3: INICIALIZAÇÃO DA APLICAÇÃO (PONTO DE PARTIDA)
// ----------------------------------------------------------------------------------
// Este bloco espera o HTML ser totalmente carregado para então
// iniciar a nossa aplicação.

document.addEventListener("DOMContentLoaded", () => {
    // 1. Carrega as tarefas salvas do localStorage para o 'state'.
    carregarTarefasDoLocalStorage();
    // 2. Desenha a lista de tarefas na tela.
    atualizarListaUI();
    // 3. Atualiza os contadores de tarefas (diário, atrasadas).
    atualizarContadorDiario();
    
    // NOTA: Os 'event listeners' dos botões principais (Adicionar, Fechar Painel)
    // provavelmente estão no seu HTML (ex: onclick="adicionarTarefa()").
    // Se não estivessem, nós os adicionaríamos aqui.
});


// ----------------------------------------------------------------------------------
// BLOCO 4: GERENCIAMENTO DE DADOS (ESTADO E LOCALSTORAGE)
// ----------------------------------------------------------------------------------
// Funções responsáveis por salvar e carregar os dados entre o
// 'state' (memória) e o 'localStorage' (disco).

/**
 * Salva a lista de tarefas ATUAL (do 'state') no localStorage.
 * Esta é a ÚNICA função que deve escrever no localStorage.
 */
function salvarTarefasNoLocalStorage() {
    // Ordena as tarefas antes de salvar
    state.tarefas.sort(compararTarefas);
    // Converte a lista de objetos (state.tarefas) para uma string JSON e salva
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.tarefas));
}

/**
 * Carrega as tarefas do localStorage para dentro do 'state.tarefas'.
 * Executado apenas uma vez, quando a página carrega.
 */
function carregarTarefasDoLocalStorage() {
    // Pega a string salva no localStorage
    const tarefasSalvas = localStorage.getItem(LOCAL_STORAGE_KEY);
    // Se houver dados (não for null), converte de volta para um array de objetos
    // Se não houver nada, usa um array vazio "[]".
    state.tarefas = JSON.parse(tarefasSalvas || "[]");
}


// ----------------------------------------------------------------------------------
// BLOCO 5: FUNÇÕES PRINCIPAIS (AÇÕES DO USUÁRIO)
// ----------------------------------------------------------------------------------
// Funções que são disparadas por ações do usuário, como cliques em botões.

/**
 * Adiciona uma nova tarefa à lista.
 * Esta função é chamada pelo botão "Adicionar".
 */
function adicionarTarefa() {
    // 1. Coleta os valores dos campos de input
    const titulo = inputTitulo.value.trim(); // .trim() remove espaços em branco
    const descricao = inputDescricao.value.trim();
    const data = inputData.value;
    const horario = inputHorario.value;
    const prioridade = selectPrioridade.value;

    // 2. Validação: Verifica se o título foi preenchido
    if (!titulo) {
        alert("O título da tarefa é obrigatório!");
        return; // Para a execução da função
    }

    // 3. Cria um objeto (um "pacote" de dados) para a nova tarefa
    const novaTarefaObjeto = {
        id: Date.now(), // ID único baseado na data e hora atual
        titulo,
        descricao,
        data,
        horario,
        prioridade,
        subtarefas: [], // Começa sem subtarefas
        concluida: false // Começa como pendente
    };

    // 4. Adiciona o novo objeto à nossa lista em memória (state)
    state.tarefas.push(novaTarefaObjeto);

    // 5. Salva a lista atualizada no localStorage
    salvarTarefasNoLocalStorage();
    
    // 6. Atualiza a tela para mostrar a nova tarefa
    atualizarListaUI();
    
    // 7. Limpa os campos do formulário
    limparCampos();
}

/**
 * Marca uma tarefa como concluída ou pendente.
 * @param {number} tarefaId O ID da tarefa que será alterada.
 */
function toggleConclusaoTarefa(tarefaId) {
    // 1. Encontra a tarefa exata na nossa lista 'state' pelo ID
    const tarefa = state.tarefas.find(t => t.id === tarefaId);

    // 2. Se a tarefa foi encontrada...
    if (tarefa) {
        // Inverte o valor: (true vira false, false vira true)
        tarefa.concluida = !tarefa.concluida;
    }

    // 3. Salva a mudança no localStorage
    salvarTarefasNoLocalStorage();
    
    // 4. Atualiza a tela (para mover a tarefa para a lista de concluídas)
    atualizarListaUI();
}

/**
 * Remove permanentemente uma tarefa da lista.
 * @param {number} tarefaId O ID da tarefa a ser removida.
 */
function removerTarefa(tarefaId) {
    // 1. Cria uma NOVA lista contendo todas as tarefas, EXCETO a tarefa com o ID passado
    state.tarefas = state.tarefas.filter(t => t.id !== tarefaId);

    // 2. Salva a nova lista (sem a tarefa removida) no localStorage
    salvarTarefasNoLocalStorage();
    
    // 3. Atualiza a tela para remover o item visualmente
    atualizarListaUI();
}


// ----------------------------------------------------------------------------------
// BLOCO 6: ATUALIZAÇÃO DA INTERFACE (UI)
// ----------------------------------------------------------------------------------
// Funções responsáveis por desenhar e atualizar o que o usuário vê na tela.

/**
 * A função MAIS IMPORTANTE da UI.
 * Lê o 'state.tarefas', aplica filtros e redesenha TODAS as listas.
 */
function atualizarListaUI() {
    // 1. Pega o valor atual do filtro de prioridade
    const filtroAtivo = filtroPrioridade.value;
    
    // 2. Limpa todas as listas no HTML antes de preenchê-las
    listaAtrasadas.innerHTML = "";
    listaHoje.innerHTML = "";
    listaAmanha.innerHTML = "";
    listaFuturas.innerHTML = "";
    listaConcluidas.innerHTML = "";

    // 3. Define as datas de hoje e amanhã para comparação
    const hoje = getHojeFormatado();
    const amanha = getAmanhaFormatado();

    let countConcluidas = 0;

    // 4. Itera (passa por) cada tarefa na nossa lista 'state.tarefas'
    state.tarefas.forEach(tarefa => {
        // 5. Aplica a lógica de filtro:
        // Se um filtro está ativo (ex: 'alta') E a tarefa NÃO é 'alta' E a tarefa NÃO está concluída...
        if (filtroAtivo !== 'todas' && tarefa.prioridade !== filtroAtivo && !tarefa.concluida) {
            return; // ...pula esta tarefa e não a exibe.
        }

        // 6. Cria o elemento <li> (o item visual) para a tarefa
        const elementoTarefa = criarElementoTarefa(tarefa);

        // 7. Distribui a tarefa na lista correta:
        if (tarefa.concluida) {
            // Se estiver concluída, vai para a lista de concluídas
            listaConcluidas.appendChild(elementoTarefa);
            countConcluidas++;
        } else if (!tarefa.data) {
            // Se não tem data, vai para futuras
            listaFuturas.appendChild(elementoTarefa);
        } else if (tarefa.data < hoje) {
            // Se a data já passou, vai para atrasadas
            listaAtrasadas.appendChild(elementoTarefa);
        } else if (tarefa.data === hoje) {
            // Se a data é hoje, vai para hoje
            listaHoje.appendChild(elementoTarefa);
        } else if (tarefa.data === amanha) {
            // Se a data é amanhã, vai para amanhã
            listaAmanha.appendChild(elementoTarefa);
        } else {
            // Se a data é depois de amanhã, vai para futuras
            listaFuturas.appendChild(elementoTarefa);
        }
    });

    // 8. Atualiza os contadores
    contadorConcluidas.textContent = countConcluidas;
    atualizarContadorDiario(); // Atualiza o contador principal
}

/**
 * Cria o elemento HTML (<li>) para uma única tarefa.
 * @param {object} tarefa - O objeto da tarefa (com id, titulo, etc.)
 * @returns {HTMLLIElement} O elemento <li> pronto para ser adicionado à tela.
 */
function criarElementoTarefa(tarefa) {
    // 1. Cria o elemento <li> (item da lista)
    const li = document.createElement("li");
    li.classList.add(tarefa.prioridade); // Adiciona a classe da prioridade (para cor)
    li.dataset.id = tarefa.id; // Guarda o ID da tarefa no próprio elemento

    // 2. Adiciona classe se estiver concluída (para o visual "riscado")
    if (tarefa.concluida) {
        li.classList.add("tarefa-concluida");
    }

    // 3. Cria o Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = tarefa.concluida;
    // Adiciona o "ouvidor" de clique no checkbox
    checkbox.addEventListener("click", (event) => {
        event.stopPropagation(); // Impede que o clique abra o painel
        // Chama a função centralizada para alterar o estado
        toggleConclusaoTarefa(tarefa.id);
    });

    // 4. Cria a <div> para o conteúdo (título, descrição, data)
    const conteudo = document.createElement("div");
    conteudo.classList.add("conteudo-tarefa");

    const tituloElem = document.createElement("strong");
    tituloElem.textContent = tarefa.titulo;

    const descElem = document.createElement("span");
    descElem.textContent = tarefa.descricao;
    descElem.classList.add("descricao");

    const dataElem = document.createElement("span");
    dataElem.classList.add("data-tarefa");
    
    // Lógica para formatar o texto da data e hora
    let textoData = "";
    if (tarefa.data) {
        textoData = `Conclusão: ${formatarData(tarefa.data)}`;
        if (tarefa.horario) {
            textoData += ` às ${tarefa.horario}`;
        }
    } else if (tarefa.horario) {
        textoData = `Conclusão: ${tarefa.horario}`;
    }
    dataElem.textContent = textoData;

    // Adiciona os elementos de texto dentro da div 'conteudo'
    conteudo.appendChild(tituloElem);
    if (tarefa.descricao) conteudo.appendChild(descElem);
    if (tarefa.data || tarefa.horario) conteudo.appendChild(dataElem);

    // 5. Cria a <div> para os botões de ação
    const botoesAcoes = document.createElement("div");
    botoesAcoes.classList.add("botoes-acao");

    // Cria o botão de Detalhes (usando a função helper)
    const botaoDetalhes = criarBotao("fa-circle-info", "detalhes", (event) => {
        event.stopPropagation();
        abrirPainelDetalhes(tarefa); // Abre o painel para esta tarefa
    });

    // Cria o botão de Remover (usando a função helper)
    const botaoRemover = criarBotao("fa-trash-can", "remover", (event) => {
        event.stopPropagation();
        // Chama a função centralizada para remover a tarefa
        removerTarefa(tarefa.id);
    });
    
    botoesAcoes.appendChild(botaoDetalhes);
    botoesAcoes.appendChild(botaoRemover);

    // 6. Monta o <li> final
    li.appendChild(checkbox);
    li.appendChild(conteudo);
    li.appendChild(botoesAcoes);

    // 7. Retorna o elemento <li> pronto
    return li;
}

/**
 * Atualiza o texto do contador principal (diário e atrasadas).
 * Esta função lê diretamente do 'state' para obter os números.
 */
function atualizarContadorDiario() {
    // Pega a data de hoje formatada no padrão AAAA-MM-DD
    const hoje = getHojeFormatado();

    // Filtra tarefas para o dia de hoje (do 'state')
    const tarefasHoje = state.tarefas.filter(tarefa => tarefa.data === hoje);

    // Filtra tarefas atrasadas (do 'state')
    const tarefasAtrasadas = state.tarefas.filter(tarefa =>
        tarefa.data && tarefa.data < hoje && !tarefa.concluida
    );

    const pendentesHoje = tarefasHoje.filter(t => !t.concluida).length;
    const concluidasHoje = tarefasHoje.filter(t => t.concluida).length;
    const contadorAtrasadas = tarefasAtrasadas.length;

    // Define as palavras no singular ou plural
    const pluralPendentes = pendentesHoje === 1 ? "tarefa pendente" : "tarefas pendentes";
    const pluralConcluidas = concluidasHoje === 1 ? "tarefa" : "tarefas";
    const pluralAtrasadas = contadorAtrasadas === 1 ? "tarefa atrasada" : "tarefas atrasadas";

    let textoContador = "";

    // Monta o texto
    if (contadorAtrasadas > 0) {
        textoContador += `🚨 Você tem ${contadorAtrasadas} ${pluralAtrasadas}! `;
    }
    if (tarefasHoje.length > 0) {
        textoContador += `Para o dia de hoje: Você tem ${pendentesHoje} ${pluralPendentes} e já concluiu ${concluidasHoje} ${pluralConcluidas}.`;
    }
    if (textoContador === "") {
        textoContador = "Você não tem tarefas para hoje!";
    }

    // Atualiza o texto no elemento HTML
    contadorTarefas.textContent = textoContador;
}

/**
 * Limpa os campos do formulário de adição após o envio.
 */
function limparCampos() {
    inputTitulo.value = "";
    inputDescricao.value = "";
    inputData.value = "";
    inputHorario.value = "";
    selectPrioridade.value = "baixa"; // Reseta para o padrão
}


// ----------------------------------------------------------------------------------
// BLOCO 7: FUNÇÕES DO PAINEL DE DETALHES
// ----------------------------------------------------------------------------------
// Lógica para abrir, fechar, editar e adicionar subtarefas no painel lateral.

/**
 * Abre o painel de detalhes e o preenche com os dados da tarefa clicada.
 * @param {object} tarefa - O objeto da tarefa a ser exibida/editada.
 */
function abrirPainelDetalhes(tarefa) {
    // 1. Guarda a tarefa que está sendo editada no 'state'
    state.tarefaAtual = tarefa;

    // 2. Preenche os campos do painel com os dados da tarefa
    inputTituloDetalhes.value = tarefa.titulo;
    inputDescricaoDetalhes.value = tarefa.descricao;
    inputDataDetalhes.value = tarefa.data;
    inputHorarioDetalhes.value = tarefa.horario;

    // 3. Limpa a lista de subtarefas antiga
    listaSubtarefasDetalhes.innerHTML = "";
    // 4. Recria a lista de subtarefas
    tarefa.subtarefas.forEach(sub => {
        listaSubtarefasDetalhes.appendChild(criarElementoSubtarefa(sub));
    });

    // 5. Mostra o painel
    painelDetalhes.classList.remove("painel-oculto");
    painelDetalhes.classList.add("painel-visivel");
}

/**
 * Fecha o painel de detalhes, salvando as alterações antes.
 * Chamada pelo botão "Fechar" (X) do painel.
 */
function fecharPainelDetalhes() {
    // 1. Salva quaisquer alterações feitas nos campos
    salvarAlteracoesDoPainel();

    // 2. Esconde o painel
    painelDetalhes.classList.remove("painel-visivel");
    painelDetalhes.classList.add("painel-oculto");
    
    // 3. Limpa a tarefa atual do 'state'
    state.tarefaAtual = null;
}

/**
 * Salva as alterações feitas nos campos do painel de detalhes.
 */
function salvarAlteracoesDoPainel() {
    // 1. Verifica se há uma tarefa sendo editada
    if (!state.tarefaAtual) return;

    // 2. Atualiza o objeto 'tarefaAtual' (que está no 'state') com os valores dos inputs
    state.tarefaAtual.titulo = inputTituloDetalhes.value.trim();
    state.tarefaAtual.descricao = inputDescricaoDetalhes.value.trim();
    state.tarefaAtual.data = inputDataDetalhes.value;
    state.tarefaAtual.horario = inputHorarioDetalhes.value;
    // (As subtarefas já são atualizadas em tempo real)

    // 3. Encontra o índice (posição) da tarefa no array 'state.tarefas'
    const index = state.tarefas.findIndex(t => t.id === state.tarefaAtual.id);
    
    // 4. Se encontrou, atualiza a tarefa na lista principal
    if (index > -1) {
        state.tarefas[index] = state.tarefaAtual;
    }

    // 5. Salva a lista inteira (com a tarefa modificada) no localStorage
    salvarTarefasNoLocalStorage();
    
    // 6. Atualiza a UI principal (para refletir mudanças de nome, data, etc.)
    atualizarListaUI();
}

/**
 * Adiciona uma nova subtarefa a partir do input do painel.
 * Chamada pelo botão "Adicionar Subtarefa".
 */
function adicionarSubtarefaDoPainel() {
    // 1. Verifica se há uma tarefa sendo editada
    if (!state.tarefaAtual) return;

    // 2. Pega o texto da subtarefa
    const textoSubtarefa = inputSubtarefaDetalhes.value.trim();
    
    if (textoSubtarefa) {
        // 3. Cria o objeto da subtarefa
        const novaSubtarefa = { texto: textoSubtarefa, concluida: false };
        
        // 4. Adiciona a subtarefa ao array da tarefa atual
        state.tarefaAtual.subtarefas.push(novaSubtarefa);
        
        // 5. Adiciona o elemento visual da subtarefa na lista do painel
        listaSubtarefasDetalhes.appendChild(criarElementoSubtarefa(novaSubtarefa));
        
        // 6. Limpa o input
        inputSubtarefaDetalhes.value = "";
        
        // 7. Salva as alterações (pois a tarefa pai foi modificada)
        salvarAlteracoesDoPainel();
    }
}

/**
 * Cria o elemento HTML (<li>) para uma única subtarefa.
 * @param {object} subtarefa - O objeto da subtarefa ({texto, concluida})
 * @returns {HTMLLIElement} O elemento <li> da subtarefa.
 */
function criarElementoSubtarefa(subtarefa) {
    const li = document.createElement("li");
    li.textContent = subtarefa.texto;
    if (subtarefa.concluida) {
        li.classList.add("subtarefa-concluida"); // Adiciona classe para riscar
    }

    // Adiciona o "ouvidor" de clique na própria subtarefa
    li.addEventListener("click", () => {
        // 1. Alterna o visual (riscado)
        li.classList.toggle("subtarefa-concluida");
        // 2. Atualiza o dado no objeto
        subtarefa.concluida = !subtarefa.concluida;
        // 3. Salva a tarefa pai (que contém esta subtarefa)
        salvarAlteracoesDoPainel();
    });

    return li;
}


// ----------------------------------------------------------------------------------
// BLOCO 8: FUNÇÕES DE FILTRO E VISUALIZAÇÃO
// ----------------------------------------------------------------------------------

/**
 * Mostra ou esconde a lista de tarefas concluídas no rodapé.
 * Chamada pela barra de título "Concluídas".
 */
function toggleConcluidas() {
    // Verifica se a lista está visível
    const isVisible = listaConcluidas.classList.contains("lista-concluidas-visivel");

    if (isVisible) {
        // Se visível, esconde
        listaConcluidas.classList.remove("lista-concluidas-visivel");
        listaConcluidas.classList.add("lista-concluidas-oculta");
        iconeToggle.classList.remove("fa-chevron-down");
        iconeToggle.classList.add("fa-chevron-up"); // Ícone para cima
    } else {
        // Se oculta, mostra
        listaConcluidas.classList.remove("lista-concluidas-oculta");
        listaConcluidas.classList.add("lista-concluidas-visivel");
        iconeToggle.classList.remove("fa-chevron-up");
        iconeToggle.classList.add("fa-chevron-down"); // Ícone para baixo
    }
}

/**
 * Limpa o filtro de prioridade e atualiza a lista.
 * Chamada pelo botão "Limpar Filtro".
 */
function limparFiltro() {
    filtroPrioridade.value = 'todas'; // Reseta o <select>
    atualizarListaUI(); // Redesenha a lista com todas as tarefas
}

// ----------------------------------------------------------------------------------
// BLOCO 9: FUNÇÕES UTILITÁRIAS (HELPERS)
// ----------------------------------------------------------------------------------
// Pequenas funções que ajudam outras funções a fazerem seu trabalho.

/**
 * Cria um elemento <button> com um ícone.
 * @param {string} iconeClasse - A classe do FontAwesome (ex: "fa-trash-can").
 * @param {string} classeAdicional - Uma classe CSS para o botão (ex: "remover").
 * @param {function} acao - A função a ser executada no clique.
 * @returns {HTMLButtonElement} O elemento <button> pronto.
 */
function criarBotao(iconeClasse, classeAdicional, acao) {
    const botao = document.createElement("button");
    botao.classList.add(classeAdicional);
    botao.innerHTML = `<i class="fa-solid ${iconeClasse}"></i>`;
    botao.addEventListener("click", acao);
    return botao;
}

/**
 * Compara duas tarefas para ordenação.
 * Usada por `Array.sort()`.
 * Lógica: Data/Hora (mais cedo primeiro) > Prioridade (mais alta primeiro).
 */
function compararTarefas(a, b) {
    // 1. Converte datas/horas para objetos Date para comparação
    const dataA = a.data && a.horario ? new Date(`${a.data}T${a.horario}`) : (a.data ? new Date(a.data) : null);
    const dataB = b.data && b.horario ? new Date(`${b.data}T${b.horario}`) : (b.data ? new Date(b.data) : null);

    // 2. Mapeia prioridades para números
    const prioridades = { 'alta': 3, 'media': 2, 'baixa': 1 };
    const prioridadeA = prioridades[a.prioridade];
    const prioridadeB = prioridades[b.prioridade];

    // 3. Lógica de ordenação
    if (dataA && dataB) {
        // Se ambas têm data, compara as datas
        const diferenca = dataA.getTime() - dataB.getTime();
        if (diferenca !== 0) return diferenca; // Retorna a mais antiga primeiro
    } else if (dataA) {
        return -1; // Tarefa com data vem antes de tarefa sem data
    } else if (dataB) {
        return 1; // Tarefa sem data vem depois
    }

    // 4. Se as datas são iguais (ou ambas são nulas), compara pela prioridade
    return prioridadeB - prioridadeA; // Maior prioridade (3) vem antes
}

/**
 * Formata uma data do formato AAAA-MM-DD para DD/MM/AAAA.
 * @param {string} dataISO - A data em formato AAAA-MM-DD.
 * @returns {string} A data em formato DD/MM/AAAA.
 */
function formatarData(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

/**
 * Retorna a data de HOJE no formato AAAA-MM-DD.
 */
function getHojeFormatado() {
    const hoje = new Date();
    // .padStart(2, '0') garante que tenhamos "05" em vez de "5"
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
    const ano = hoje.getFullYear();
    return `${ano}-${mes}-${dia}`;
}

/**
 * Retorna a data de AMANHÃ no formato AAAA-MM-DD.
 */
function getAmanhaFormatado() {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1); // Adiciona 1 dia
    const dia = String(amanha.getDate()).padStart(2, '0');
    const mes = String(amanha.getMonth() + 1).padStart(2, '0');
    const ano = amanha.getFullYear();
    return `${ano}-${mes}-${dia}`;
}