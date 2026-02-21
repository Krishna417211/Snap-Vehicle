import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const vehiclesList = [
    {
        make: 'Kia',
        model: 'Seltos',
        year: 2023,
        price_per_day: 1500,
        location_lat: 9.9312,
        location_lng: 76.2673,
        images: '["/cars/kia seltos.png"]',
        description: 'A stylish and capable SUV perfectly suited for road trips and city driving alike.\n\nFESTIVAL TUNE: Street setup.'
    },
    {
        make: 'Maruti',
        model: 'Suzuki',
        year: 2022,
        price_per_day: 800,
        location_lat: 9.95,
        location_lng: 76.27,
        images: '["/cars/maruthi susuki.png"]',
        description: 'Reliable and perfectly compact for agile urban maneuvering and daily challenges.\n\nFESTIVAL TUNE: Nimble handler.'
    },
    {
        make: 'Mahindra',
        model: 'Thar',
        year: 2024,
        price_per_day: 1800,
        location_lat: 9.92,
        location_lng: 76.25,
        images: '["/cars/maruthi thar.png"]',
        description: 'The ultimate off-road conqueror. Built to tackle dirt trails and cross-country adventures.\n\nFESTIVAL TUNE: Fully lifted off-road rig.'
    },
    {
        make: 'Volkswagen',
        model: 'Polo',
        year: 2021,
        price_per_day: 1200,
        location_lat: 9.91,
        location_lng: 76.28,
        images: '["/cars/volkswagen.png"]',
        description: 'A punchy hot hatch legendary for its tuning potential and racing pedigree.\n\nFESTIVAL TUNE: Track-ready suspension.'
    }
];

async function main() {
    console.log('Seeding Horizon database...');

    // Create a default Tuner (Host)
    const hashedPassword = await bcrypt.hash('password123', 10);
    const host = await prisma.user.upsert({
        where: { email: 'tuner@horizon.com' },
        update: {},
        create: {
            email: 'tuner@horizon.com',
            password: hashedPassword,
            name: 'Horizon Tuner',
            role: 'HOST'
        }
    });

    // Clear existing vehicles to avoid clutter
    await prisma.vehicle.deleteMany({});

    for (const car of vehiclesList) {
        await prisma.vehicle.create({
            data: {
                ...car,
                owner_id: host.id
            }
        });
    }

    console.log('Database seeded with 4 Horizon cars successfully.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
