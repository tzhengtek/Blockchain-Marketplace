import { NextResponse } from "next/server";
import axiosInstance from "@/utils/http-client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const params: Record<string, string> = {};

  const owner = searchParams.get("owner");
  const pagination = searchParams.get("pagination");

  if (owner) params.owner = owner;
  if (pagination) params.pagination = pagination;

  try {
    const response = await axiosInstance.get("/api/nft", { params });

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
