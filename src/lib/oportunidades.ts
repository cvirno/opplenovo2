// Interface para o tipo de oportunidade
export interface Oportunidade {
  id: string;
  revenda: string;
  registro: string;
  cliente: string;
  bid: string;
  validadeBid: string;
  validadeProposta: string;
  preco: string;
  margem: string;
  classificacao: string;
  observacoes: string;
  estagioVenda: string;
  trimestre: string;
  dataWon?: string;
  dataFaturamento?: string;
  regional: string;
}

// Função para criar oportunidades iniciais
export const criarOportunidadesIniciais = () => {
  try {
    const oportunidadesIniciais = [
      {
        id: '1',
        revenda: 'Revenda A',
        registro: 'REG001',
        cliente: 'Empresa Tech (XPTO1)',
        bid: 'BID001',
        validadeBid: '2024-12-31',
        validadeProposta: '2024-12-31',
        preco: '1500000',
        margem: '25',
        classificacao: 'proposta_valida',
        observacoes: 'Cliente final',
        estagioVenda: 'won',
        trimestre: 'Q1',
        dataFaturamento: '2024-03-15',
        dataWon: '2024-03-01',
        regional: 'SUL'
      },
      {
        id: '2',
        revenda: 'Revenda B',
        registro: 'REG002',
        cliente: 'Corporação Digital (XPTO2)',
        bid: 'BID002',
        validadeBid: '2024-12-31',
        validadeProposta: '2024-12-31',
        preco: '2800000',
        margem: '30',
        classificacao: 'proposta_valida',
        observacoes: 'Cliente final',
        estagioVenda: 'won',
        trimestre: 'Q2',
        dataFaturamento: '2024-06-20',
        dataWon: '2024-06-01',
        regional: 'SUDESTE'
      }
    ];

    localStorage.setItem('oportunidades', JSON.stringify(oportunidadesIniciais));
    return oportunidadesIniciais;
  } catch (error) {
    console.error('Erro ao criar oportunidades iniciais:', error);
    throw error;
  }
};

// Função para adicionar uma nova oportunidade
export const adicionarOportunidade = (oportunidade: Oportunidade) => {
  try {
    const oportunidades = buscarOportunidades();
    const novasOportunidades = [...oportunidades, oportunidade];
    localStorage.setItem('oportunidades', JSON.stringify(novasOportunidades));
    return oportunidade.id;
  } catch (error) {
    console.error('Erro ao adicionar oportunidade:', error);
    throw error;
  }
};

// Função para buscar todas as oportunidades
export const buscarOportunidades = (): Oportunidade[] => {
  try {
    const dados = localStorage.getItem('oportunidades');
    return dados ? JSON.parse(dados) : [];
  } catch (error) {
    console.error('Erro ao buscar oportunidades:', error);
    return [];
  }
};

// Função para atualizar uma oportunidade
export const atualizarOportunidade = (id: string, oportunidade: Partial<Oportunidade>) => {
  try {
    const oportunidades = buscarOportunidades();
    const index = oportunidades.findIndex(op => op.id === id);
    if (index !== -1) {
      oportunidades[index] = { ...oportunidades[index], ...oportunidade };
      localStorage.setItem('oportunidades', JSON.stringify(oportunidades));
    }
  } catch (error) {
    console.error('Erro ao atualizar oportunidade:', error);
    throw error;
  }
};

// Função para excluir uma oportunidade
export const excluirOportunidade = (id: string) => {
  try {
    const oportunidades = buscarOportunidades();
    const novasOportunidades = oportunidades.filter(op => op.id !== id);
    localStorage.setItem('oportunidades', JSON.stringify(novasOportunidades));
  } catch (error) {
    console.error('Erro ao excluir oportunidade:', error);
    throw error;
  }
}; 