import { NextRequest, NextResponse } from 'next/server';
import { dashboardApiService } from '@/services/Firebase/dashboard-api-service';

// GET - Obtener estadísticas del dashboard
// Query params: userId, period (1m, 3m, 6m, 1y), monthResetDay
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const period = searchParams.get('period') || '6m';
    const monthResetDay = parseInt(searchParams.get('monthResetDay') || '1', 10);

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }

    const dashboardData = await dashboardApiService.getCompleteDashboard(
      userId,
      period as '1m' | '3m' | '6m' | '1y',
      monthResetDay
    );

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('Error en GET /api/dashboard:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas del dashboard' },
      { status: 500 }
    );
  }
}
