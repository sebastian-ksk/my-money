import { NextRequest, NextResponse } from 'next/server';
import { initialLiquidityService } from '@/services/Firebase/initial-liquidity-service';

// GET - Obtener liquidez inicial de un mes
// Query params: userId, monthPeriod, calculate (optional, default true)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const monthPeriod = searchParams.get('monthPeriod');
    const calculate = searchParams.get('calculate') !== 'false'; // default true

    if (!userId || !monthPeriod) {
      return NextResponse.json(
        { error: 'userId y monthPeriod son requeridos' },
        { status: 400 }
      );
    }

    if (calculate) {
      // Obtener o calcular si no existe
      const result =
        await initialLiquidityService.getOrCalculateInitialLiquidity(
          userId,
          monthPeriod
        );

      return NextResponse.json({
        success: true,
        data: result,
      });
    } else {
      // Solo obtener sin calcular
      const liquidity = await initialLiquidityService.getInitialLiquidity(
        userId,
        monthPeriod
      );

      return NextResponse.json({
        success: true,
        data: {
          liquidity,
          calculatedAmount: liquidity?.amount ?? null,
          wasCalculated: false,
        },
      });
    }
  } catch (error) {
    console.error('Error en GET /api/initial-liquidity:', error);
    return NextResponse.json(
      { error: 'Error al obtener liquidez inicial' },
      { status: 500 }
    );
  }
}

// POST - Crear o actualizar liquidez inicial
// Body: { userId, monthPeriod, amount, isManual? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, monthPeriod, amount, isManual = true } = body;

    if (!userId || !monthPeriod || amount === undefined) {
      return NextResponse.json(
        { error: 'userId, monthPeriod y amount son requeridos' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || isNaN(amount)) {
      return NextResponse.json(
        { error: 'amount debe ser un número válido' },
        { status: 400 }
      );
    }

    const liquidity =
      await initialLiquidityService.createOrUpdateInitialLiquidity(
        userId,
        monthPeriod,
        amount,
        isManual
      );

    return NextResponse.json({
      success: true,
      data: liquidity,
    });
  } catch (error) {
    console.error('Error en POST /api/initial-liquidity:', error);
    return NextResponse.json(
      { error: 'Error al crear/actualizar liquidez inicial' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar liquidez inicial
// Body: { userId, monthPeriod, amount }
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, monthPeriod, amount } = body;

    if (!userId || !monthPeriod || amount === undefined) {
      return NextResponse.json(
        { error: 'userId, monthPeriod y amount son requeridos' },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || isNaN(amount)) {
      return NextResponse.json(
        { error: 'amount debe ser un número válido' },
        { status: 400 }
      );
    }

    const liquidity = await initialLiquidityService.updateInitialLiquidity(
      userId,
      monthPeriod,
      amount
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

// DELETE - Eliminar liquidez inicial
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

    await initialLiquidityService.deleteInitialLiquidity(userId, monthPeriod);

    return NextResponse.json({
      success: true,
      message: 'Liquidez inicial eliminada correctamente',
    });
  } catch (error) {
    console.error('Error en DELETE /api/initial-liquidity:', error);
    return NextResponse.json(
      { error: 'Error al eliminar liquidez inicial' },
      { status: 500 }
    );
  }
}
