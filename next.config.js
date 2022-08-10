/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		deviceSizes: [900],
		domains: ["image.tmdb.org"],
	},
	reactStrictMode: true,
};

module.exports = nextConfig;
