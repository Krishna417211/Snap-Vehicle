import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Clean up
    await prisma.booking.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();

    // Create mock host
    const hashedPassword = await bcrypt.hash('password123', 10);
    const host = await prisma.user.create({
        data: {
            email: 'host@swiftrent.com',
            password: hashedPassword,
            name: 'SwiftRent Host',
            role: 'HOST',
        },
    });

    // Kochi coordinates
    const baseLat = 9.9312;
    const baseLng = 76.2673;

    const vehicles = [
        { make: 'Maruti Suzuki', model: 'Swift', year: 2021, price: 1200, img: '/cars/maruthi susuki.png' },
        { make: 'Hyundai', model: 'i20', year: 2022, price: 1300, img: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800' },
        { make: 'Honda', model: 'City', year: 2020, price: 1800, img: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=800' },
        { make: 'Mahindra', model: 'Thar', year: 2023, price: 3000, img: '/cars/maruthi thar.png' },
        { make: 'Tata', model: 'Nexon', year: 2022, price: 1600, img: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?auto=format&fit=crop&q=80&w=800' },
        { make: 'Kia', model: 'Seltos', year: 2021, price: 1900, img: '/cars/kia seltos.png' },
        { make: 'Toyota', model: 'Innova Crysta', year: 2019, price: 2500, img: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800' },
        { make: 'Ford', model: 'EcoSport', year: 2018, price: 1400, img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=800' },
        { make: 'Renault', model: 'Kiger', year: 2023, price: 1350, img: 'https://images.unsplash.com/photo-1546768292-fb12f6c92568?auto=format&fit=crop&q=80&w=800' },
        { make: 'Volkswagen', model: 'Polo', year: 2020, price: 1500, img: '/cars/volkswagen.png' },
    ];

    for (let i = 0; i < vehicles.length; i++) {
        const v = vehicles[i];
        // Generate slight random offset for coordinates around Kochi
        const latOffset = (Math.random() - 0.5) * 0.1;
        const lngOffset = (Math.random() - 0.5) * 0.1;

        await prisma.vehicle.create({
            data: {
                owner_id: host.id,
                make: v.make,
                model: v.model,
                year: v.year,
                price_per_day: v.price,
                location_lat: baseLat + latOffset,
                location_lng: baseLng + lngOffset,
                images: JSON.stringify([v.img]),
                description: `This well-maintained ${v.make} ${v.model} is perfect for your trips around Kochi and beyond. Comes with AC and great mileage.`,
            },
        });
    }

    console.log('Seeding completed! 10 vehicles created around Kochi.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
