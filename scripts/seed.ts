import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import crypto from "crypto";
import * as schema from "../lib/db/src/schema/index.js";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "powersport_salt_2024").digest("hex");
}

async function seed() {
  console.log("Seeding database...");

  // Seed admin profile
  const existing = await db.select().from(schema.adminProfileTable).limit(1);
  if (existing.length === 0) {
    await db.insert(schema.adminProfileTable).values({
      name: "Apex Admin",
      email: "admin@apexmoto.com",
      phone: "+1 555 000 1234",
      passwordHash: hashPassword("Admin@2024!"),
      whatsappNumber: "+1 555 000 1234",
      appName: "Apex Moto",
      socialLinks: {
        instagram: "https://instagram.com/apexmoto",
        facebook: "https://facebook.com/apexmoto",
        twitter: null,
        website: null,
      },
    });
    console.log("Admin profile created — email: admin@apexmoto.com | password: Admin@2024!");
  } else {
    console.log("Admin profile already exists, skipping.");
  }

  // Seed quad bike products
  const existingProducts = await db.select().from(schema.productsTable).limit(1);
  if (existingProducts.length > 0) {
    console.log("Products already exist, skipping product seed.");
    await pool.end();
    return;
  }

  const products = [
    {
      name: "Raptor 700R",
      brand: "Yamaha",
      price: "8999.00",
      category: "Quad Bike",
      description: "The Yamaha Raptor 700R is a high-performance sport ATV built for riders who demand the absolute best. With a powerful 686cc engine and race-inspired suspension, this machine dominates every trail, sand dune, and motocross track.",
      engineCapacity: "686cc",
      topSpeed: "75 mph",
      images: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=800",
      ],
      model3dUrl: null,
      featured: true,
      specs: {
        engine: "686cc, 4-stroke, DOHC",
        horsepower: "55 HP",
        torque: "45 Nm",
        weight: "335 lbs",
        fuelCapacity: "2.77 gal",
        seatHeight: "34.3 in",
        transmission: "5-speed manual + reverse",
        brakes: "Dual hydraulic disc",
        suspension: "Independent double wishbone (front), Tri-link (rear)",
        yearModel: "2024",
      },
    },
    {
      name: "TRX450R",
      brand: "Honda",
      price: "7499.00",
      category: "Quad Bike",
      description: "Honda's TRX450R is the benchmark sport ATV, trusted by racers around the world. A championship-proven 449cc liquid-cooled four-stroke engine delivers relentless power, while a sophisticated chassis provides razor-sharp handling.",
      engineCapacity: "449cc",
      topSpeed: "72 mph",
      images: [
        "https://images.unsplash.com/photo-1562796360-c2db48e9a19b?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&q=80&w=800",
      ],
      model3dUrl: null,
      featured: true,
      specs: {
        engine: "449cc, 4-stroke, liquid-cooled",
        horsepower: "50 HP",
        torque: "40 Nm",
        weight: "328 lbs",
        fuelCapacity: "1.98 gal",
        seatHeight: "33.1 in",
        transmission: "5-speed manual",
        brakes: "Hydraulic disc (front & rear)",
        suspension: "Double A-arm (front), Swingarm (rear)",
        yearModel: "2024",
      },
    },
    {
      name: "Sportsman 850",
      brand: "Polaris",
      price: "11299.00",
      category: "Quad Bike",
      description: "The Polaris Sportsman 850 is the ultimate utility ATV, delivering class-leading performance for work and trail riding alike. The 850cc twin-cylinder engine provides massive torque while the rugged frame and on-demand AWD handle the roughest terrain.",
      engineCapacity: "850cc",
      topSpeed: "65 mph",
      images: [
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800",
      ],
      model3dUrl: null,
      featured: true,
      specs: {
        engine: "850cc, 2-cylinder, ProStar",
        horsepower: "78 HP",
        torque: "68 Nm",
        weight: "650 lbs",
        fuelCapacity: "4.5 gal",
        seatHeight: "35.5 in",
        transmission: "Automatic PVT H/L/N/R/P",
        brakes: "4-wheel disc with EBS",
        suspension: "MacPherson strut (front), Trailing arm (rear)",
        yearModel: "2024",
      },
    },
    {
      name: "KFX 450R",
      brand: "Kawasaki",
      price: "7999.00",
      category: "Quad Bike",
      description: "Kawasaki's KFX 450R is an extreme sport ATV engineered for high-speed performance. A 449cc fuel-injected engine provides instant throttle response, while the lightweight aluminum frame and advanced suspension setup let you attack any course with confidence.",
      engineCapacity: "449cc",
      topSpeed: "70 mph",
      images: [
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1562796360-c2db48e9a19b?auto=format&fit=crop&q=80&w=800",
      ],
      model3dUrl: null,
      featured: true,
      specs: {
        engine: "449cc, 4-stroke, DOHC, fuel-injected",
        horsepower: "52 HP",
        torque: "42 Nm",
        weight: "340 lbs",
        fuelCapacity: "2.1 gal",
        seatHeight: "34.5 in",
        transmission: "5-speed with reverse",
        brakes: "Twin piston caliper discs",
        suspension: "Independent A-arm (front), Uni-Trak rear linkage",
        yearModel: "2024",
      },
    },
    {
      name: "Outlander 1000R",
      brand: "Can-Am",
      price: "14999.00",
      category: "Quad Bike",
      description: "The Can-Am Outlander 1000R is the most powerful production ATV on the market. Powered by a massive 976cc Rotax V-Twin engine, this quad beast delivers 89 HP and unprecedented traction through its industry-leading Visco-Lok QE system.",
      engineCapacity: "976cc",
      topSpeed: "80 mph",
      images: [
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800",
      ],
      model3dUrl: null,
      featured: true,
      specs: {
        engine: "976cc, Rotax V-Twin, DOHC",
        horsepower: "89 HP",
        torque: "89 Nm",
        weight: "741 lbs",
        fuelCapacity: "5.4 gal",
        seatHeight: "34.8 in",
        transmission: "Automatic CVT with High/Low/Neutral/Reverse/Park",
        brakes: "Hydraulic disc (3 rotors) with ABS",
        suspension: "TTI independent rear, dual A-arm front",
        yearModel: "2024",
      },
    },
    {
      name: "YFZ450R",
      brand: "Yamaha",
      price: "9499.00",
      category: "Quad Bike",
      description: "The Yamaha YFZ450R is a purpose-built racing ATV descended directly from championship bloodlines. Its 449cc high-revving engine produces explosive power, while a compact chassis, fully adjustable suspension, and superior ergonomics make it the weapon of choice for competitive riders.",
      engineCapacity: "449cc",
      topSpeed: "74 mph",
      images: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=800",
      ],
      model3dUrl: null,
      featured: false,
      specs: {
        engine: "449cc, 4-stroke, DOHC, fuel-injected",
        horsepower: "55 HP",
        torque: "43 Nm",
        weight: "334 lbs",
        fuelCapacity: "2.64 gal",
        seatHeight: "34.1 in",
        transmission: "5-speed manual",
        brakes: "Hydraulic disc F&R",
        suspension: "Independent double wishbone (front), linkage-type rear",
        yearModel: "2024",
      },
    },
    {
      name: "LTZ400",
      brand: "Suzuki",
      price: "6299.00",
      category: "Quad Bike",
      description: "The Suzuki LTZ400 is a legendary sport ATV celebrated for its outstanding handling and reliability. A 398cc liquid-cooled engine delivers predictable power, while the lightweight chassis and user-friendly ergonomics make it ideal for both beginner and intermediate sport riders.",
      engineCapacity: "398cc",
      topSpeed: "68 mph",
      images: [
        "https://images.unsplash.com/photo-1562796360-c2db48e9a19b?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&q=80&w=800",
      ],
      model3dUrl: null,
      featured: false,
      specs: {
        engine: "398cc, 4-stroke, DOHC, liquid-cooled",
        horsepower: "38 HP",
        torque: "34 Nm",
        weight: "381 lbs",
        fuelCapacity: "2.64 gal",
        seatHeight: "32.7 in",
        transmission: "5-speed manual",
        brakes: "Disc front, drum rear",
        suspension: "Independent double wishbone (front), swingarm (rear)",
        yearModel: "2023",
      },
    },
    {
      name: "Grizzly 700 EPS",
      brand: "Yamaha",
      price: "10999.00",
      category: "Quad Bike",
      description: "The Yamaha Grizzly 700 EPS is the most capable utility ATV ever produced — built to conquer any terrain, haul heavy loads, and get you through conditions that stop lesser machines in their tracks. Electric Power Steering (EPS) reduces rider fatigue on long rides.",
      engineCapacity: "686cc",
      topSpeed: "60 mph",
      images: [
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800",
      ],
      model3dUrl: null,
      featured: false,
      specs: {
        engine: "686cc, 4-stroke, DOHC, fuel-injected",
        horsepower: "50 HP",
        torque: "58 Nm",
        weight: "702 lbs",
        fuelCapacity: "4.76 gal",
        seatHeight: "34.6 in",
        transmission: "Ultramatic automatic with H/L/N/R/P",
        brakes: "Disc all four wheels",
        suspension: "Independent double wishbone (front), swingarm with link (rear)",
        yearModel: "2024",
      },
    },
  ];

  for (const p of products) {
    await db.insert(schema.productsTable).values(p);
    console.log(`Inserted: ${p.brand} ${p.name}`);
  }

  console.log("\nSeed complete!");
  console.log("Admin login: admin@apexmoto.com / Admin@2024!");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
