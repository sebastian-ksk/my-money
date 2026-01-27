import { NextRequest, NextResponse } from 'next/server';
import { monthlyLiquidityService } from '@/services/Firebase/monthly-liquidity-service';

// POST - Actualizar balances del mes
// Body: { userId, monthPeriod, initialLiquidity, transactions }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, monthPeriod, initialLiquidity, transactions } = body;

    if (!userId || !monthPeriod) {
      return NextResponse.json(
        { error: 'userId y monthPeriod son requeridos' },
        { status: 400 }
      );
    }

    const liquidity = await monthlyLiquidityService.updateBalances(
      userId,
      monthPeriod,
      initialLiquidity || 0,
      transactions || []
    );

    return NextResponse.json({
      success: true,
      data: liquidity,
    });
  } catch (error) {
    console.error('Error en POST /api/monthly-liquidity/balances:', error);
    return NextResponse.json(
      { error: 'Error al actualizar balances' },
      { status: 500 }
    );
  }
}
