import { NextRequest, NextResponse } from 'next/server';
import { savingsService } from '@/services/Firebase/savings-service';

// GET - Obtener historial de depósitos de una fuente
// Query params: savingsSourceId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const savingsSourceId = searchParams.get('savingsSourceId');

    if (!savingsSourceId) {
      return NextResponse.json(
        { error: 'savingsSourceId es requerido' },
        { status: 400 }
      );
    }

    const history = await savingsService.getSavingsHistory(savingsSourceId);

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error en GET /api/savings/history:', error);
    return NextResponse.json(
      { error: 'Error al obtener historial de depósitos' },
      { status: 500 }
    );
  }
}
