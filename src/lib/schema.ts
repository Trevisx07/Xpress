import { site } from '@/config/site';
import hero from '@/assets/hero-flatbed.jpg';
import lightDuty from '@/assets/truck-light-duty.jpg';
import mediumDuty from '@/assets/truck-medium-duty.jpg';
import flatbed from '@/assets/truck-flatbed.jpg';
import recovery from '@/assets/recovery-dusk.jpg';
import roadside from '@/assets/roadside.jpg';
import lockout from '@/assets/lockout.jpg';
import jumpStart from '@/assets/jump-start.jpg';
import shop from '@/assets/commercial-shop.jpg';
import type { ImageMetadata } from 'astro';

export type JsonLd = Record<string, unknown>;
export interface Breadcrumb { name: string; path: string }

const abs = (path: string) => new URL(path, site.url).href;

export const imageObject = (img: ImageMetadata, caption: string): JsonLd => ({
  '@type': 'ImageObject',
  url: abs(img.src),
  contentUrl: abs(img.src),
  width: img.width,
  height: img.height,
  caption,
});

export const photos = {
  hero: imageObject(hero, 'Xpress Towing white Hino flatbed carrier with empty deck on the lot in Mobile, Alabama'),
  lightDuty: imageObject(lightDuty, 'Xpress rollback with deck tilted, winching a sedan aboard'),
  mediumDuty: imageObject(mediumDuty, 'Rear three-quarter view of the Xpress flatbed with an empty deck on an interstate shoulder'),
  flatbed: imageObject(flatbed, 'SUV strapped to the Xpress flatbed deck'),
  recovery: imageObject(recovery, 'Xpress flatbed at dusk with beacons lit on a wet highway shoulder'),
  roadside: imageObject(roadside, 'Xpress technician changing a flat tire beside the flatbed'),
  lockout: imageObject(lockout, 'Air wedge and long reach tool opening a locked car door'),
  jumpStart: imageObject(jumpStart, 'Jump pack clamped to a car battery with the Xpress flatbed behind'),
  shop: imageObject(shop, 'Xpress flatbed at the open bays of a repair shop'),
};

export function organizationSchema(): JsonLd {
  const sameAs = Object.values(site.social).filter(Boolean);
  return {
    '@type': ['AutoTowing', 'LocalBusiness'],
    '@id': `${site.url}/#business`,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    image: [photos.hero, photos.lightDuty, photos.mediumDuty, photos.flatbed, photos.recovery, photos.roadside, photos.lockout, photos.jumpStart, photos.shop],
    logo: { '@type': 'ImageObject', url: abs('/og/logo.png'), width: 1300, height: 706 },
    slogan: site.tagline,
    foundingDate: String(site.founded),
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      ...(site.address.streetAddress && { streetAddress: site.address.streetAddress }),
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    areaServed: site.serviceAreas.map((name) => ({ '@type': 'City', name })),
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
      geoRadius: Math.round(site.serviceRadiusMiles * 1609.344),
    },
    ...(site.hours.open24x7 && {
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
    }),
    ...(sameAs.length && { sameAs }),
  };
}

export function webSiteSchema(): JsonLd {
  return {
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    url: site.url,
    name: site.name,
    publisher: { '@id': `${site.url}/#business` },
    inLanguage: 'en-US',
  };
}

export function breadcrumbSchema(items: Breadcrumb[]): JsonLd {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

export function buildGraph(extra: JsonLd[] = [], breadcrumbs?: Breadcrumb[]) {
  const graph: JsonLd[] = [organizationSchema(), webSiteSchema()];
  if (breadcrumbs?.length) graph.push(breadcrumbSchema(breadcrumbs));
  // Page-level objects are merged flat into the graph; any nested @context is stripped so there is one root context.
  for (const obj of extra) {
    const { '@context': _ctx, ...rest } = obj;
    graph.push(rest);
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
