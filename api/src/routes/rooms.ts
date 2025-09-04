import { Router } from 'express';
import { CreateRoomSchema, ApiResponse } from '../types';
import { db } from '../services/database';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const rooms = await db.prisma.room.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            messages: true,
            ideas: true,
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: rooms,
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rooms',
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const validatedData = CreateRoomSchema.parse(req.body);

    const room = await db.prisma.room.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            messages: true,
            ideas: true,
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: room,
      message: 'Room created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating room:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create room',
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const room = await db.prisma.room.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            messages: true,
            ideas: true,
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found',
      });
    }

    const response: ApiResponse = {
      success: true,
      data: room,
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch room',
    });
  }
});

export default router;


