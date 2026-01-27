import { NextRequest, NextResponse } from 'next/server';
import { initialLiquidityService } from '@/services/Firebase/initial-liquidity-service';

// POST - Recalcular el calculatedAmount basado en el mes anterior
// No afecta el realAmount si existe
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

    const liquidity = await initialLiquidityService.recalculateInitialLiquidity(
      userId,
      monthPeriod
    );

    const effectiveAmount = liquidity.realAmount ?? liquidity.calculatedAmount;

    return NextResponse.json({
      success: true,
      data: {
        liquidity,
        effectiveAmount,
        wasCalculated: liquidity.realAmount === null,
      },
      message: 'Valor calculado actualizado correctamente',
    });
  } catch (error) {
    console.error('Error en POST /api/initial-liquidity/recalculate:', error);
    return NextResponse.json(
      { error: 'Error al recalcular liquidez inicial' },
      { status: 500 }
    );
  }
}
