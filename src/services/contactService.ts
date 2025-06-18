import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ContactService {
  async identifyContact(email?: string, phoneNumber?: string) {
    // Normalize empty strings to null
    const normalizedEmail = email?.trim() || null;
    const normalizedPhone = phoneNumber?.trim() || null;

    // Validate that at least one contact method is provided
    if (!normalizedEmail && !normalizedPhone) {
      throw new Error('Either email or phoneNumber must be provided');
    }

    // Find existing contacts
    const existingContacts = await this.findExistingContacts(normalizedEmail, normalizedPhone);

    if (existingContacts.length === 0) {
      // Create new primary contact
      const newContact = await this.createPrimaryContact(normalizedEmail, normalizedPhone);
      return this.formatContactResponse(newContact);
    }

    // Get the oldest primary contact
    const primaryContact = existingContacts.find(contact => contact.linkPrecedence === 'primary');
    if (!primaryContact) {
      throw new Error('No primary contact found in existing contacts');
    }

    // Check if this is an exact match (both email and phone match existing contact)
    const exactMatch = existingContacts.find(contact => 
      contact.email === normalizedEmail && contact.phoneNumber === normalizedPhone
    );

    if (exactMatch) {
      // Exact match found, return existing chain without creating new contact
      return this.formatContactResponse(primaryContact);
    }

    // Check if we need to create a secondary contact
    const hasNewInfo = (normalizedEmail && !existingContacts.some(c => c.email === normalizedEmail)) ||
                      (normalizedPhone && !existingContacts.some(c => c.phoneNumber === normalizedPhone));

    if (hasNewInfo) {
      // Create secondary contact with new information
      await this.createSecondaryContact(normalizedEmail, normalizedPhone, primaryContact.id);
    }

    // Handle multiple primary contacts (chain merging)
    const otherPrimaries = existingContacts.filter(contact => 
      contact.linkPrecedence === 'primary' && contact.id !== primaryContact.id
    );

    for (const otherPrimary of otherPrimaries) {
      await this.mergeContactChains(primaryContact, otherPrimary);
    }

    return this.formatContactResponse(primaryContact);
  }

  private async findExistingContacts(email: string | null, phoneNumber: string | null) {
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
  }

  private async createPrimaryContact(email: string | null, phoneNumber: string | null) {
    return prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: 'primary'
      }
    });
  }

  private async createSecondaryContact(email: string | null, phoneNumber: string | null, primaryId: number) {
    return prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: 'secondary',
        linkedId: primaryId
      }
    });
  }

  private async mergeContactChains(olderPrimary: any, newerPrimary: any) {
    // Update newer primary to secondary
    await prisma.contact.update({
      where: { id: newerPrimary.id },
      data: {
        linkPrecedence: 'secondary',
        linkedId: olderPrimary.id
      }
    });

    // Update all contacts linked to newer primary
    await prisma.contact.updateMany({
      where: { linkedId: newerPrimary.id },
      data: { linkedId: olderPrimary.id }
    });
  }

  private async formatContactResponse(primaryContact: any) {
    if (!primaryContact || !primaryContact.id) {
      throw new Error('Invalid primary contact provided to formatContactResponse');
    }

    const allLinkedContacts = await prisma.contact.findMany({
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
    const emails = new Set<string>();
    const phoneNumbers = new Set<string>();
    const secondaryContactIds: number[] = [];

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
  }
} 