import { Request, Response, NextFunction } from 'express';
import { pool } from '../db/connection';

export interface CustomRequest extends Request {
  clientId?: string;
}

/**
 * Rate limiter middleware: 1 corn per client per minute
 * 
 * Strategy: 
 * - Use x-client-id header if provided, otherwise fall back to IP address
 * - Check purchases in the last 60 seconds
 * - If any purchase exists, return 429 with retry-after information
 * - Otherwise, allow the request to proceed
 * 
 * Business Rule: At most 1 corn per client per minute
 */
export async function rateLimiter(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Get client identifier (prefer header, fallback to IP)
    const clientId = (req.headers['x-client-id'] as string)?.trim() || 
                     req.ip || 
                     'unknown';
    
    if (!clientId || clientId === 'unknown') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Client identification required'
      });
    }

    req.clientId = clientId;

    // Check if client has purchased corn in the last 60 seconds
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    
    const result = await pool.query(
      `SELECT COUNT(*)::int as count,
              MAX(purchased_at) as last_purchase
       FROM corn_purchases 
       WHERE client_id = $1 
       AND purchased_at > $2`,
      [clientId, oneMinuteAgo]
    );

    const purchaseCount = result.rows[0]?.count || 0;
    const lastPurchase = result.rows[0]?.last_purchase;

    if (purchaseCount >= 1) {
      // Calculate seconds until they can buy again
      let retryAfter = 60;
      if (lastPurchase) {
        const lastPurchaseTime = new Date(lastPurchase).getTime();
        const timeSinceLastPurchase = Date.now() - lastPurchaseTime;
        retryAfter = Math.ceil((60000 - timeSinceLastPurchase) / 1000);
      }

      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'You can only buy 1 corn per minute. Please wait before trying again.',
        retryAfter: Math.max(1, retryAfter)
      });
    }

    // Rate limit check passed
    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    // Fail closed: if we can't check rate limit, deny the request
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Rate limit service temporarily unavailable. Please try again later.'
    });
  }
}

