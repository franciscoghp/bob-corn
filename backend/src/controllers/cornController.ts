import { Response } from 'express';
import { pool } from '../db/connection';
import { CustomRequest } from '../middleware/rateLimiter';

/**
 * POST /api/buy-corn
 * 
 * Records a corn purchase for the client.
 * Rate limiting is handled by middleware before this controller.
 * 
 * Returns: 200 with purchase details on success
 */
export async function buyCorn(req: CustomRequest, res: Response) {
  try {
    const clientId = req.clientId;

    if (!clientId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Client identification required'
      });
    }

    // Insert purchase record
    const result = await pool.query(
      `INSERT INTO corn_purchases (client_id, purchased_at) 
       VALUES ($1, CURRENT_TIMESTAMP) 
       RETURNING id, purchased_at`,
      [clientId]
    );

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Failed to insert purchase record');
    }

    const purchase = result.rows[0];

    res.status(200).json({
      success: true,
      message: '🌽 Corn purchased successfully!',
      purchase: {
        id: purchase.id,
        purchasedAt: purchase.purchased_at
      }
    });
  } catch (error) {
    console.error('Error buying corn:', error);
    
    // Check if it's a database constraint error
    if (error instanceof Error && error.message.includes('constraint')) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Purchase could not be completed due to a conflict'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process corn purchase. Please try again later.'
    });
  }
}

