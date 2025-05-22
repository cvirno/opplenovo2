import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { registro } = req.query;

  if (req.method === 'DELETE') {
    try {
      await pool.query('DELETE FROM oportunidades WHERE registro = ?', [registro]);
      res.status(200).json({ message: 'Oportunidade excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir oportunidade:', error);
      res.status(500).json({ error: 'Erro ao excluir oportunidade' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 