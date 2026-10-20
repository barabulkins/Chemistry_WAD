import { DataSource } from 'typeorm';
import { ChemicalSample } from './src/chemical-samples/entities/chemical-sample.entity';
import { User } from './src/chemical-samples/entities/user.entity';
import { SampleLike } from './src/chemical-samples/entities/sample-like.entity';

const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "chemistry_db",
    entities: [ChemicalSample, User, SampleLike],
    synchronize: false,
    logging: false,
});

AppDataSource.initialize()
    .then(async () => {
        await AppDataSource.query(`UPDATE chemical_samples SET status = 'published' WHERE status = 'deleted'`);
        console.log("Restored deleted samples");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Error", err);
        process.exit(1);
    });
