import { NextRequest } from 'next/server';
import { getOrCreateUser } from '@/lib/auth';
import { handleApiError, success, error } from '@/lib/api-response';
import { FraudDetectionService } from '@/services/fraud-detection.service';

// POST /api/fraud/analyze/[id] - Analyze specific expense
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getOrCreateUser();
    const { id } = await params;

    const analysis = await FraudDetectionService.analyzeExpense(user.id, id);

    return success(analysis);
  } catch (err) {
    return handleApiError(err);
  }
}
