import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// crete new user
export async function POST(req: Request) {
  const { email, password } = await req.json();
  const session = await auth({
    email,
    password,
  });
  return NextResponse.json(session);
}
