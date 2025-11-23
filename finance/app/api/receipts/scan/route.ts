import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { success, error } from '@/lib/api-response';

/**
 * POST /api/receipts/scan
 * Scan receipt image and extract expense data using OCR/AI
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return error('Unauthorized', 401);
    }

    // TODO: Implement receipt scanning with OCR/AI
    // This would typically use a service like Google Vision API, Tesseract, or similar

    return success({
      message: 'Receipt scanning feature coming soon',
      extractedData: null,
    });
  } catch (err) {
    console.error('Error scanning receipt:', err);
    return error('Failed to scan receipt', 500);
  }
}
