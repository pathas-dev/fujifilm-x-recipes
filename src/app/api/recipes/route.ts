import { NextResponse } from 'next/server';
import { getAllDocuments } from '../mongodb';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET() {
  try {
    const data = await getAllDocuments('recipes');
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.error();
  }
}
