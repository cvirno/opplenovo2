import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const [rows] = await pool.query('SELECT * FROM oportunidades ORDER BY created_at DESC');
        res.status(200).json(rows);
      } catch (error) {
        console.error('Erro ao buscar oportunidades:', error);
        res.status(500).json({ error: 'Erro ao buscar oportunidades' });
      }
      break;

    case 'POST':
      try {
        const { revenda, registro, cliente, bid, validadeBid, validadeProposta, preco, margem, classificacao, observacoes } = req.body;
        
        const [result] = await pool.query(
          'INSERT INTO oportunidades (revenda, registro, cliente, bid, validade_bid, validade_proposta, preco, margem, classificacao, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [revenda, registro, cliente, bid, validadeBid, validadeProposta, preco, margem, classificacao, observacoes]
        );

        res.status(201).json({ id: result.insertId });
      } catch (error) {
        console.error('Erro ao criar oportunidade:', error);
        res.status(500).json({ error: 'Erro ao criar oportunidade' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 