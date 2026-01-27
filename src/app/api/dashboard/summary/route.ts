import { NextRequest, NextResponse } from 'next/server';
import { dashboardApiService } from '@/services/Firebase/dashboard-api-service';

// GET - Obtener resumen financiero global (todos los tiempos)
// Query params: userId, monthResetDay
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const monthResetDay = parseInt(searchParams.get('monthResetDay') || '1', 10);

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }

    const summary = await dashboardApiService.getGlobalSummary(
      userId,
      monthResetDay
    );

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error en GET /api/dashboard/summary:', error);
    return NextResponse.json(
      { error: 'Error al obtener resumen financiero' },
      { status: 500 }
    );
  }
}
