import { NextRequest, NextResponse } from 'next/server';
import { initialLiquidityService } from '@/services/Firebase/initial-liquidity-service';

// POST - Recalcular y guardar liquidez inicial basado en el mes anterior
// Body: { userId, monthPeriod }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, monthPeriod } = body;

    if (!userId || !monthPeriod) {
      return NextResponse.json(
        { error: 'userId y monthPeriod son requeridos' },
        { status: 400 }
      );
    }

    const liquidity =
      await initialLiquidityService.recalculateAndSaveInitialLiquidity(
        userId,
        monthPeriod
      );

    return NextResponse.json({
      success: true,
      data: liquidity,
      message: 'Liquidez inicial recalculada correctamente',
    });
  } catch (error) {
    console.error('Error en POST /api/initial-liquidity/recalculate:', error);
    return NextResponse.json(
      { error: 'Error al recalcular liquidez inicial' },
      { status: 500 }
    );
  }
}
