import React, { useEffect, useState } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { X, Search, Calendar, DollarSign, Percent, Tag, FileText, Building2, User, Hash, FileDigit } from 'lucide-react';
import { Label } from "../components/ui/label";

const CLASSIFICACOES = [
  { value: 'proposta_valida', label: 'Proposta Válida', color: '#22c55e' },
  { value: 'proposta_expirada', label: 'Proposta Expirada', color: '#94a3b8' },
  { value: 'declinado', label: 'Declinado', color: '#dc2626' },
  { value: 'info_processo', label: 'Informação do Processo', color: '#eab308' },
  { value: 'alteracao_config', label: 'Alteração de Config', color: '#db2777' }
];

const ESTAGIOS_VENDA = [
  { value: 'closed_lost', label: 'Closed Lost', percentual: 0, color: '#dc2626' },
  { value: 'lead', label: 'Lead', percentual: 5, color: '#94a3b8' },
  { value: 'qualification', label: 'Qualification', percentual: 10, color: '#eab308' },
  { value: 'validation', label: 'Validation', percentual: 20, color: '#f97316' },
  { value: 'proposal', label: 'Proposal', percentual: 50, color: '#3b82f6' },
  { value: 'negotiation', label: 'In Negotiation', percentual: 75, color: '#8b5cf6' },
  { value: 'waiting_po', label: 'Waiting PO', percentual: 85, color: '#ec4899' },
  { value: 'won', label: 'WON', percentual: 100, color: '#22c55e' }
];

interface Oportunidade {
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
}

const formatarPreco = (valor: string) => {
  if (!valor) return 'R$ 0';
  const numeros = valor.replace(/\D/g, '');
  if (!numeros) return 'R$ 0';
  const valorFormatado = numeros.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `R$ ${valorFormatado}`;
};

// Componente SearchableDropdown
interface SearchableDropdownProps {
  name: string;
  value: string;
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  name,
  value,
  placeholder,
  options,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    const filtered = options.filter(option =>
      String(option).toLowerCase().includes(String(searchText).toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchText, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(`.dropdown-${name}`)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [name]);

  return (
    <div className={`relative dropdown-${name}`}>
      <div className="flex">
        <Input
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="rounded-r-none"
        />
        <Button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-l-none border-l-0"
        >
          ▼
        </Button>
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-gray-500">
              Nenhum resultado encontrado
            </div>
          ) : (
            <>
              <div
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  onChange('');
                  setSearchText('');
                  setIsOpen(false);
                }}
              >
                Limpar seleção
              </div>
              {filteredOptions.map(option => (
                <div
                  key={option}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    onChange(String(option));
                    setSearchText(String(option));
                    setIsOpen(false);
                  }}
                >
                  {option}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const FiltrosGraficos: React.FC = () => {
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [oportunidadesFiltradas, setOportunidadesFiltradas] = useState<Oportunidade[]>([]);
  const [filtros, setFiltros] = useState({
    revenda: [] as string[],
    cliente: [] as string[],
    registro: [] as string[],
    bid: [] as string[],
    validadeBid: '',
    validadeProposta: '',
    precoMin: '',
    precoMax: '',
    margemMin: '',
    margemMax: '',
    classificacao: [] as string[],
    observacoes: '',
    estagioVenda: [] as string[],
  });

  // Estados para controlar os dropdowns
  const [dropdownRevendaAberto, setDropdownRevendaAberto] = useState(false);
  const [dropdownClienteAberto, setDropdownClienteAberto] = useState(false);
  const [dropdownRegistroAberto, setDropdownRegistroAberto] = useState(false);
  const [dropdownBidAberto, setDropdownBidAberto] = useState(false);
  const [dropdownClassificacaoAberto, setDropdownClassificacaoAberto] = useState(false);

  // Estados para busca nos dropdowns
  const [textoBuscaRevenda, setTextoBuscaRevenda] = useState('');
  const [textoBuscaCliente, setTextoBuscaCliente] = useState('');
  const [textoBuscaRegistro, setTextoBuscaRegistro] = useState('');
  const [textoBuscaBid, setTextoBuscaBid] = useState('');
  const [textoBuscaClassificacao, setTextoBuscaClassificacao] = useState('');

  // Estados específicos para os campos
  const [revendaDropdownAberto, setRevendaDropdownAberto] = useState(false);
  const [revendaTextoBusca, setRevendaTextoBusca] = useState('');
  const [revendaSelecionadas, setRevendaSelecionadas] = useState<string[]>([]);
  const [revendaSelecionadasTemp, setRevendaSelecionadasTemp] = useState<string[]>([]);

  const [clienteDropdownAberto, setClienteDropdownAberto] = useState(false);
  const [clienteTextoBusca, setClienteTextoBusca] = useState('');
  const [clienteSelecionados, setClienteSelecionados] = useState<string[]>([]);
  const [clienteSelecionadosTemp, setClienteSelecionadosTemp] = useState<string[]>([]);

  const [registroDropdownAberto, setRegistroDropdownAberto] = useState(false);
  const [registroTextoBusca, setRegistroTextoBusca] = useState('');
  const [registroSelecionados, setRegistroSelecionados] = useState<string[]>([]);
  const [registroSelecionadosTemp, setRegistroSelecionadosTemp] = useState<string[]>([]);

  const [bidDropdownAberto, setBidDropdownAberto] = useState(false);
  const [bidTextoBusca, setBidTextoBusca] = useState('');
  const [bidSelecionados, setBidSelecionados] = useState<string[]>([]);
  const [bidSelecionadosTemp, setBidSelecionadosTemp] = useState<string[]>([]);

  const [estagioVendaDropdownAberto, setEstagioVendaDropdownAberto] = useState(false);
  const [estagioVendaTextoBusca, setEstagioVendaTextoBusca] = useState('');
  const [estagioVendaSelecionados, setEstagioVendaSelecionados] = useState<string[]>([]);
  const [estagioVendaSelecionadosTemp, setEstagioVendaSelecionadosTemp] = useState<string[]>([]);

  // Funções para obter opções únicas
  const getRevendasUnicas = () => {
    return [...new Set(oportunidades.map(op => op.revenda))].filter(Boolean).sort();
  };

  const getClientesUnicos = () => {
    return [...new Set(oportunidades.map(op => op.cliente))].filter(Boolean).sort();
  };

  const getRegistrosUnicos = () => {
    return [...new Set(oportunidades.map(op => op.registro))].filter(Boolean).sort();
  };

  const getBidsUnicos = () => {
    return [...new Set(oportunidades.map(op => op.bid))].filter(Boolean).sort();
  };

  // Carregar oportunidades do localStorage
  useEffect(() => {
    const data = localStorage.getItem('oportunidades');
    if (data) {
      const oportunidadesData = JSON.parse(data);
      setOportunidades(oportunidadesData);
      setOportunidadesFiltradas(oportunidadesData);
    }
  }, []);

  // Atualizar quando houver mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const data = localStorage.getItem('oportunidades');
      if (data) {
        const oportunidadesData = JSON.parse(data);
        setOportunidades(oportunidadesData);
        setOportunidadesFiltradas(oportunidadesData);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleFiltro = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const filtrarOpcoes = (opcoes: string[], texto: string) => {
    return opcoes.filter(opcao =>
      opcao.toLowerCase().includes(texto.toLowerCase())
    );
  };

  const filtrarRevendas = (texto: string) => {
    const revendasUnicas = getRevendasUnicas();
    return filtrarOpcoes(revendasUnicas, texto);
  };

  const aplicarFiltros = (filtrosAtuais: typeof filtros) => {
    let resultado = [...oportunidades];

    if (filtrosAtuais.revenda.length > 0) {
      resultado = resultado.filter(op => filtrosAtuais.revenda.includes(op.revenda));
    }

    if (filtrosAtuais.cliente.length > 0) {
      resultado = resultado.filter(op => filtrosAtuais.cliente.includes(op.cliente));
    }

    if (filtrosAtuais.registro.length > 0) {
      resultado = resultado.filter(op => filtrosAtuais.registro.includes(op.registro));
    }

    if (filtrosAtuais.bid.length > 0) {
      resultado = resultado.filter(op => filtrosAtuais.bid.includes(op.bid));
    }

    if (filtrosAtuais.validadeBid) {
      resultado = resultado.filter(op => op.validadeBid === filtrosAtuais.validadeBid);
    }

    if (filtrosAtuais.validadeProposta) {
      resultado = resultado.filter(op => op.validadeProposta === filtrosAtuais.validadeProposta);
    }

    if (filtrosAtuais.precoMin) {
      resultado = resultado.filter(op => Number(op.preco) >= Number(filtrosAtuais.precoMin));
    }

    if (filtrosAtuais.precoMax) {
      resultado = resultado.filter(op => Number(op.preco) <= Number(filtrosAtuais.precoMax));
    }

    if (filtrosAtuais.margemMin) {
      resultado = resultado.filter(op => Number(op.margem) >= Number(filtrosAtuais.margemMin));
    }

    if (filtrosAtuais.margemMax) {
      resultado = resultado.filter(op => Number(op.margem) <= Number(filtrosAtuais.margemMax));
    }

    if (filtrosAtuais.classificacao.length > 0) {
      resultado = resultado.filter(op => filtrosAtuais.classificacao.includes(op.classificacao));
    }

    if (filtrosAtuais.observacoes) {
      resultado = resultado.filter(op =>
        op.observacoes.toLowerCase().includes(filtrosAtuais.observacoes.toLowerCase())
      );
    }

    if (filtrosAtuais.estagioVenda.length > 0) {
      resultado = resultado.filter(op => filtrosAtuais.estagioVenda.includes(op.estagioVenda));
    }

    setOportunidadesFiltradas(resultado);
  };

  const limparFiltros = () => {
    setFiltros({
      revenda: [],
      cliente: [],
      registro: [],
      bid: [],
      validadeBid: '',
      validadeProposta: '',
      precoMin: '',
      precoMax: '',
      margemMin: '',
      margemMax: '',
      classificacao: [],
      observacoes: '',
      estagioVenda: [],
    });
    setOportunidadesFiltradas(oportunidades);
  };

  const temFiltrosAtivos = () => {
    return Object.values(filtros).some(value =>
      Array.isArray(value) ? value.length > 0 : Boolean(value)
    );
  };

  const MultiSelectDropdown = ({ 
    name, 
    value, 
    options, 
    searchText, 
    onSearchChange, 
    isOpen, 
    onToggle, 
    onChange 
  }: { 
    name: string;
    value: string[];
    options: string[];
    searchText: string;
    onSearchChange: (text: string) => void;
    isOpen: boolean;
    onToggle: () => void;
    onChange: (values: string[]) => void;
  }) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && searchText) {
        e.preventDefault();
        if (!value.includes(searchText)) {
          onChange([...value, searchText]);
        }
        onSearchChange('');
      }
    };

    return (
      <div className="relative">
        <div className="flex flex-wrap gap-2 p-2 border rounded-md">
          {value.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="text-blue-600 hover:text-blue-800"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <input
            type="text"
            value={searchText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={onToggle}
            placeholder="Digite para buscar..."
            className="flex-1 min-w-[120px] outline-none"
          />
        </div>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {options
              .filter(option => !value.includes(option))
              .filter(option => option.toLowerCase().includes(searchText.toLowerCase()))
              .map((option, index) => (
                <div
                  key={index}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    onChange([...value, option]);
                    onSearchChange('');
                  }}
                >
                  {option}
                </div>
              ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-6">
        {/* Filtros */}
        <Card>
        <CardHeader>
            <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Revenda */}
              <div className="space-y-2">
                <Label>Revenda</Label>
                <MultiSelectDropdown
                  name="revenda"
                  value={filtros.revenda}
                  options={getRevendasUnicas()}
                  searchText={textoBuscaRevenda}
                  onSearchChange={setTextoBuscaRevenda}
                  isOpen={dropdownRevendaAberto}
                  onToggle={() => setDropdownRevendaAberto(!dropdownRevendaAberto)}
                  onChange={(values) => setFiltros(prev => ({ ...prev, revenda: values }))}
                />
              </div>

              {/* Cliente */}
              <div className="space-y-2">
                <Label>Cliente</Label>
                <MultiSelectDropdown
                  name="cliente"
                  value={filtros.cliente}
                  options={getClientesUnicos()}
                  searchText={textoBuscaCliente}
                  onSearchChange={setTextoBuscaCliente}
                  isOpen={dropdownClienteAberto}
                  onToggle={() => setDropdownClienteAberto(!dropdownClienteAberto)}
                  onChange={(values) => setFiltros(prev => ({ ...prev, cliente: values }))}
                />
              </div>

              {/* Registro */}
              <div className="space-y-2">
                <Label>Registro</Label>
                <MultiSelectDropdown
                  name="registro"
                  value={filtros.registro}
                  options={getRegistrosUnicos()}
                  searchText={textoBuscaRegistro}
                  onSearchChange={setTextoBuscaRegistro}
                  isOpen={dropdownRegistroAberto}
                  onToggle={() => setDropdownRegistroAberto(!dropdownRegistroAberto)}
                  onChange={(values) => setFiltros(prev => ({ ...prev, registro: values }))}
                />
              </div>

              {/* BID */}
              <div className="space-y-2">
                <Label>BID</Label>
                <MultiSelectDropdown
                  name="bid"
                  value={filtros.bid}
                  options={getBidsUnicos()}
                  searchText={textoBuscaBid}
                  onSearchChange={setTextoBuscaBid}
                  isOpen={dropdownBidAberto}
                  onToggle={() => setDropdownBidAberto(!dropdownBidAberto)}
                  onChange={(values) => setFiltros(prev => ({ ...prev, bid: values }))}
                />
              </div>

              {/* Validade BID */}
              <div className="space-y-2">
                <Label>Validade BID</Label>
                <Input
                  type="date"
                  name="validadeBid"
                  value={filtros.validadeBid}
                  onChange={handleFiltro}
                />
              </div>

              {/* Validade Proposta */}
              <div className="space-y-2">
                <Label>Validade Proposta</Label>
                <Input
                  type="date"
                  name="validadeProposta"
                  value={filtros.validadeProposta}
                  onChange={handleFiltro}
                />
              </div>

              {/* Preço Mínimo */}
              <div className="space-y-2">
                <Label>Preço Mínimo</Label>
                <Input
                  type="number"
                  name="precoMin"
                  value={filtros.precoMin}
                  onChange={handleFiltro}
                  placeholder="R$ 0,00"
                />
              </div>

              {/* Preço Máximo */}
              <div className="space-y-2">
                <Label>Preço Máximo</Label>
                <Input
                  type="number"
                  name="precoMax"
                  value={filtros.precoMax}
                  onChange={handleFiltro}
                  placeholder="R$ 0,00"
                />
              </div>

              {/* Margem Mínima */}
              <div className="space-y-2">
                <Label>Margem Mínima</Label>
                <Input
                  type="number"
                  name="margemMin"
                  value={filtros.margemMin}
                  onChange={handleFiltro}
                  placeholder="0%"
                />
              </div>

              {/* Margem Máxima */}
              <div className="space-y-2">
                <Label>Margem Máxima</Label>
                <Input
                  type="number"
                  name="margemMax"
                  value={filtros.margemMax}
                  onChange={handleFiltro}
                  placeholder="100%"
                />
              </div>

              {/* Classificação */}
              <div className="space-y-2">
                <Label>Classificação</Label>
                <MultiSelectDropdown
                  name="classificacao"
                  value={filtros.classificacao}
                  options={CLASSIFICACOES.map(c => c.label)}
                  searchText={textoBuscaClassificacao}
                  onSearchChange={setTextoBuscaClassificacao}
                  isOpen={dropdownClassificacaoAberto}
                  onToggle={() => setDropdownClassificacaoAberto(!dropdownClassificacaoAberto)}
                  onChange={(values) => setFiltros(prev => ({ ...prev, classificacao: values }))}
                />
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label>Observações</Label>
                <Input
                  type="text"
                  name="observacoes"
                  value={filtros.observacoes}
                  onChange={handleFiltro}
                  placeholder="Digite para buscar nas observações"
                />
              </div>

              {/* Estágio da Venda */}
              <div className="space-y-2">
                <Label>Estágio da Venda</Label>
                <MultiSelectDropdown
                  name="estagioVenda"
                  value={filtros.estagioVenda}
                  options={ESTAGIOS_VENDA.map(e => e.label)}
                  searchText={estagioVendaTextoBusca}
                  onSearchChange={setEstagioVendaTextoBusca}
                  isOpen={estagioVendaDropdownAberto}
                  onToggle={() => setEstagioVendaDropdownAberto(!estagioVendaDropdownAberto)}
                  onChange={(values) => setFiltros(prev => ({ ...prev, estagioVenda: values }))}
                />
              </div>
          </div>

            <div className="flex justify-end gap-2 mt-4">
          <Button 
                variant="outline"
            onClick={limparFiltros} 
                disabled={!temFiltrosAtivos()}
          >
            Limpar Filtros
          </Button>
              <Button onClick={() => aplicarFiltros(filtros)}>
                Aplicar Filtros
              </Button>
            </div>
        </CardContent>
      </Card>

        {/* Tabela de Resultados */}
        <Card>
        <CardHeader>
            <CardTitle>Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Revenda</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>BID</TableHead>
                  <TableHead>Validade BID</TableHead>
                  <TableHead>Validade Proposta</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Margem</TableHead>
                  <TableHead>Classificação</TableHead>
                    <TableHead>Estágio</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {oportunidadesFiltradas.map((oportunidade, index) => (
                    <TableRow key={index}>
                      <TableCell>{oportunidade.revenda}</TableCell>
                      <TableCell>{oportunidade.registro}</TableCell>
                      <TableCell>{oportunidade.cliente}</TableCell>
                      <TableCell>{oportunidade.bid}</TableCell>
                      <TableCell>{oportunidade.validadeBid}</TableCell>
                      <TableCell>{oportunidade.validadeProposta}</TableCell>
                      <TableCell>
                        {Number(oportunidade.preco).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        })}
                      </TableCell>
                      <TableCell>{oportunidade.margem}%</TableCell>
                      <TableCell>
                        {CLASSIFICACOES.find(c => c.value === oportunidade.classificacao)?.label}
                      </TableCell>
                      <TableCell>
                        {ESTAGIOS_VENDA.find(e => e.value === oportunidade.estagioVenda)?.label}
                      </TableCell>
                      <TableCell>{oportunidade.observacoes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FiltrosGraficos; 