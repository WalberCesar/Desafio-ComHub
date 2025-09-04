import { Router } from 'express';
import { CreateMessageSchema, ApiResponse, PaginatedResponse, MessageRole } from '../types';
import { db } from '../services/database';
import { optionalAuth, requireAuth } from '../middleware/auth';
import { AIService } from '../services/aiService';

const router = Router();

// Função processAIRequest removida - implementação direta no endpoint

/**
 * GET /api/messages/:roomId
 * Get messages for a room with cursor-based pagination
 * Auth: Optional (shows public messages, with user context if authenticated)
 */
router.get('/:roomId', optionalAuth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { cursor, limit = '20' } = req.query;

    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);

    // Build where clause
    const where: any = { roomId };
    if (cursor) {
      where.id = { lt: cursor as string };
    }

    const messages = await db.prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limitNum + 1, // Take one extra to check if there are more
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
      },
    });

    const hasMore = messages.length > limitNum;
    const data = hasMore ? messages.slice(0, -1) : messages;
    const nextCursor = hasMore ? data[data.length - 1]?.id : undefined;

    const response: PaginatedResponse<typeof data[0]> = {
      data: data.reverse(), // Reverse to show oldest first
      pagination: {
        cursor: nextCursor,
        hasMore,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
    });
  }
});

/**
 * POST /api/messages
 * Create a new message
 * Auth: Required (user must be authenticated to send messages)
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const validatedData = CreateMessageSchema.parse(req.body);
    
    // Debug: log raw body to see what's being received
    console.log('🔍 Raw request body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 triggerAI no body:', req.body.triggerAI, typeof req.body.triggerAI);
    console.log('🔍 validatedData.triggerAI:', validatedData.triggerAI, typeof validatedData.triggerAI);

    // Use authenticated user ID if not provided in body (exclude triggerAI from message data)
    const messageData = {
      content: validatedData.content,
      roomId: validatedData.roomId,
      role: validatedData.role,
      userId: validatedData.userId || req.user!.id,
    };

    const message = await db.prisma.message.create({
      data: messageData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        tags: true,
        room: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Emit message to all users in the room via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(message.roomId).emit('message:new', message);
      console.log(`💬 Message broadcasted to room ${message.roomId} via HTTP`);
    }
    // 🤖 IA GROQ REAL - INTEGRAÇÃO COMPLETA CONFORME DESAFIO
    if (validatedData.triggerAI === true) {
      console.log(`🤖 [IA GROQ] Solicitação recebida! Processando com Groq...`);
      
      // Processar IA de forma assíncrona para não bloquear resposta
      setTimeout(async () => {
        try {
          console.log(`🤖 [GROQ] Iniciando processamento para sala ${message.roomId}...`);
          
          // Gerar resposta completa usando Groq REAL
          const aiResponse = await AIService.generateCompleteResponse(message.roomId);
          
          // Buscar ou criar usuário IA
          let aiUser = await db.prisma.user.findFirst({
            where: { name: 'Assistente IA' }
          });

          if (!aiUser) {
            aiUser = await db.prisma.user.create({
              data: { name: 'Assistente IA', isGuest: false }
            });
          }

          // Construir conteúdo da mensagem formatado
          const aiContent = `🤖 **Assistente IA (Groq)**\n\n📊 **Resumo**:\n${aiResponse.summary}\n\n🏷️ **Tags**: ${aiResponse.tags.join(', ')}\n\n🎯 **Pitch**:\n${aiResponse.pitch}`;

          // Criar mensagem da IA no banco de dados
          const aiMessage = await db.prisma.message.create({
            data: {
              content: aiContent,
              roomId: message.roomId,
              role: MessageRole.ASSISTANT,
              userId: aiUser.id,
            },
            include: {
              user: { select: { id: true, name: true } },
              tags: true,
              room: { select: { id: true, name: true } }
            }
          });

          console.log(`🤖 [GROQ] Mensagem IA criada com sucesso: ${aiMessage.id}`);

          // Enviar via Socket.IO para todos os clientes conectados
          if (io) {
            io.to(message.roomId).emit('message:new', aiMessage);
            io.to(message.roomId).emit('ai:summary', { 
              roomId: message.roomId, 
              summary: aiResponse.summary 
            });
            io.to(message.roomId).emit('ai:tags', { 
              roomId: message.roomId, 
              tags: aiResponse.tags 
            });
            io.to(message.roomId).emit('ai:pitch', { 
              roomId: message.roomId, 
              pitch: aiResponse.pitch 
            });
            console.log(`🤖 [GROQ] Resposta completa enviada via Socket.IO`);
          }

        } catch (error) {
          console.error('❌ [GROQ] Erro ao processar IA:', error);
          
          // Enviar mensagem de erro
          if (io) {
            io.to(message.roomId).emit('ai:error', { 
              roomId: message.roomId, 
              error: 'Erro ao processar solicitação da IA' 
            });
          }
        }
      }, 1000); // 1 segundo de delay para melhor UX
    } else {
      console.log(`❌ [IA] triggerAI = ${validatedData.triggerAI} (não ativada)`);
    }

    const response: ApiResponse = {
      success: true,
      data: message,
      message: 'Message created successfully',
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating message:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create message',
    });
  }
});

/**
 * GET /api/messages/:roomId/latest
 * Get latest messages for AI processing
 */
router.get('/:roomId/latest', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = '10' } = req.query;

    const limitNum = Math.min(parseInt(limit as string, 10) || 10, 50);

    const messages = await db.prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
      take: limitNum,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const response: ApiResponse = {
      success: true,
      data: messages.reverse(), // Reverse to show chronological order
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching latest messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch latest messages',
    });
  }
});

export default router;
