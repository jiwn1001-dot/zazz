import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const googleSheetUrl = process.env.GOOGLE_SHEET_URL;

    if (!googleSheetUrl) {
      console.error("GOOGLE_SHEET_URL is not defined in environment variables");
      return NextResponse.json(
        { error: "Server Configuration Error" },
        { status: 500 }
      );
    }

    // Google Apps Script usually prefers form data or stringified JSON body handled explicitly
    // In our provided Apps Script, we'll expect JSON.
    const response = await fetch(googleSheetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      // Prevent caching since CRUD operations are dynamic
      cache: "no-store",
    });

    // Check if the response is valid (Apps script can sometimes return HTML on error)
    if (!response.ok) {
      throw new Error(`Google Apps Script responded with ${response.status}`);
    }

    // Attempt to parse JSON response. Apps script should return Content-Type: application/json
    const data = await response.json().catch(() => ({ status: "success", text: "non-json response" }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Google Sheets API Error:", error);
    return NextResponse.json(
      { error: "Failed to communicate with Google Sheets" },
      { status: 500 }
    );
  }
}
