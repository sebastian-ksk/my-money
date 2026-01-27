import { NextRequest, NextResponse } from 'next/server';
import { savingsService } from '@/services/Firebase/savings-service';

// GET - Obtener fuentes de ahorro con balance
// Query params: userId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }

    const sources = await savingsService.getSavingsSourcesWithBalance(userId);
    const totalBalance = await savingsService.getTotalSavingsBalance(userId);

    return NextResponse.json({
      success: true,
      data: {
        sources,
        totalBalance,
      },
    });
  } catch (error) {
    console.error('Error en GET /api/savings/sources:', error);
    return NextResponse.json(
      { error: 'Error al obtener fuentes de ahorro' },
      { status: 500 }
    );
  }
}

// POST - Recalcular balance de una fuente
// Body: { savingsSourceId }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { savingsSourceId } = body;

    if (!savingsSourceId) {
      return NextResponse.json(
        { error: 'savingsSourceId es requerido' },
        { status: 400 }
      );
    }

    const source = await savingsService.recalculateSavingsSourceBalance(savingsSourceId);

    return NextResponse.json({
      success: true,
      data: source,
    });
  } catch (error) {
    console.error('Error en POST /api/savings/sources:', error);
    return NextResponse.json(
      { error: 'Error al recalcular balance de fuente' },
      { status: 500 }
    );
  }
}
