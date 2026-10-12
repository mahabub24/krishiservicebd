import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/products`, lastModified: new Date() },
    { url: `${baseUrl}/category/improved-seeds`, lastModified: new Date() },
    { url: `${baseUrl}/category/pesticides`, lastModified: new Date() },
    { url: `${baseUrl}/category/fertilizers`, lastModified: new Date() },
    { url: `${baseUrl}/category/agricultural-machinery`, lastModified: new Date() },
    { url: `${baseUrl}/agricultural-advice`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/pages/privacy-policy`, lastModified: new Date() },
    { url: `${baseUrl}/pages/terms-and-conditions`, lastModified: new Date() },
    { url: `${baseUrl}/pages/return-refund-policy`, lastModified: new Date() },
  ];
}
