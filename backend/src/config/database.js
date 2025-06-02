const sql = require('mssql/msnodesqlv8');

const config = {
    server: 'localhost\\SQLEXPRESS',
    database: 'ControleLenovo',
    options: {
        trustServerCertificate: true,
        trustedConnection: true,
        enableArithAbort: true
    }
};

async function initializeDatabase() {
    try {
        await sql.connect(config);
        console.log('Conectado ao banco de dados');

        // Criar tabela QuotaTotal se não existir
        await sql.query`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'QuotaTotal')
            BEGIN
                CREATE TABLE QuotaTotal (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    ano INT NOT NULL,
                    valor DECIMAL(18,2) NOT NULL,
                    dataAtualizacao DATETIME DEFAULT GETDATE()
                )
            END
        `;

        return sql;
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        throw err;
    }
}

module.exports = { sql, config, initializeDatabase }; 