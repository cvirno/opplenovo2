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
import { adicionarOportunidade, buscarOportunidades, atualizarOportunidade, excluirOportunidade, criarOportunidadesIniciais } from '../lib/oportunidades';
import type { Oportunidade } from '../lib/oportunidades';

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

  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar oportunidades do localStorage
  useEffect(() => {
    const carregarOportunidades = () => {
      setLoading(true);
      try {
        const dados = buscarOportunidades();
        if (dados.length === 0) {
          criarOportunidadesIniciais();
          setOportunidades(buscarOportunidades());
        } else {
          setOportunidades(dados);
        }
      } catch (error) {
        console.error('Erro ao carregar oportunidades:', error);
        alert('Erro ao carregar oportunidades. Por favor, recarregue a página.');
      } finally {
        setLoading(false);
      }
    };

    carregarOportunidades();
  }, []);

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

    try {
      const novaOportunidade = {
        id: Date.now().toString(),
        ...formData,
        validadeProposta: new Date().toISOString().split('T')[0]
      };

      adicionarOportunidade(novaOportunidade);
      setOportunidades(buscarOportunidades());

      // Limpa o formulário
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
    } catch (error) {
      console.error('Erro ao adicionar oportunidade:', error);
      alert('Erro ao adicionar oportunidade. Tente novamente.');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta oportunidade?')) {
      try {
        excluirOportunidade(id);
        setOportunidades(buscarOportunidades());
      } catch (error) {
        console.error('Erro ao excluir oportunidade:', error);
        alert('Erro ao excluir oportunidade. Tente novamente.');
      }
    }
  };

  // Edição de oportunidades
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleEdit = (index: number) => {
    const oportunidade = oportunidades[index];
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
      try {
        const oportunidade = oportunidades[editIndex];
        atualizarOportunidade(oportunidade.id, {
          ...formData,
          preco: formData.preco.replace(/\D/g, '')
        });
        setOportunidades(buscarOportunidades());
        setEditIndex(null);
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
      } catch (error) {
        console.error('Erro ao atualizar oportunidade:', error);
        alert('Erro ao atualizar oportunidade. Tente novamente.');
      }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">Carregando...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl text-red-500">{error}</div>
        </div>
      ) : (
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
            <CardContent className="p-0">
              <div className="relative w-full overflow-auto max-h-[300px]">
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
                      <TableRow key={oportunidade.id} className="hover:bg-gray-50">
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
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(index)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(oportunidade.id)}
                              className="text-red-500 hover:text-red-700"
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
      )}
    </div>
  );
};

export default Oportunidades; 