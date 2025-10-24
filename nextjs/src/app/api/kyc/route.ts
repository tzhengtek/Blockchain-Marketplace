import { NextResponse } from "next/server";

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
    const apiRes = await fetch(`http://localhost:3000/api/kyc?wallet_address=${wallet}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await apiRes.json().catch(() => null);
    if (!apiRes.ok) {
      return NextResponse.json(
        { error: "Remote KYC API error", details: data },
        { status: apiRes.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
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
    const apiRes = await fetch(`http://localhost:3000/api/kyc`, {
      method: "POST",
      headers: { "Content-Type": "application/json" } ,
      body: JSON.stringify({ wallet_address: address }),
    });

    const data = await apiRes.json().catch(() => null);
    if (!apiRes.ok) {
      return NextResponse.json(
        { error: "Remote KYC API error", details: data },
        { status: apiRes.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
