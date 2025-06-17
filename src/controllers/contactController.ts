import { Router, Request, Response, NextFunction, RequestHandler } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import { ContactService } from '../services/contactService';

const router = Router();
const contactService = new ContactService();

// Validation middleware
const validateIdentifyRequest: ValidationChain[] = [
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phoneNumber').optional().matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format')
];

// Validation result handler
const handleValidationErrors: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// Identify endpoint
router.post('/identify', [...validateIdentifyRequest, handleValidationErrors], async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phoneNumber } = req.body;
    
    if (!email && !phoneNumber) {
      res.status(400).json({
        status: 'error',
        message: 'Either email or phoneNumber must be provided'
      });
      return;
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