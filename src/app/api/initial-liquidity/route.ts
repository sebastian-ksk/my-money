import { NextRequest, NextResponse } from 'next/server';
import { initialLiquidityService } from '@/services/Firebase/initial-liquidity-service';

// GET - Obtener liquidez inicial de un mes
// Query params: userId, monthPeriod
// Siempre retorna el documento con realAmount y calculatedAmount
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

    // Obtener o crear con valor calculado
    const result = await initialLiquidityService.getOrCalculateInitialLiquidity(
      userId,
      monthPeriod
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error en GET /api/initial-liquidity:', error);
    return NextResponse.json(
      { error: 'Error al obtener liquidez inicial' },
      { status: 500 }
    );
  }
}

// POST - Establecer el realAmount (valor manual del usuario)
// Body: { userId, monthPeriod, realAmount }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, monthPeriod, realAmount } = body;

    if (!userId || !monthPeriod || realAmount === undefined) {
      return NextResponse.json(
        { error: 'userId, monthPeriod y realAmount son requeridos' },
        { status: 400 }
      );
    }

    if (typeof realAmount !== 'number' || isNaN(realAmount)) {
      return NextResponse.json(
        { error: 'realAmount debe ser un número válido' },
        { status: 400 }
      );
    }

    const liquidity = await initialLiquidityService.updateRealAmount(
      userId,
      monthPeriod,
      realAmount
    );

    return NextResponse.json({
      success: true,
      data: liquidity,
    });
  } catch (error) {
    console.error('Error en POST /api/initial-liquidity:', error);
    return NextResponse.json(
      { error: 'Error al guardar liquidez inicial' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar el realAmount
// Body: { userId, monthPeriod, realAmount }
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, monthPeriod, realAmount } = body;

    if (!userId || !monthPeriod || realAmount === undefined) {
      return NextResponse.json(
        { error: 'userId, monthPeriod y realAmount son requeridos' },
        { status: 400 }
      );
    }

    if (typeof realAmount !== 'number' || isNaN(realAmount)) {
      return NextResponse.json(
        { error: 'realAmount debe ser un número válido' },
        { status: 400 }
      );
    }

    const liquidity = await initialLiquidityService.updateRealAmount(
      userId,
      monthPeriod,
      realAmount
    );

    return NextResponse.json({
      success: true,
      data: liquidity,
    });
  } catch (error) {
    console.error('Error en PUT /api/initial-liquidity:', error);
    return NextResponse.json(
      { error: 'Error al actualizar liquidez inicial' },
      { status: 500 }
    );
  }
}

// DELETE - Limpiar el realAmount (volver a usar calculado)
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

    // Limpiar realAmount, mantener documento con calculatedAmount
    const liquidity = await initialLiquidityService.clearRealAmount(
      userId,
      monthPeriod
    );

    return NextResponse.json({
      success: true,
      data: liquidity,
      message: 'Valor manual eliminado, usando valor calculado',
    });
  } catch (error) {
    console.error('Error en DELETE /api/initial-liquidity:', error);
    return NextResponse.json(
      { error: 'Error al limpiar liquidez inicial' },
      { status: 500 }
    );
  }
}
