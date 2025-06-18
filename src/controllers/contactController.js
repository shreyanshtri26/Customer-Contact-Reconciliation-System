"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const contactService_1 = require("../services/contactService");
const router = (0, express_1.Router)();
const contactService = new contactService_1.ContactService();
// Validation middleware
const validateIdentifyRequest = [
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .withMessage('Invalid email format')
        .normalizeEmail(),
    (0, express_validator_1.body)('phoneNumber')
        .optional()
        .matches(/^[\+]?[0-9\-\s\(\)]{7,15}$/)
        .withMessage('Invalid phone number format')
        .customSanitizer((value) => value === null || value === void 0 ? void 0 : value.trim())
];
// Validation result handler
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: errors.array()
        });
        return;
    }
    next();
};
// Identify endpoint
router.post('/identify', [...validateIdentifyRequest, handleValidationErrors], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, phoneNumber } = req.body;
        // Additional validation for empty values
        if (!email && !phoneNumber) {
            res.status(400).json({
                status: 'error',
                message: 'Either email or phoneNumber must be provided'
            });
            return;
        }
        const result = yield contactService.identifyContact(email, phoneNumber);
        res.json(result);
    }
    catch (error) {
        console.error('Error in identify endpoint:', error);
        if (error instanceof Error) {
            res.status(400).json({
                status: 'error',
                message: error.message
            });
        }
        else {
            res.status(500).json({
                status: 'error',
                message: 'An error occurred while processing your request'
            });
        }
    }
}));
exports.contactRouter = router;
