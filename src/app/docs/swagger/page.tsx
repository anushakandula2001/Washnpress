"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    SwaggerUIBundle?: {
      (config: Record<string, unknown>): void;
      presets: { apis: unknown };
    };
    SwaggerUIStandalonePreset?: unknown;
    ui?: unknown;
  }
}

export default function SwaggerDocsPage() {
  useEffect(() => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css";
    document.head.appendChild(css);

    const bundle = document.createElement("script");
    bundle.src = "https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js";
    bundle.async = true;

    const preset = document.createElement("script");
    preset.src = "https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-standalone-preset.js";
    preset.async = true;

    const mount = () => {
      const SwaggerUIBundle = window.SwaggerUIBundle;
      const SwaggerUIStandalonePreset = window.SwaggerUIStandalonePreset;
      if (!SwaggerUIBundle || !SwaggerUIStandalonePreset) return;

      window.ui = SwaggerUIBundle({
        url: "/openapi.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        plugins: [],
        layout: "StandaloneLayout",
        tryItOutEnabled: true,
        persistAuthorization: true,
      });
    };

    preset.onload = () => {
      if (window.SwaggerUIBundle) mount();
      else bundle.onload = mount;
    };

    document.body.appendChild(bundle);
    document.body.appendChild(preset);

    return () => {
      css.remove();
      bundle.remove();
      preset.remove();
    };
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <div id="swagger-ui" />
    </main>
  );
}
