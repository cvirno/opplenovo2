const sql = require('mssql/msnodesqlv8');
const fs = require('fs');
const path = require('path');

const config = {
    connectionString: 'Driver={SQL Server};Server=localhost;Database=ControleLenovo;Trusted_Connection=yes;'
};

async function exportAndMigrate() {
    try {
        // Conectar ao SQL Server
        console.log('Conectando ao SQL Server...');
        await sql.connect(config);
        console.log('Conexão estabelecida com sucesso!');

        // Ler os dados do localStorage diretamente do arquivo
        const localStoragePath = path.join(__dirname, '../../../frontend/src/data/localStorage.json');
        let localStorageData;

        try {
            localStorageData = JSON.parse(fs.readFileSync(localStoragePath, 'utf8'));
        } catch (err) {
            console.error('Erro ao ler arquivo localStorage.json:', err);
            console.log('Tentando ler dados do localStorage diretamente...');
            
            // Se não encontrar o arquivo, tenta ler do localStorage
            const localStorageContent = fs.readFileSync(
                path.join(__dirname, '../../../frontend/src/data/localStorage.json'),
                'utf8'
            );
            localStorageData = JSON.parse(localStorageContent);
        }

        // Migrar Regionais
        console.log('Migrando Regionais...');
        for (const regional of localStorageData.regionais || []) {
            try {
                await sql.query`
                    INSERT INTO Regionais (nome, codigo)
                    VALUES (${regional.nome}, ${regional.codigo})
                `;
                console.log(`Regional migrada: ${regional.nome}`);
            } catch (err) {
                if (err.number === 2627) { // Erro de chave duplicada
                    console.log(`Regional já existe: ${regional.nome}`);
                } else {
                    console.error(`Erro ao migrar regional ${regional.nome}:`, err);
                }
            }
        }

        // Migrar Oportunidades
        console.log('Migrando Oportunidades...');
        for (const oportunidade of localStorageData.oportunidades || []) {
            try {
                await sql.query`
                    INSERT INTO Oportunidades (
                        id, revenda, registro, cliente, bid, validadeBid,
                        validadeProposta, preco, margem, classificacao,
                        observacoes, estagioVenda, trimestre, dataWon,
                        dataFaturamento, regional_id
                    )
                    VALUES (
                        ${oportunidade.id},
                        ${oportunidade.revenda},
                        ${oportunidade.registro},
                        ${oportunidade.cliente},
                        ${oportunidade.bid},
                        ${oportunidade.validadeBid},
                        ${oportunidade.validadeProposta},
                        ${oportunidade.preco},
                        ${oportunidade.margem},
                        ${oportunidade.classificacao},
                        ${oportunidade.observacoes},
                        ${oportunidade.estagioVenda},
                        ${oportunidade.trimestre},
                        ${oportunidade.dataWon},
                        ${oportunidade.dataFaturamento},
                        ${oportunidade.regional_id}
                    )
                `;
                console.log(`Oportunidade migrada: ${oportunidade.id}`);
            } catch (err) {
                if (err.number === 2627) { // Erro de chave duplicada
                    console.log(`Oportunidade já existe: ${oportunidade.id}`);
                } else {
                    console.error(`Erro ao migrar oportunidade ${oportunidade.id}:`, err);
                }
            }
        }

        // Migrar Quotas
        console.log('Migrando Quotas...');
        for (const quota of localStorageData.quotas || []) {
            try {
                await sql.query`
                    INSERT INTO Quotas (
                        regional_id, trimestre, ano, valor
                    )
                    VALUES (
                        ${quota.regional_id},
                        ${quota.trimestre},
                        ${quota.ano},
                        ${quota.valor}
                    )
                `;
                console.log(`Quota migrada: Regional ${quota.regional_id}, Trimestre ${quota.trimestre}`);
            } catch (err) {
                if (err.number === 2627) { // Erro de chave duplicada
                    console.log(`Quota já existe: Regional ${quota.regional_id}, Trimestre ${quota.trimestre}`);
                } else {
                    console.error(`Erro ao migrar quota:`, err);
                }
            }
        }

        // Migrar Histórico de Oportunidades
        console.log('Migrando Histórico de Oportunidades...');
        for (const historico of localStorageData.historicoOportunidades || []) {
            try {
                await sql.query`
                    INSERT INTO HistoricoOportunidades (
                        oportunidade_id, estagioVenda, dataAlteracao
                    )
                    VALUES (
                        ${historico.oportunidade_id},
                        ${historico.estagioVenda},
                        ${historico.dataAlteracao}
                    )
                `;
                console.log(`Histórico migrado: Oportunidade ${historico.oportunidade_id}`);
            } catch (err) {
                console.error(`Erro ao migrar histórico:`, err);
            }
        }

        console.log('Migração concluída com sucesso!');

    } catch (err) {
        console.error('Erro durante a migração:', err);
    } finally {
        await sql.close();
        console.log('Conexão fechada.');
    }
}

// Executar a migração
exportAndMigrate().catch(err => {
    console.error('Erro fatal:', err);
    process.exit(1);
}); 