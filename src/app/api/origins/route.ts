import { NextResponse } from 'next/server';
import { getAllDocuments } from '../mongodb';

export async function GET() {
  try {
    const data = await getAllDocuments('origins');
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.error();
  }
}
