import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      passwordHash: true,
    },
  });
  
  console.log('Toplam kullanıcı:', users.length);
  users.forEach(u => {
    console.log(`- ${u.email} (${u.role}) - Password: ${u.passwordHash ? 'VAR' : 'YOK'}`);
  });
}

main()
  .finally(() => prisma.$disconnect());
