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
    synchronize: true,
    logging: true,
});

AppDataSource.initialize()
    .then(async () => {
        console.log("Data Source has been initialized!");
        await AppDataSource.query(`INSERT INTO users (username, email) VALUES ('Student', 'student@lab.ru') ON CONFLICT DO NOTHING`);
        console.log("User inserted");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
        process.exit(1);
    });
