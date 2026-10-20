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
        await AppDataSource.query(`UPDATE chemical_samples SET image_url = 'http://127.0.0.1:9000/chemistry1/marble.jpg', video_url = 'http://127.0.0.1:9000/chemistry1/marble.MP4' WHERE id = 4`);
        await AppDataSource.query(`UPDATE chemical_samples SET image_url = 'http://127.0.0.1:9000/chemistry1/zinc.jpg', video_url = 'http://127.0.0.1:9000/chemistry1/zinc.MP4' WHERE id = 5`);
        await AppDataSource.query(`UPDATE chemical_samples SET image_url = 'http://127.0.0.1:9000/chemistry1/limestone.jpg', video_url = 'http://127.0.0.1:9000/chemistry1/limestone.MP4' WHERE id = 1`);
        console.log("Restored MinIO URLs");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Error", err);
        process.exit(1);
    });
