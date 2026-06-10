import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Report from '@/models/BattleReport';

// Обробка отримання даних профілю
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    let login = null;

    // Ідентифікація користувача
    const sessionToken = req.cookies.get('session_token')?.value;
    if (sessionToken) {
      login = sessionToken;
    } else {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token?.login) {
        login = token.login;
      }
    }

    if (!login) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ login: login });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Підрахунок активності (кількість звітів автора)
    const count = await Report.countDocuments({ authorLogin: user.login });

    return NextResponse.json({
      id: user._id.toString(),
      userId: user._id.toString(),
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      position: user.position,
      unit: user.unit,
      rank: user.rank,
      createdAt: user.createdAt,
      count: count
    });

  } catch (error) {
    console.error("Помилка профілю:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Обробка оновлення даних профілю
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    let login = null;

    // Ідентифікація користувача
    const sessionToken = req.cookies.get('session_token')?.value;
    if (sessionToken) {
      login = sessionToken;
    } else {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token?.login) login = token.login;
    }

    if (!login) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Отримання нових даних
    const body = await req.json();
    const { firstName, lastName, position, unit, rank } = body;

    // Оновлення в базі
    const updatedUser = await User.findOneAndUpdate(
      { login: login },
      { 
        $set: { 
          firstName, 
          lastName, 
          position, 
          unit, 
          rank 
        } 
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile updated', user: updatedUser });

  } catch (error) {
    console.error("Помилка оновлення профілю:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}