import express from 'express';
import { PostcardModel } from '../../database/models/PostcardModel.js';
import { ImageModel } from '../../database/models/ImageModel.js';
import { createPostcardSchema, updatePostcardSchema, paginationSchema } from '../middleware/validation.js';
import { validate, validateQuery } from '../middleware/validation.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';

const router = express.Router();

router.post('/', validate(createPostcardSchema), async (req, res, next) => {
  try {
    const { frontImageId, backImageId, senderName, recipientName, sentDate, deliveredDate, description, status } = req.validatedBody;

    const frontImage = await ImageModel.findById(frontImageId);
    if (!frontImage) {
      throw new ValidationError('Front image not found');
    }

    const backImage = await ImageModel.findById(backImageId);
    if (!backImage) {
      throw new ValidationError('Back image not found');
    }

    const postcard = await PostcardModel.create({
      frontImageId,
      backImageId,
      senderName,
      recipientName,
      sentDate,
      deliveredDate,
      description,
      status
    });

    res.status(201).json({
      success: true,
      message: 'Postcard created successfully',
      data: postcard
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', validateQuery(paginationSchema), async (req, res, next) => {
  try {
    const { page, limit } = req.validatedQuery;
    const { status, senderName, recipientName } = req.query;

    const result = await PostcardModel.findAll({
      page,
      limit,
      status,
      senderName,
      recipientName
    });

    const postcardsWithUrls = result.data.map(pc => ({
      ...pc,
      front_url: `/uploads/images/${pc.front_filename}`,
      back_url: `/uploads/images/${pc.back_filename}`
    }));

    res.json({
      success: true,
      data: postcardsWithUrls,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
});

router.get('/statistics', async (req, res, next) => {
  try {
    const stats = await PostcardModel.getStatistics();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const postcard = await PostcardModel.findById(req.params.id);
    if (!postcard) {
      throw new NotFoundError('Postcard not found');
    }

    res.json({
      success: true,
      data: {
        ...postcard,
        front_url: `/uploads/images/${postcard.front_filename}`,
        back_url: `/uploads/images/${postcard.back_filename}`
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/code/:code', async (req, res, next) => {
  try {
    const postcard = await PostcardModel.findByCode(req.params.code);
    if (!postcard) {
      throw new NotFoundError('Postcard not found');
    }

    res.json({
      success: true,
      data: {
        ...postcard,
        front_url: `/uploads/images/${postcard.front_filename}`,
        back_url: `/uploads/images/${postcard.back_filename}`
      }
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validate(updatePostcardSchema), async (req, res, next) => {
  try {
    const existing = await PostcardModel.findById(req.params.id);
    if (!existing) {
      throw new NotFoundError('Postcard not found');
    }

    const postcard = await PostcardModel.update(req.params.id, req.validatedBody);

    res.json({
      success: true,
      message: 'Postcard updated successfully',
      data: postcard
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const postcard = await PostcardModel.delete(req.params.id);
    if (!postcard) {
      throw new NotFoundError('Postcard not found');
    }

    res.json({
      success: true,
      message: 'Postcard deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
