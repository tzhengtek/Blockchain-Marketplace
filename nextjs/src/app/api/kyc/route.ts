import { NextResponse } from "next/server";
import axiosInstance from "@/utils/http-client";

// On autorise GET et POST pour plus de flexibilité
export async function GET(req: Request) {
    console.log("KYC route GET called");
    console.log(req.url);
  const { searchParams } = new URL(req.url);
  const wallet = searchParams.get("wallet_address");

  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet_address parameter" }, { status: 400 });
  }

  try {
    const apiRes = await axiosInstance.get(`/api/kyc?wallet_address=${wallet}`);

    return NextResponse.json({ success: true, data: apiRes.data });
  } catch (err: any) {
    const status = err.response?.status || 500;
    const details = err.response?.data || null;
    return NextResponse.json(
      { error: err.message || "Internal server error", details },
      { status }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    if (!address) {
      return NextResponse.json({ error: "Missing address in body" }, { status: 400 });
    }

    console.log("KYC route POST called for address:", address);
    const apiRes = await axiosInstance.post(`/api/kyc`, { wallet_address: address });

    return NextResponse.json({ success: true, data: apiRes.data });
  } catch (err: any) {
    const status = err.response?.status || 500;
    const details = err.response?.data || null;
    return NextResponse.json(
      { error: err.message || "Internal server error", details },
      { status }
    );
  }
}
