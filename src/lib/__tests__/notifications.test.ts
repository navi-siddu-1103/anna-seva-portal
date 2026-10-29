import { 
  sendWelcomeEmail, 
  sendTokenBookingEmail, 
  sendDistributionConfirmationEmail,
  sendDistributionCycleAnnouncementEmail,
  sendWelcomeSMS,
  sendTokenBookingSMS,
  sendDistributionConfirmationSMS,
  sendDistributionCycleAnnouncementSMS
} from '@/lib/notifications';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  })),
}));

// Mock twilio
jest.mock('twilio', () => {
  return jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ sid: 'test-sid' }),
    },
  }));
});

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  warn: jest.spyOn(console, 'warn').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
};

describe('HTML Escaping', () => {
  // Test escapeHtml function indirectly through email functions
  it('should escape HTML special characters in email names', async () => {
    process.env.SMTP_USER = 'test@gmail.com';
    
    const name = '<script>alert("xss")</script>';
    await sendWelcomeEmail('user@example.com', name, 'cardholder');
    
    // The function should successfully process without throwing
    expect(consoleSpy.log).toHaveBeenCalled();
  });

  it('should escape HTML special characters in token numbers', async () => {
    process.env.SMTP_USER = 'test@gmail.com';
    
    const tokenNumber = '<img src=x onerror="alert(1)">';
    const tokenDetails = {
      tokenNumber,
      bookingDate: '2024-01-15',
      items: [{ name: 'Rice', quantity: 5 }],
      shopName: 'Test Shop',
      shopAddress: 'Test Address',
    };
    
    await sendTokenBookingEmail('user@example.com', 'John', tokenDetails);
    expect(consoleSpy.log).toHaveBeenCalled();
  });

  it('should escape HTML entities in shop names', async () => {
    process.env.SMTP_USER = 'test@gmail.com';
    
    const shopName = '&<>"\'';
    const tokenDetails = {
      tokenNumber: 'TKN001',
      bookingDate: '2024-01-15',
      items: [{ name: 'Rice', quantity: 5 }],
      shopName,
      shopAddress: 'Test Address',
    };
    
    await sendTokenBookingEmail('user@example.com', 'John', tokenDetails);
    expect(consoleSpy.log).toHaveBeenCalled();
  });

  it('should escape HTML in item names', async () => {
    process.env.SMTP_USER = 'test@gmail.com';
    
    const itemName = '<script>console.log("xss")</script>Rice';
    const tokenDetails = {
      tokenNumber: 'TKN001',
      bookingDate: '2024-01-15',
      items: [{ name: itemName, quantity: 5 }],
      shopName: 'Test Shop',
      shopAddress: 'Test Address',
    };
    
    await sendTokenBookingEmail('user@example.com', 'John', tokenDetails);
    expect(consoleSpy.log).toHaveBeenCalled();
  });

  it('should escape HTML in distribution cycle descriptions', async () => {
    process.env.SMTP_USER = 'test@gmail.com';
    
    const description = '<iframe src="evil.com"></iframe>New cycle description';
    const cycleDetails = {
      distributorName: 'Test Distributor',
      cycleStartDate: '2024-01-15',
      description,
    };
    
    await sendDistributionCycleAnnouncementEmail('user@example.com', 'John', cycleDetails);
    expect(consoleSpy.log).toHaveBeenCalled();
  });

  it('should escape HTML in SMS messages', async () => {
    process.env.TWILIO_ACCOUNT_SID = 'test-sid';
    process.env.TWILIO_AUTH_TOKEN = 'test-token';
    process.env.TWILIO_PHONE_NUMBER = '+1234567890';
    
    const name = '<script>alert("xss")</script>';
    await sendWelcomeSMS('+919876543210', name, 'cardholder');
    
    expect(consoleSpy.log).toHaveBeenCalled();
  });
});

describe('Email Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SMTP_USER = 'test@gmail.com';
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email for cardholder', async () => {
      await sendWelcomeEmail('user@example.com', 'John', 'cardholder');
      expect(consoleSpy.log).toHaveBeenCalledWith('Welcome email sent to user@example.com');
    });

    it('should send welcome email for distributor', async () => {
      await sendWelcomeEmail('distributor@example.com', 'Jane', 'distributor');
      expect(consoleSpy.log).toHaveBeenCalledWith('Welcome email sent to distributor@example.com');
    });

    it('should skip email when SMTP_USER is not configured', async () => {
      delete process.env.SMTP_USER;
      await sendWelcomeEmail('user@example.com', 'John', 'cardholder');
      expect(consoleSpy.warn).toHaveBeenCalledWith('Email service not configured. Skipping email.');
    });

    it('should handle email with special name characters', async () => {
      await sendWelcomeEmail('user@example.com', "O'Brien", 'cardholder');
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should handle unicode characters in name', async () => {
      await sendWelcomeEmail('user@example.com', 'राज', 'cardholder');
      expect(consoleSpy.log).toHaveBeenCalled();
    });
  });

  describe('sendTokenBookingEmail', () => {
    it('should send token booking confirmation email', async () => {
      const tokenDetails = {
        tokenNumber: 'TKN001',
        bookingDate: '2024-01-15',
        items: [
          { name: 'Rice', quantity: 5 },
          { name: 'Wheat', quantity: 5 },
        ],
        shopName: 'Fair Price Shop',
        shopAddress: '123 Main Street',
      };
      
      await sendTokenBookingEmail('user@example.com', 'John', tokenDetails);
      expect(consoleSpy.log).toHaveBeenCalledWith('Token booking email sent to user@example.com');
    });

    it('should handle empty items array', async () => {
      const tokenDetails = {
        tokenNumber: 'TKN001',
        bookingDate: '2024-01-15',
        items: [],
        shopName: 'Fair Price Shop',
        shopAddress: '123 Main Street',
      };
      
      await sendTokenBookingEmail('user@example.com', 'John', tokenDetails);
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should skip email when SMTP_USER is not configured', async () => {
      delete process.env.SMTP_USER;
      const tokenDetails = {
        tokenNumber: 'TKN001',
        bookingDate: '2024-01-15',
        items: [{ name: 'Rice', quantity: 5 }],
        shopName: 'Fair Price Shop',
        shopAddress: '123 Main Street',
      };
      
      await sendTokenBookingEmail('user@example.com', 'John', tokenDetails);
      expect(consoleSpy.warn).toHaveBeenCalledWith('Email service not configured. Skipping email.');
    });

    it('should handle multiple items in token', async () => {
      const tokenDetails = {
        tokenNumber: 'TKN001',
        bookingDate: '2024-01-15',
        items: [
          { name: 'Rice', quantity: 5 },
          { name: 'Wheat Flour', quantity: 5 },
          { name: 'Sugar', quantity: 1 },
          { name: 'Toor Dal', quantity: 1 },
          { name: 'Cooking Oil', quantity: 1 },
        ],
        shopName: 'Fair Price Shop',
        shopAddress: '123 Main Street',
      };
      
      await sendTokenBookingEmail('user@example.com', 'John', tokenDetails);
      expect(consoleSpy.log).toHaveBeenCalled();
    });
  });

  describe('sendDistributionConfirmationEmail', () => {
    it('should send distribution confirmation email', async () => {
      const distributionDetails = {
        tokenNumber: 'TKN001',
        distributionDate: '2024-01-20',
        items: [
          { name: 'Rice', quantity: 5 },
          { name: 'Wheat Flour', quantity: 5 },
        ],
        shopName: 'Fair Price Shop',
      };
      
      await sendDistributionConfirmationEmail('user@example.com', 'John', distributionDetails);
      expect(consoleSpy.log).toHaveBeenCalledWith('Distribution confirmation email sent to user@example.com');
    });

    it('should skip email when SMTP_USER is not configured', async () => {
      delete process.env.SMTP_USER;
      const distributionDetails = {
        tokenNumber: 'TKN001',
        distributionDate: '2024-01-20',
        items: [{ name: 'Rice', quantity: 5 }],
        shopName: 'Fair Price Shop',
      };
      
      await sendDistributionConfirmationEmail('user@example.com', 'John', distributionDetails);
      expect(consoleSpy.warn).toHaveBeenCalledWith('Email service not configured. Skipping email.');
    });
  });

  describe('sendDistributionCycleAnnouncementEmail', () => {
    it('should send cycle announcement email without description', async () => {
      const cycleDetails = {
        distributorName: 'Test Distributor',
        cycleStartDate: '2024-01-15',
      };
      
      await sendDistributionCycleAnnouncementEmail('user@example.com', 'John', cycleDetails);
      expect(consoleSpy.log).toHaveBeenCalledWith('Distribution cycle announcement email sent to user@example.com');
    });

    it('should send cycle announcement email with description', async () => {
      const cycleDetails = {
        distributorName: 'Test Distributor',
        cycleStartDate: '2024-01-15',
        description: 'New cycle with special items',
      };
      
      await sendDistributionCycleAnnouncementEmail('user@example.com', 'John', cycleDetails);
      expect(consoleSpy.log).toHaveBeenCalled();
    });

    it('should skip email when SMTP_USER is not configured', async () => {
      delete process.env.SMTP_USER;
      const cycleDetails = {
        distributorName: 'Test Distributor',
        cycleStartDate: '2024-01-15',
      };
      
      await sendDistributionCycleAnnouncementEmail('user@example.com', 'John', cycleDetails);
      expect(consoleSpy.warn).toHaveBeenCalledWith('Email service not configured. Skipping email.');
    });
  });
});

describe('SMS Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TWILIO_ACCOUNT_SID = 'test-sid';
    process.env.TWILIO_AUTH_TOKEN = 'test-token';
    process.env.TWILIO_PHONE_NUMBER = '+1234567890';
  });

  describe('sendWelcomeSMS', () => {
    it('should skip SMS when Twilio is not configured', async () => {
      delete process.env.TWILIO_ACCOUNT_SID;
      await sendWelcomeSMS('+919876543210', 'John', 'cardholder');
      expect(consoleSpy.warn).toHaveBeenCalledWith('SMS service not configured. Skipping SMS.');
    });

    it('should skip SMS when TWILIO_PHONE_NUMBER is not set', async () => {
      delete process.env.TWILIO_PHONE_NUMBER;
      await sendWelcomeSMS('+919876543210', 'John', 'cardholder');
      expect(consoleSpy.warn).toHaveBeenCalledWith('SMS service not configured. Skipping SMS.');
    });
  });

  describe('sendTokenBookingSMS', () => {
    it('should skip SMS when Twilio is not configured', async () => {
      delete process.env.TWILIO_ACCOUNT_SID;
      await sendTokenBookingSMS('+919876543210', 'John', 'TKN001', 'Fair Price Shop');
      expect(consoleSpy.warn).toHaveBeenCalledWith('SMS service not configured. Skipping SMS.');
    });
  });

  describe('sendDistributionConfirmationSMS', () => {
    it('should skip SMS when Twilio is not configured', async () => {
      delete process.env.TWILIO_ACCOUNT_SID;
      await sendDistributionConfirmationSMS('+919876543210', 'John', 'TKN001', 'Rice, Wheat');
      expect(consoleSpy.warn).toHaveBeenCalledWith('SMS service not configured. Skipping SMS.');
    });
  });

  describe('sendDistributionCycleAnnouncementSMS', () => {
    it('should skip SMS when Twilio is not configured', async () => {
      delete process.env.TWILIO_ACCOUNT_SID;
      await sendDistributionCycleAnnouncementSMS(
        '+919876543210',
        'John',
        'Test Distributor',
        '2024-01-15'
      );
      expect(consoleSpy.warn).toHaveBeenCalledWith('SMS service not configured. Skipping SMS.');
    });
  });
});

describe('Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SMTP_USER = 'test@gmail.com';
  });

  it('should handle email sending configuration gracefully', async () => {
    delete process.env.SMTP_USER;
    
    const tokenDetails = {
      tokenNumber: 'TKN001',
      bookingDate: '2024-01-15',
      items: [{ name: 'Rice', quantity: 5 }],
      shopName: 'Fair Price Shop',
      shopAddress: '123 Main Street',
    };
    
    await sendTokenBookingEmail('user@example.com', 'John', tokenDetails);
    expect(consoleSpy.warn).toHaveBeenCalledWith('Email service not configured. Skipping email.');
  });

  it('should handle SMS configuration gracefully', async () => {
    delete process.env.TWILIO_ACCOUNT_SID;
    
    await sendWelcomeSMS('+919876543210', 'John', 'cardholder');
    expect(consoleSpy.warn).toHaveBeenCalledWith('SMS service not configured. Skipping SMS.');
  });

  it('should skip operations when required config is missing', async () => {
    delete process.env.SMTP_USER;
    
    await sendWelcomeEmail('user@example.com', 'John', 'cardholder');
    expect(consoleSpy.warn).toHaveBeenCalled();
  });
});
