import { PostcardModel } from '../src/database/models/PostcardModel.js';
import { getDatabase, closeDatabase } from '../src/database/init.js';

jest.mock('../src/database/init.js', () => {
  const db = {
    prepare: jest.fn(),
    exec: jest.fn(),
    pragma: jest.fn()
  };
  return {
    getDatabase: jest.fn(() => db),
    closeDatabase: jest.fn()
  };
});

describe('PostcardModel', () => {
  let mockDb;
  let db;

  beforeEach(() => {
    mockDb = getDatabase();
    db = mockDb;
    jest.clearAllMocks();
  });

  describe('generateCode', () => {
    it('should generate a code with correct format', () => {
      const code = PostcardModel.generateCode();
      expect(code).toMatch(/^PC-[A-Z0-9]+-[A-Z0-9]+$/);
    });
  });

  describe('calculateDeliveryDays', () => {
    it('should calculate correct delivery days', () => {
      const sentDate = '2024-01-01T00:00:00.000Z';
      const deliveredDate = '2024-01-06T00:00:00.000Z';
      const days = PostcardModel.calculateDeliveryDays(sentDate, deliveredDate);
      expect(days).toBe(5);
    });

    it('should return null if sentDate is missing', () => {
      const days = PostcardModel.calculateDeliveryDays(null, '2024-01-06');
      expect(days).toBeNull();
    });

    it('should return null if deliveredDate is missing', () => {
      const days = PostcardModel.calculateDeliveryDays('2024-01-01', null);
      expect(days).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return paginated results', () => {
      const mockData = [
        { id: '1', code: 'PC-001', front_filename: 'front.jpg', back_filename: 'back.jpg' }
      ];

      db.prepare.mockReturnValueOnce({
        all: jest.fn().mockReturnValue(mockData)
      });
      db.prepare.mockReturnValueOnce({
        get: jest.fn().mockReturnValue({ count: 1 })
      });

      const result = PostcardModel.findAll({ page: 1, limit: 12 });

      expect(result.data).toEqual(mockData);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
    });

    it('should apply status filter', () => {
      db.prepare.mockReturnValue({
        all: jest.fn().mockReturnValue([])
      });

      PostcardModel.findAll({ status: 'delivered' });

      expect(db.prepare).toHaveBeenCalledWith(
        expect.stringContaining("p.status = ?"),
        expect.anything()
      );
    });
  });
});
