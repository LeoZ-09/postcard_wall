import request from 'supertest';
import express from 'express';
import imageRoutes from '../src/routes/imageRoutes.js';
import { ImageModel } from '../src/database/models/ImageModel.js';

const app = express();
app.use(express.json());
app.use('/api/images', imageRoutes);

jest.mock('../src/database/models/ImageModel.js');
jest.mock('../src/middleware/errorHandler.js', () => (err, req, res, next) => {
  res.status(err.statusCode || 500).json({ success: false, error: err.message });
});

describe('Image API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/images', () => {
    it('should return paginated images', async () => {
      const mockData = {
        data: [
          {
            id: '1',
            filename: 'test.jpg',
            original_name: 'test.jpg',
            url: '/uploads/images/test.jpg'
          }
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1
        }
      };

      ImageModel.findAll.mockReturnValue(mockData);

      const response = await request(app)
        .get('/api/images')
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/images/:id', () => {
    it('should return an image by id', async () => {
      const mockImage = {
        id: '1',
        filename: 'test.jpg',
        original_name: 'test.jpg',
        url: '/uploads/images/test.jpg'
      };

      ImageModel.findById.mockReturnValue(mockImage);

      const response = await request(app)
        .get('/api/images/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('1');
    });

    it('should return 404 for non-existent image', async () => {
      ImageModel.findById.mockReturnValue(null);

      const response = await request(app)
        .get('/api/images/non-existent');

      expect(response.status).toBe(404);
    });
  });
});
