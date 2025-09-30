import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    // Get user's team
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      include: { team: true },
    });

    if (!teamMember) {
      return NextResponse.json({ error: "No team found" }, { status: 404 });
    }

    // Get all categories for this team
    const categories = await prisma.jobCategory.findMany({
      where: { teamId: teamMember.teamId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    });

    // Get jobs based on category filter
    const jobsWhere: any = { teamId: teamMember.teamId };
    if (categoryId) {
      jobsWhere.categoryId = categoryId;
    }

    const jobs = await prisma.job.findMany({
      where: jobsWhere,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        categoryId: true,
      },
    });

    return NextResponse.json({
      categories,
      jobs,
    });
  } catch (error) {
    console.error("Error fetching filters:", error);
    return NextResponse.json(
      { error: "Failed to fetch filters" },
      { status: 500 }
    );
  }
}
