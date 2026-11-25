// ==========================================
// 1. CAPTURAR OS ELEMENTOS DO HTML
// ==========================================

const formulario = document.getElementById('form-tarefa');
const titulo = document.getElementById('titulo');
const descricao = document.getElementById('descricao');
const responsavel = document.getElementById('responsavel');
const data = document.getElementById('data');
const campoStatus = document.getElementById('status');
const listaTarefas = document.getElementById('lista-tarefas');

const botaoSalvar = formulario.querySelector('button[type="submit"]');

// ==========================================
// 2. CONFIGURAÇÕES DO LOCALSTORAGE
// ==========================================

// Nome utilizado para identificar os dados salvos
const CHAVE_STORAGE = 'taskflow_tarefas';

// Recupera as tarefas salvas no navegador
function carregarTarefas() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (dadosSalvos === null) {
        return [];
    }

    try {
        const tarefas = JSON.parse(dadosSalvos);

        return Array.isArray(tarefas) ? tarefas : [];
    } catch (erro) {
        console.error('Erro ao carregar tarefas:', erro);
        return [];
    }
}

// Lista principal de tarefas
let tarefas = carregarTarefas();

// Identifica se estamos editando alguma tarefa
let tarefaEmEdicao = null;

// ==========================================
// 3. SALVAR AS TAREFAS
// ==========================================

function salvarTarefas() {
    localStorage.setItem(
        CHAVE_STORAGE,
        JSON.stringify(tarefas)
    );
}

// ==========================================
// 4. EXIBIR AS TAREFAS NA TELA
// ==========================================

function renderizarTarefas() {

    // Limpa a lista antes de exibi-la novamente
    listaTarefas.innerHTML = '';

    tarefas.forEach(function(tarefa) {

        // Cria o cartão da tarefa
        const novaTarefa = document.createElement('div');

        // Título
        const textoTarefa = document.createElement('span');
        textoTarefa.textContent = tarefa.titulo;

        // Descrição
        const textoDescricao = document.createElement('p');
        textoDescricao.textContent =
            'Descrição: ' + tarefa.descricao;

        // Responsável
        const textoResponsavel = document.createElement('p');
        textoResponsavel.textContent =
            'Responsável: ' + tarefa.responsavel;

        // Data de vencimento
        const textoData = document.createElement('p');

        const dataFormatada = tarefa.data
            ? tarefa.data.split('-').reverse().join('/')
            : '';

        textoData.textContent =
            'Vencimento: ' + dataFormatada;

        // Status
        const textoStatus = document.createElement('span');
        textoStatus.textContent = tarefa.status;

        // Seletor de status
        const seletorStatus = document.createElement('select');

        const opcoes = [
            'Pendente',
            'Em andamento',
            'Concluída'
        ];

        opcoes.forEach(function(opcao) {

            const option = document.createElement('option');

            option.value = opcao;
            option.textContent = opcao;

            seletorStatus.appendChild(option);
        });

        seletorStatus.value = tarefa.status;

        // Caixa de seleção
        const checkbox = document.createElement('input');

        checkbox.type = 'checkbox';

        checkbox.checked = tarefa.status === 'Concluída';

        // Alterar o status pelo seletor
        seletorStatus.addEventListener('change', function() {

            tarefa.status = seletorStatus.value;

            salvarTarefas();
            renderizarTarefas();
        });

        // Alterar o status pela caixa de seleção
        checkbox.addEventListener('change', function() {

            if (checkbox.checked) {
                tarefa.status = 'Concluída';
            } else {
                tarefa.status = 'Pendente';
            }

            salvarTarefas();
            renderizarTarefas();
        });

        // Botão de editar
        const botaoEditar = document.createElement('button');

        botaoEditar.textContent = 'Editar';

        botaoEditar.addEventListener('click', function() {

            titulo.value = tarefa.titulo;
            descricao.value = tarefa.descricao;
            responsavel.value = tarefa.responsavel;
            data.value = tarefa.data;
            campoStatus.value = tarefa.status;

            tarefaEmEdicao = tarefa.id;

            botaoSalvar.textContent = 'Salvar alterações';

            // Leva a tela até o formulário
            formulario.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });

        // Botão de excluir
        const botaoExcluir = document.createElement('button');

        botaoExcluir.textContent = 'Excluir';

        botaoExcluir.addEventListener('click', function() {

            const confirmar = confirm(
                'Deseja realmente excluir esta tarefa?'
            );

            if (!confirmar) {
                return;
            }

            tarefas = tarefas.filter(function(item) {
                return item.id !== tarefa.id;
            });

            salvarTarefas();
            renderizarTarefas();

            // Se excluir a tarefa que estava sendo editada
            if (tarefaEmEdicao === tarefa.id) {
                limparFormulario();
            }
        });

        // Adiciona os elementos ao cartão
        novaTarefa.appendChild(textoTarefa);
        novaTarefa.appendChild(textoDescricao);
        novaTarefa.appendChild(textoResponsavel);
        novaTarefa.appendChild(textoData);
        novaTarefa.appendChild(textoStatus);
        novaTarefa.appendChild(seletorStatus);
        novaTarefa.appendChild(checkbox);
        novaTarefa.appendChild(botaoEditar);
        novaTarefa.appendChild(botaoExcluir);

        // Adiciona o cartão à lista
        listaTarefas.appendChild(novaTarefa);
    });
}

// ==========================================
// 5. LIMPAR O FORMULÁRIO
// ==========================================

function limparFormulario() {

    formulario.reset();

    campoStatus.value = 'Pendente';

    tarefaEmEdicao = null;

    botaoSalvar.textContent = 'Adicionar tarefa';
}

// ==========================================
// 6. CADASTRAR E EDITAR TAREFAS
// ==========================================

formulario.addEventListener('submit', function(event) {

    event.preventDefault();

    // Captura os valores dos campos
    const textoDigitado = titulo.value.trim();
    const descricaoDigitada = descricao.value.trim();
    const responsavelDigitado = responsavel.value.trim();
    const dataDigitada = data.value;
    const statusSelecionado = campoStatus.value;

    // Validação
    if (
        textoDigitado === '' ||
        descricaoDigitada === '' ||
        responsavelDigitado === '' ||
        dataDigitada === ''
    ) {
        alert('Por favor, preencha todos os campos da tarefa.');
        return;
    }

    // Verifica se estamos editando uma tarefa existente
    if (tarefaEmEdicao !== null) {

        const indice = tarefas.findIndex(function(tarefa) {
            return tarefa.id === tarefaEmEdicao;
        });

        if (indice !== -1) {

            tarefas[indice].titulo = textoDigitado;
            tarefas[indice].descricao = descricaoDigitada;
            tarefas[indice].responsavel = responsavelDigitado;
            tarefas[indice].data = dataDigitada;
            tarefas[indice].status = statusSelecionado;
        }

    } else {

        // Cria uma nova tarefa
        const novaTarefa = {
            id: crypto.randomUUID(),
            titulo: textoDigitado,
            descricao: descricaoDigitada,
            responsavel: responsavelDigitado,
            data: dataDigitada,
            status: statusSelecionado
        };

        // Adiciona a tarefa à lista
        tarefas.push(novaTarefa);
    }

    // Salva os dados no navegador
    salvarTarefas();

    // Atualiza a tela
    renderizarTarefas();

    // Limpa os campos
    limparFormulario();
});

// ==========================================
// 7. CARREGAR AS TAREFAS AO ABRIR A PÁGINA
// ==========================================

renderizarTarefas();