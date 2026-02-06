import { NextRequest, NextResponse } from "next/server";
import { verifyCertificate } from "@/lib/certificates";
import { withErrorHandler } from "@/app/api/error-handler";

export const GET = withErrorHandler(async (
  request: NextRequest,
  { params }: { params: { certificateId: string } }
) => {
  const { certificateId } = params;
  const result = await verifyCertificate(certificateId);

  if (!result.valid) {
    return NextResponse.json(
      { valid: false, error: result.error },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
});
