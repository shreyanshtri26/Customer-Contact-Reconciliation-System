import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { ContactService } from '../services/contactService';

const router = Router();
const contactService = new ContactService();

// Validation middleware
const validateIdentifyRequest = [
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phoneNumber').optional().matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format'),
  (req: Request, res: Response, next: Function) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Identify endpoint
router.post('/identify', validateIdentifyRequest, async (req: Request, res: Response) => {
  try {
    const { email, phoneNumber } = req.body;
    
    if (!email && !phoneNumber) {
      return res.status(400).json({
        status: 'error',
        message: 'Either email or phoneNumber must be provided'
      });
    }

    const result = await contactService.identifyContact(email, phoneNumber);
    res.json(result);
  } catch (error) {
    console.error('Error in identify endpoint:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while processing your request'
    });
  }
});

export const contactRouter = router; 