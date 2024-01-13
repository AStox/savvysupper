/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
        port: "",
        pathname: "/private/org-ZB2fmnoPFrBug3fjsENTta6g/user-mtQComgMEorV9nPBfCYAWYIF/**",
      },
    ],
  },
};

module.exports = nextConfig;
