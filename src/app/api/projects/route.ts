// Nexorium Core - Projects API
// GET /api/projects - List all projects with environments
// POST /api/projects - Create new project

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getProjects, createProject } from '@/lib/services/project';

const CreateProjectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters').max(255),
  code: z.string().max(50).optional(),
  description: z.string().max(1000).optional(),
  ownerTeam: z.string().max(255).optional(),
  ownerEmail: z.string().email().optional().or(z.literal('')),
  businessUnit: z.string().max(255).optional(),
  costCenter: z.string().max(100).optional(),
});

export async function GET() {
  try {
    const projects = await getProjects();
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = CreateProjectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    // Clean up empty strings
    const data = {
      ...validation.data,
      ownerEmail: validation.data.ownerEmail || undefined,
    };

    const project = await createProject(data);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'A project with this name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
