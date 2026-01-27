import { NextRequest, NextResponse } from 'next/server';
import { initialLiquidityService } from '@/services/Firebase/initial-liquidity-service';

// GET - Obtener historial de liquidez inicial
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

    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: 'limit debe ser un número positivo' },
        { status: 400 }
      );
    }

    const history = await initialLiquidityService.getInitialLiquidityHistory(
      userId,
      limit
    );

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error en GET /api/initial-liquidity/history:', error);
    return NextResponse.json(
      { error: 'Error al obtener historial de liquidez inicial' },
      { status: 500 }
    );
  }
}
