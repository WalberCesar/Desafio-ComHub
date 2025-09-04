// =============================================================================
// SERVIÇO DE IA - PitchLab com Integração Groq REAL
// =============================================================================

import Groq from 'groq-sdk';
import { db } from './database';
import { MessageRole } from '../types';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama3-8b-8192';

export class AIService {
  /**
   * Busca as mensagens recentes de uma sala
   * @param roomId ID da sala
   * @param limit Número máximo de mensagens
   * @returns Array de mensagens
   */
  private static async getRecentMessages(roomId: string, limit = 20) {
    const messages = await db.prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { name: true }
        }
      }
    });
    
    return messages.reverse(); // Ordem cronológica
  }

  /**
   * Gera um resumo das últimas mensagens de uma sala usando Groq.
   * @param roomId ID da sala
   * @returns Resumo da conversa
   */
  static async generateSummary(roomId: string): Promise<string> {
    try {
      console.log(`🤖 [AIService] Gerando resumo para sala ${roomId}...`);
      
      const messages = await this.getRecentMessages(roomId);
      
      if (messages.length === 0) {
        return '📊 **Resumo**: Nenhuma mensagem encontrada nesta sala ainda.';
      }

      // Preparar contexto da conversa para o Groq
      const conversationContext = messages.map(msg => 
        `${msg.user?.name || 'Usuário'}: ${msg.content}`
      ).join('\n');

      const prompt = `Analise a seguinte conversa e gere um resumo estruturado em português brasileiro:

${conversationContext}

Gere um resumo que inclua:
- Número de mensagens e participantes
- Principais tópicos discutidos
- Tom da conversa
- Pontos-chave mencionados

Formato: Use marcadores e seja conciso. Máximo 200 palavras.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente especializado em resumir conversas de forma clara e estruturada.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: GROQ_MODEL,
        temperature: 0.3,
        max_tokens: 300,
      });

      const summary = completion.choices[0]?.message?.content || 'Não foi possível gerar o resumo.';
      console.log(`📊 [AIService] Resumo gerado com sucesso`);
      return summary;

    } catch (error) {
      console.error('❌ [AIService] Erro ao gerar resumo:', error);
      return '📊 **Resumo**: Erro ao processar a conversa com a IA.';
    }
  }

  /**
   * Sugere tags com base nas últimas mensagens de uma sala usando Groq.
   * @param roomId ID da sala
   * @returns Array de tags
   */
  static async generateTags(roomId: string): Promise<string[]> {
    try {
      console.log(`🏷️ [AIService] Gerando tags para sala ${roomId}...`);
      
      const messages = await this.getRecentMessages(roomId);
      
      if (messages.length === 0) {
        return ['conversa', 'iniciante'];
      }

      const conversationContext = messages.map(msg => msg.content).join(' ');

      const prompt = `Analise o seguinte texto e extraia 3-5 tags relevantes em português brasileiro:

${conversationContext}

Retorne apenas as tags separadas por vírgula, sem numeração ou explicações.
Exemplo: tecnologia, inovação, colaboração, produtividade`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em extrair tags relevantes de conversas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: GROQ_MODEL,
        temperature: 0.2,
        max_tokens: 100,
      });

      const tagsText = completion.choices[0]?.message?.content || '';
      const tags = tagsText.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      console.log(`🏷️ [AIService] Tags geradas:`, tags);
      return tags.slice(0, 5); // Máximo 5 tags

    } catch (error) {
      console.error('❌ [AIService] Erro ao gerar tags:', error);
      return ['conversa', 'erro'];
    }
  }

  /**
   * Gera um pitch curto e estruturado a partir da conversa usando Groq.
   * @param roomId ID da sala
   * @returns Pitch da ideia
   */
  static async generatePitch(roomId: string): Promise<string> {
    try {
      console.log(`🎯 [AIService] Gerando pitch para sala ${roomId}...`);
      
      const messages = await this.getRecentMessages(roomId);
      
      if (messages.length === 0) {
        return '🎯 **Pitch**: Esta é uma nova conversa com potencial para grandes ideias!';
      }

      const conversationContext = messages.map(msg => msg.content).join(' ');

      const prompt = `Com base na seguinte conversa, gere um pitch curto e envolvente em português brasileiro:

${conversationContext}

O pitch deve:
- Ser motivador e positivo
- Destacar o valor da colaboração
- Ter máximo 150 palavras
- Incluir emoji apropriado no início
- Focar no potencial das ideias discutidas`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em criar pitches inspiradores e motivadores.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: GROQ_MODEL,
        temperature: 0.7,
        max_tokens: 200,
      });

      const pitch = completion.choices[0]?.message?.content || 'Esta conversa tem grande potencial!';
      console.log(`🎯 [AIService] Pitch gerado com sucesso`);
      return pitch;

    } catch (error) {
      console.error('❌ [AIService] Erro ao gerar pitch:', error);
      return '🎯 **Pitch**: Erro ao processar a conversa, mas o potencial está aqui!';
    }
  }

  /**
   * Gera resposta completa da IA com resumo, tags e pitch
   * @param roomId ID da sala
   * @returns Objeto com resumo, tags e pitch
   */
  static async generateCompleteResponse(roomId: string) {
    console.log(`🤖 [AIService] Gerando resposta completa para sala ${roomId}...`);
    
    const [summary, tags, pitch] = await Promise.all([
      this.generateSummary(roomId),
      this.generateTags(roomId),
      this.generatePitch(roomId)
    ]);

    return {
      summary,
      tags,
      pitch,
      timestamp: new Date().toISOString()
    };
  }
}