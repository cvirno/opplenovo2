require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./config/supabase');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

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

// Endpoint para obter a quota total
app.get('/api/quota-total', async (req, res) => {
  try {
    const ano = new Date().getFullYear();
    
    const { data, error } = await supabase
      .from('quota_total')
      .select('*')
      .eq('ano', ano)
      .limit(1);

    if (error) throw error;

    if (!data || data.length === 0) {
      // Se não existir, cria um registro com valor 0
      const { data: newData, error: insertError } = await supabase
        .from('quota_total')
        .insert([{ ano, valor: 0 }])
        .select()
        .single();

      if (insertError) throw insertError;
      return res.json(newData);
    }

    res.json(data[0]);
  } catch (error) {
    console.error('Erro ao buscar quota total:', error);
    res.status(500).json({ error: 'Erro ao buscar quota total' });
  }
});

// Endpoint para atualizar a quota total
app.put('/api/quota-total', async (req, res) => {
  try {
    const { valor } = req.body;
    const ano = new Date().getFullYear();

    console.log('[PUT /api/quota-total] Iniciando atualização');
    console.log('[PUT /api/quota-total] Valor recebido:', valor, '| Tipo:', typeof valor);
    console.log('[PUT /api/quota-total] Ano:', ano);

    // Validar o valor
    if (valor === undefined || valor === null) {
      console.error('[PUT /api/quota-total] Valor não fornecido');
      return res.status(400).json({ error: 'Valor não fornecido' });
    }

    const valorNumerico = Number(valor);
    console.log('[PUT /api/quota-total] Valor convertido para número:', valorNumerico);

    if (isNaN(valorNumerico)) {
      console.error('[PUT /api/quota-total] Valor inválido:', valor);
      return res.status(400).json({ error: 'Valor inválido' });
    }

    if (valorNumerico < 0) {
      console.error('[PUT /api/quota-total] Valor negativo:', valorNumerico);
      return res.status(400).json({ error: 'O valor não pode ser negativo' });
    }

    // Usar upsert para criar ou atualizar o registro
    const { data, error } = await supabase
      .from('quota_total')
      .upsert({ 
        ano, 
        valor: valorNumerico,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[PUT /api/quota-total] Erro do Supabase:', error);
      return res.status(500).json({ 
        error: 'Erro ao salvar quota total', 
        details: error.message 
      });
    }

    console.log('[PUT /api/quota-total] Registro salvo com sucesso:', data);
    res.json(data);
  } catch (error) {
    console.error('[PUT /api/quota-total] Erro não tratado:', error);
    res.status(500).json({ 
      error: 'Erro ao salvar quota total',
      details: error.message 
    });
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
            validade_bid,
            validade_proposta,
            preco,
            margem,
            classificacao,
            observacoes,
            estagio_venda,
            trimestre,
            data_won,
            data_faturamento,
            regional_id
        } = req.body;

        console.log('Dados recebidos:', {
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
            data_won,
            data_faturamento,
            regional_id
        });

        // Validação dos campos obrigatórios
        if (!cliente || !regional_id || !preco || !margem || !estagio_venda) {
            console.log('Campos obrigatórios faltando:', { cliente, regional_id, preco, margem, estagio_venda });
            return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
        }

        // Converte e valida os valores numéricos
        let precoNumerico, margemNumerica;
        try {
            precoNumerico = parseFloat(String(preco).replace(/[^\d,.]/g, '').replace(',', '.'));
            margemNumerica = parseFloat(String(margem).replace(/[^\d,.]/g, '').replace(',', '.'));
        } catch (error) {
            return res.status(400).json({ error: 'Valores numéricos inválidos' });
        }

        if (isNaN(precoNumerico) || isNaN(margemNumerica)) {
            return res.status(400).json({ error: 'Valores numéricos inválidos' });
        }

        if (precoNumerico <= 0 || margemNumerica <= 0) {
            return res.status(400).json({ error: 'Preço e margem devem ser maiores que zero' });
        }

        // Buscar a regional pelo ID
        const { data: regionais, error: errorRegionais } = await supabase
            .from('regionais')
            .select('*')
            .eq('id', regional_id);

        if (errorRegionais || !regionais || regionais.length === 0) {
            console.error('Erro ao buscar regional:', errorRegionais);
            return res.status(400).json({ error: 'Regional inválida' });
        }

        const novaOportunidade = {
            id: uuidv4(),
            revenda: revenda || '',
            registro: registro || '',
            cliente,
            bid: bid || '',
            validade_bid: validade_bid || null,
            validade_proposta: validade_proposta || null,
            preco: precoNumerico,
            margem: margemNumerica,
            classificacao: classificacao || '',
            observacoes: observacoes || '',
            estagio_venda: estagio_venda,
            trimestre: trimestre || '',
            data_won: data_won || null,
            data_faturamento: data_faturamento || null,
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
        const { oportunidade_id, estagio_venda } = req.body;

        if (!oportunidade_id || !estagio_venda) {
            return res.status(400).json({ error: 'ID da oportunidade e estágio são obrigatórios' });
        }

        const { error } = await supabase
            .from('historico_oportunidades')
            .insert([{
                oportunidade_id,
                estagio_venda: estagio_venda
            }]);

        if (error) {
            console.error('Erro ao registrar histórico:', error);
            return res.status(500).json({ error: 'Erro ao registrar histórico' });
        }

        res.json({ message: 'Histórico registrado com sucesso' });
    } catch (error) {
        console.error('Erro ao registrar histórico:', error);
        res.status(500).json({ error: 'Erro ao registrar histórico' });
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
            estagio_venda,
            revenda,
            registro,
            bid,
            validade_bid,
            validade_proposta,
            classificacao,
            observacoes,
            trimestre,
            data_faturamento,
            data_won
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

        // Validar valores numéricos
        if (precoNumerico !== undefined && (isNaN(precoNumerico) || precoNumerico <= 0)) {
            return res.status(400).json({ error: 'Preço deve ser maior que zero' });
        }

        if (margemNumerica !== undefined && (isNaN(margemNumerica) || margemNumerica <= 0)) {
            return res.status(400).json({ error: 'Margem deve ser maior que zero' });
        }

        // Validar regional_id se fornecido
        if (regional_id !== undefined) {
            const { data: regionais, error: errorRegionais } = await supabase
                .from('regionais')
                .select('*')
                .eq('id', regional_id);

            if (errorRegionais || !regionais || regionais.length === 0) {
                return res.status(400).json({ error: 'Regional inválida' });
            }
        }

        // Preparar dados para atualização
        const dadosAtualizados = {
            revenda: revenda !== undefined ? revenda : oportunidadeExistente.revenda,
            registro: registro !== undefined ? registro : oportunidadeExistente.registro,
            cliente: cliente !== undefined ? cliente : oportunidadeExistente.cliente,
            bid: bid !== undefined ? bid : oportunidadeExistente.bid,
            validade_bid: validade_bid !== undefined ? (validade_bid === '' ? null : validade_bid) : oportunidadeExistente.validade_bid,
            validade_proposta: validade_proposta !== undefined ? (validade_proposta === '' ? null : validade_proposta) : oportunidadeExistente.validade_proposta,
            preco: precoNumerico !== undefined ? precoNumerico : oportunidadeExistente.preco,
            margem: margemNumerica !== undefined ? margemNumerica : oportunidadeExistente.margem,
            classificacao: classificacao !== undefined ? classificacao : oportunidadeExistente.classificacao,
            observacoes: observacoes !== undefined ? observacoes : oportunidadeExistente.observacoes,
            estagio_venda: estagio_venda !== undefined ? estagio_venda : oportunidadeExistente.estagio_venda,
            trimestre: trimestre !== undefined ? trimestre : oportunidadeExistente.trimestre,
            data_won: data_won !== undefined ? (data_won === '' ? null : data_won) : oportunidadeExistente.data_won,
            data_faturamento: data_faturamento !== undefined ? (data_faturamento === '' ? null : data_faturamento) : oportunidadeExistente.data_faturamento,
            regional_id: regional_id !== undefined ? regional_id : oportunidadeExistente.regional_id
        };

        // Atualizar a oportunidade
        const { data: oportunidadeAtualizada, error: errorAtualizacao } = await supabase
            .from('oportunidades')
            .update(dadosAtualizados)
            .eq('id', id)
            .select();

        if (errorAtualizacao) {
            console.error('Erro ao atualizar oportunidade:', errorAtualizacao);
            return res.status(500).json({ 
                error: 'Erro ao atualizar oportunidade',
                details: errorAtualizacao.message
            });
        }

        res.json(oportunidadeAtualizada[0]);
    } catch (error) {
        console.error('Erro ao atualizar oportunidade:', error);
        res.status(500).json({ 
            error: 'Erro ao atualizar oportunidade',
            details: error.message
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