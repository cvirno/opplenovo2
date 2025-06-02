-- Dropar o banco de dados se existir
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'ControleLenovo')
BEGIN
    ALTER DATABASE ControleLenovo SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE ControleLenovo;
END
GO

-- Criar o banco de dados
CREATE DATABASE ControleLenovo;
GO

USE ControleLenovo;
GO

-- Tabela de Regionais
CREATE TABLE IF NOT EXISTS regionais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(50) NOT NULL,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
GO

-- Tabela de Oportunidades
CREATE TABLE IF NOT EXISTS oportunidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    revenda VARCHAR(100) NOT NULL,
    registro VARCHAR(50) NOT NULL,
    cliente VARCHAR(100) NOT NULL,
    bid VARCHAR(50),
    validade_bid DATE,
    validade_proposta DATE,
    preco DECIMAL(18,2) NOT NULL,
    margem DECIMAL(5,2) NOT NULL,
    classificacao VARCHAR(50) NOT NULL,
    observacoes TEXT,
    estagio_venda VARCHAR(50) NOT NULL,
    trimestre VARCHAR(2) NOT NULL,
    data_won DATE,
    data_faturamento DATE,
    regional_id UUID NOT NULL REFERENCES regionais(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
GO

-- Tabela de Quotas
CREATE TABLE IF NOT EXISTS quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    regional_id UUID NOT NULL REFERENCES regionais(id),
    trimestre VARCHAR(2) NOT NULL,
    ano INTEGER NOT NULL,
    valor DECIMAL(18,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (regional_id, trimestre, ano)
);
GO

-- Tabela de Histórico de Oportunidades
CREATE TABLE IF NOT EXISTS historico_oportunidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oportunidade_id UUID NOT NULL REFERENCES oportunidades(id),
    estagio_venda VARCHAR(50) NOT NULL,
    data_alteracao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
GO

-- Tabela para armazenar a quota total anual
CREATE TABLE IF NOT EXISTS quota_total (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ano INTEGER NOT NULL,
    valor DECIMAL(18,2) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
GO

-- Inserir valor inicial na QuotaTotal
INSERT INTO quota_total (ano, valor)
SELECT EXTRACT(YEAR FROM CURRENT_DATE), 0
WHERE NOT EXISTS (SELECT 1 FROM quota_total WHERE ano = EXTRACT(YEAR FROM CURRENT_DATE));
GO

-- Inserir dados iniciais nas Regionais
INSERT INTO regionais (nome, codigo)
VALUES
    ('SUL', 'sul'),
    ('BRASÍLIA + CENTRO OESTE', 'brasilia_centro_oeste'),
    ('SUDESTE', 'sudeste'),
    ('NORTE + NORDESTE', 'norte_nordeste')
ON CONFLICT (codigo) DO NOTHING;
GO

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
GO

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_oportunidades_estagio_venda ON oportunidades(estagio_venda);
GO

CREATE INDEX IF NOT EXISTS idx_oportunidades_trimestre ON oportunidades(trimestre);
GO

CREATE INDEX IF NOT EXISTS idx_oportunidades_regional ON oportunidades(regional_id);
GO

-- Criar função para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar o updated_at
CREATE TRIGGER update_regionais_updated_at
    BEFORE UPDATE ON regionais
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oportunidades_updated_at
    BEFORE UPDATE ON oportunidades
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotas_updated_at
    BEFORE UPDATE ON quotas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quota_total_updated_at
    BEFORE UPDATE ON quota_total
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 