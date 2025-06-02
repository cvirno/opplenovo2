const { createClient } = require('@supabase/supabase-js');

// Estas variáveis devem ser configuradas no arquivo .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('URL do Supabase:', supabaseUrl);
console.log('Chave do Supabase:', supabaseKey ? 'Chave presente' : 'Chave ausente');

if (!supabaseUrl || !supabaseKey) {
    console.error('Erro: SUPABASE_URL e SUPABASE_ANON_KEY devem ser configurados no arquivo .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Teste de conexão mais detalhado
supabase.from('regionais').select('*').then(
    ({ data, error }) => {
        if (error) {
            console.error('Erro ao conectar com Supabase:', error);
            console.error('Detalhes do erro:', {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
            });
        } else {
            console.log('Conexão com Supabase estabelecida com sucesso!');
            console.log('Dados recebidos:', data);
        }
    }
).catch(err => {
    console.error('Erro inesperado ao testar conexão:', err);
});

module.exports = supabase; 