// src/controllers/quotes.controller.ts
import { Request, Response } from 'express';
import { getQuotes, getAllRateCards, createRateCard, updateRateCard, deleteRateCard } from '../services/quotes.service';

// GET /api/quotes?serviceType=Rail&origin=Chennai&destination=JNPT&weight=1000
export const getQuotesHandler = async (req: Request, res: Response) => {
  try {
    const { serviceType, origin, destination, weight, numberOfContainers, containerType } = req.query;

    if (!serviceType || !origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'serviceType, origin and destination are required',
      });
    }

    const quotes = await getQuotes({
      serviceType: serviceType as string,
      origin: origin as string,
      destination: destination as string,
      weight: weight ? parseFloat(weight as string) : undefined,
      numberOfContainers: numberOfContainers ? parseInt(numberOfContainers as string) : undefined,
      containerType: containerType as string | undefined,
    });

    return res.status(200).json({
      success: true,
      count: quotes.length,
      data: quotes,
    });
  } catch (error) {
    console.error('Get quotes error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/quotes/rate-cards (admin only)
export const getRateCardsHandler = async (req: Request, res: Response) => {
  try {
    const rateCards = await getAllRateCards();
    return res.status(200).json({ success: true, data: rateCards });
  } catch (error) {
    console.error('Get rate cards error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/quotes/rate-cards (admin only)
export const createRateCardHandler = async (req: Request, res: Response) => {
  try {
    const rateCard = await createRateCard(req.body);
    return res.status(201).json({ success: true, data: rateCard });
  } catch (error) {
    console.error('Create rate card error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/quotes/rate-cards/:id (admin only)
export const updateRateCardHandler = async (req: Request, res: Response) => {
  try {
    const rateCard = await updateRateCard(req.params.id, req.body);
    if (!rateCard) return res.status(404).json({ success: false, message: 'Rate card not found' });
    return res.status(200).json({ success: true, data: rateCard });
  } catch (error) {
    console.error('Update rate card error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/quotes/rate-cards/:id (admin only)
export const deleteRateCardHandler = async (req: Request, res: Response) => {
  try {
    await deleteRateCard(req.params.id);
    return res.status(200).json({ success: true, message: 'Rate card deleted' });
  } catch (error) {
    console.error('Delete rate card error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};