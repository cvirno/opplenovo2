const sql = require('mssql/msnodesqlv8');
const fs = require('fs');
const path = require('path');

const config = {
    connectionString: 'Driver={SQL Server};Server=localhost;Database=master;Trusted_Connection=yes;'
};

async function createDatabase() {
    try {
        // Conectar ao SQL Server
        console.log('Conectando ao SQL Server...');
        console.log('Tentando conectar usando autenticação do Windows...');
        
        await sql.connect(config);
        console.log('Conexão estabelecida com sucesso!');

        // Ler o arquivo SQL
        const sqlScript = fs.readFileSync(
            path.join(__dirname, '../../database/create_tables.sql'),
            'utf8'
        );

        // Dividir o script em comandos individuais
        const commands = sqlScript
            .split('GO')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0);

        // Executar cada comando
        for (const command of commands) {
            try {
                await sql.query(command);
                console.log('Comando executado com sucesso:', command.substring(0, 50) + '...');
            } catch (err) {
                console.error('Erro ao executar comando:', command.substring(0, 50) + '...');
                console.error('Erro:', err.message);
            }
        }

        console.log('Script de criação do banco de dados executado com sucesso!');

    } catch (err) {
        console.error('Erro ao executar script:', err);
    } finally {
        // Fechar a conexão
        await sql.close();
        console.log('Conexão fechada.');
    }
}

// Executar a função
createDatabase().catch(err => {
    console.error('Erro fatal:', err);
    process.exit(1);
}); 