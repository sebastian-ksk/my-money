import { NextRequest, NextResponse } from 'next/server';
import { monthlyLiquidityService } from '@/services/Firebase/monthly-liquidity-service';

// GET - Obtener historial de liquidez mensual
// Query params: userId, limit (optional, default 12)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 12;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }

    const history = await monthlyLiquidityService.getHistory(userId, limit);

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error en GET /api/monthly-liquidity/history:', error);
    return NextResponse.json(
      { error: 'Error al obtener historial' },
      { status: 500 }
    );
  }
}
