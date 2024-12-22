import { serve } from "bun";

export class WebhookHandler {
  constructor(private port: number) {}

  async startServer(handler: (req: Request) => Promise<Response>) {
    return serve({
      port: this.port,
      fetch: async (req) => {
        try {
          return await handler(req);
        } catch (error) {
          return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    });
  }

  protected createJsonResponse(data: any, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" }
    });
  }

  protected createErrorResponse(message: string, status: number = 400): Response {
    return this.createJsonResponse({ error: message }, status);
  }
} 