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
exports.ContactService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class ContactService {
    identifyContact(email, phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            // Normalize empty strings to null
            const normalizedEmail = (email === null || email === void 0 ? void 0 : email.trim()) || null;
            const normalizedPhone = (phoneNumber === null || phoneNumber === void 0 ? void 0 : phoneNumber.trim()) || null;
            // Validate that at least one contact method is provided
            if (!normalizedEmail && !normalizedPhone) {
                throw new Error('Either email or phoneNumber must be provided');
            }
            // Find existing contacts
            const existingContacts = yield this.findExistingContacts(normalizedEmail, normalizedPhone);
            if (existingContacts.length === 0) {
                // Create new primary contact
                const newContact = yield this.createPrimaryContact(normalizedEmail, normalizedPhone);
                return this.formatContactResponse(newContact);
            }
            // Get the oldest primary contact
            const primaryContact = existingContacts.find((contact) => contact.linkPrecedence === 'primary');
            if (!primaryContact) {
                throw new Error('No primary contact found in existing contacts');
            }
            // Check if this is an exact match (both email and phone match existing contact)
            const exactMatch = existingContacts.find((contact) => contact.email === normalizedEmail && contact.phoneNumber === normalizedPhone);
            if (exactMatch) {
                // Exact match found, return existing chain without creating new contact
                return this.formatContactResponse(primaryContact);
            }
            // Check if we need to create a secondary contact
            const hasNewInfo = (normalizedEmail && !existingContacts.some((c) => c.email === normalizedEmail)) ||
                (normalizedPhone && !existingContacts.some((c) => c.phoneNumber === normalizedPhone));
            if (hasNewInfo) {
                // Create secondary contact with new information
                yield this.createSecondaryContact(normalizedEmail, normalizedPhone, primaryContact.id);
            }
            // Handle multiple primary contacts (chain merging)
            const otherPrimaries = existingContacts.filter((contact) => contact.linkPrecedence === 'primary' && contact.id !== primaryContact.id);
            for (const otherPrimary of otherPrimaries) {
                yield this.mergeContactChains(primaryContact, otherPrimary);
            }
            return this.formatContactResponse(primaryContact);
        });
    }
    findExistingContacts(email, phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            const conditions = [];
            if (email) {
                conditions.push({ email });
            }
            if (phoneNumber) {
                conditions.push({ phoneNumber });
            }
            return prisma.contact.findMany({
                where: {
                    OR: conditions,
                    deletedAt: null
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });
        });
    }
    createPrimaryContact(email, phoneNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkPrecedence: 'primary'
                }
            });
        });
    }
    createSecondaryContact(email, phoneNumber, primaryId) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma.contact.create({
                data: {
                    email,
                    phoneNumber,
                    linkPrecedence: 'secondary',
                    linkedId: primaryId
                }
            });
        });
    }
    mergeContactChains(olderPrimary, newerPrimary) {
        return __awaiter(this, void 0, void 0, function* () {
            // Update newer primary to secondary
            yield prisma.contact.update({
                where: { id: newerPrimary.id },
                data: {
                    linkPrecedence: 'secondary',
                    linkedId: olderPrimary.id
                }
            });
            // Update all contacts linked to newer primary
            yield prisma.contact.updateMany({
                where: { linkedId: newerPrimary.id },
                data: { linkedId: olderPrimary.id }
            });
        });
    }
    formatContactResponse(primaryContact) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!primaryContact || !primaryContact.id) {
                throw new Error('Invalid primary contact provided to formatContactResponse');
            }
            const allLinkedContacts = yield prisma.contact.findMany({
                where: {
                    OR: [
                        { id: primaryContact.id },
                        { linkedId: primaryContact.id }
                    ],
                    deletedAt: null
                },
                orderBy: {
                    createdAt: 'asc'
                }
            });
            // Start with primary contact's info
            const emails = new Set();
            const phoneNumbers = new Set();
            const secondaryContactIds = [];
            // Add primary contact's info first
            if (primaryContact.email) {
                emails.add(primaryContact.email);
            }
            if (primaryContact.phoneNumber) {
                phoneNumbers.add(primaryContact.phoneNumber);
            }
            // Add secondary contacts' info
            for (const contact of allLinkedContacts) {
                if (contact.id !== primaryContact.id) {
                    secondaryContactIds.push(contact.id);
                    if (contact.email) {
                        emails.add(contact.email);
                    }
                    if (contact.phoneNumber) {
                        phoneNumbers.add(contact.phoneNumber);
                    }
                }
            }
            return {
                contact: {
                    primaryContactId: primaryContact.id,
                    emails: Array.from(emails),
                    phoneNumbers: Array.from(phoneNumbers),
                    secondaryContactIds
                }
            };
        });
    }
}
exports.ContactService = ContactService;
