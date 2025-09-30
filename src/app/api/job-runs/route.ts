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

    // Pagination
    const page = Number.parseInt(searchParams.get("page") || "1");
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "50");

    // Filters
    const jobId = searchParams.get("jobId");
    const jobIds = searchParams.getAll("jobIds"); // Multiple job IDs
    const categoryId = searchParams.get("categoryId");
    const state = searchParams.get("state"); // OK, FAIL, TIMEOUT, RUNNING, QUEUED
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search"); // Search by job name

    // Sorting
    const sortBy = searchParams.get("sortBy") || "startedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Get user's team (assuming first team for now)
    const teamMember = await prisma.teamMember.findFirst({
      where: { userId: session.user.id },
      include: { team: true },
    });

    if (!teamMember) {
      return NextResponse.json({ error: "No team found" }, { status: 404 });
    }

    // Build where clause
    const where: any = {
      job: {
        teamId: teamMember.teamId,
      },
    };

    if (jobId) {
      where.jobId = jobId;
    }

    // Support multiple job IDs
    if (jobIds && jobIds.length > 0) {
      where.jobId = {
        in: jobIds,
      };
    }

    if (categoryId) {
      where.job = {
        ...where.job,
        categoryId: categoryId,
      };
    }

    if (state) {
      where.state = state;
    }

    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) {
        where.startedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.startedAt.lte = new Date(endDate);
      }
    }

    // For search by job name, we need to include job relation
    if (search) {
      where.job = {
        ...where.job,
        name: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    // Get total count
    const total = await prisma.jobRun.count({ where });

    // Get paginated runs
    const runs = await prisma.jobRun.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            name: true,
            categoryId: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json({
      runs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching job runs:", error);
    return NextResponse.json(
      { error: "Failed to fetch job runs" },
      { status: 500 }
    );
  }
}
