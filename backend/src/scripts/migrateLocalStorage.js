const sql = require('mssql/msnodesqlv8');
const fs = require('fs');
const path = require('path');

const config = {
    connectionString: 'Driver={SQL Server};Server=localhost;Database=ControleLenovo;Trusted_Connection=yes;'
};

async function migrateData() {
    try {
        // Conectar ao SQL Server
        console.log('Conectando ao SQL Server...');
        await sql.connect(config);
        console.log('Conexão estabelecida com sucesso!');

        // Ler o arquivo de dados do localStorage
        const localStorageData = JSON.parse(fs.readFileSync(
            path.join(__dirname, '../../../frontend/src/data/localStorage.json'),
            'utf8'
        ));

        // Migrar Regionais
        console.log('Migrando Regionais...');
        for (const regional of localStorageData.regionais || []) {
            await sql.query`
                INSERT INTO Regionais (nome, codigo)
                VALUES (${regional.nome}, ${regional.codigo})
            `;
        }

        // Migrar Oportunidades
        console.log('Migrando Oportunidades...');
        for (const oportunidade of localStorageData.oportunidades || []) {
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
        }

        // Migrar Quotas
        console.log('Migrando Quotas...');
        for (const quota of localStorageData.quotas || []) {
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
        }

        // Migrar Histórico de Oportunidades
        console.log('Migrando Histórico de Oportunidades...');
        for (const historico of localStorageData.historicoOportunidades || []) {
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
migrateData().catch(err => {
    console.error('Erro fatal:', err);
    process.exit(1);
}); 