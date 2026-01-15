import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  name?: string;
  type?: string;
  image?: string;
  url?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const DEFAULT_DESCRIPTION = "SiTiket - Sistem Manajemen Tiket Gangguan Terpadu untuk monitoring dan penanganan masalah jaringan telekomunikasi secara real-time.";
const SITE_NAME = "SiTiket";
const BASE_URL = "https://sitiket.lovable.app";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

export default function SEO({ 
  title, 
  description = DEFAULT_DESCRIPTION, 
  name = SITE_NAME, 
  type = "website",
  image = DEFAULT_IMAGE,
  url,
  noIndex = false,
  jsonLd
}: SEOProps) {
  const fullTitle = `${title} | ${name}`;
  const canonicalUrl = url || BASE_URL;

  // Default Organization JSON-LD
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SiTiket - Telkom Infra",
    "description": DEFAULT_DESCRIPTION,
    "url": BASE_URL,
    "logo": `${BASE_URL}/logo.png`,
    "sameAs": [],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["Indonesian"]
    }
  };

  // WebApplication JSON-LD
  const webAppJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "SiTiket",
    "description": DEFAULT_DESCRIPTION,
    "url": BASE_URL,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "IDR"
    },
    "featureList": [
      "Manajemen Tiket Gangguan",
      "Monitoring TTR Real-time",
      "Manajemen Teknisi",
      "Laporan & Analitik",
      "Notifikasi WhatsApp"
    ]
  };

  // BreadcrumbList JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Dashboard",
        "item": `${BASE_URL}/dashboard`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": title,
        "item": canonicalUrl
      }
    ]
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content="sitiket, tiket gangguan, helpdesk, teknisi, manajemen tiket, ttr, monitoring, telkom infra, jaringan telekomunikasi, trouble ticket" />
      <meta name="author" content="Telkom Infra" />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Language */}
      <meta httpEquiv="content-language" content="id" />
      <meta name="language" content="Indonesian" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={name} />
      <meta property="og:locale" content="id_ID" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@telkominfra" />

      {/* Additional Meta */}
      <meta name="theme-color" content="#6366f1" />
      <meta name="msapplication-TileColor" content="#6366f1" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={name} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationJsonLd)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webAppJsonLd)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </script>
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

// Helper component for page-specific SEO
export function TicketSEO({ 
  siteCode, 
  siteName, 
  status 
}: { 
  siteCode: string; 
  siteName: string; 
  status: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": `Tiket ${siteCode} - ${siteName}`,
    "description": `Detail tiket gangguan di ${siteName}. Status: ${status}`,
    "mainEntity": {
      "@type": "Thing",
      "name": siteCode,
      "description": `Tiket gangguan untuk site ${siteName}`
    }
  };

  return (
    <SEO 
      title={`${siteCode} - ${siteName}`}
      description={`Detail tiket gangguan di ${siteName}. Status: ${status}. Monitoring progress perbaikan secara real-time.`}
      type="article"
      jsonLd={jsonLd}
    />
  );
}
