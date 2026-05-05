// src/routes/locations.routes.ts
import { Router, Request, Response } from 'express';
import { query } from '../config/database';

const router = Router();

// GET /api/locations/search?q=ch&type=city
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, type } = req.query;

    if (!q || (q as string).length < 2) {
      return res.json({ success: true, data: [] });
    }

    const searchTerm = (q as string).toLowerCase();

    let sql = `
      SELECT id, name, code, type, state, country
      FROM locations
      WHERE is_active = TRUE
      AND (
        LOWER(name) LIKE $1
        OR LOWER(code) LIKE $1
        OR LOWER(state) LIKE $1
      )
    `;
    const params: any[] = [`%${searchTerm}%`];

    if (type) {
      sql += ` AND type = $2`;
      params.push(type);
    }

    sql += ` ORDER BY 
      CASE WHEN LOWER(name) LIKE $${params.length + 1} THEN 0 ELSE 1 END,
      name ASC
      LIMIT 8`;
    params.push(`${searchTerm}%`);

    const result = await query(sql, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Location search error:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

export default router;