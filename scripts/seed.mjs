import pg from "pg";
import crypto from "crypto";

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL not set");

const pool = new Pool({ connectionString: DATABASE_URL });

function hashPassword(password) {
  return crypto.createHash("sha256").update(password + "powersport_salt_2024").digest("hex");
}

async function seed() {
  const client = await pool.connect();
  try {
    console.log("Seeding database...");

    // Seed admin profile
    const existingAdmin = await client.query("SELECT id FROM admin_profile LIMIT 1");
    if (existingAdmin.rows.length === 0) {
      const hash = hashPassword("Admin@2024!");
      await client.query(`
        INSERT INTO admin_profile (name, email, phone, password_hash, whatsapp_number, app_name, social_links, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      `, [
        "Apex Admin",
        "admin@apexmoto.com",
        "+1 555 000 1234",
        hash,
        "+1 555 000 1234",
        "Apex Moto",
        JSON.stringify({ instagram: "https://instagram.com/apexmoto", facebook: "https://facebook.com/apexmoto", twitter: null, website: null }),
      ]);
      console.log("Admin created: admin@apexmoto.com / Admin@2024!");
    } else {
      console.log("Admin already exists, skipping.");
    }

    // Seed products
    const existingProducts = await client.query("SELECT id FROM products LIMIT 1");
    if (existingProducts.rows.length > 0) {
      console.log("Products already exist, skipping.");
      return;
    }

    const products = [
      {
        name: "Raptor 700R", brand: "Yamaha", price: "8999.00", category: "Quad Bike",
        description: "The Yamaha Raptor 700R is a high-performance sport ATV built for riders who demand the absolute best. With a powerful 686cc engine and race-inspired suspension, this machine dominates every trail, sand dune, and motocross track.",
        engine_capacity: "686cc", top_speed: "75 mph", featured: true,
        images: JSON.stringify(["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=800"]),
        specs: JSON.stringify({ engine: "686cc, 4-stroke, DOHC", horsepower: "55 HP", torque: "45 Nm", weight: "335 lbs", fuelCapacity: "2.77 gal", seatHeight: "34.3 in", transmission: "5-speed + reverse", brakes: "Dual hydraulic disc", suspension: "Independent double wishbone", yearModel: "2024" }),
      },
      {
        name: "TRX450R", brand: "Honda", price: "7499.00", category: "Quad Bike",
        description: "Honda's TRX450R is the benchmark sport ATV, trusted by racers worldwide. A championship-proven 449cc liquid-cooled four-stroke engine delivers relentless power with razor-sharp handling.",
        engine_capacity: "449cc", top_speed: "72 mph", featured: true,
        images: JSON.stringify(["https://images.unsplash.com/photo-1562796360-c2db48e9a19b?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&q=80&w=800"]),
        specs: JSON.stringify({ engine: "449cc, 4-stroke, liquid-cooled", horsepower: "50 HP", torque: "40 Nm", weight: "328 lbs", fuelCapacity: "1.98 gal", seatHeight: "33.1 in", transmission: "5-speed manual", brakes: "Hydraulic disc F&R", suspension: "Double A-arm", yearModel: "2024" }),
      },
      {
        name: "Sportsman 850", brand: "Polaris", price: "11299.00", category: "Quad Bike",
        description: "The Polaris Sportsman 850 is the ultimate utility ATV. The 850cc twin-cylinder engine provides massive torque while rugged frame and on-demand AWD handle the roughest terrain with ease.",
        engine_capacity: "850cc", top_speed: "65 mph", featured: true,
        images: JSON.stringify(["https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800"]),
        specs: JSON.stringify({ engine: "850cc, 2-cylinder ProStar", horsepower: "78 HP", torque: "68 Nm", weight: "650 lbs", fuelCapacity: "4.5 gal", seatHeight: "35.5 in", transmission: "Automatic PVT H/L/N/R/P", brakes: "4-wheel disc with EBS", suspension: "MacPherson strut front", yearModel: "2024" }),
      },
      {
        name: "KFX 450R", brand: "Kawasaki", price: "7999.00", category: "Quad Bike",
        description: "Kawasaki's KFX 450R is an extreme sport ATV engineered for high-speed performance. A 449cc fuel-injected engine provides instant throttle response and the lightweight aluminum frame delivers confidence on any course.",
        engine_capacity: "449cc", top_speed: "70 mph", featured: true,
        images: JSON.stringify(["https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1562796360-c2db48e9a19b?auto=format&fit=crop&q=80&w=800"]),
        specs: JSON.stringify({ engine: "449cc, DOHC, fuel-injected", horsepower: "52 HP", torque: "42 Nm", weight: "340 lbs", fuelCapacity: "2.1 gal", seatHeight: "34.5 in", transmission: "5-speed with reverse", brakes: "Twin piston caliper discs", suspension: "Independent A-arm / Uni-Trak rear", yearModel: "2024" }),
      },
      {
        name: "Outlander 1000R", brand: "Can-Am", price: "14999.00", category: "Quad Bike",
        description: "The Can-Am Outlander 1000R is the most powerful production ATV on the market. A massive 976cc Rotax V-Twin engine delivers 89 HP with unprecedented traction through the industry-leading Visco-Lok QE system.",
        engine_capacity: "976cc", top_speed: "80 mph", featured: true,
        images: JSON.stringify(["https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800"]),
        specs: JSON.stringify({ engine: "976cc Rotax V-Twin DOHC", horsepower: "89 HP", torque: "89 Nm", weight: "741 lbs", fuelCapacity: "5.4 gal", seatHeight: "34.8 in", transmission: "Automatic CVT H/L/N/R/P", brakes: "Hydraulic disc 3 rotors + ABS", suspension: "TTI independent rear, dual A-arm front", yearModel: "2024" }),
      },
      {
        name: "YFZ450R", brand: "Yamaha", price: "9499.00", category: "Quad Bike",
        description: "The Yamaha YFZ450R is a purpose-built racing ATV from championship bloodlines. High-revving 449cc engine with explosive power, fully adjustable suspension, and superior ergonomics for competitive riders.",
        engine_capacity: "449cc", top_speed: "74 mph", featured: false,
        images: JSON.stringify(["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=800"]),
        specs: JSON.stringify({ engine: "449cc, DOHC, fuel-injected", horsepower: "55 HP", torque: "43 Nm", weight: "334 lbs", fuelCapacity: "2.64 gal", seatHeight: "34.1 in", transmission: "5-speed manual", brakes: "Hydraulic disc F&R", suspension: "Independent double wishbone", yearModel: "2024" }),
      },
      {
        name: "LTZ400", brand: "Suzuki", price: "6299.00", category: "Quad Bike",
        description: "The Suzuki LTZ400 is a legendary sport ATV celebrated for outstanding handling and reliability. User-friendly ergonomics make it ideal for both beginner and intermediate sport riders on any terrain.",
        engine_capacity: "398cc", top_speed: "68 mph", featured: false,
        images: JSON.stringify(["https://images.unsplash.com/photo-1562796360-c2db48e9a19b?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&q=80&w=800"]),
        specs: JSON.stringify({ engine: "398cc, DOHC, liquid-cooled", horsepower: "38 HP", torque: "34 Nm", weight: "381 lbs", fuelCapacity: "2.64 gal", seatHeight: "32.7 in", transmission: "5-speed manual", brakes: "Disc front, drum rear", suspension: "Independent double wishbone", yearModel: "2023" }),
      },
      {
        name: "Grizzly 700 EPS", brand: "Yamaha", price: "10999.00", category: "Quad Bike",
        description: "The Yamaha Grizzly 700 EPS is the most capable utility ATV — built to conquer any terrain, haul heavy loads, and get through conditions that stop lesser machines. Electric Power Steering reduces fatigue on long rides.",
        engine_capacity: "686cc", top_speed: "60 mph", featured: false,
        images: JSON.stringify(["https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800"]),
        specs: JSON.stringify({ engine: "686cc, DOHC, fuel-injected", horsepower: "50 HP", torque: "58 Nm", weight: "702 lbs", fuelCapacity: "4.76 gal", seatHeight: "34.6 in", transmission: "Ultramatic automatic H/L/N/R/P", brakes: "Disc all four wheels", suspension: "Independent double wishbone", yearModel: "2024" }),
      },
    ];

    for (const p of products) {
      await client.query(`
        INSERT INTO products (name, brand, price, category, description, engine_capacity, top_speed, images, model_3d_url, featured, specs, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL, $9, $10, NOW(), NOW())
      `, [p.name, p.brand, p.price, p.category, p.description, p.engine_capacity, p.top_speed, p.images, p.featured, p.specs]);
      console.log(`Inserted: ${p.brand} ${p.name}`);
    }

    console.log("\nSeed complete!");
    console.log("Admin credentials: admin@apexmoto.com / Admin@2024!");
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
