import { NextRequest, NextResponse } from 'next/server';
import { dashboardApiService } from '@/services/Firebase/dashboard-api-service';

// GET - Obtener historial financiero por periodos
// Query params: userId, months (número de meses hacia atrás), monthResetDay
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const months = parseInt(searchParams.get('months') || '12', 10);
    const monthResetDay = parseInt(searchParams.get('monthResetDay') || '1', 10);

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }

    const history = await dashboardApiService.getFinancialHistory(
      userId,
      months,
      monthResetDay
    );

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error en GET /api/dashboard/history:', error);
    return NextResponse.json(
      { error: 'Error al obtener historial financiero' },
      { status: 500 }
    );
  }
}
