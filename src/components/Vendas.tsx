import React, { useState, useEffect, useMemo } from 'react';
import { Input } from './ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, Cell, PieChart, Pie } from 'recharts';

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
  dataFaturamento?: string;
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Vendas: React.FC = () => {
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
    regional: '',
  });

  const [oportunidades, setOportunidades] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(false);

  const [quotaTotal, setQuotaTotal] = useState<number>(() => {
    const quotaSalva = localStorage.getItem('quotaTotal');
    return quotaSalva ? Number(quotaSalva) : 0;
  });
  const [quotaQ1, setQuotaQ1] = useState<number>(0);
  const [quotaQ2, setQuotaQ2] = useState<number>(0);
  const [quotaQ3, setQuotaQ3] = useState<number>(0);
  const [quotaQ4, setQuotaQ4] = useState<number>(0);

  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedRegionais, setSelectedRegionais] = useState<string[]>([]);
  const [selectedEstagios, setSelectedEstagios] = useState<string[]>([]);

  // Salvar quota total no localStorage quando alterada
  useEffect(() => {
    localStorage.setItem('quotaTotal', quotaTotal.toString());
  }, [quotaTotal]);

  // Efeito para distribuir a quota total entre os trimestres
  useEffect(() => {
    const quotaPorTrimestre = quotaTotal / 4;
    setQuotaQ1(quotaPorTrimestre);
    setQuotaQ2(quotaPorTrimestre);
    setQuotaQ3(quotaPorTrimestre);
    setQuotaQ4(quotaPorTrimestre);
  }, [quotaTotal]);

  // Carregar oportunidades do localStorage
  useEffect(() => {
    const data = localStorage.getItem('oportunidades');
    if (data) {
      const oportunidadesCarregadas = JSON.parse(data);
      // Adiciona o estágio da venda e trimestre aleatório para oportunidades existentes que não os possuem
      const oportunidadesAtualizadas = oportunidadesCarregadas.map((op: FormData) => ({
        ...op,
        estagioVenda: op.estagioVenda || 'lead', // Define 'lead' como estágio padrão
        trimestre: op.trimestre || TRIMESTRES[Math.floor(Math.random() * TRIMESTRES.length)].value, // Atribui um trimestre aleatório
        regional: op.regional || 'SUL' // Define 'SUL' como regional padrão
      }));
      setOportunidades(oportunidadesAtualizadas);
      // Salva as oportunidades atualizadas
      localStorage.setItem('oportunidades', JSON.stringify(oportunidadesAtualizadas));
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
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAdd = () => {
    // Remove a formatação antes de salvar
    const precoNumerico = formData.preco.replace(/\D/g, '');
    const formDataFormatado = {
      ...formData,
      preco: precoNumerico
    };
    const novasOportunidades = [...oportunidades, formDataFormatado];
    salvarOportunidades(novasOportunidades);
    setFormData({ revenda: '', registro: '', cliente: '', bid: '', validadeBid: '', validadeProposta: '', preco: '', margem: '', classificacao: '', observacoes: '', estagioVenda: '', trimestre: '', regional: 'SUL' });
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
  };

  const handleSaveEdit = () => {
    if (editIndex !== null) {
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
      setFormData({ revenda: '', registro: '', cliente: '', bid: '', validadeBid: '', validadeProposta: '', preco: '', margem: '', classificacao: '', observacoes: '', estagioVenda: '', trimestre: '', regional: 'SUL' });
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 py-2 w-full max-w-[1920px]">
        {/* Header com logo e quotas */}
        <div className="flex flex-col space-y-4 mb-4">
          <div className="flex items-center">
            <img
              src="/logo-adistec.png"
              alt="Logo Adistec"
              className="mr-4 h-32 w-auto"
            />
            <h1 className="text-3xl font-bold text-blue-600">Vendas Adistec Lenovo</h1>
          </div>
          <div className="flex gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-blue-800">Quota Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={quotaTotal.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                    onChange={(e) => {
                      const valor = e.target.value.replace(/\D/g, '');
                      const valorNumerico = Number(valor) / 100;
                      setQuotaTotal(valorNumerico);
                    }}
                    className="w-32"
                    placeholder="R$ 0,00"
                  />
                  <span className="text-sm text-gray-500">R$</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-green-800">Q1</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-green-900">
                  {quotaQ1.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-50 to-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-yellow-800">Q2</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-yellow-900">
                  {quotaQ2.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-orange-800">Q3</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-orange-900">
                  {quotaQ3.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-red-800">Q4</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-red-900">
                  {quotaQ4.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cards de estágio de venda */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 mb-2">
          {ESTAGIOS_VENDA.map((estagio) => {
            const oportunidadesNoEstagio = oportunidades.filter(op => op.estagioVenda === estagio.value);
            const valorTotal = oportunidadesNoEstagio.reduce((acc, op) => acc + (Number(op.preco.replace(/\D/g, '')) || 0), 0);
            
            return (
              <Card 
                key={estagio.value} 
                className="shadow-md transition-all duration-300 hover:shadow-lg"
                style={{ 
                  backgroundColor: estagio.color,
                  color: 'white'
                }}
              >
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm font-medium text-white">{estagio.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {valorTotal.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </div>
                  <div className="text-sm text-white/80">
                    {oportunidadesNoEstagio.length} oportunidades
                  </div>
                  <div className="mt-2">
                    <div className="h-2 bg-white/20 rounded-full">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${estagio.percentual}%`,
                          backgroundColor: 'white'
                        }}
                      />
                    </div>
                    <div className="text-xs text-white/80 mt-1">
                      {estagio.percentual}% do pipeline
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Média de Margem dos Estágios Avançados */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-purple-800">Média de Margem dos Estágios Avançados</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const estagiosAvancados = ['proposal', 'negotiation', 'waiting_po', 'won'];
                const oportunidadesAvancadas = oportunidades.filter(op => estagiosAvancados.includes(op.estagioVenda));
                const mediaMargem = oportunidadesAvancadas.length > 0
                  ? oportunidadesAvancadas.reduce((acc, op) => acc + (Number(op.margem) || 0), 0) / oportunidadesAvancadas.length
                  : 0;
                
                return (
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-4xl font-bold text-purple-900">
                      {mediaMargem.toFixed(2)}%
                    </span>
                    <p className="text-sm text-gray-500 mt-2">
                      Média de margem considerando: Proposal, In Negotiation, Waiting PO e WON
                    </p>
                    <p className="text-sm text-gray-500">
                      Total de oportunidades: {oportunidadesAvancadas.length}
                    </p>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-emerald-800">Média de Margem WON</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const oportunidadesWon = oportunidades.filter(op => op.estagioVenda === 'won');
                const mediaMargemWon = oportunidadesWon.length > 0
                  ? oportunidadesWon.reduce((acc, op) => acc + (Number(op.margem) || 0), 0) / oportunidadesWon.length
                  : 0;
                
                return (
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-4xl font-bold text-emerald-900">
                      {mediaMargemWon.toFixed(2)}%
                    </span>
                    <p className="text-sm text-gray-500 mt-2">
                      Média de margem das oportunidades WON
                    </p>
                    <p className="text-sm text-gray-500">
                      Total de oportunidades WON: {oportunidadesWon.length}
                    </p>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Resumo de Valores */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-green-800">Valor Total do Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-3xl font-bold text-green-900">
                  {formatarPreco(
                    oportunidades
                      .filter(op => op.estagioVenda !== 'closed_lost')
                      .reduce((acc, op) => acc + (Number(op.preco.replace(/\D/g, '')) || 0), 0)
                      .toString()
                  )}
                </span>
                <p className="text-sm text-gray-500 mt-2">Soma de todas as oportunidades ativas no pipeline</p>
                <p className="text-sm text-gray-500">(Excluindo oportunidades Closed Lost)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-red-800">Valor Total de Lost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-3xl font-bold text-red-900">
                  {formatarPreco(
                    oportunidades
                      .filter(op => op.estagioVenda === 'closed_lost')
                      .reduce((acc, op) => acc + (Number(op.preco.replace(/\D/g, '')) || 0), 0)
                      .toString()
                  )}
                </span>
                <p className="text-sm text-gray-500 mt-2">Soma de todas as oportunidades perdidas</p>
                <p className="text-sm text-gray-500">(Apenas oportunidades Closed Lost)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Médias por Estágio de Venda */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-100">Médias por Estágio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center px-2 mb-1">
                  <div className="w-[150px]"></div>
                  <div className="flex gap-4">
                    <span className="font-medium text-gray-300 w-[120px] text-center">Valor em R$</span>
                    <span className="font-medium text-gray-300 w-[80px] text-center">Margem</span>
                  </div>
                </div>
                {ESTAGIOS_VENDA.map(estagio => {
                  const oportunidadesNoEstagio = oportunidades.filter(op => op.estagioVenda === estagio.value);
                  const mediaPreco = oportunidadesNoEstagio.length > 0
                    ? oportunidadesNoEstagio.reduce((acc, op) => acc + (Number(op.preco.replace(/\D/g, '')) || 0), 0) / oportunidadesNoEstagio.length
                    : 0;
                  const mediaMargem = oportunidadesNoEstagio.length > 0
                    ? oportunidadesNoEstagio.reduce((acc, op) => acc + (Number(op.margem) || 0), 0) / oportunidadesNoEstagio.length
                    : 0;
                  
                  return (
                    <div key={estagio.value} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center gap-2 w-[150px]">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: estagio.color }} />
                        <span className="font-medium text-gray-200">{estagio.label}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="font-bold text-gray-100 w-[120px] text-center">
                          {mediaPreco.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })}
                        </span>
                        <span className="font-bold text-gray-100 w-[80px] text-center">
                          {mediaMargem.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pipeline por Trimestre */}
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-100">Pipeline por Trimestre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Q1', quota: quotaQ1, color: 'bg-green-500', textColor: 'text-green-500' },
                  { label: 'Q2', quota: quotaQ2, color: 'bg-yellow-500', textColor: 'text-yellow-500' },
                  { label: 'Q3', quota: quotaQ3, color: 'bg-orange-500', textColor: 'text-orange-500' },
                  { label: 'Q4', quota: quotaQ4, color: 'bg-red-500', textColor: 'text-red-500' }
                ].map(({ label, quota, color, textColor }) => {
                  // Pipeline (todos os estágios exceto closed_lost e won)
                  const valorPipeline = oportunidades
                    .filter(op => 
                      op.trimestre === label && 
                      op.estagioVenda !== 'closed_lost' &&
                      op.estagioVenda !== 'won'
                    )
                    .reduce((acc, op) => acc + (Number(op.preco.replace(/\D/g, '')) || 0), 0);
                  
                  // Cálculo do múltiplo do pipeline em relação à quota
                  const multiploPipeline = quota > 0 ? valorPipeline / quota : 0;
                  
                  let statusColor;
                  let barColor;
                  let pipelineStatus;
                  
                  if (multiploPipeline > 4) {
                    statusColor = 'text-green-400';
                    barColor = 'bg-green-500';
                    pipelineStatus = 'Pipeline Saudável';
                  } else if (multiploPipeline >= 3) {
                    statusColor = 'text-yellow-400';
                    barColor = 'bg-yellow-500';
                    pipelineStatus = 'Pipeline Regular';
                  } else {
                    statusColor = 'text-red-400';
                    barColor = 'bg-red-500';
                    pipelineStatus = 'Pipeline Baixo';
                  }

                  return (
                    <div key={label} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-lg ${textColor}`}>{label}</span>
                          <span className="text-sm text-gray-400">Meta:</span>
                          <span className="font-bold text-gray-100">
                            {quota.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">Pipeline:</span>
                          <span className="font-bold text-gray-100">
                            {valorPipeline.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </span>
                          <span className={`text-sm ${statusColor}`}>
                            ({multiploPipeline.toFixed(1)}x)
                          </span>
                        </div>
                      </div>
                      
                      <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${barColor} transition-all duration-500`}
                          style={{ width: `${Math.min((valorPipeline / quota) * 100, 100)}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Status:</span>
                        <span className={`font-bold ${statusColor}`}>{pipelineStatus}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Linha do Total */}
                <div className="pt-4 border-t border-gray-700">
                  {(() => {
                    const pipelineTotal = oportunidades
                      .filter(op => 
                        op.estagioVenda !== 'closed_lost' &&
                        op.estagioVenda !== 'won'
                      )
                      .reduce((acc, op) => acc + (Number(op.preco.replace(/\D/g, '')) || 0), 0);
                    
                    const multiploTotal = quotaTotal > 0 ? pipelineTotal / quotaTotal : 0;
                    
                    let statusColor;
                    let barColor;
                    let pipelineStatus;
                    
                    if (multiploTotal > 4) {
                      statusColor = 'text-green-400';
                      barColor = 'bg-green-500';
                      pipelineStatus = 'Pipeline Saudável';
                    } else if (multiploTotal >= 3) {
                      statusColor = 'text-yellow-400';
                      barColor = 'bg-yellow-500';
                      pipelineStatus = 'Pipeline Regular';
                    } else {
                      statusColor = 'text-red-400';
                      barColor = 'bg-red-500';
                      pipelineStatus = 'Pipeline Baixo';
                    }

                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-gray-100">Total</span>
                            <span className="text-sm text-gray-400">Meta:</span>
                            <span className="font-bold text-gray-100">
                              {quotaTotal.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">Pipeline:</span>
                            <span className="font-bold text-gray-100">
                              {pipelineTotal.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                              })}
                            </span>
                            <span className={`text-sm ${statusColor}`}>
                              ({multiploTotal.toFixed(1)}x)
                            </span>
                          </div>
                        </div>
                        
                        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${barColor} transition-all duration-500`}
                            style={{ width: `${Math.min((pipelineTotal / quotaTotal) * 100, 100)}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Status:</span>
                          <span className={`font-bold ${statusColor}`}>{pipelineStatus}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gauges de Progresso vs Meta */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Progresso vs. Meta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Gauge Total */}
                <div className="col-span-1">
                  <div className="text-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-700">Total</h3>
                  </div>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { 
                              name: 'Atingido', 
                              value: oportunidades
                                .filter(op => op.estagioVenda === 'won')
                                .reduce((acc, op) => acc + (Number(op.preco.replace(/\D/g, '')) || 0), 0)
                            },
                            { 
                              name: 'Restante', 
                              value: Math.max(0, quotaTotal - oportunidades
                                .filter(op => op.estagioVenda === 'won')
                                .reduce((acc, op) => acc + (Number(op.preco.replace(/\D/g, '')) || 0), 0))
                            }
                          ]}
                          cx="50%"
                          cy="50%"
                          startAngle={180}
                          endAngle={0}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill={(() => {
                            const valorWon = oportunidades
                              .filter(op => op.estagioVenda === 'won')
                              .reduce((acc, op) => acc + (Number(op.preco.replace(/\D/g, '')) || 0), 0);
                            const percentual = Math.round((valorWon / quotaTotal) * 100);
                            
                            if (percentual <= 50) {
                              return '#ef4444'; // vermelho
                            } else if (percentual < 100) {
                              return '#f59e0b'; // amarelo
                            } else {
                              return '#10b981'; // verde
                            }
                          })()} />
                          <Cell fill="#e5e7eb" />
                        </Pie>
                        <text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-2xl font-bold"
                        >
                          {(() => {
                            const valorWon = oportunidades
                              .filter(op => op.estagioVenda === 'won')
                              .reduce((acc, op) => acc + (Number(op.preco.replace(/\D/g, '')) || 0), 0);
                            const percentual = Math.round((valorWon / quotaTotal) * 100);
                            return `${percentual}%`;
                          })()}
                        </text>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center text-sm text-gray-600">
                    Meta: {quotaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                  <div className="text-center text-sm mt-1">
                    {(() => {
                      const valorWon = oportunidades
                        .filter(op => op.estagioVenda === 'won')
                        .reduce((acc, op) => acc + (Number(op.preco.replace(/\D/g, '')) || 0), 0);
                      const diferenca = valorWon - quotaTotal;
                      
                      if (diferenca < 0) {
                        return (
                          <span className="text-red-600">
                            Faltam {Math.abs(diferenca).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para meta
                          </span>
                        );
                      } else {
                        return (
                          <span className="text-green-600">
                            {diferenca.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} acima da meta
                          </span>
                        );
                      }
                    })()}
                  </div>
                </div>

                {/* Gauges por Trimestre */}
                {[
                  { label: 'Q1', quota: quotaQ1 },
                  { label: 'Q2', quota: quotaQ2 },
                  { label: 'Q3', quota: quotaQ3 },
                  { label: 'Q4', quota: quotaQ4 }
                ].map(({ label, quota }) => {
                  const valorWon = oportunidades
                    .filter(op => 
                      op.trimestre === label && 
                      op.estagioVenda === 'won'
                    )
                    .reduce((acc, op) => acc + (Number(op.preco.replace(/\D/g, '')) || 0), 0);
                  
                  const percentual = Math.round((valorWon / quota) * 100);
                  const diferenca = valorWon - quota;

                  let color;
                  if (percentual <= 50) {
                    color = '#ef4444'; // vermelho
                  } else if (percentual < 100) {
                    color = '#f59e0b'; // amarelo
                  } else {
                    color = '#10b981'; // verde
                  }

                  return (
                    <div key={label} className="col-span-1">
                      <div className="text-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-700">{label}</h3>
                      </div>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Atingido', value: valorWon },
                                { name: 'Restante', value: Math.max(0, quota - valorWon) }
                              ]}
                              cx="50%"
                              cy="50%"
                              startAngle={180}
                              endAngle={0}
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              <Cell fill={color} />
                              <Cell fill="#e5e7eb" />
                            </Pie>
                            <text
                              x="50%"
                              y="50%"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              className="text-2xl font-bold"
                            >
                              {`${percentual}%`}
                            </text>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="text-center text-sm text-gray-600">
                        Meta: {quota.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                      <div className="text-center text-sm mt-1">
                        {diferenca < 0 ? (
                          <span className="text-red-600">
                            Faltam {Math.abs(diferenca).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para meta
                          </span>
                        ) : (
                          <span className="text-green-600">
                            {diferenca.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} acima da meta
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard de Faturamento */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard de Faturamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Seleção de Ano e Meses */}
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-lg">Selecione o Período</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Seleção de Ano */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ano
                        </label>
                        <select
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(Number(e.target.value))}
                        >
                          {(() => {
                            const currentYear = new Date().getFullYear();
                            return Array.from({ length: 5 }, (_, i) => currentYear - i).map(year => (
                              <option key={year} value={year}>{year}</option>
                            ));
                          })()}
                        </select>
                      </div>

                      {/* Lista de Meses */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Meses
                        </label>
                        <div className="space-y-2">
                          {(() => {
                            const meses = Array.from({ length: 12 }, (_, i) => {
                              const data = new Date(selectedYear, i);
                              return {
                                value: data.toISOString().split('T')[0],
                                label: data.toLocaleDateString('pt-BR', { month: 'long' })
                              };
                            });

                            return meses.map((mes) => (
                              <div key={mes.value} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={mes.value}
                                  checked={selectedMonths.includes(mes.value)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedMonths([...selectedMonths, mes.value]);
                                    } else {
                                      setSelectedMonths(selectedMonths.filter(m => m !== mes.value));
                                    }
                                  }}
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor={mes.value} className="text-sm font-medium text-gray-700">
                                  {mes.label}
                                </label>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Resumo do Faturamento */}
                <Card className="md:col-span-3">
                  <CardHeader>
                    <CardTitle className="text-lg">Resumo do Faturamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {selectedMonths.map(month => {
                        const oportunidadesDoMes = oportunidades.filter(op => {
                          if (!op.dataFaturamento) return false;
                          const dataFaturamento = new Date(op.dataFaturamento || '');
                          const dataSelecionada = new Date(month);
                          return dataFaturamento.getMonth() === dataSelecionada.getMonth() &&
                                 dataFaturamento.getFullYear() === dataSelecionada.getFullYear();
                        });

                        const totalMes = oportunidadesDoMes.reduce((acc, op) => 
                          acc + (Number(op.preco.replace(/\D/g, '')) || 0), 0);

                        return (
                          <div key={month} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-semibold text-gray-700">
                                {new Date(month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                              </h3>
                              <div className="text-sm font-medium text-gray-600">
                                Total: {totalMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </div>
                            </div>
                            
                            <div className="border rounded-lg overflow-hidden">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[100px]">Registro</TableHead>
                                    <TableHead>Revenda</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                    <TableHead className="text-right">Margem</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {oportunidadesDoMes.map((op, index) => {
                                    const valor = Number(op.preco.replace(/\D/g, '')) || 0;
                                    const margem = Number(op.margem) || 0;
                                    const total = valor * (1 + margem / 100);

                                    return (
                                      <TableRow key={index}>
                                        <TableCell className="font-medium">{op.registro}</TableCell>
                                        <TableCell>{op.revenda}</TableCell>
                                        <TableCell className="text-right">
                                          {valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </TableCell>
                                        <TableCell className="text-right">{margem}%</TableCell>
                                        <TableCell className="text-right">
                                          {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        );
                      })}

                      {selectedMonths.length === 0 && (
                        <div className="text-center text-gray-500 py-4">
                          Selecione pelo menos um mês para ver o resumo de faturamento
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard por Regional */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard por Regional e Estágio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Filtros */}
                <div className="space-y-6">
                  {/* Filtro de Regionais */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Regionais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[
                          { label: 'SUL', color: 'text-blue-900' },
                          { label: 'BRASÍLIA + CENTRO OESTE', color: 'text-green-900' },
                          { label: 'SUDESTE', color: 'text-purple-900' },
                          { label: 'NORTE + NORDESTE', color: 'text-orange-900' }
                        ].map((regional) => (
                          <div key={regional.label} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`regional-${regional.label}`}
                              checked={selectedRegionais.includes(regional.label)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRegionais([...selectedRegionais, regional.label]);
                                } else {
                                  setSelectedRegionais(selectedRegionais.filter(r => r !== regional.label));
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label 
                              htmlFor={`regional-${regional.label}`} 
                              className={`text-sm font-medium ${regional.color}`}
                            >
                              {regional.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Filtro de Estágios */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Estágios de Venda</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {ESTAGIOS_VENDA.map((estagio) => (
                          <div key={estagio.value} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`estagio-${estagio.value}`}
                              checked={selectedEstagios.includes(estagio.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEstagios([...selectedEstagios, estagio.value]);
                                } else {
                                  setSelectedEstagios(selectedEstagios.filter(e => e !== estagio.value));
                                }
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label 
                              htmlFor={`estagio-${estagio.value}`} 
                              className="text-sm font-medium"
                              style={{ color: estagio.color }}
                            >
                              {estagio.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Cards de Resumo */}
                <div className="lg:col-span-2">
                  {selectedRegionais.length > 0 && selectedEstagios.length > 0 ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Oportunidades Filtradas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[100px]">Registro</TableHead>
                                <TableHead>Revenda</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                                <TableHead className="text-right">Margem</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(() => {
                                const oportunidadesFiltradas = oportunidades.filter(op => {
                                  const matchRegional = selectedRegionais.includes(op.regional);
                                  const matchEstagio = selectedEstagios.includes(op.estagioVenda);
                                  return matchRegional && matchEstagio;
                                });
                                
                                const totalValor = oportunidadesFiltradas.reduce((acc, op) => 
                                  acc + (Number(op.preco.replace(/\D/g, '')) || 0), 0);
                                
                                return (
                                  <>
                                    {oportunidadesFiltradas.map((op, index) => (
                                      <TableRow key={index}>
                                        <TableCell className="font-medium">{op.registro}</TableCell>
                                        <TableCell>{op.revenda}</TableCell>
                                        <TableCell className="text-right">
                                          {Number(op.preco.replace(/\D/g, '')).toLocaleString('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL'
                                          })}
                                        </TableCell>
                                        <TableCell className="text-right">{op.margem}%</TableCell>
                                      </TableRow>
                                    ))}
                                    {oportunidadesFiltradas.length > 0 && (
                                      <TableRow className="bg-gray-50">
                                        <TableCell className="font-bold">Total</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell className="text-right font-bold">
                                          {totalValor.toLocaleString('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL'
                                          })}
                                        </TableCell>
                                        <TableCell></TableCell>
                                      </TableRow>
                                    )}
                                  </>
                                );
                              })()}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Selecione pelo menos uma Regional e um Estágio de Venda para ver as oportunidades
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pipeline de Vendas */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-500 mb-4">Pipeline de vendas por estágio</div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ESTAGIOS_VENDA.map(estagio => {
                    const oportunidadesNoEstagio = oportunidades.filter(op => op.estagioVenda === estagio.value);
                    const valorTotal = oportunidadesNoEstagio.reduce((acc, op) => acc + (Number(op.preco.replace(/\D/g, '')) || 0), 0);
                    return {
                      name: estagio.label,
                      valor: valorTotal,
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
                      'Valor Total'
                    ]}
                  />
                  <Bar dataKey="valor" fill="#8884d8">
                    {ESTAGIOS_VENDA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

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

export default Vendas; 