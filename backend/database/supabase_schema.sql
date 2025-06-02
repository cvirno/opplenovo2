-- Habilitar a extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Regionais
CREATE TABLE regionais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(50) NOT NULL,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Oportunidades
CREATE TABLE oportunidades (
    id VARCHAR(50) PRIMARY KEY,
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
    regional_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (regional_id) REFERENCES regionais(id)
);

-- Tabela de Quotas
CREATE TABLE quotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    regional_id UUID NOT NULL,
    trimestre VARCHAR(2) NOT NULL,
    ano INT NOT NULL,
    valor DECIMAL(18,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (regional_id) REFERENCES regionais(id),
    UNIQUE (regional_id, trimestre, ano)
);

-- Tabela de Histórico de Oportunidades
CREATE TABLE historico_oportunidades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oportunidade_id VARCHAR(50) NOT NULL,
    estagio_venda VARCHAR(50) NOT NULL,
    data_alteracao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (oportunidade_id) REFERENCES oportunidades(id)
);

-- Tabela para armazenar a quota total anual
CREATE TABLE quota_total (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ano INT NOT NULL,
    valor DECIMAL(18,2) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir valor inicial na QuotaTotal
INSERT INTO quota_total (ano, valor) VALUES (EXTRACT(YEAR FROM CURRENT_DATE), 0);

-- Inserir dados iniciais nas Regionais
INSERT INTO regionais (nome, codigo) VALUES
('SUL', 'sul'),
('BRASÍLIA + CENTRO OESTE', 'brasilia_centro_oeste'),
('SUDESTE', 'sudeste'),
('NORTE + NORDESTE', 'norte_nordeste');

-- Criar índices para melhor performance
CREATE INDEX idx_oportunidades_estagio_venda ON oportunidades(estagio_venda);
CREATE INDEX idx_oportunidades_trimestre ON oportunidades(trimestre);
CREATE INDEX idx_oportunidades_regional ON oportunidades(regional_id);

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar o updated_at
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