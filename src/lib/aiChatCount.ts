import { prisma } from "@/lib/prisma";

export async function getAIChatCount(userId: string): Promise<number> {
  return prisma.aIChat.count({
    where: {
      project: {
        userId,
      },
    },
  });
}