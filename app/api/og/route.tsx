import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/config";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const title = searchParams.get("title") || siteConfig.name;
    const description = searchParams.get("description") || siteConfig.description;

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000",
            backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            fontSize: 32,
            fontWeight: 600,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "40px",
            }}
          >
            <div
              style={{
                color: "white",
                fontSize: "48px",
                fontWeight: "bold",
                marginBottom: "20px",
                lineHeight: 1.2,
                maxWidth: "800px",
              }}
            >
              {title}
            </div>
            <div
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "24px",
                marginBottom: "40px",
                lineHeight: 1.4,
                maxWidth: "700px",
              }}
            >
              {description}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "16px 24px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#764ba2",
                }}
              >
                AI
              </div>
              <div
                style={{
                  color: "white",
                  fontSize: "20px",
                  fontWeight: "600",
                }}
              >
                AI Genius Lab
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.log(message);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
