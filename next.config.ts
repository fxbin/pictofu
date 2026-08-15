import type { NextConfig } from "next";

const previewCommitSha =
  process.env.VERCEL_ENV === "preview" ? process.env.VERCEL_GIT_COMMIT_SHA : undefined;

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
          ...(previewCommitSha
            ? [{ key: "X-PicTofu-Commit", value: previewCommitSha }]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
