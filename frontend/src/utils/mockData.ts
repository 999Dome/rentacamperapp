import type { Camper } from "../types/interface.ts";

export interface MockCamper extends Camper {
  image_url: string;
  features_list: string[];
  owner_id: string;
  is_blocked?: boolean;
}

export interface MockBooking {
  id: string;
  camper_id: string;
  camper_name: string;
  start_date: string;
  end_date: string;
  total_price: number;
  addons_price: number;
  status: "Confirmed" | "Completed" | "Pending" | "Cancelled";
  addons_detail: { name: string; price: number }[];
}

export interface MockInquiry {
  id: string;
  camper_id: string;
  camper_name: string;
  renter_name: string;
  start_date: string;
  end_date: string;
  message: string;
  status: "Pending" | "Accepted" | "Declined";
}

export interface MockUserProfile {
  firstname: string;
  lastname: string;
  email: string;
  driver_license_class: string;
  phone: string;
}

const DEFAULT_CAMPERS: MockCamper[] = [
  {
    id: "camper-1",
    name: "California Dream",
    manufacturer: "Folkwagen",
    beds: 4,
    price_per_night_base: 89,
    cleaning_fee: 50,
    deposit_amount: 1000,
    empty_weight_kg: 2200,
    engine_power: 150,
    fuel_consumption: 7.5,
    fuel_type: "Diesel",
    has_tow_hitch: true,
    height_cm: 199,
    length_cm: 490,
    width_cm: 190,
    max_towing_capacity_kg: 2000,
    max_weight_kg: 3000,
    required_license: "B",
    short_desc: "Kompakter Camper für die ganze Familie.",
    description: "Der Klassiker unter den Campern. Perfekt für Roadtrips, flexibel in der Stadt und extrem komfortabel auf dem Campingplatz.",
    created_at: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7",
    features_list: ["Küche", "Aufstelldach", "Klimaanlage", "Heizung", "Fahrradträger"],
    owner_id: "company",
    is_blocked: false
  },
  {
    id: "camper-2",
    name: "Marco Polo V",
    manufacturer: "Mercedenz-Bonz",
    beds: 4,
    price_per_night_base: 120,
    cleaning_fee: 70,
    deposit_amount: 1500,
    empty_weight_kg: 2400,
    engine_power: 190,
    fuel_consumption: 8.2,
    fuel_type: "Diesel",
    has_tow_hitch: true,
    height_cm: 198,
    length_cm: 514,
    width_cm: 193,
    max_towing_capacity_kg: 2500,
    max_weight_kg: 3200,
    required_license: "B",
    short_desc: "Luxuriöser Reisebegleiter mit Premium-Ausstattung.",
    description: "Reisen erster Klasse. Ausgestattet mit einer vollfunktionalen Küche, bequemen Betten und modernster Assistenztechnologie.",
    created_at: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1513313778780-9ae4807465f0",
    features_list: ["Küche", "Toilette", "Klimaanlage", "Heizung", "Navigationssystem"],
    owner_id: "company",
    is_blocked: false
  },
  {
    id: "camper-3",
    name: "Avdi e-Adventure",
    manufacturer: "Avdi",
    beds: 2,
    price_per_night_base: 149,
    cleaning_fee: 60,
    deposit_amount: 2000,
    empty_weight_kg: 2600,
    engine_power: 313,
    fuel_consumption: 0,
    fuel_type: "Super",
    has_tow_hitch: false,
    height_cm: 185,
    length_cm: 490,
    width_cm: 195,
    max_towing_capacity_kg: 0,
    max_weight_kg: 3100,
    required_license: "B",
    short_desc: "Voll-elektrischer Abenteurer mit Allradantrieb.",
    description: "Nachhaltig die Welt entdecken. Mit ordentlich Power unter der Haube und autarker Stromversorgung durch Solar auf dem Dach.",
    created_at: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2",
    features_list: ["Solaranlage", "Klimaanlage", "Heizung", "Navigationssystem", "Küche"],
    owner_id: "user-1",
    is_blocked: false
  },
  {
    id: "camper-4",
    name: "DYB Land Cruiser",
    manufacturer: "DYB",
    beds: 2,
    price_per_night_base: 95,
    cleaning_fee: 45,
    deposit_amount: 1200,
    empty_weight_kg: 2100,
    engine_power: 170,
    fuel_consumption: 9.5,
    fuel_type: "Diesel",
    has_tow_hitch: true,
    height_cm: 210,
    length_cm: 480,
    width_cm: 188,
    max_towing_capacity_kg: 3000,
    max_weight_kg: 2800,
    required_license: "B",
    short_desc: "Robustes Offroad-Wunder mit Dachzelt.",
    description: "Abseits der befestigten Straßen schlafen. Ideal für Wildcamping und raues Gelände.",
    created_at: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1533518463841-d62e1fc91373",
    features_list: ["Dachzelt", "Kühlbox", "Allrad", "Heizung"],
    owner_id: "user-1",
    is_blocked: false
  },
  {
    id: "camper-5",
    name: "Tayota Land Home",
    manufacturer: "Tayota",
    beds: 5,
    price_per_night_base: 135,
    cleaning_fee: 80,
    deposit_amount: 1500,
    empty_weight_kg: 2900,
    engine_power: 160,
    fuel_consumption: 10.2,
    fuel_type: "Diesel",
    has_tow_hitch: true,
    height_cm: 285,
    length_cm: 650,
    width_cm: 220,
    max_towing_capacity_kg: 2000,
    max_weight_kg: 3500,
    required_license: "B96",
    short_desc: "Geräumiges Wohnmobil für lange Reisen.",
    description: "Viel Platz, viel Komfort. Perfekt für längere Reisen durch Europa mit allem Zubehör, das man sich nur wünschen kann.",
    created_at: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1527786356703-4b100091cd2c",
    features_list: ["Küche", "Toilette", "Dusche", "Klimaanlage", "Heizung", "Fahrradträger", "TV"],
    owner_id: "user-2",
    is_blocked: false
  },
  {
    id: "camper-6",
    name: "Lamberghini Urus Camper Edition",
    manufacturer: "Lamberghini",
    beds: 2,
    price_per_night_base: 399,
    cleaning_fee: 150,
    deposit_amount: 5000,
    empty_weight_kg: 2200,
    engine_power: 650,
    fuel_consumption: 12.7,
    fuel_type: "Super Plus",
    has_tow_hitch: false,
    height_cm: 165,
    length_cm: 511,
    width_cm: 201,
    max_towing_capacity_kg: 0,
    max_weight_kg: 2850,
    required_license: "B",
    short_desc: "Der schnellste Camper der Welt. Luxus pur.",
    description: "Für alle, die keine Zeit zu verlieren haben. Luxuriöses Sport-SUV mit maßgeschneidertem Carbon-Dachzelt und integrierter Champagnerkühlbox.",
    created_at: new Date().toISOString(),
    image_url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738",
    features_list: ["Carbon-Dachzelt", "Kühlbox", "Navigationssystem", "Klimaanlage"],
    owner_id: "company",
    is_blocked: false
  }
];

const DEFAULT_BOOKINGS: MockBooking[] = [
  {
    id: "booking-1",
    camper_id: "camper-1",
    camper_name: "California Dream",
    start_date: "2026-07-10",
    end_date: "2026-07-17",
    total_price: 673,
    addons_price: 50,
    status: "Confirmed",
    addons_detail: [
      { name: "Extra Gasflasche", price: 20 },
      { name: "Fahrradträger", price: 30 }
    ]
  },
  {
    id: "booking-2",
    camper_id: "camper-2",
    camper_name: "Marco Polo V",
    start_date: "2026-05-01",
    end_date: "2026-05-05",
    total_price: 550,
    addons_price: 0,
    status: "Completed",
    addons_detail: []
  }
];

const DEFAULT_INQUIRIES: MockInquiry[] = [
  {
    id: "inquiry-1",
    camper_id: "camper-3",
    camper_name: "Avdi e-Adventure",
    renter_name: "Thomas Müller",
    start_date: "2026-08-01",
    end_date: "2026-08-08",
    message: "Hallo, ich würde gerne deinen elektrischen Camper für eine Woche im August ausleihen. Passt das?",
    status: "Pending"
  },
  {
    id: "inquiry-2",
    camper_id: "camper-4",
    camper_name: "DYB Land Cruiser",
    renter_name: "Sarah Schmidt",
    start_date: "2026-07-15",
    end_date: "2026-07-20",
    message: "Moin! Ich plane eine Offroad-Tour durch die Alpen. Ist dein Land Cruiser zu diesem Zeitraum frei?",
    status: "Pending"
  }
];

const DEFAULT_PROFILE: MockUserProfile = {
  firstname: "Max",
  lastname: "Mustermann",
  email: "max.mustermann@example.com",
  driver_license_class: "B",
  phone: "+49 176 12345678"
};

export function getMockCampers(): MockCamper[] {
  const data = localStorage.getItem("rentoutCampers");
  if (!data) {
    localStorage.setItem("rentoutCampers", JSON.stringify(DEFAULT_CAMPERS));
    return DEFAULT_CAMPERS;
  }
  return JSON.parse(data);
}

export function saveMockCampers(campers: MockCamper[]) {
  localStorage.setItem("rentoutCampers", JSON.stringify(campers));
}

export function getMockBookings(): MockBooking[] {
  const data = localStorage.getItem("rentBookings");
  if (!data) {
    localStorage.setItem("rentBookings", JSON.stringify(DEFAULT_BOOKINGS));
    return DEFAULT_BOOKINGS;
  }
  return JSON.parse(data);
}

export function saveMockBookings(bookings: MockBooking[]) {
  localStorage.setItem("rentBookings", JSON.stringify(bookings));
}

export function getMockInquiries(): MockInquiry[] {
  const data = localStorage.getItem("providerInquiries");
  if (!data) {
    localStorage.setItem("providerInquiries", JSON.stringify(DEFAULT_INQUIRIES));
    return DEFAULT_INQUIRIES;
  }
  return JSON.parse(data);
}

export function saveMockInquiries(inquiries: MockInquiry[]) {
  localStorage.setItem("providerInquiries", JSON.stringify(inquiries));
}

export function getMockProfile(): MockUserProfile {
  const data = localStorage.getItem("userProfile");
  if (!data) {
    localStorage.setItem("userProfile", JSON.stringify(DEFAULT_PROFILE));
    return DEFAULT_PROFILE;
  }
  return JSON.parse(data);
}

export function saveMockProfile(profile: MockUserProfile) {
  localStorage.setItem("userProfile", JSON.stringify(profile));
}
