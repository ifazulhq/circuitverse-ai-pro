import { prisma } from "@/lib/prisma";

type SaveAIInteractionInput = {
  userId: string;
  projectId: string;
  userMessage: string;
  assistantMessage: string;
  chatId?: string;
};

type SaveAIInteractionResult = {
  chatId: string;
};

export async function saveAIInteraction(
  input: SaveAIInteractionInput
): Promise<SaveAIInteractionResult> {
  const {
    userId,
    projectId,
    userMessage,
    assistantMessage,
    chatId,
  } = input;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  let currentChatId = chatId;

if (currentChatId) {
  const existingChat = await prisma.aIChat.findFirst({
    where: {
      id: currentChatId,
      projectId: project.id,
    },
    select: {
      id: true,
    },
  });

  if (!existingChat) {
    throw new Error("AI chat not found");
  }
} else {
  const newChat = await prisma.aIChat.create({
    data: {
      projectId: project.id,
    },
    select: {
      id: true,
    },
  });

  currentChatId = newChat.id;
}

await prisma.aIMessage.create({
  data: {
    chatId: currentChatId,
    role: "user",
    content: userMessage,
  },
});

await prisma.aIMessage.create({
  data: {
    chatId: currentChatId,
    role: "assistant",
    content: assistantMessage,
  },
});

await prisma.aIChat.update({
  where: {
    id: currentChatId,
  },
  data: {
    updatedAt: new Date(),
  },
});

return {
  chatId: currentChatId,
};
}