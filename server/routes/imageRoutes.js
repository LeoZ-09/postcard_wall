import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ImageModel } from '../../database/models/ImageModel.js';
import { imageQuerySchema, paginationSchema } from '../middleware/validation.js';
import { validateQuery } from '../middleware/validation.js';
import { NotFoundError } from '../middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadsDir = path.join(__dirname, '../../../uploads');
const imagesDir = path.join(uploadsDir, 'images');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

async function getImageHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function processImage(buffer) {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  const processedBuffer = await image
    .rotate()
    .toBuffer();

  return {
    buffer: processedBuffer,
    width: metadata.width,
    height: metadata.height
  };
}

router.post('/upload', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const hash = await getImageHash(req.file.buffer);

    const existingImage = await ImageModel.findByHash(hash);
    if (existingImage) {
      return res.status(200).json({
        success: true,
        message: 'Image already exists, reusing existing file',
        data: existingImage,
        reused: true
      });
    }

    const { buffer, width, height } = await processImage(req.file.buffer);

    const ext = path.extname(req.file.originalname) || '.jpg';
    const filename = `${hash}${ext}`;
    const filepath = path.join(imagesDir, filename);

    await sharp(buffer).toFile(filepath);

    const imageData = await ImageModel.create({
      filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: buffer.length,
      hash,
      width,
      height
    });

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: imageData,
      reused: false
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', validateQuery(paginationSchema), async (req, res, next) => {
  try {
    const { page, limit } = req.validatedQuery;
    const result = await ImageModel.findAll({ page, limit });

    const imagesWithUrls = result.data.map(img => ({
      ...img,
      url: `/uploads/images/${img.filename}`
    }));

    res.json({
      success: true,
      data: imagesWithUrls,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const image = await ImageModel.findById(req.params.id);
    if (!image) {
      throw new NotFoundError('Image not found');
    }

    res.json({
      success: true,
      data: {
        ...image,
        url: `/uploads/images/${image.filename}`
      }
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const image = await ImageModel.delete(req.params.id);
    if (!image) {
      throw new NotFoundError('Image not found');
    }

    const filepath = path.join(imagesDir, image.filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: image
    });
  } catch (error) {
    next(error);
  }
});

export default router;
