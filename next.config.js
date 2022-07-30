/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		domains: ["image.tmdb.org"],
		deviceSizes: [900],
	},
};

module.exports = nextConfig;
