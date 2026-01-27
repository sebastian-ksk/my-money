import { NextRequest, NextResponse } from 'next/server';
import { monthlyLiquidityService } from '@/services/Firebase/monthly-liquidity-service';

// POST - Agregar fuente de liquidez
// Body: { userId, monthPeriod, source: { name, expectedAmount, realAmount } }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, monthPeriod, source } = body;

    if (!userId || !monthPeriod || !source) {
      return NextResponse.json(
        { error: 'userId, monthPeriod y source son requeridos' },
        { status: 400 }
      );
    }

    const liquidity = await monthlyLiquidityService.addLiquiditySource(
      userId,
      monthPeriod,
      source
    );

    return NextResponse.json({
      success: true,
      data: liquidity,
    });
  } catch (error) {
    console.error('Error en POST /api/monthly-liquidity/sources:', error);
    return NextResponse.json(
      { error: 'Error al agregar fuente de liquidez' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar fuente de liquidez
// Body: { userId, monthPeriod, sourceId, updates }
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, monthPeriod, sourceId, updates } = body;

    if (!userId || !monthPeriod || !sourceId) {
      return NextResponse.json(
        { error: 'userId, monthPeriod y sourceId son requeridos' },
        { status: 400 }
      );
    }

    const liquidity = await monthlyLiquidityService.updateLiquiditySource(
      userId,
      monthPeriod,
      sourceId,
      updates || {}
    );

    return NextResponse.json({
      success: true,
      data: liquidity,
    });
  } catch (error) {
    console.error('Error en PUT /api/monthly-liquidity/sources:', error);
    return NextResponse.json(
      { error: 'Error al actualizar fuente de liquidez' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar fuente de liquidez
// Query params: userId, monthPeriod, sourceId
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const monthPeriod = searchParams.get('monthPeriod');
    const sourceId = searchParams.get('sourceId');

    if (!userId || !monthPeriod || !sourceId) {
      return NextResponse.json(
        { error: 'userId, monthPeriod y sourceId son requeridos' },
        { status: 400 }
      );
    }

    const liquidity = await monthlyLiquidityService.deleteLiquiditySource(
      userId,
      monthPeriod,
      sourceId
    );

    return NextResponse.json({
      success: true,
      data: liquidity,
    });
  } catch (error) {
    console.error('Error en DELETE /api/monthly-liquidity/sources:', error);
    return NextResponse.json(
      { error: 'Error al eliminar fuente de liquidez' },
      { status: 500 }
    );
  }
}
