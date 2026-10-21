import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';

const hbs = require('hbs');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Настройка шаблонизатора Handlebars (SSR из ЛР1-ЛР3)
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(__dirname, '..', 'views/partials'));
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Поддержка CORS для запросов со сторонних клиентов с куками
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Подключение cookie-parser
  app.use(cookieParser());

  // Подключение Redis для хранения сессий (Требование ЛР4: показать пользователя в Redis)
  let sessionStore: any = undefined;
  try {
    const redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    redisClient.on('error', (err) => console.warn('Redis error:', err.message));
    await redisClient.connect();
    sessionStore = new RedisStore({
      client: redisClient,
      prefix: 'sess:',
    });
    console.log('Redis connected successfully: sessions are stored in Redis (port 6379)!');
  } catch (err: any) {
    console.warn('Redis connection failed, fallback to memory store:', err.message);
  }

  // Подключение серверных сессий и куки (Требование ЛР4 для NestJS + Redis)
  app.use(
    session({
      store: sessionStore,
      name: 'connect.sid',
      secret: process.env.SESSION_SECRET || 'rip_chemistry_super_secret_session_key_2026',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false, // false для локальной разработки по HTTP
        maxAge: 1000 * 60 * 60 * 24, // 24 часа
        sameSite: 'lax',
      },
    }),
  );

  // Настройка Swagger (OpenAPI 3.0)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Управление химическими образцами — Веб-сервис (ЛР4)')
    .setDescription(
      `RESTful веб-сервис для учета химических образцов (лабораторных услуг).\n\n` +
      `### Разделение прав доступа:\n` +
      `* **Без авторизации (Гость):** Доступно ТОЛЬКО чтение-получение данных через API (просмотр каталога опубликованных образцов с фильтрацией, лента образцов, детальный просмотр), а также регистрация и вход в систему.\n` +
      `* **С авторизацией (Создатель):** Доступны методы создателя (получение черновика, создание новой услуги с автозаполнением автора из сессии, публикация черновика, удаление через транзакционный SQL-курсор FOR UPDATE, выставление лайков, профиль и выход).\n\n` +
      `### Авторизация:\n` +
      `Авторизация реализована через **сессии и cookies (express-session + connect.sid)**.\n` +
      `Для авторизации в Swagger UI выполните запрос \`POST /api/users/login\` — сессионная кука сохранится браузером автоматически (благодаря флагу \`withCredentials: true\`).`
    )
    .setVersion('4.0.0')
    .addCookieAuth('connect.sid', {
      type: 'apiKey',
      in: 'cookie',
      name: 'connect.sid',
      description: 'Идентификатор сессии в cookie (устанавливается сервером после успешного входа)',
    })
    .addTag(
      'Публичные методы (Чтение — без авторизации)',
      'Методы чтения каталога и ленты, доступные гостям без входа в систему',
    )
    .addTag(
      'Аутентификация и пользователи',
      'Методы регистрации, аутентификации (входа), получения профиля и деавторизации (выхода)',
    )
    .addTag(
      'Методы создателя (Защищенные — с авторизацией)',
      'Методы управления образцами, доступные только авторизованному создателю с автозаполнением creator_id',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    swaggerOptions: {
      withCredentials: true,
      persistAuthorization: true,
    },
    customSiteTitle: 'Chemistry Samples API Docs (Swagger)',
  });

  // Редиректы на Swagger для удобства пользователя
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/docs', (req: any, res: any) => res.redirect('/api/docs'));
  httpAdapter.get('/swagger', (req: any, res: any) => res.redirect('/api/docs'));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Server started on http://localhost:${port}`);
  console.log(`Swagger UI is available at http://localhost:${port}/api/docs`);
}
bootstrap();
