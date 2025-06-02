require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./config/supabase');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // URLs do frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Log de todas as requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Body:', req.body);
    next();
});

// Rota raiz
app.get('/', (req, res) => {
    res.json({ message: 'API do Controle Lenovo está funcionando!' });
});

// Rotas GET
app.get('/api/regionais', async (req, res) => {
    try {
        console.log('Buscando regionais...');
        const { data, error } = await supabase
            .from('regionais')
            .select('*');
        
        if (error) {
            console.error('Erro ao buscar regionais:', error);
            throw error;
        }
        console.log('Regionais encontradas:', data);
        res.json(data);
    } catch (err) {
        console.error('Erro ao buscar regionais:', err);
        res.status(500).json({ error: 'Erro ao buscar regionais' });
    }
});

app.get('/api/oportunidades', async (req, res) => {
    try {
        console.log('Buscando oportunidades...');
        console.log('Conexão Supabase:', {
            url: process.env.SUPABASE_URL,
            key: process.env.SUPABASE_ANON_KEY ? 'Chave presente' : 'Chave ausente'
        });
        
        const { data, error } = await supabase
            .from('oportunidades')
            .select(`
                *,
                regionais (
                    nome
                )
            `);
        
        if (error) {
            console.error('Erro ao buscar oportunidades:', error);
            console.error('Detalhes do erro:', {
                code: error.code,
                message: error.message,
                details: error.details,
                hint: error.hint
            });
            throw error;
        }
        console.log('Oportunidades encontradas:', data);
        res.json(data || []);
    } catch (err) {
        console.error('Erro ao buscar oportunidades:', err);
        res.status(500).json({ error: 'Erro ao buscar oportunidades' });
    }
});

app.get('/api/quotas', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('quotas')
            .select('*');
        
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Erro ao buscar quotas:', err);
        res.status(500).json({ error: 'Erro ao buscar quotas' });
    }
});

app.get('/api/historico', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('historico_oportunidades')
            .select('*');
        
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Erro ao buscar histórico:', err);
        res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
});

// Rota para buscar a quota total do ano atual
app.get('/api/quota-total', async (req, res) => {
    try {
        const anoAtual = new Date().getFullYear();
        const { data, error } = await supabase
            .from('quota_total')
            .select('valor')
            .eq('ano', anoAtual)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                // Se não existir, cria com valor 0
                const { data: newData, error: insertError } = await supabase
                    .from('quota_total')
                    .insert([{ ano: anoAtual, valor: 0 }])
                    .select()
                    .single();
                
                if (insertError) throw insertError;
                return res.json({ valor: 0 });
            }
            throw error;
        }
        
        res.json({ valor: data.valor });
    } catch (err) {
        console.error('Erro ao buscar quota total:', err);
        res.status(500).json({ error: 'Erro ao buscar quota total' });
    }
});

// Rotas POST
app.post('/api/regionais', async (req, res) => {
    try {
        const { nome, codigo } = req.body;
        const { error } = await supabase
            .from('regionais')
            .insert([{ nome, codigo }]);
        
        if (error) throw error;
        res.json({ message: 'Regional criada com sucesso!' });
    } catch (err) {
        console.error('Erro ao criar regional:', err);
        res.status(500).json({ error: 'Erro ao criar regional' });
    }
});

app.post('/api/oportunidades', async (req, res) => {
    try {
        console.log('Recebendo requisição para criar oportunidade:', req.body);
        
        const {
            revenda,
            registro,
            cliente,
            bid,
            validadeBid,
            validadeProposta,
            preco,
            margem,
            classificacao,
            observacoes,
            estagioVenda,
            trimestre,
            dataWon,
            dataFaturamento,
            regional_id
        } = req.body;

        console.log('Dados recebidos:', {
            revenda,
            registro,
            cliente,
            bid,
            validadeBid,
            validadeProposta,
            preco,
            margem,
            classificacao,
            observacoes,
            estagioVenda,
            trimestre,
            dataWon,
            dataFaturamento,
            regional_id
        });

        // Validação dos campos obrigatórios
        if (!cliente || !regional_id || !preco || !margem || !estagioVenda) {
            console.log('Campos obrigatórios faltando:', { cliente, regional_id, preco, margem, estagioVenda });
            return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
        }

        // Converte e valida os valores numéricos
        let precoNumerico, margemNumerica;
        try {
            // Remove caracteres não numéricos exceto ponto e vírgula
            const precoLimpo = String(preco).replace(/[^\d,.]/g, '').replace(',', '.');
            const margemLimpa = String(margem).replace(/[^\d,.]/g, '').replace(',', '.');
            
            precoNumerico = parseFloat(precoLimpo);
            margemNumerica = parseFloat(margemLimpa);
            
            console.log('Valores convertidos:', { precoNumerico, margemNumerica });
        } catch (error) {
            console.error('Erro ao converter valores:', error);
            return res.status(400).json({ error: 'Valores numéricos inválidos' });
        }

        if (isNaN(precoNumerico) || isNaN(margemNumerica)) {
            console.log('Valores inválidos após conversão:', { precoNumerico, margemNumerica });
            return res.status(400).json({ error: 'Valores numéricos inválidos' });
        }

        // Validação dos valores
        if (precoNumerico <= 0 || margemNumerica <= 0) {
            console.log('Valores não positivos:', { precoNumerico, margemNumerica });
            return res.status(400).json({ error: 'Preço e margem devem ser maiores que zero' });
        }

        // Validar regional_id
        console.log('Validando regional_id:', regional_id);
        const { data: regionais, error: errorRegionais } = await supabase
            .from('regionais')
            .select('id')
            .eq('id', regional_id);

        if (errorRegionais) {
            console.error('Erro ao validar regional:', errorRegionais);
            return res.status(400).json({ error: 'Regional inválida' });
        }

        if (!regionais || regionais.length === 0) {
            console.error('Regional não encontrada:', regional_id);
            return res.status(400).json({ error: 'Regional não encontrada' });
        }

        console.log('Regional encontrada:', regionais[0]);

        const novaOportunidade = {
            revenda: revenda || '',
            registro: registro || '',
            cliente,
            bid: bid || '',
            validade_bid: validadeBid || null,
            validade_proposta: validadeProposta || null,
            preco: precoNumerico,
            margem: margemNumerica,
            classificacao: classificacao || '',
            observacoes: observacoes || '',
            estagio_venda: estagioVenda,
            trimestre: trimestre || '',
            data_won: dataWon || null,
            data_faturamento: dataFaturamento || null,
            regional_id: regionais[0].id
        };

        console.log('Tentando inserir oportunidade:', novaOportunidade);

        const { data, error } = await supabase
            .from('oportunidades')
            .insert([novaOportunidade])
            .select();

        if (error) {
            console.error('Erro ao inserir no Supabase:', error);
            return res.status(500).json({ 
                error: 'Erro ao criar oportunidade',
                details: error.message,
                code: error.code,
                hint: error.hint
            });
        }

        console.log('Oportunidade criada com sucesso:', data);
        res.json(data[0]);
    } catch (err) {
        console.error('Erro ao criar oportunidade:', err);
        res.status(500).json({ 
            error: 'Erro ao criar oportunidade',
            details: err.message,
            code: err.code,
            hint: err.hint
        });
    }
});

app.post('/api/quotas', async (req, res) => {
    try {
        const { regional_id, trimestre, ano, valor } = req.body;
        const { error } = await supabase
            .from('quotas')
            .insert([{ regional_id, trimestre, ano, valor }]);
        
        if (error) throw error;
        res.json({ message: 'Quota criada com sucesso!' });
    } catch (err) {
        console.error('Erro ao criar quota:', err);
        res.status(500).json({ error: 'Erro ao criar quota' });
    }
});

app.post('/api/historico', async (req, res) => {
    try {
        const { oportunidade_id, estagioVenda } = req.body;
        const { error } = await supabase
            .from('historico_oportunidades')
            .insert([{
                oportunidade_id,
                estagio_venda: estagioVenda
            }]);
        
        if (error) throw error;
        res.json({ message: 'Histórico criado com sucesso!' });
    } catch (err) {
        console.error('Erro ao criar histórico:', err);
        res.status(500).json({ error: 'Erro ao criar histórico' });
    }
});

// Rota PUT para atualizar oportunidades
app.put('/api/oportunidades/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Atualizando oportunidade:', { id, body: req.body });

        // Primeiro, buscar a oportunidade existente
        const { data: oportunidadeExistente, error: errorBusca } = await supabase
            .from('oportunidades')
            .select('*')
            .eq('id', id)
            .single();

        if (errorBusca) {
            console.error('Erro ao buscar oportunidade:', errorBusca);
            return res.status(404).json({ error: 'Oportunidade não encontrada' });
        }

        const {
            cliente,
            regional_id,
            preco,
            margem,
            estagioVenda,
            revenda,
            registro,
            bid,
            validadeBid,
            validadeProposta,
            classificacao,
            observacoes,
            trimestre,
            dataFaturamento,
            dataWon
        } = req.body;

        // Converte e valida os valores numéricos
        let precoNumerico = preco;
        let margemNumerica = margem;

        if (preco !== undefined) {
            try {
                precoNumerico = parseFloat(String(preco).replace(/[^\d,.]/g, '').replace(',', '.'));
            } catch (error) {
                return res.status(400).json({ error: 'Valor de preço inválido' });
            }
        }

        if (margem !== undefined) {
            try {
                margemNumerica = parseFloat(String(margem).replace(/[^\d,.]/g, '').replace(',', '.'));
            } catch (error) {
                return res.status(400).json({ error: 'Valor de margem inválido' });
            }
        }

        // Manter valores existentes se não forem fornecidos novos valores
        const dadosAtualizados = {
            revenda: revenda !== undefined ? revenda : oportunidadeExistente.revenda,
            registro: registro !== undefined ? registro : oportunidadeExistente.registro,
            cliente: cliente !== undefined ? cliente : oportunidadeExistente.cliente,
            bid: bid !== undefined ? bid : oportunidadeExistente.bid,
            validade_bid: validadeBid !== undefined ? (validadeBid === '' ? null : validadeBid) : oportunidadeExistente.validade_bid,
            validade_proposta: validadeProposta !== undefined ? (validadeProposta === '' ? null : validadeProposta) : oportunidadeExistente.validade_proposta,
            preco: preco !== undefined ? precoNumerico : oportunidadeExistente.preco,
            margem: margem !== undefined ? margemNumerica : oportunidadeExistente.margem,
            classificacao: classificacao !== undefined ? classificacao : oportunidadeExistente.classificacao,
            observacoes: observacoes !== undefined ? observacoes : oportunidadeExistente.observacoes,
            estagio_venda: estagioVenda !== undefined ? estagioVenda : oportunidadeExistente.estagio_venda,
            trimestre: trimestre !== undefined ? trimestre : oportunidadeExistente.trimestre,
            data_won: dataWon !== undefined ? (dataWon === '' ? null : dataWon) : oportunidadeExistente.data_won,
            data_faturamento: dataFaturamento !== undefined ? (dataFaturamento === '' ? null : dataFaturamento) : oportunidadeExistente.data_faturamento,
            regional_id: regional_id !== undefined ? regional_id : oportunidadeExistente.regional_id
        };

        console.log('Dados atualizados:', dadosAtualizados);

        const { error } = await supabase
            .from('oportunidades')
            .update(dadosAtualizados)
            .eq('id', id);

        if (error) {
            console.error('Erro ao atualizar oportunidade:', error);
            return res.status(500).json({ 
                error: 'Erro ao atualizar oportunidade',
                details: error.message,
                code: error.code,
                hint: error.hint
            });
        }

        console.log('Oportunidade atualizada com sucesso!');
        res.json({ message: 'Oportunidade atualizada com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar oportunidade:', error);
        res.status(500).json({ 
            error: 'Erro ao atualizar oportunidade',
            details: error.message,
            code: error.code,
            hint: error.hint
        });
    }
});

// Rota DELETE para excluir oportunidades
app.delete('/api/oportunidades/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Tentando excluir oportunidade:', id);

        const { error } = await supabase
            .from('oportunidades')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir oportunidade:', error);
            return res.status(500).json({ 
                error: 'Erro ao excluir oportunidade',
                details: error.message,
                code: error.code,
                hint: error.hint
            });
        }

        console.log('Oportunidade excluída com sucesso!');
        res.json({ message: 'Oportunidade excluída com sucesso!' });
    } catch (err) {
        console.error('Erro ao excluir oportunidade:', err);
        res.status(500).json({ 
            error: 'Erro ao excluir oportunidade',
            details: err.message,
            code: err.code,
            hint: err.hint
        });
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
}); 