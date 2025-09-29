import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Hello, world!" });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ message: "Hello, world!", body });
}

export async function DELETE(request: Request) {
  const body = await request.json();
  return NextResponse.json({ message: "Hello, world!", body });
}

export async function PUT(request: Request) {
  const body = await request.json();
  return NextResponse.json({ message: "Hello, world!", body });
}