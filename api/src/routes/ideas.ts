import { Router } from 'express';
import { CreateIdeaSchema, VoteIdeaSchema, ApiResponse } from '../types';
import { db } from '../services/database';
import { optionalAuth, requireAuth } from '../middleware/auth';

const router = Router();

/**
 * GET /api/ideas/:roomId
 * Get ideas for a room
 * Auth: Optional (public viewing, enhanced experience if authenticated)
 */
router.get('/:roomId', optionalAuth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { sortBy = 'score' } = req.query;

    let orderBy: any = { score: 'desc' };
    if (sortBy === 'recent') {
      orderBy = { createdAt: 'desc' };
    }

    const ideas = await db.prisma.idea.findMany({
      where: { roomId },
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        votes: {
          select: {
            id: true,
            value: true,
            userId: true,
          },
        },
        tags: true,
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    // Map score to votes for frontend compatibility
    const mappedIdeas = ideas.map(idea => ({
      ...idea,
      votes: idea.score,
    }));

    const response: ApiResponse = {
      success: true,
      data: mappedIdeas,
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching ideas:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ideas',
    });
  }
});

/**
 * POST /api/ideas
 * Create a new idea
 * Auth: Required (user must be authenticated to create ideas)
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const validatedData = CreateIdeaSchema.parse(req.body);

    // Use authenticated user ID if not provided in body
    const ideaData = {
      title: validatedData.title,
      description: validatedData.description || null,
      roomId: validatedData.roomId,
      userId: validatedData.userId || req.user!.id,
    };

    const idea = await db.prisma.idea.create({
      data: ideaData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        votes: {
          select: {
            id: true,
            value: true,
            userId: true,
          },
        },
        tags: true,
        room: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    // Map score to votes for frontend compatibility
    const mappedIdea = {
      ...idea,
      votes: idea.score,
    };

    // Emit idea to all users in the room via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(idea.roomId).emit('idea:new', mappedIdea);
      console.log(`💡 Idea broadcasted to room ${idea.roomId} via HTTP`);
    }

    const response: ApiResponse = {
      success: true,
      data: mappedIdea,
      message: 'Idea created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating idea:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create idea',
    });
  }
});

/**
 * POST /api/ideas/:id/vote
 * Vote on an idea
 * Auth: Required (user must be authenticated to vote)
 */
router.post('/:id/vote', requireAuth, async (req, res) => {
  try {
    const { id: ideaId } = req.params;
    const validatedData = VoteIdeaSchema.parse({
      ...req.body,
      ideaId,
      userId: req.body.userId || req.user!.id, // Use authenticated user ID
    });

    // Check if idea exists
    const idea = await db.prisma.idea.findUnique({
      where: { id: ideaId },
    });

    if (!idea) {
      return res.status(404).json({
        success: false,
        error: 'Idea not found',
      });
    }

    // Check if user already voted
    const existingVote = await db.prisma.vote.findUnique({
      where: {
        userId_ideaId: {
          userId: validatedData.userId,
          ideaId: validatedData.ideaId,
        },
      },
    });

    let vote;
    if (existingVote) {
      // Update existing vote
      vote = await db.prisma.vote.update({
        where: { id: existingVote.id },
        data: { value: validatedData.value },
      });
    } else {
      // Create new vote
      vote = await db.prisma.vote.create({
        data: {
          userId: validatedData.userId,
          ideaId: validatedData.ideaId,
          value: validatedData.value,
        },
      });
    }

    // Calculate new score
    const votes = await db.prisma.vote.findMany({
      where: { ideaId: validatedData.ideaId },
    });
    
    const newScore = votes.reduce((sum, v) => sum + v.value, 0);

    // Update idea score
    const updatedIdea = await db.prisma.idea.update({
      where: { id: validatedData.ideaId },
      data: { score: newScore },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        votes: {
          select: {
            id: true,
            value: true,
            userId: true,
          },
        },
        tags: true,
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    // Emit vote update to all users in the room via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(updatedIdea.roomId).emit('idea:voted', {
        ideaId: updatedIdea.id,
        votes: newScore,
        roomId: updatedIdea.roomId
      });
      console.log(`🗳️ Vote broadcasted to room ${updatedIdea.roomId} via HTTP`);
    }

    const response: ApiResponse = {
      success: true,
      data: {
        idea: updatedIdea,
        vote,
      },
      message: 'Vote recorded successfully',
    };

    res.json(response);
  } catch (error) {
    console.error('Error voting on idea:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to vote on idea',
    });
  }
});

/**
 * GET /api/ideas/details/:id
 * Get idea details
 */
router.get('/details/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const idea = await db.prisma.idea.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        votes: {
          select: {
            id: true,
            value: true,
            userId: true,
          },
        },
        tags: true,
        room: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    if (!idea) {
      return res.status(404).json({
        success: false,
        error: 'Idea not found',
      });
    }

    const response: ApiResponse = {
      success: true,
      data: idea,
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching idea:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch idea',
    });
  }
});

export default router;
