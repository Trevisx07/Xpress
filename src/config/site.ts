export interface SiteConfig {
  name: string;
  legalName: string;
  url: string;
  phone: string;
  phoneDisplay: string;
  email: string;
  tagline: string;
  address: {
    streetAddress: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  geo: { lat: number; lng: number };
  serviceRadiusMiles: number;
  serviceAreas: readonly string[];
  hours: { open24x7: boolean };
  social: { googleBusinessUrl: string; facebook: string };
  founded: number;
}

export const site: SiteConfig = {
  name: 'Xpress Towing & Recovery',
  legalName: 'Xpress Towing & Recovery LLC',
  url: 'https://xpresstowingmobile.com',
  phone: '+12198694433',
  phoneDisplay: '(219) 869-4433',
  email: 'xpresstowingandrecoverymobile@gmail.com',
  tagline: 'As we don\'t drag your car, we safely deliver it.',
  address: {
    streetAddress: '930 W I-65 Service Road S',
    city: 'Mobile',
    region: 'AL',
    postalCode: '36609',
    country: 'US',
  },
  geo: { lat: 30.6954, lng: -88.0399 },
  serviceRadiusMiles: 50,
  serviceAreas: [
    'Mobile',
    'Prichard',
    'Saraland',
    'Tillmans Corner',
    'Theodore',
    'Semmes',
    'Daphne',
    'Spanish Fort',
    'Fairhope',
    'Chickasaw',
    'Satsuma',
    'Grand Bay',
  ],
  hours: { open24x7: true },
  social: { googleBusinessUrl: '', facebook: '' },
  founded: 2025,
};

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Commercial Towing', href: '/commercial-towing' },
  { label: 'Contact', href: '/contact' },
] as const;

import type { IconName } from '@/components/icons/map';

export interface Service {
  slug: string;
  name: string;
  category: string;
  short: string;
  long: string[];
  bullets: string[];
  idealFor: string;
  icon: IconName;
  image: string | null;
  imageAlt?: string;
  seoKeywords: string[];
}

export const services: Service[] = [
  {
    slug: 'light-duty-towing',
    name: 'Light Duty Towing',
    category: 'Towing',
    short: 'Cars, SUVs, and pickups moved with wheel lift or flatbed, whichever protects your vehicle.',
    long: [
      'Most calls in Mobile are light duty: a sedan that quit on Government St, a blown tire on I-65, a pickup that will not start in Tillmans Corner. Wheel lift or flatbed depending on your drivetrain, soft straps and wheel nets, and a tow to your home, mechanic, dealership, or body shop anywhere in Mobile County.',
    ],
    bullets: ['Sedans, coupes, SUVs, minivans, and half ton pickups', 'Wheel lift or flatbed, chosen for your drivetrain', 'Soft straps and wheel nets, no chains on suspension parts', 'Parking deck and tight driveway recovery', 'Same price by phone as on the invoice'],
    idealFor: 'Breakdowns, no starts, flat tires without a spare, and getting a car to the shop after hours.',
    icon: 'Truck',
    image: 'truck-light-duty.jpg',
    imageAlt: 'Xpress rollback with deck tilted, winching a silver Toyota sedan aboard on a residential street',
    seoKeywords: ['car towing Mobile AL', 'tow truck near me Mobile', 'light duty towing Mobile Alabama'],
  },
  {
    slug: 'medium-duty-towing',
    name: 'Medium Duty Towing',
    category: 'Towing',
    short: 'Work vans, box trucks, delivery vehicles, and small buses up to 26,000 lb.',
    long: [
      'A down delivery truck costs money every hour it sits. Our medium duty wrecker moves box trucks, cargo vans, shuttle buses, and small RVs up to 26,000 lb with proper air brake hookups. Common runs cover the port, the industrial parks off I-65 and Highway 90, and the distribution centers around Theodore and Saraland.',
    ],
    bullets: ['Box trucks, cargo vans, step vans, and shuttle buses', 'Small RVs and travel trailers', 'Air brake and driveline aware hookups', 'Coordination with your fleet dispatcher'],
    idealFor: 'Delivery fleets, contractors, church and school buses, and RV owners passing through on I-10.',
    icon: 'Truck',
    image: 'truck-medium-duty.jpg',
    imageAlt: 'Rear three-quarter view of the Xpress flatbed with an empty deck on an interstate shoulder',
    seoKeywords: ['box truck towing Mobile', 'medium duty tow Mobile AL', 'cargo van towing Mobile'],
  },
  {
    slug: 'flatbed-towing',
    name: 'Flatbed Towing',
    category: 'Towing',
    short: 'Zero wheels on the road for AWD, lowered, luxury, and non-running vehicles.',
    long: [
      'A flatbed is the only right way to move an all wheel drive vehicle, a locked transmission, or a car too low for a wheel lift. Nothing spins, nothing drags. Ramp extensions handle low clearance cars and a wheel chock keeps a motorcycle upright. Ask for the flatbed by name and it is what shows up.',
    ],
    bullets: ['All wheel drive and four wheel drive vehicles', 'Lowered, luxury, and exotic cars', 'Non-running vehicles and locked transmissions', 'Motorcycles with chock and soft tie downs', 'Long distance transport across Alabama and the Gulf Coast'],
    idealFor: 'Subaru, Audi, and truck owners with 4WD, sports car owners, and anyone shipping a vehicle out of town.',
    icon: 'Truck',
    image: 'truck-flatbed.jpg',
    imageAlt: 'Gray Mazda SUV strapped to the Xpress flatbed deck with yellow ratchet straps',
    seoKeywords: ['flatbed towing Mobile AL', 'AWD towing', 'motorcycle towing Mobile'],
  },
  {
    slug: 'accident-recovery',
    name: 'Accident Recovery',
    category: 'Recovery',
    short: 'Winch outs from ditches, mud, and medians, scene cleanup, and transport to the body shop of your choice.',
    long: [
      'After a wreck on I-10, I-65, or the Bayway, job one is getting the vehicle out of the lane and you out of traffic. We work with Mobile Police and ALEA, clear debris, and winch out of ditches and medians. No wreck needed for a winch out: slid into a ditch off Highway 90 or buried in sand near Dauphin Island, we pull you back to pavement. Photos at the scene and at drop off, an itemized invoice your adjuster can read, and you choose the body shop.',
    ],
    bullets: ['Winch outs from ditches, mud, sand, and medians, wreck or not', 'Debris cleanup coordinated with law enforcement', 'Photo documentation at scene and drop off', 'Transport to the body shop or storage yard you pick', 'Insurance ready itemized invoices'],
    idealFor: 'Collisions on Mobile area highways, vehicles stuck off the pavement, and body shops that need reliable pickup.',
    icon: 'Shield',
    image: 'recovery-dusk.jpg',
    imageAlt: 'Xpress flatbed at dusk on a wet highway shoulder with amber beacons lit and traffic cones set out',
    seoKeywords: ['accident towing Mobile AL', 'wreck recovery Mobile', 'winch out service Mobile', 'stuck in ditch towing Mobile'],
  },
  {
    slug: 'roadside-assistance',
    name: 'Roadside Assistance',
    category: 'Roadside',
    short: 'Fuel delivery, flat tire changes, and minor fixes on the spot.',
    long: [
      'Not every call needs a tow. Out of gas on Dauphin Island Parkway, a flat with a good spare, or a car on a soft shoulder can usually be fixed at the curb. The driver arrives in the same truck that could tow you, so if the fix does not hold you are not waiting on a second vehicle.',
    ],
    bullets: ['Fuel delivery, gas or diesel', 'Flat tire change with your spare', 'Short pull outs from sand, mud, or a ditch edge', 'Minor on-site help before deciding on a tow'],
    idealFor: 'Drivers who need a quick fix rather than a full tow, anywhere within our service radius.',
    icon: 'MapPin',
    image: 'roadside.jpg',
    imageAlt: 'Xpress technician changing a flat tire on a silver sedan with the flatbed parked behind on a residential street',
    seoKeywords: ['roadside assistance Mobile Alabama', 'fuel delivery Mobile AL', 'flat tire change Mobile AL'],
  },
  {
    slug: 'lockouts',
    name: 'Lockouts',
    category: 'Roadside',
    short: 'Damage free entry on most vehicles, day or night.',
    long: [
      'Keys locked in the car at the Airport Blvd shopping centers, a downtown parking deck, or your own driveway. We open most cars, trucks, and SUVs with air wedges and long reach tools that leave paint and door frames untouched. Photo ID and proof of ownership are required first.',
    ],
    bullets: ['Air wedge and long reach tools, no slim jims on modern doors', 'Most makes and models, including trucks and SUVs', 'ID and ownership verification required', 'Available around the clock'],
    idealFor: 'Anyone locked out in Mobile County who wants the door opened without a scratch.',
    icon: 'Key',
    image: 'lockout.jpg',
    imageAlt: 'Gloved hands using an air wedge and long reach tool to open a locked car door, Xpress truck in the background',
    seoKeywords: ['car lockout service Mobile AL', 'locked keys in car Mobile', 'unlock car door Mobile Alabama'],
  },
  {
    slug: 'jump-starts',
    name: 'Jump Starts',
    category: 'Roadside',
    short: 'Safe jump start, battery and alternator test, or a straight answer that you need a tow.',
    long: [
      'A dead battery in a Midtown lot or a downtown garage is one of our most common calls. The driver jumps the vehicle from a regulated pack, then tests the battery and alternator. If the battery will not hold a charge we say so and can tow straight to your shop instead of leaving you stranded twice.',
    ],
    bullets: ['Regulated jump pack, safe for modern electronics', 'Battery and alternator check before we leave', 'Honest call on jump versus tow', 'Tow to a shop or parts store if the battery is done'],
    idealFor: 'No starts in parking lots, garages, and driveways across Mobile.',
    icon: 'Battery',
    image: 'jump-start.jpg',
    imageAlt: 'Jump pack clamped to a car battery under the hood with the Xpress flatbed behind',
    seoKeywords: ['jump start service Mobile', 'battery jump start Mobile AL', 'dead battery help Mobile AL', 'car won\'t start Mobile'],
  },
];
