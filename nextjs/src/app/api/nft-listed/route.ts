import { NextResponse } from "next/server";
import axiosInstance from "@/utils/http-client";

export async function GET() {
  try {
    const response = await axiosInstance.get("/api/nft-listed");

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
