import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  console.log('🧹 Limpando dados existentes...');
  await prisma.vote.deleteMany();
  await prisma.idea.deleteMany();
  await prisma.message.deleteMany();
  await prisma.user.deleteMany();
  await prisma.room.deleteMany();
  await prisma.tag.deleteMany();

  console.log('👥 Criando usuários...');
  const user1 = await prisma.user.create({
    data: {
      name: 'Ana Silva',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'João Santos',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Maria Costa',
    },
  });

  console.log('🏠 Criando salas...');
  const room1 = await prisma.room.create({
    data: {
      name: 'Brainstorming Geral',
      description: 'Sala para ideias e discussões gerais sobre o projeto',
    },
  });

  const room2 = await prisma.room.create({
    data: {
      name: 'Inovação em Tecnologia',
      description: 'Discussão sobre novas tecnologias e tendências',
    },
  });

  console.log('💬 Criando mensagens...');
  await prisma.message.create({
    data: {
      content: 'Olá pessoal! Vamos começar nosso brainstorming?',
      role: 'USER',
      userId: user1.id,
      roomId: room1.id,
    },
  });

  await prisma.message.create({
    data: {
      content: 'Ótima ideia! Que tal começarmos discutindo os principais desafios?',
      role: 'USER',
      userId: user2.id,
      roomId: room1.id,
    },
  });

  await prisma.message.create({
    data: {
      content: 'Concordo! Podemos focar em soluções sustentáveis.',
      role: 'USER',
      userId: user3.id,
      roomId: room1.id,
    },
  });

  console.log('💡 Criando ideias...');
  const idea1 = await prisma.idea.create({
    data: {
      title: 'App de Carona Sustentável',
      description: 'Aplicativo que conecta pessoas para compartilhar viagens, reduzindo emissões de CO2',
      userId: user1.id,
      roomId: room1.id,
    },
  });

  const idea2 = await prisma.idea.create({
    data: {
      title: 'Plataforma de Reciclagem Inteligente',
      description: 'Sistema que gamifica a reciclagem e conecta pessoas com pontos de coleta',
      userId: user2.id,
      roomId: room1.id,
    },
  });

  console.log('🗳️  Criando votos...');
  await prisma.vote.create({
    data: {
      userId: user2.id,
      ideaId: idea1.id,
      value: 1,
    },
  });

  await prisma.vote.create({
    data: {
      userId: user3.id,
      ideaId: idea1.id,
      value: 1,
    },
  });

  await prisma.vote.create({
    data: {
      userId: user1.id,
      ideaId: idea2.id,
      value: 1,
    },
  });

  await prisma.idea.update({
    where: { id: idea1.id },
    data: { score: 2 },
  });

  await prisma.idea.update({
    where: { id: idea2.id },
    data: { score: 1 },
  });

  console.log('🏷️  Criando tags...');
  await prisma.tag.createMany({
    data: [
      { name: 'sustentabilidade' },
      { name: 'tecnologia' },
      { name: 'inovação' },
      { name: 'meio-ambiente' },
      { name: 'mobilidade' },
    ],
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log(`👥 Usuários criados: ${user1.name}, ${user2.name}, ${user3.name}`);
  console.log(`🏠 Salas criadas: ${room1.name}, ${room2.name}`);
  console.log(`💡 Ideias criadas: ${idea1.title}, ${idea2.title}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
