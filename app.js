const API_URL = 'https://pratica-fullstack-backend-k6tl.onrender.com/api/cargos';

// Elementos do DOM
const formCargo = document.getElementById('form-cargo');
const inputId = document.getElementById('cargo-id');
const inputNome = document.getElementById('nome');
const inputDepartamento = document.getElementById('departamento');
const inputSalario = document.getElementById('salarioBase');

const tituloFormulario = document.getElementById('titulo-formulario');
const botaoSalvar = document.getElementById('botao-salvar');
const botaoCancelar = document.getElementById('botao-cancelar');

const botaoAtualizar = document.getElementById('botao-atualizar');
const formBusca = document.getElementById('form-busca');
const inputBuscaId = document.getElementById('busca-id');
const botaoLimparBusca = document.getElementById('botao-limpar-busca');

const mensagem = document.getElementById('mensagem');
const listaCargos = document.getElementById('lista-cargos');

// Exibe mensagens de feedback na tela
function exibirMensagem(texto, tipo = 'sucesso') {
  mensagem.textContent = texto;
  mensagem.className = tipo;
  setTimeout(() => {
    mensagem.textContent = '';
    mensagem.className = '';
  }, 4000);
}

// 1. Carregar todos os cargos
async function carregarCargos() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Erro ao buscar cargos');
    const cargos = await res.json();
    renderizarLista(cargos);
  } catch (err) {
    exibirMensagem(err.message, 'erro');
  }
}

// Renderiza os cards/itens na tela
function renderizarLista(cargos) {
  listaCargos.innerHTML = '';
  
  if (!Array.isArray(cargos)) {
    cargos = [cargos]; // Caso venha apenas um elemento da busca
  }

  if (cargos.length === 0) {
    listaCargos.innerHTML = '<p>Nenhum cargo encontrado.</p>';
    return;
  }

  cargos.forEach(cargo => {
    const item = document.createElement('div');
    item.className = 'item-cargo';
    item.innerHTML = `
      <div class="info">
        <strong>${cargo.nome}</strong>
        <p>Departamento: ${cargo.departamento}</p>
        <p>Salário Base: R$ ${Number(cargo.salarioBase).toFixed(2)}</p>
        <small>ID: ${cargo._id}</small>
      </div>
      <div class="acoes">
        <button type="button" class="secundario" onclick="prepararEdicao('${cargo._id}', '${cargo.nome}', '${cargo.departamento}', ${cargo.salarioBase})">Editar</button>
        <button type="button" class="perigo" onclick="deletarCargo('${cargo._id}')">Excluir</button>
      </div>
    `;
    listaCargos.appendChild(item);
  });
}

// 2. Salvar (Criar ou Atualizar)
formCargo.addEventListener('submit', async (e) => {
  e.preventDefault();

  const cargoData = {
    nome: inputNome.value,
    departamento: inputDepartamento.value,
    salarioBase: Number(inputSalario.value)
  };

  const id = inputId.value;

  try {
    let res;
    if (id) {
      res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cargoData)
      });
    } else {
      res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cargoData)
      });
    }

    if (!res.ok) throw new Error('Erro ao salvar os dados');

    exibirMensagem(id ? 'Cargo atualizado com sucesso!' : 'Cargo cadastrado com sucesso!');
    resetarFormulario();
    carregarCargos();
  } catch (err) {
    exibirMensagem(err.message, 'erro');
  }
});

// 3. Preparar formulário para edição
function prepararEdicao(id, nome, departamento, salario) {
  inputId.value = id;
  inputNome.value = nome;
  inputDepartamento.value = departamento;
  inputSalario.value = salario;

  tituloFormulario.textContent = 'Editar cargo';
  botaoSalvar.textContent = 'Salvar alterações';
  botaoCancelar.classList.remove('oculto');
}

// Cancelar Edição
botaoCancelar.addEventListener('click', resetarFormulario);

function resetarFormulario() {
  formCargo.reset();
  inputId.value = '';
  tituloFormulario.textContent = 'Novo cargo';
  botaoSalvar.textContent = 'Cadastrar';
  botaoCancelar.classList.add('oculto');
}

// 4. Excluir Cargo
async function deletarCargo(id) {
  if (confirm('Tem certeza de que deseja excluir este cargo?')) {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir o cargo');
      exibirMensagem('Cargo removido com sucesso!');
      carregarCargos();
    } catch (err) {
      exibirMensagem(err.message, 'erro');
    }
  }
}

// 5. Buscar Cargo por ID
formBusca.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = inputBuscaId.value.trim();
  if (!id) return;

  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Cargo não encontrado');
    const cargo = await res.json();
    renderizarLista(cargo);
  } catch (err) {
    exibirMensagem(err.message, 'erro');
  }
});

// Botões Auxiliares
botaoAtualizar.addEventListener('click', carregarCargos);
botaoLimparBusca.addEventListener('click', () => {
  inputBuscaId.value = '';
  carregarCargos();
});

// Inicializar
carregarCargos();