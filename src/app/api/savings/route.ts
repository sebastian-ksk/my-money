import { NextRequest, NextResponse } from 'next/server';
import { savingsService } from '@/services/Firebase/savings-service';

// GET - Obtener transacciones de ahorro
// Query params: userId, monthPeriod (opcional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const monthPeriod = searchParams.get('monthPeriod');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }

    let transactions;
    let totalSavings = 0;

    if (monthPeriod) {
      transactions = await savingsService.getSavingsTransactions(userId, monthPeriod);
      totalSavings = await savingsService.getTotalSavingsForPeriod(userId, monthPeriod);
    } else {
      transactions = await savingsService.getAllSavingsTransactions(userId);
      totalSavings = await savingsService.getTotalSavingsBalance(userId);
    }

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        totalSavings,
      },
    });
  } catch (error) {
    console.error('Error en GET /api/savings:', error);
    return NextResponse.json(
      { error: 'Error al obtener transacciones de ahorro' },
      { status: 500 }
    );
  }
}

// POST - Crear transacción de ahorro
// Body: { userId, monthPeriod, savingsSourceId, originSource, value, concept?, date? }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, monthPeriod, savingsSourceId, originSource, value, concept, date } = body;

    console.log('POST /api/savings - Body recibido:', { userId, monthPeriod, savingsSourceId, originSource, value, concept, date });

    if (!userId || !monthPeriod || !savingsSourceId || !originSource || value === undefined) {
      return NextResponse.json(
        { error: 'userId, monthPeriod, savingsSourceId, originSource y value son requeridos' },
        { status: 400 }
      );
    }

    const transaction = await savingsService.createSavingsTransaction({
      userId,
      monthPeriod,
      savingsSourceId,
      originSource,
      value: Number(value),
      concept,
      date: date ? new Date(date) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Error en POST /api/savings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: `Error al crear transacción de ahorro: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// PUT - Actualizar transacción de ahorro
// Body: { transactionId, value?, originSource?, concept?, date? }
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, value, originSource, concept, date } = body;

    if (!transactionId) {
      return NextResponse.json(
        { error: 'transactionId es requerido' },
        { status: 400 }
      );
    }

    const transaction = await savingsService.updateSavingsTransaction(transactionId, {
      value,
      originSource,
      concept,
      date: date ? new Date(date) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Error en PUT /api/savings:', error);
    return NextResponse.json(
      { error: 'Error al actualizar transacción de ahorro' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar transacción de ahorro
// Query params: transactionId
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json(
        { error: 'transactionId es requerido' },
        { status: 400 }
      );
    }

    await savingsService.deleteSavingsTransaction(transactionId);

    return NextResponse.json({
      success: true,
      message: 'Transacción de ahorro eliminada correctamente',
    });
  } catch (error) {
    console.error('Error en DELETE /api/savings:', error);
    return NextResponse.json(
      { error: 'Error al eliminar transacción de ahorro' },
      { status: 500 }
    );
  }
}
