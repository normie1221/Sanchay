import { NextRequest } from 'next/server';
import { getOrCreateUser } from '@/lib/auth';
import { handleApiError, success } from '@/lib/api-response';
import { FraudDetectionService } from '@/services/fraud-detection.service';

// POST /api/fraud/alerts/[id]/resolve - Resolve a fraud alert
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await getOrCreateUser();

    const body = await request.json();
    const { resolution, isConfirmed } = body;

    const alert = await FraudDetectionService.resolveFraudAlert(
      params.id,
      resolution,
      isConfirmed
    );

    return success(alert);
  } catch (error) {
    return handleApiError(error);
  }
}
