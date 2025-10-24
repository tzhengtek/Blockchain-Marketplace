import { NextResponse } from "next/server";
import axiosInstance from "@/utils/http-client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const params: Record<string, string> = {};

  const transactionHash = searchParams.get("transaction_hash");
  const pagination = searchParams.get("pagination");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (transactionHash) params.transaction_hash = transactionHash;
  if (pagination) params.pagination = pagination;
  if (from) params.from = from;
  if (to) params.to = to;

  try {
    const response = await axiosInstance.get("/api/transaction", { params });

    return NextResponse.json(response.data);
  } catch (err: any) {
    const status = err.response?.status || 500;
    const details = err.response?.data || null;
    return NextResponse.json(
      { error: err.message || "Internal server error", details },
      { status }
    );
  }
}
