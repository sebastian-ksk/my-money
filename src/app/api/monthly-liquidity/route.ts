import { NextRequest, NextResponse } from 'next/server';
import { monthlyLiquidityService } from '@/services/Firebase/monthly-liquidity-service';

// GET - Obtener liquidez mensual
// Query params: userId, monthPeriod
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const monthPeriod = searchParams.get('monthPeriod');

    if (!userId || !monthPeriod) {
      return NextResponse.json(
        { error: 'userId y monthPeriod son requeridos' },
        { status: 400 }
      );
    }

    const liquidity = await monthlyLiquidityService.getMonthlyLiquidity(
      userId,
      monthPeriod
    );

    return NextResponse.json({
      success: true,
      data: liquidity,
    });
  } catch (error) {
    console.error('Error en GET /api/monthly-liquidity:', error);
    return NextResponse.json(
      { error: 'Error al obtener liquidez mensual' },
      { status: 500 }
    );
  }
}

// POST - Crear o actualizar liquidez mensual
// Body: { userId, monthPeriod, expectedAmount?, realAmount?, totalExpenses?, totalIncomes?, finalBalance?, dayOfMonth? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, monthPeriod, ...data } = body;

    if (!userId || !monthPeriod) {
      return NextResponse.json(
        { error: 'userId y monthPeriod son requeridos' },
        { status: 400 }
      );
    }

    const liquidity = await monthlyLiquidityService.createOrUpdateMonthlyLiquidity(
      userId,
      monthPeriod,
      data
    );

    return NextResponse.json({
      success: true,
      data: liquidity,
    });
  } catch (error) {
    console.error('Error en POST /api/monthly-liquidity:', error);
    return NextResponse.json(
      { error: 'Error al crear/actualizar liquidez mensual' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar liquidez mensual
// Body: { userId, monthPeriod, expectedAmount?, realAmount?, totalExpenses?, totalIncomes?, finalBalance? }
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, monthPeriod, ...data } = body;

    if (!userId || !monthPeriod) {
      return NextResponse.json(
        { error: 'userId y monthPeriod son requeridos' },
        { status: 400 }
      );
    }

    const liquidity = await monthlyLiquidityService.createOrUpdateMonthlyLiquidity(
      userId,
      monthPeriod,
      data
    );

    return NextResponse.json({
      success: true,
      data: liquidity,
    });
  } catch (error) {
    console.error('Error en PUT /api/monthly-liquidity:', error);
    return NextResponse.json(
      { error: 'Error al actualizar liquidez mensual' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar liquidez mensual
// Query params: userId, monthPeriod
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const monthPeriod = searchParams.get('monthPeriod');

    if (!userId || !monthPeriod) {
      return NextResponse.json(
        { error: 'userId y monthPeriod son requeridos' },
        { status: 400 }
      );
    }

    await monthlyLiquidityService.deleteMonthlyLiquidity(userId, monthPeriod);

    return NextResponse.json({
      success: true,
      message: 'Liquidez mensual eliminada correctamente',
    });
  } catch (error) {
    console.error('Error en DELETE /api/monthly-liquidity:', error);
    return NextResponse.json(
      { error: 'Error al eliminar liquidez mensual' },
      { status: 500 }
    );
  }
}
