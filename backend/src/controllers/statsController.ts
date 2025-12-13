import { Request, Response } from 'express';
import { pool } from '../db/connection';

/**
 * GET /api/stats/:clientId
 * 
 * Returns statistics about corn purchases for a specific client
 * 
 * Returns: 200 with client statistics
 */
export async function getClientStats(req: Request, res: Response) {
  try {
    const { clientId } = req.params;

    if (!clientId || clientId.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Client ID is required'
      });
    }

    // Get total purchases count and last purchase in a single query
    const result = await pool.query(
      `SELECT 
         COUNT(*)::int as total,
         MAX(purchased_at) as last_purchase
       FROM corn_purchases 
       WHERE client_id = $1`,
      [clientId]
    );

    const total = result.rows[0]?.total || 0;
    const lastPurchase = result.rows[0]?.last_purchase || null;

    res.json({
      clientId,
      totalPurchases: total,
      lastPurchase
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve statistics. Please try again later.'
    });
  }
}

