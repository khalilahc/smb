// src/views/ShopEmbed.tsx
import React, { useState } from "react";
import Layout from "@/components/Layout";

export default function ShopEmbed() {
  const [error, setError] = useState(false);

  return (
    <Layout>
      <div className="h-[calc(100vh-5rem)]">
        {error ? (
          <div className="flex items-center justify-center h-full text-center p-4">
            <div className="text-red-600 font-semibold">
              ⚠️ Failed to load the Queen's Shop. <br />
              <a
                href="https://khalilahk-beautique.myshopify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 underline"
              >
                Click here to open in a new tab ↗
              </a>
            </div>
          </div>
        ) : (
          <iframe
            src="https://khalilahk-beautique.myshopify.com"
            title="Queen's Shop"
            className="w-full h-full border-none"
            onError={() => setError(true)}
          />
        )}
      </div>
    </Layout>
  );
}
