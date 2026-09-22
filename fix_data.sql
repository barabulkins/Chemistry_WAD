-- Обновить названия на русском
UPDATE chemical_samples SET
  title = 'Известняк',
  description = 'Технический образец известняка для определения массовой доли примесей. При обработке кислотой выделяется углекислый газ.'
WHERE id = 1;

UPDATE chemical_samples SET
  title = 'Новый образец'
WHERE id = 2;

UPDATE chemical_samples SET
  title = 'Бракованный образец',
  description = 'Не используется'
WHERE id = 3;

UPDATE chemical_samples SET
  title = 'Мрамор',
  description = 'Кристаллическая горная порода, состоящая из кальцита. Используется в качестве образца для расчета доли примесей.',
  image_url = 'http://127.0.0.1:9000/chemistry1/marble.jpg',
  video_url = 'http://127.0.0.1:9000/chemistry1/marble.MP4'
WHERE id = 4;

UPDATE chemical_samples SET
  title = 'Металлический цинк',
  description = 'Образец цинка с примесями. При реакции с соляной кислотой выделяется водород.',
  image_url = 'http://127.0.0.1:9000/chemistry1/zinc.jpg',
  video_url = 'http://127.0.0.1:9000/chemistry1/zinc.MP4'
WHERE id = 5;

-- Добавить лайки как в оригинале (Известняк=5, Мрамор=3, Цинк=2)
DELETE FROM sample_likes;
-- Известняк: 5 лайков
INSERT INTO sample_likes (user_id, sample_id) VALUES (1, 1), (1, 1), (1, 1), (1, 1), (1, 1);
-- Мрамор: 3 лайка
INSERT INTO sample_likes (user_id, sample_id) VALUES (1, 4), (1, 4), (1, 4);
-- Цинк: 2 лайка
INSERT INTO sample_likes (user_id, sample_id) VALUES (1, 5), (1, 5);
