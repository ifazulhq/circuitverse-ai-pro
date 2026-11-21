import { auth } from "@auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getAuthenticatedUser() {
  const session = await auth();

  if (!session?.user?.email) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  const user = await prisma.user.findUnique({
  where: {
    email: session.user.email,
  },
  select: {
    id: true,
  },
});

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      ),
    };
  }

  return {
    user,
    response: null,
  };
}

async function getOwnedProject(
  projectId: string,
  userId: string
) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      userId,
    },
    select: {
      id: true,
    },
  });
}
function isValidCircuitData(data: unknown): boolean {
  if (!data || typeof data !== "object") {
    return false;
  }

  const circuit = data as {
    placedComponents?: unknown;
    connections?: unknown;
    sequentialState?: unknown;
  };

  if (!Array.isArray(circuit.placedComponents)) {
    return false;
  }

  if (!Array.isArray(circuit.connections)) {
    return false;
  }

  if (
    circuit.sequentialState !== undefined &&
    (
      circuit.sequentialState === null ||
      typeof circuit.sequentialState !== "object" ||
      Array.isArray(circuit.sequentialState)
    )
  ) {
    return false;
  }

  const componentIds = new Set<number>();

  for (const component of circuit.placedComponents) {
    if (!component || typeof component !== "object") {
      return false;
    }

    const item = component as {
      id?: unknown;
      type?: unknown;
      x?: unknown;
      y?: unknown;
      value?: unknown;
    };

    if (
      typeof item.id !== "number" ||
      !Number.isInteger(item.id)
    ) {
      return false;
    }

    if (componentIds.has(item.id)) {
      return false;
    }

    componentIds.add(item.id);

    if (
      typeof item.type !== "string" ||
      item.type.trim() === ""
    ) {
      return false;
    }

    if (
      typeof item.x !== "number" ||
      !Number.isFinite(item.x)
    ) {
      return false;
    }

    if (
      typeof item.y !== "number" ||
      !Number.isFinite(item.y)
    ) {
      return false;
    }

    if (
      item.value !== undefined &&
      item.value !== 0 &&
      item.value !== 1
    ) {
      return false;
    }
  }

  const connectionIds = new Set<number>();

  for (const connection of circuit.connections) {
    if (!connection || typeof connection !== "object") {
      return false;
    }

    const item = connection as {
      id?: unknown;
      sourceId?: unknown;
      targetId?: unknown;
      sourcePort?: unknown;
    };

    if (
      typeof item.id !== "number" ||
      !Number.isInteger(item.id)
    ) {
      return false;
    }

    if (connectionIds.has(item.id)) {
      return false;
    }

    connectionIds.add(item.id);

    if (
      typeof item.sourceId !== "number" ||
      !Number.isInteger(item.sourceId) ||
      typeof item.targetId !== "number" ||
      !Number.isInteger(item.targetId)
    ) {
      return false;
    }

    if (
      !componentIds.has(item.sourceId) ||
      !componentIds.has(item.targetId)
    ) {
      return false;
    }

    if (item.sourceId === item.targetId) {
      return false;
    }

    if (
      item.sourcePort !== undefined &&
      (
        typeof item.sourcePort !== "number" ||
        !Number.isInteger(item.sourcePort) ||
        item.sourcePort < 0
      )
    ) {
      return false;
    }
  }

  return true;
}

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const { user, response } = await getAuthenticatedUser();

    if (response) {
      return response;
    }

    const project = await getOwnedProject(id, user!.id);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const circuit = await prisma.circuit.findUnique({
      where: {
        projectId: id,
      },
    });

    if (!circuit) {
      return NextResponse.json(
        { error: "Circuit not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(circuit);
  } catch (error) {
    console.error("GET /api/projects/[id]/circuit error:", error);

    return NextResponse.json(
      { error: "Failed to fetch circuit" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const { user, response } = await getAuthenticatedUser();

    if (response) {
      return response;
    }

    const rateLimitResult = rateLimit(`circuit:${user!.id}`, 60, 60 * 1000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many circuit save requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const project = await getOwnedProject(id, user!.id);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { data, progress, completion } = body;

    if (data === undefined) {
      return NextResponse.json(
        { error: "Circuit data is required" },
        { status: 400 }
      );
    }

    if (!isValidCircuitData(data)) {
      return NextResponse.json(
        { error: "Invalid circuit data." },
        { status: 400 }
      );
    }

    const existingCircuit = await prisma.circuit.findUnique({
      where: {
        projectId: id,
      },
    });

    if (existingCircuit) {
      return NextResponse.json(
        { error: "Circuit already exists for this project" },
        { status: 409 }
      );
    }

    const circuit = await prisma.circuit.create({
      data: {
        projectId: id,
        data,
      },
    });

    const targetScore =
      typeof progress === "number"
        ? Math.min(100, Math.max(0, Math.round(progress)))
        : typeof completion === "number"
        ? Math.min(100, Math.max(0, Math.round(completion)))
        : undefined;

    if (targetScore !== undefined) {
      const nextStatus =
        targetScore === 100
          ? "Completed"
          : targetScore > 0
          ? "In Progress"
          : "Planning";

      await prisma.project.update({
        where: { id },
        data: {
          progress: targetScore,
          completion: targetScore,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json(circuit, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects/[id]/circuit error:", error);

    return NextResponse.json(
      { error: "Failed to create circuit" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const { user, response } = await getAuthenticatedUser();

    if (response) {
      return response;
    }

    const rateLimitResult = rateLimit(`circuit:${user!.id}`, 60, 60 * 1000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many circuit update requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const project = await getOwnedProject(id, user!.id);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { data, progress, completion } = body;

    if (data === undefined) {
      return NextResponse.json(
        { error: "Circuit data is required" },
        { status: 400 }
      );
    }

    if (!isValidCircuitData(data)) {
      return NextResponse.json(
        { error: "Invalid circuit data." },
        { status: 400 }
      );
    }

    const circuit = await prisma.circuit.upsert({
      where: {
        projectId: id,
      },
      create: {
        projectId: id,
        data,
      },
      update: {
        data,
      },
    });

    const targetScore =
      typeof progress === "number"
        ? Math.min(100, Math.max(0, Math.round(progress)))
        : typeof completion === "number"
        ? Math.min(100, Math.max(0, Math.round(completion)))
        : undefined;

    if (targetScore !== undefined) {
      const nextStatus =
        targetScore === 100
          ? "Completed"
          : targetScore > 0
          ? "In Progress"
          : "Planning";

      await prisma.project.update({
        where: { id },
        data: {
          progress: targetScore,
          completion: targetScore,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json(circuit);
  } catch (error) {
    console.error("PATCH /api/projects/[id]/circuit error:", error);

    return NextResponse.json(
      { error: "Failed to update circuit" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string" || id.trim() === "") {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    const { user, response } = await getAuthenticatedUser();

    if (response) {
      return response;
    }

    const project = await getOwnedProject(id, user!.id);

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const existingCircuit = await prisma.circuit.findUnique({
      where: {
        projectId: id,
      },
    });

    if (!existingCircuit) {
      return NextResponse.json(
        { error: "Circuit not found" },
        { status: 404 }
      );
    }

    await prisma.circuit.delete({
      where: {
        projectId: id,
      },
    });

    return NextResponse.json(
      { message: "Circuit deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE /api/projects/[id]/circuit error:", error);

    return NextResponse.json(
      { error: "Failed to delete circuit" },
      { status: 500 }
    );
  }
}