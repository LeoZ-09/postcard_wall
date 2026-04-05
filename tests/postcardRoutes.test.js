import request from 'supertest';
import express from 'express';
import postcardRoutes from '../src/routes/postcardRoutes.js';
import { PostcardModel } from '../src/database/models/PostcardModel.js';

const app = express();
app.use(express.json());
app.use('/api/postcards', postcardRoutes);

jest.mock('../src/database/models/PostcardModel.js');

describe('Postcard API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/postcards', () => {
    it('should return paginated postcards', async () => {
      const mockData = {
        data: [
          {
            id: '1',
            code: 'PC-TEST-001',
            sender_name: 'Test Sender',
            recipient_name: 'Test Recipient',
            status: 'pending',
            front_url: '/uploads/images/test.jpg',
            back_url: '/uploads/images/test2.jpg'
          }
        ],
        pagination: {
          page: 1,
          limit: 12,
          total: 1,
          totalPages: 1
        }
      };

      PostcardModel.findAll.mockReturnValue(mockData);

      const response = await request(app)
        .get('/api/postcards')
        .query({ page: 1, limit: 12 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.total).toBe(1);
    });

    it('should filter postcards by status', async () => {
      const mockData = {
        data: [{ id: '1', status: 'delivered' }],
        pagination: { page: 1, limit: 12, total: 1, totalPages: 1 }
      };

      PostcardModel.findAll.mockReturnValue(mockData);

      const response = await request(app)
        .get('/api/postcards')
        .query({ status: 'delivered' });

      expect(response.status).toBe(200);
      expect(PostcardModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'delivered' })
      );
    });
  });

  describe('GET /api/postcards/statistics', () => {
    it('should return postcard statistics', async () => {
      const mockStats = {
        total: 10,
        pending: 3,
        sent: 4,
        delivered: 3,
        avgDeliveryDays: 5
      };

      PostcardModel.getStatistics.mockReturnValue(mockStats);

      const response = await request(app)
        .get('/api/postcards/statistics');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(10);
      expect(response.body.data.avgDeliveryDays).toBe(5);
    });
  });

  describe('POST /api/postcards', () => {
    it('should create a new postcard', async () => {
      const newPostcard = {
        id: '1',
        code: 'PC-NEW-001',
        front_image_id: 'front-123',
        back_image_id: 'back-123',
        sender_name: 'Sender',
        recipient_name: 'Recipient',
        status: 'pending'
      };

      PostcardModel.create.mockReturnValue(newPostcard);

      const response = await request(app)
        .post('/api/postcards')
        .send({
          frontImageId: 'front-123',
          backImageId: 'back-123',
          senderName: 'Sender',
          recipientName: 'Recipient'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBe('PC-NEW-001');
    });
  });

  describe('GET /api/postcards/:id', () => {
    it('should return a postcard by id', async () => {
      const mockPostcard = {
        id: '1',
        code: 'PC-TEST-001',
        sender_name: 'Test',
        status: 'pending',
        front_url: '/uploads/images/test.jpg',
        back_url: '/uploads/images/test2.jpg'
      };

      PostcardModel.findById.mockReturnValue(mockPostcard);

      const response = await request(app)
        .get('/api/postcards/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('1');
    });

    it('should return 404 for non-existent postcard', async () => {
      PostcardModel.findById.mockReturnValue(null);

      const response = await request(app)
        .get('/api/postcards/non-existent');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/postcards/:id', () => {
    it('should update a postcard', async () => {
      const updatedPostcard = {
        id: '1',
        sender_name: 'Updated Sender',
        status: 'delivered'
      };

      PostcardModel.findById.mockReturnValue({ id: '1' });
      PostcardModel.update.mockReturnValue(updatedPostcard);

      const response = await request(app)
        .put('/api/postcards/1')
        .send({ senderName: 'Updated Sender', status: 'delivered' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/postcards/:id', () => {
    it('should delete a postcard', async () => {
      PostcardModel.delete.mockReturnValue({ id: '1' });

      const response = await request(app)
        .delete('/api/postcards/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent postcard', async () => {
      PostcardModel.delete.mockReturnValue(null);

      const response = await request(app)
        .delete('/api/postcards/non-existent');

      expect(response.status).toBe(404);
    });
  });
});
