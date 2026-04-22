import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            );
        }

        // Read raw body bytes + preserve content-type with multipart boundary
        const contentType = request.headers.get("content-type") || "";
        const rawBody = await request.arrayBuffer();

        // Forward raw body to backend with cookie in header
        const backendResponse = await fetch("http://localhost:5000/api/chat/voice-upload", {
            method: "POST",
            headers: {
                "Content-Type": contentType,
                Cookie: `token=${token}`,
            },
            body: Buffer.from(rawBody),
        });

        if (!backendResponse.ok) {
            const errorText = await backendResponse.text();
            console.error("Backend voice upload error:", backendResponse.status, errorText);
            return NextResponse.json(
                { success: false, message: "Upload failed" },
                { status: backendResponse.status }
            );
        }

        const data = await backendResponse.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Voice upload proxy error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
