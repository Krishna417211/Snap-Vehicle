import pg from 'pg';

const passwords = ['postgres', 'root', 'admin', 'password', '1234', '12345', ''];

async function testPostgresPasswords() {
    for (const p of passwords) {
        console.log(`Testing password: "${p}"`);
        const client = new pg.Client({
            user: 'postgres',
            password: p,
            host: 'localhost',
            port: 5432,
            database: 'postgres'
        });

        try {
            await client.connect();
            console.log(`\n\nSUCCESS! Password is: "${p}"`);
            await client.end();
            return;
        } catch (e) {
            // console.error(e.message);
        }
    }
    console.log('\n\nFAILED TO FIND POSTGRES PASSWORD');
}

testPostgresPasswords();
