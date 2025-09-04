import { Server, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '../types';
import { db } from './database';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function setupSocketHandlers(io: Server<ClientToServerEvents, ServerToClientEvents>) {
  io.on('connection', (socket: TypedSocket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Join room
    socket.on('room:join', async (roomId: string) => {
      try {
        socket.join(roomId);
        console.log(`👥 Socket ${socket.id} joined room ${roomId}`);
        
        // Get user data from auth token if available
        const authHeader = socket.handshake.headers.authorization;
        let userData = { id: socket.id, name: 'Usuário Anônimo' };
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
          try {
            const token = authHeader.slice(7);
            // You'll need to implement token verification here
            // For now, we'll use socket.id as fallback
            userData = { id: socket.id, name: `Usuário ${socket.id.slice(0, 6)}` };
          } catch (error) {
            console.log('Could not verify token for socket user data');
          }
        }
        
        // Notify others in the room
        socket.to(roomId).emit('room:joined', { 
          roomId, 
          user: userData
        });
      } catch (error) {
        console.error('Error joining room:', error);
      }
    });

    // Leave room
    socket.on('room:leave', async (roomId: string) => {
      try {
        socket.leave(roomId);
        console.log(`👋 Socket ${socket.id} left room ${roomId}`);
        
        // Notify others in the room
        socket.to(roomId).emit('room:left', { 
          roomId, 
          user: { id: socket.id, name: `Usuário ${socket.id.slice(0, 6)}` }
        });
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });

    // Send message
    socket.on('message:send', async (data) => {
      try {
        const message = await db.prisma.message.create({
          data: {
            content: data.content,
            roomId: data.roomId,
            userId: data.userId,
            role: data.role || 'USER',
          },
          include: {
            user: true,
            room: true,
          },
        });

        // Broadcast to all users in the room
        io.to(data.roomId).emit('message:new', message);
        console.log(`💬 New message in room ${data.roomId}`);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Typing indicator
    socket.on('message:typing', (data) => {
      socket.to(data.roomId).emit('message:typing', {
        roomId: data.roomId,
        user: { id: socket.id, name: `Usuário ${socket.id.slice(0, 6)}` },
        isTyping: data.isTyping,
      });
    });

    // Create idea
    socket.on('idea:create', async (data) => {
      try {
        const idea = await db.prisma.idea.create({
          data: {
            title: data.title,
            description: data.description || null,
            roomId: data.roomId,
            userId: data.userId || '',
          },
          include: {
            user: true,
            room: true,
            votes: true,
            tags: true,
          },
        });

        // Broadcast to all users in the room
        io.to(data.roomId).emit('idea:new', idea);
        console.log(`💡 New idea in room ${data.roomId}`);
      } catch (error) {
        console.error('Error creating idea:', error);
      }
    });

    // Vote on idea
    socket.on('idea:vote', async (data) => {
      try {
        // Check if user already voted
        const existingVote = await db.prisma.vote.findUnique({
          where: {
            userId_ideaId: {
              userId: data.userId,
              ideaId: data.ideaId,
            },
          },
        });

        if (existingVote) {
          // Update existing vote
          await db.prisma.vote.update({
            where: { id: existingVote.id },
            data: { value: data.value },
          });
        } else {
          // Create new vote
          await db.prisma.vote.create({
            data: {
              userId: data.userId,
              ideaId: data.ideaId,
              value: data.value,
            },
          });
        }

        // Calculate new score
        const votes = await db.prisma.vote.findMany({
          where: { ideaId: data.ideaId },
        });
        
        const newScore = votes.reduce((sum, vote) => sum + vote.value, 0);

        // Update idea score
        await db.prisma.idea.update({
          where: { id: data.ideaId },
          data: { score: newScore },
        });

        // Get room ID for broadcasting
        const idea = await db.prisma.idea.findUnique({
          where: { id: data.ideaId },
          select: { roomId: true },
        });

        if (idea) {
          // Broadcast score update
          io.to(idea.roomId).emit('idea:voted', {
            ideaId: data.ideaId,
            votes: newScore,
            roomId: idea.roomId,
          });
        }

        console.log(`🗳️ Vote on idea ${data.ideaId}, new score: ${newScore}`);
      } catch (error) {
        console.error('Error voting on idea:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
      
      // Notify all rooms this user was in that they left
      // Note: We should track which rooms the user was in, but for now we'll just broadcast disconnect
      socket.broadcast.emit('user:disconnected', { 
        roomId: 'global',
        user: { id: socket.id, name: `Usuário ${socket.id.slice(0, 6)}` }
      });
    });
  });

  console.log('🚀 Socket.IO handlers configured');
}


