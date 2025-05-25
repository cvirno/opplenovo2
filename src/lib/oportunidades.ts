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
  dataWon: string;
  dataFaturamento: string;
  regional: string;
}

const STORAGE_KEY = 'oportunidades';

export const buscarOportunidades = (): Oportunidade[] => {
  const dados = localStorage.getItem(STORAGE_KEY);
  return dados ? JSON.parse(dados) : [];
};

export const adicionarOportunidade = (oportunidade: Oportunidade): void => {
  const oportunidades = buscarOportunidades();
  oportunidades.push(oportunidade);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(oportunidades));
};

export const atualizarOportunidade = (id: string, dadosAtualizados: Oportunidade): void => {
  const oportunidades = buscarOportunidades();
  const index = oportunidades.findIndex(op => op.id === id);
  if (index !== -1) {
    oportunidades[index] = { ...oportunidades[index], ...dadosAtualizados };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(oportunidades));
  }
};

export const excluirOportunidade = (id: string): void => {
  const oportunidades = buscarOportunidades();
  const novasOportunidades = oportunidades.filter(op => op.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(novasOportunidades));
};

export const criarOportunidadesIniciais = (): void => {
  const oportunidadesIniciais: Oportunidade[] = [
    {
      id: '1',
      revenda: 'Revenda Exemplo',
      registro: 'REG001',
      cliente: 'Cliente Exemplo',
      bid: 'BID001',
      validadeBid: '2024-12-31',
      validadeProposta: '2024-12-31',
      preco: '100000',
      margem: '20',
      classificacao: 'proposta_valida',
      observacoes: 'Observação inicial',
      estagioVenda: 'proposal',
      trimestre: 'Q1',
      dataWon: '',
      dataFaturamento: '',
      regional: 'sudeste'
    }
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(oportunidadesIniciais));
}; 