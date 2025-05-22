import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FormData {
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

const CLASSIFICACOES = [
  { value: 'proposta_valida', label: 'Proposta Válida', color: 'bg-emerald-500 hover:bg-emerald-600' },
  { value: 'proposta_expirada', label: 'Proposta Expirada', color: 'bg-gray-200 hover:bg-gray-300' },
  { value: 'declinado', label: 'Declinado', color: 'bg-red-500 hover:bg-red-600' },
  { value: 'info_processo', label: 'Informação do Processo', color: 'bg-yellow-200 hover:bg-yellow-300' },
  { value: 'alteracao_config', label: 'Alteração de Config', color: 'bg-pink-200 hover:bg-pink-300' }
];

const ESTAGIOS_VENDA = [
  { value: 'closed_lost', label: 'Closed Lost', percentual: 0, color: '#ef4444' },
  { value: 'lead', label: 'Lead', percentual: 5, color: '#6b7280' },
  { value: 'qualification', label: 'Qualification', percentual: 10, color: '#f59e0b' },
  { value: 'validation', label: 'Validation', percentual: 20, color: '#f97316' },
  { value: 'proposal', label: 'Proposal', percentual: 50, color: '#3b82f6' },
  { value: 'negotiation', label: 'In Negotiation', percentual: 75, color: '#8b5cf6' },
  { value: 'waiting_po', label: 'Waiting PO', percentual: 85, color: '#ec4899' },
  { value: 'won', label: 'WON', percentual: 100, color: '#10b981' }
];

const TRIMESTRES = [
  { value: 'Q1', label: 'Q1' },
  { value: 'Q2', label: 'Q2' },
  { value: 'Q3', label: 'Q3' },
  { value: 'Q4', label: 'Q4' }
];

const REGIONAIS = [
  { value: 'sul', label: 'SUL' },
  { value: 'brasilia_centro_oeste', label: 'BRASÍLIA + CENTRO OESTE' },
  { value: 'sudeste', label: 'SUDESTE' },
  { value: 'norte_nordeste', label: 'NORTE + NORDESTE' }
];

const Oportunidades: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    revenda: '',
    registro: '',
    cliente: '',
    bid: '',
    validadeBid: '',
    validadeProposta: '',
    preco: '',
    margem: '',
    classificacao: '',
    observacoes: '',
    estagioVenda: '',
    trimestre: '',
    dataWon: '',
    dataFaturamento: '',
    regional: '',
  });

  const [oportunidades, setOportunidades] = useState<FormData[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Carregar oportunidades do localStorage
  useEffect(() => {
    const data = localStorage.getItem('oportunidades');
    if (data) {
      const oportunidadesCarregadas = JSON.parse(data);
      // Atualiza oportunidades que estavam com 'proposta_expirada'
      const oportunidadesAtualizadas = oportunidadesCarregadas.map((op: FormData) => {
        if (op.estagioVenda === 'proposta_expirada') {
          // Lista de estágios disponíveis (excluindo won e closed_lost)
          const estagiosDisponiveis = ['lead', 'qualification', 'validation', 'proposal', 'negotiation', 'waiting_po'];
          // Seleciona um estágio aleatório
          const novoEstagio = estagiosDisponiveis[Math.floor(Math.random() * estagiosDisponiveis.length)];
          return {
            ...op,
            estagioVenda: novoEstagio,
            classificacao: 'proposta_valida'
          };
        }
        return op;
      });
      setOportunidades(oportunidadesAtualizadas);
      localStorage.setItem('oportunidades', JSON.stringify(oportunidadesAtualizadas));
    } else {
      // Cria as oportunidades iniciais apenas se não existirem no localStorage
      const oportunidadesIniciais: FormData[] = [
        // Oportunidades WON existentes
        {
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
        },
        {
          revenda: 'Revenda C',
          registro: 'REG003',
          cliente: 'Inovação Tech (XPTO3)',
          bid: 'BID003',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '3200000',
          margem: '28',
          classificacao: 'proposta_valida',
          observacoes: 'Cliente final',
          estagioVenda: 'won',
          trimestre: 'Q3',
          dataFaturamento: '2024-09-10',
          dataWon: '2024-09-01',
          regional: 'BRASÍLIA + CENTRO OESTE'
        },
        {
          revenda: 'Revenda D',
          registro: 'REG004',
          cliente: 'Soluções Digitais (XPTO4)',
          bid: 'BID004',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '4500000',
          margem: '32',
          classificacao: 'proposta_valida',
          observacoes: 'Cliente final',
          estagioVenda: 'won',
          trimestre: 'Q4',
          dataFaturamento: '2024-12-05',
          dataWon: '2024-12-01',
          regional: 'NORTE + NORDESTE'
        },
        // Novas oportunidades para cada estágio
        // Closed Lost
        {
          revenda: 'Revenda E',
          registro: 'REG005',
          cliente: 'Tech Solutions (XPTO5)',
          bid: 'BID005',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '1800000',
          margem: '22',
          classificacao: 'declinado',
          observacoes: 'Cliente desistiu do projeto',
          estagioVenda: 'closed_lost',
          trimestre: 'Q1',
          regional: 'SUL',
          dataWon: '',
          dataFaturamento: ''
        },
        {
          revenda: 'Revenda F',
          registro: 'REG006',
          cliente: 'Digital Corp (XPTO6)',
          bid: 'BID006',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '2200000',
          margem: '24',
          classificacao: 'declinado',
          observacoes: 'Proposta não competitiva',
          estagioVenda: 'closed_lost',
          trimestre: 'Q2',
          regional: 'SUDESTE',
          dataWon: '',
          dataFaturamento: ''
        },
        {
          revenda: 'Revenda G',
          registro: 'REG007',
          cliente: 'Inovação Digital (XPTO7)',
          bid: 'BID007',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '1900000',
          margem: '23',
          classificacao: 'declinado',
          observacoes: 'Cliente optou por outro fornecedor',
          estagioVenda: 'closed_lost',
          trimestre: 'Q3',
          regional: 'BRASÍLIA + CENTRO OESTE',
          dataWon: '',
          dataFaturamento: ''
        },
        // Lead
        {
          revenda: 'Revenda H',
          registro: 'REG008',
          cliente: 'Tech Inovação (XPTO8)',
          bid: 'BID008',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '2500000',
          margem: '26',
          classificacao: 'info_processo',
          observacoes: 'Primeiro contato',
          estagioVenda: 'lead',
          trimestre: 'Q1',
          regional: 'NORTE + NORDESTE',
          dataWon: '',
          dataFaturamento: ''
        },
        {
          revenda: 'Revenda I',
          registro: 'REG009',
          cliente: 'Digital Solutions (XPTO9)',
          bid: 'BID009',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '2800000',
          margem: '27',
          classificacao: 'info_processo',
          observacoes: 'Contato inicial',
          estagioVenda: 'lead',
          trimestre: 'Q2',
          regional: 'SUL',
          dataWon: '',
          dataFaturamento: ''
        },
        {
          revenda: 'Revenda J',
          registro: 'REG010',
          cliente: 'Tech Corp (XPTO10)',
          bid: 'BID010',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '3000000',
          margem: '28',
          classificacao: 'info_processo',
          observacoes: 'Lead qualificado',
          estagioVenda: 'lead',
          trimestre: 'Q3',
          regional: 'SUDESTE',
          dataWon: '',
          dataFaturamento: ''
        },
        // Qualification
        {
          revenda: 'Revenda K',
          registro: 'REG011',
          cliente: 'Inovação Digital (XPTO11)',
          bid: 'BID011',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '3200000',
          margem: '29',
          classificacao: 'proposta_valida',
          observacoes: 'Em qualificação',
          estagioVenda: 'qualification',
          trimestre: 'Q1',
          regional: 'BRASÍLIA + CENTRO OESTE',
          dataWon: '',
          dataFaturamento: ''
        },
        {
          revenda: 'Revenda L',
          registro: 'REG012',
          cliente: 'Tech Solutions (XPTO12)',
          bid: 'BID012',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '3500000',
          margem: '30',
          classificacao: 'proposta_valida',
          observacoes: 'Qualificação em andamento',
          estagioVenda: 'qualification',
          trimestre: 'Q2',
          regional: 'NORTE + NORDESTE',
          dataWon: '',
          dataFaturamento: ''
        },
        {
          revenda: 'Revenda M',
          registro: 'REG013',
          cliente: 'Digital Corp (XPTO13)',
          bid: 'BID013',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '3800000',
          margem: '31',
          classificacao: 'proposta_valida',
          observacoes: 'Qualificação avançada',
          estagioVenda: 'qualification',
          trimestre: 'Q3',
          regional: 'SUL',
          dataWon: '',
          dataFaturamento: ''
        },
        // Validation
        {
          revenda: 'Revenda N',
          registro: 'REG014',
          cliente: 'Tech Inovação (XPTO14)',
          bid: 'BID014',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '4000000',
          margem: '32',
          classificacao: 'proposta_valida',
          observacoes: 'Em validação',
          estagioVenda: 'validation',
          trimestre: 'Q1',
          regional: 'SUDESTE',
          dataWon: '',
          dataFaturamento: ''
        },
        {
          revenda: 'Revenda O',
          registro: 'REG015',
          cliente: 'Digital Solutions (XPTO15)',
          bid: 'BID015',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '4200000',
          margem: '33',
          classificacao: 'proposta_valida',
          observacoes: 'Validação em andamento',
          estagioVenda: 'validation',
          trimestre: 'Q2',
          regional: 'BRASÍLIA + CENTRO OESTE',
          dataWon: '',
          dataFaturamento: ''
        },
        {
          revenda: 'Revenda P',
          registro: 'REG016',
          cliente: 'Tech Corp (XPTO16)',
          bid: 'BID016',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '4500000',
          margem: '34',
          classificacao: 'proposta_valida',
          observacoes: 'Validação avançada',
          estagioVenda: 'validation',
          trimestre: 'Q3',
          regional: 'NORTE + NORDESTE',
          dataWon: '',
          dataFaturamento: ''
        },
        // Proposal
        {
          revenda: 'Revenda Q',
          registro: 'REG017',
          cliente: 'Inovação Digital (XPTO17)',
          bid: 'BID017',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '4800000',
          margem: '35',
          classificacao: 'proposta_valida',
          observacoes: 'Proposta enviada',
          estagioVenda: 'proposal',
          trimestre: 'Q1',
          regional: 'SUL',
          dataWon: '',
          dataFaturamento: ''
        },
        {
          revenda: 'Revenda R',
          registro: 'REG018',
          cliente: 'Tech Solutions (XPTO18)',
          bid: 'BID018',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '5000000',
          margem: '36',
          classificacao: 'proposta_valida',
          observacoes: 'Proposta em análise',
          estagioVenda: 'proposal',
          trimestre: 'Q2',
          regional: 'SUDESTE',
          dataWon: '',
          dataFaturamento: ''
        },
        {
          revenda: 'Revenda S',
          registro: 'REG019',
          cliente: 'Digital Corp (XPTO19)',
          bid: 'BID019',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '5200000',
          margem: '37',
          classificacao: 'proposta_valida',
          observacoes: 'Proposta em revisão',
          estagioVenda: 'proposal',
          trimestre: 'Q3',
          regional: 'BRASÍLIA + CENTRO OESTE',
          dataWon: '',
          dataFaturamento: ''
        },
        // In Negotiation
        {
          revenda: 'Revenda T',
          registro: 'REG020',
          cliente: 'Tech Inovação (XPTO20)',
          bid: 'BID020',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '5500000',
          margem: '38',
          classificacao: 'proposta_valida',
          observacoes: 'Em negociação',
          estagioVenda: 'negotiation',
          trimestre: 'Q1',
          regional: 'NORTE + NORDESTE',
          dataWon: '',
          dataFaturamento: ''
        },
        {
          revenda: 'Revenda U',
          registro: 'REG021',
          cliente: 'Digital Solutions (XPTO21)',
          bid: 'BID021',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '5800000',
          margem: '39',
          classificacao: 'proposta_valida',
          observacoes: 'Negociação avançada',
          estagioVenda: 'negotiation',
          trimestre: 'Q2',
          regional: 'SUL',
          dataWon: '',
          dataFaturamento: ''
        },
        {
          revenda: 'Revenda V',
          registro: 'REG022',
          cliente: 'Tech Corp (XPTO22)',
          bid: 'BID022',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '6000000',
          margem: '40',
          classificacao: 'proposta_valida',
          observacoes: 'Negociação final',
          estagioVenda: 'negotiation',
          trimestre: 'Q3',
          regional: 'SUDESTE',
          dataWon: '',
          dataFaturamento: ''
        },
        // Waiting PO
        {
          revenda: 'Revenda W',
          registro: 'REG023',
          cliente: 'Inovação Digital (XPTO23)',
          bid: 'BID023',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '6200000',
          margem: '41',
          classificacao: 'proposta_valida',
          observacoes: 'Aguardando PO',
          estagioVenda: 'waiting_po',
          trimestre: 'Q1',
          regional: 'BRASÍLIA + CENTRO OESTE',
          dataWon: '',
          dataFaturamento: ''
        },
        {
          revenda: 'Revenda X',
          registro: 'REG024',
          cliente: 'Tech Solutions (XPTO24)',
          bid: 'BID024',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '6500000',
          margem: '42',
          classificacao: 'proposta_valida',
          observacoes: 'PO em aprovação',
          estagioVenda: 'waiting_po',
          trimestre: 'Q2',
          regional: 'NORTE + NORDESTE',
          dataWon: '',
          dataFaturamento: ''
        },
        {
          revenda: 'Revenda Y',
          registro: 'REG025',
          cliente: 'Digital Corp (XPTO25)',
          bid: 'BID025',
          validadeBid: '2024-12-31',
          validadeProposta: '2024-12-31',
          preco: '6800000',
          margem: '43',
          classificacao: 'proposta_valida',
          observacoes: 'PO final',
          estagioVenda: 'waiting_po',
          trimestre: 'Q3',
          regional: 'SUL',
          dataWon: '',
          dataFaturamento: ''
        }
      ];

      // Salva as oportunidades no localStorage
      localStorage.setItem('oportunidades', JSON.stringify(oportunidadesIniciais));
      
      // Atualiza o estado
      setOportunidades(oportunidadesIniciais);
    }
  }, []);

  const salvarOportunidades = (ops: FormData[]) => {
    setOportunidades(ops);
    localStorage.setItem('oportunidades', JSON.stringify(ops));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'preco') {
      // Formata o valor em tempo real
      const valorFormatado = formatarInputPreco(value);
      setFormData({ ...formData, [name]: valorFormatado });
    } else if (name === 'estagioVenda' && value === 'won' && !formData.dataWon) {
      // Se mudou para WON e não tem data, define a data atual
      setFormData({ 
        ...formData, 
        [name]: value,
        dataWon: new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAdd = () => {
    if (!formData.revenda || !formData.registro || !formData.cliente || !formData.preco || !formData.margem || !formData.estagioVenda || !formData.trimestre || !formData.regional) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const novaOportunidade = {
      ...formData,
      validadeProposta: new Date().toISOString().split('T')[0] // Data atual como data da proposta
    };

    const novasOportunidades = [...oportunidades, novaOportunidade];
    const oportunidadesAtualizadas = verificarValidadePropostas(novasOportunidades);
    setOportunidades(oportunidadesAtualizadas);
    salvarOportunidades(oportunidadesAtualizadas);
    setFormData({
      revenda: '',
      registro: '',
      cliente: '',
      bid: '',
      validadeBid: '',
      validadeProposta: '',
      preco: '',
      margem: '',
      classificacao: '',
      observacoes: '',
      estagioVenda: '',
      trimestre: '',
      dataWon: '',
      dataFaturamento: '',
      regional: '',
    });
  };

  const handleDelete = (index: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta oportunidade?')) {
      const novasOportunidades = [...oportunidades];
      novasOportunidades.splice(index, 1);
      salvarOportunidades(novasOportunidades);
    }
  };

  // Edição de oportunidades
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleEdit = (index: number) => {
    const oportunidade = oportunidades[index];
    // Formata o preço ao editar
    const precoFormatado = formatarInputPreco(oportunidade.preco);
    setFormData({
      ...oportunidade,
      preco: precoFormatado
    });
    setEditIndex(index);
    
    // Adiciona scroll suave para o formulário
    const formCard = document.getElementById('formulario-oportunidade');
    if (formCard) {
      formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSaveEdit = () => {
    if (editIndex !== null) {
      // Validação da data WON
      if (formData.estagioVenda === 'won' && !formData.dataWon) {
        alert('A data WON é obrigatória quando o estágio é WON');
        return;
      }

      // Remove a formatação antes de salvar
      const precoNumerico = formData.preco.replace(/\D/g, '');
      const formDataFormatado = {
        ...formData,
        preco: precoNumerico
      };
      const novasOportunidades = [...oportunidades];
      novasOportunidades[editIndex] = formDataFormatado;
      salvarOportunidades(novasOportunidades);
      setEditIndex(null);
      setFormData({ revenda: '', registro: '', cliente: '', bid: '', validadeBid: '', validadeProposta: '', preco: '', margem: '', classificacao: '', observacoes: '', estagioVenda: '', trimestre: '', dataWon: '', dataFaturamento: '', regional: '' });
    }
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
    setFormData({ revenda: '', registro: '', cliente: '', bid: '', validadeBid: '', validadeProposta: '', preco: '', margem: '', classificacao: '', observacoes: '', estagioVenda: '', trimestre: '', dataWon: '', dataFaturamento: '', regional: '' });
  };

  // Cálculo dos totais por classificação
  const totaisPorClassificacao = oportunidades.reduce((acc, op) => {
    const classificacao = op.classificacao || 'Não Classificado';
    const preco = parseFloat(op.preco.replace(/\D/g, '')) || 0;
    if (!acc[classificacao]) {
      acc[classificacao] = { total: 0, count: 0 };
    }
    acc[classificacao].total += preco;
    acc[classificacao].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  // Cálculo das médias
  const dadosMedias = oportunidades.reduce((acc, op) => {
    const preco = parseFloat(op.preco.replace(/\D/g, '')) || 0;
    const margem = parseFloat(op.margem) || 0;
    acc.totalPreco += preco;
    acc.totalMargem += margem;
    acc.count += 1;
    return acc;
  }, { totalPreco: 0, totalMargem: 0, count: 0 });

  const mediaPreco = dadosMedias.count > 0 ? dadosMedias.totalPreco / dadosMedias.count : 0;
  const mediaMargem = dadosMedias.count > 0 ? dadosMedias.totalMargem / dadosMedias.count : 0;

  const formatarPreco = (valor: string) => {
    if (!valor) return 'R$ 0,00';
    const numeros = valor.replace(/\D/g, '');
    if (!numeros) return 'R$ 0,00';
    const valorFormatado = numeros.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `R$ ${valorFormatado},00`;
  };

  const formatarInputPreco = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (!numeros) return '';
    return numeros.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Função para verificar e atualizar a validade das propostas
  const verificarValidadePropostas = (ops: FormData[]) => {
    const hoje = new Date();
    return ops.map(op => {
      if (op.validadeProposta) {
        const dataProposta = new Date(op.validadeProposta);
        const diferencaDias = Math.floor((hoje.getTime() - dataProposta.getTime()) / (1000 * 60 * 60 * 24));
        
        // Se passou mais de 15 dias e o estágio não é 'won' ou 'closed_lost'
        if (diferencaDias > 15 && op.estagioVenda !== 'won' && op.estagioVenda !== 'closed_lost') {
          return {
            ...op,
            estagioVenda: 'proposta_expirada',
            classificacao: 'proposta_expirada'
          };
        }
      }
      return op;
    });
  };

  // Atualizar oportunidades a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      const oportunidadesAtualizadas = verificarValidadePropostas(oportunidades);
      if (JSON.stringify(oportunidadesAtualizadas) !== JSON.stringify(oportunidades)) {
        salvarOportunidades(oportunidadesAtualizadas);
      }
    }, 60000); // Verifica a cada minuto

    return () => clearInterval(interval);
  }, [oportunidades]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-2 max-w-[1920px]">
        {/* Header com logo */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img
              src="/logo-adistec.png"
              alt="Logo Adistec"
              className="mr-4 h-32 w-auto"
            />
            <h1 className="text-3xl font-bold text-blue-600">Oportunidades Adistec Lenovo</h1>
          </div>
        </div>

        {/* Cards de classificação */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 mb-2">
          {CLASSIFICACOES.map((c) => (
            <Card key={c.value} className={`shadow-md ${c.color}`}>
              <CardHeader className="pb-1">
                <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totaisPorClassificacao[c.value]?.total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }) || 'R$ 0,00'}
                </div>
                <div className="text-sm text-gray-600">
                  {totaisPorClassificacao[c.value]?.count || 0} oportunidades
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Formulário de Nova Oportunidade */}
        <Card id="formulario-oportunidade" className="mb-4">
          <CardHeader>
            <CardTitle>{editIndex !== null ? 'Editar Oportunidade' : 'Nova Oportunidade'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="revenda">Revenda</Label>
                <Input
                  id="revenda"
                  value={formData.revenda}
                  onChange={(e) => setFormData({ ...formData, revenda: e.target.value })}
                  placeholder="Digite a revenda"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registro">Registro</Label>
                <Input
                  id="registro"
                  value={formData.registro}
                  onChange={(e) => setFormData({ ...formData, registro: e.target.value })}
                  placeholder="Digite o registro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  value={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                  placeholder="Digite o cliente"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bid">BID</Label>
                <Input
                  id="bid"
                  value={formData.bid}
                  onChange={(e) => setFormData({ ...formData, bid: e.target.value })}
                  placeholder="Digite o BID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validadeBid">Validade BID</Label>
                <Input
                  id="validadeBid"
                  type="date"
                  value={formData.validadeBid}
                  onChange={(e) => setFormData({ ...formData, validadeBid: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validadeProposta">Validade Proposta</Label>
                <Input
                  id="validadeProposta"
                  type="date"
                  value={formData.validadeProposta}
                  onChange={(e) => setFormData({ ...formData, validadeProposta: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco">Preço</Label>
                <Input
                  id="preco"
                  name="preco"
                  value={formData.preco}
                  onChange={handleChange}
                  placeholder="Digite o preço"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="margem">Margem</Label>
                <Input
                  id="margem"
                  type="number"
                  value={formData.margem}
                  onChange={(e) => setFormData({ ...formData, margem: e.target.value })}
                  placeholder="Digite a margem"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="classificacao">Classificação</Label>
                <Select
                  value={formData.classificacao}
                  onValueChange={(value) => setFormData({ ...formData, classificacao: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a classificação" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSIFICACOES.map((classificacao) => (
                      <SelectItem key={classificacao.value} value={classificacao.value}>
                        {classificacao.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estagioVenda">Estágio da Venda</Label>
                <Select
                  value={formData.estagioVenda}
                  onValueChange={(value) => setFormData({ ...formData, estagioVenda: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estágio" />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTAGIOS_VENDA.map((estagio) => (
                      <SelectItem key={estagio.value} value={estagio.value}>
                        {estagio.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trimestre">Trimestre de Fechamento</Label>
                <Select
                  value={formData.trimestre}
                  onValueChange={(value) => setFormData({ ...formData, trimestre: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o trimestre" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIMESTRES.map((trimestre) => (
                      <SelectItem key={trimestre.value} value={trimestre.value}>
                        {trimestre.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataWon">
                  Data WON
                  {formData.estagioVenda === 'won' && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                  id="dataWon"
                  name="dataWon"
                  type="date"
                  value={formData.dataWon}
                  onChange={handleChange}
                  disabled={formData.estagioVenda !== 'won'}
                  required={formData.estagioVenda === 'won'}
                  className={formData.estagioVenda === 'won' && !formData.dataWon ? 'border-red-500' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataFaturamento">Data Faturamento</Label>
                <Input
                  id="dataFaturamento"
                  name="dataFaturamento"
                  type="date"
                  value={formData.dataFaturamento}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="regional">Regional</Label>
                <Select
                  value={formData.regional}
                  onValueChange={(value) => setFormData({ ...formData, regional: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a regional" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONAIS.map((regional) => (
                      <SelectItem key={regional.value} value={regional.value}>
                        {regional.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Digite as observações"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              {editIndex !== null && (
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  Cancelar
                </Button>
              )}
              <Button
                onClick={editIndex !== null ? handleSaveEdit : handleAdd}
                className={editIndex !== null ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                {editIndex !== null ? 'Salvar Alterações' : 'Adicionar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Oportunidades */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Oportunidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-[600px]">
              <div className="min-w-[1200px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                    <TableRow>
                      <TableHead className="w-[100px] bg-white">Revenda</TableHead>
                      <TableHead className="w-[80px] bg-white">Registro</TableHead>
                      <TableHead className="w-[150px] bg-white">Cliente</TableHead>
                      <TableHead className="w-[80px] bg-white">BID</TableHead>
                      <TableHead className="w-[100px] bg-white">Validade BID</TableHead>
                      <TableHead className="w-[120px] bg-white">Validade Proposta</TableHead>
                      <TableHead className="w-[100px] bg-white">Preço</TableHead>
                      <TableHead className="w-[80px] bg-white">Margem</TableHead>
                      <TableHead className="w-[120px] bg-white">Classificação</TableHead>
                      <TableHead className="w-[120px] bg-white">Estágio</TableHead>
                      <TableHead className="w-[100px] bg-white">Trimestre</TableHead>
                      <TableHead className="w-[100px] bg-white">Data WON</TableHead>
                      <TableHead className="w-[120px] bg-white">Data Faturamento</TableHead>
                      <TableHead className="w-[150px] bg-white">Regional</TableHead>
                      <TableHead className="w-[150px] bg-white">Observações</TableHead>
                      <TableHead className="w-[100px] bg-white">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {oportunidades.map((oportunidade, index) => (
                      <TableRow key={index}>
                        <TableCell className="whitespace-nowrap">{oportunidade.revenda}</TableCell>
                        <TableCell className="whitespace-nowrap">{oportunidade.registro}</TableCell>
                        <TableCell className="whitespace-nowrap">{oportunidade.cliente}</TableCell>
                        <TableCell className="whitespace-nowrap">{oportunidade.bid}</TableCell>
                        <TableCell className="whitespace-nowrap">{oportunidade.validadeBid}</TableCell>
                        <TableCell className="whitespace-nowrap">{oportunidade.validadeProposta}</TableCell>
                        <TableCell className="whitespace-nowrap">{formatarPreco(oportunidade.preco)}</TableCell>
                        <TableCell className="whitespace-nowrap">{oportunidade.margem}</TableCell>
                        <TableCell className="whitespace-nowrap">{oportunidade.classificacao}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {ESTAGIOS_VENDA.find(e => e.value === oportunidade.estagioVenda)?.label || oportunidade.estagioVenda}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{oportunidade.trimestre}</TableCell>
                        <TableCell className="whitespace-nowrap">{oportunidade.dataWon || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">{oportunidade.dataFaturamento || '-'}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {REGIONAIS.find(r => r.value === oportunidade.regional)?.label || oportunidade.regional}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{oportunidade.observacoes}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(index)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(index)}
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo de Valores */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-blue-800">Valores por Classificação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {CLASSIFICACOES.map(c => {
                  const valorTotal = oportunidades
                    .filter(op => op.classificacao === c.value)
                    .reduce((acc, op) => acc + (Number(op.preco.replace(/\D/g, '')) || 0), 0);
                  
                  return (
                    <div key={c.value} className="flex justify-between items-center p-2 rounded-lg hover:bg-blue-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="font-medium text-gray-700">{c.label}</span>
                      </div>
                      <span className="font-bold text-blue-900">{formatarPreco(valorTotal.toString())}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-green-800">Valor Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-3xl font-bold text-green-900">
                  {formatarPreco(
                    oportunidades
                      .reduce((acc, op) => acc + (Number(op.preco.replace(/\D/g, '')) || 0), 0)
                      .toString()
                  )}
                </span>
                <p className="text-sm text-gray-500 mt-2">Soma de todas as oportunidades</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Médias por Estágio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
          <Card className="shadow-md">
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Média de Preço</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={ESTAGIOS_VENDA.map(estagio => {
                      const oportunidadesNoEstagio = oportunidades.filter(op => op.estagioVenda === estagio.value);
                      const mediaPreco = oportunidadesNoEstagio.length > 0
                        ? oportunidadesNoEstagio.reduce((acc, op) => acc + (Number(op.preco.replace(/\D/g, '')) || 0), 0) / oportunidadesNoEstagio.length
                        : 0;
                      return {
                        name: estagio.label,
                        media: mediaPreco,
                        color: estagio.color
                      };
                    })}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [
                        value.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }),
                        'Média de Preço'
                      ]}
                    />
                    <Line type="monotone" dataKey="media" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-1">
              <CardTitle className="text-lg">Média de Margem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={ESTAGIOS_VENDA.map(estagio => {
                      const oportunidadesNoEstagio = oportunidades.filter(op => op.estagioVenda === estagio.value);
                      const mediaMargem = oportunidadesNoEstagio.length > 0
                        ? oportunidadesNoEstagio.reduce((acc, op) => acc + (Number(op.margem) || 0), 0) / oportunidadesNoEstagio.length
                        : 0;
                      return {
                        name: estagio.label,
                        media: mediaMargem,
                        color: estagio.color
                      };
                    })}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [
                        `${value.toFixed(2)}%`,
                        'Média de Margem'
                      ]}
                    />
                    <Line type="monotone" dataKey="media" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Oportunidades; 