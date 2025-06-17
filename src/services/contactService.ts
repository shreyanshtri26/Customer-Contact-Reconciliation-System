import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ContactService {
  async identifyContact(email?: string, phoneNumber?: string) {
    // Find existing contacts
    const existingContacts = await this.findExistingContacts(email, phoneNumber);

    if (existingContacts.length === 0) {
      // Create new primary contact
      const newContact = await this.createPrimaryContact(email, phoneNumber);
      return this.formatContactResponse(newContact);
    }

    // Get the oldest primary contact
    const primaryContact = existingContacts.find(contact => contact.linkPrecedence === 'primary')!;

    // Create secondary contact if needed
    if (existingContacts.length === 1) {
      const secondaryContact = await this.createSecondaryContact(email, phoneNumber, primaryContact.id);
      return this.formatContactResponse(primaryContact);
    }

    // Handle multiple existing contacts
    const newerPrimary = existingContacts.find(contact => 
      contact.linkPrecedence === 'primary' && contact.id !== primaryContact.id
    );

    if (newerPrimary) {
      await this.mergeContactChains(primaryContact, newerPrimary);
    }

    return this.formatContactResponse(primaryContact);
  }

  private async findExistingContacts(email?: string, phoneNumber?: string) {
    return prisma.contact.findMany({
      where: {
        OR: [
          { email },
          { phoneNumber }
        ],
        deletedAt: null
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }

  private async createPrimaryContact(email?: string, phoneNumber?: string) {
    return prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: 'primary'
      }
    });
  }

  private async createSecondaryContact(email?: string, phoneNumber?: string, primaryId: number) {
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
    const allLinkedContacts = await prisma.contact.findMany({
      where: {
        OR: [
          { id: primaryContact.id },
          { linkedId: primaryContact.id }
        ],
        deletedAt: null
      }
    });

    const emails = [...new Set(allLinkedContacts
      .map(contact => contact.email)
      .filter(email => email !== null))];

    const phoneNumbers = [...new Set(allLinkedContacts
      .map(contact => contact.phoneNumber)
      .filter(phone => phone !== null))];

    const secondaryContactIds = allLinkedContacts
      .filter(contact => contact.id !== primaryContact.id)
      .map(contact => contact.id);

    return {
      contact: {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds
      }
    };
  }
} 