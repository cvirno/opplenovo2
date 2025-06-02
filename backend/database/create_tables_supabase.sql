-- Tabela de Regionais
CREATE TABLE regionais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    codigo VARCHAR(30) NOT NULL UNIQUE
);

-- Tabela de Oportunidades
CREATE TABLE oportunidades (
    id VARCHAR(50) PRIMARY KEY,
    revenda VARCHAR(100) NOT NULL,
    registro VARCHAR(50) NOT NULL,
    cliente VARCHAR(100) NOT NULL,
    bid VARCHAR(50),
    validade_bid VARCHAR(10),
    validade_proposta VARCHAR(10),
    preco DECIMAL(18,2) NOT NULL,
    margem DECIMAL(5,2) NOT NULL,
    classificacao VARCHAR(50) NOT NULL,
    observacoes TEXT,
    estagio_venda VARCHAR(50) NOT NULL,
    trimestre VARCHAR(2) NOT NULL,
    data_won VARCHAR(10),
    data_faturamento VARCHAR(10),
    regional_id INTEGER NOT NULL REFERENCES regionais(id),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Quotas
CREATE TABLE quotas (
    id SERIAL PRIMARY KEY,
    regional_id INTEGER NOT NULL REFERENCES regionais(id),
    trimestre VARCHAR(2) NOT NULL,
    ano INTEGER NOT NULL,
    valor DECIMAL(18,2) NOT NULL,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (regional_id, trimestre, ano)
);

-- Tabela de Histórico de Oportunidades
CREATE TABLE historico_oportunidades (
    id SERIAL PRIMARY KEY,
    oportunidade_id VARCHAR(50) NOT NULL REFERENCES oportunidades(id),
    estagio_venda VARCHAR(50) NOT NULL,
    data_alteracao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para armazenar a quota total anual
CREATE TABLE quota_total (
    id SERIAL PRIMARY KEY,
    ano INTEGER NOT NULL,
    valor DECIMAL(18,2) NOT NULL,
    data_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir valor inicial na QuotaTotal
INSERT INTO quota_total (ano, valor) VALUES (EXTRACT(YEAR FROM CURRENT_DATE), 0);

-- Inserir dados iniciais nas Regionais
INSERT INTO regionais (nome, codigo) VALUES
('SUL', 'sul'),
('BRASÍLIA + CENTRO OESTE', 'brasilia_centro_oeste'),
('SUDESTE', 'sudeste'),
('NORTE + NORDESTE', 'norte_nordeste');

-- Inserir oportunidade inicial
INSERT INTO oportunidades (
    id,
    revenda,
    registro,
    cliente,
    bid,
    validade_bid,
    validade_proposta,
    preco,
    margem,
    classificacao,
    observacoes,
    estagio_venda,
    trimestre,
    regional_id
) VALUES (
    '1',
    'Revenda Exemplo',
    'REG001',
    'Cliente Exemplo',
    'BID001',
    '2024-12-31',
    '2024-12-31',
    100000.00,
    20.00,
    'proposta_valida',
    'Observação inicial',
    'proposal',
    'Q1',
    3  -- ID da regional SUDESTE
);

-- Criar índices para melhor performance
CREATE INDEX idx_oportunidades_estagio_venda ON oportunidades(estagio_venda);
CREATE INDEX idx_oportunidades_trimestre ON oportunidades(trimestre);
CREATE INDEX idx_oportunidades_regional ON oportunidades(regional_id); 