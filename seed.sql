INSERT INTO chemical_samples (title, description, status, image_url, video_url, impurities_percent, gas_volume, creator_id, created_at, published_at)
VALUES
  ('Limestone', 'Technical sample of limestone for determining the mass fraction of impurities. When treated with acid, carbon dioxide is released.', 'published',
   'http://127.0.0.1:9000/chemistry1/limestone.jpg', 'http://127.0.0.1:9000/chemistry1/limestone.MP4',
   15.5, 45, 1, NOW(), NOW()),
  ('New sample', NULL, 'draft', NULL, NULL, NULL, NULL, 1, NOW(), NULL),
  ('Defective sample', 'Not used', 'deleted', NULL, NULL, 99.9, 0, 1, NOW(), NULL);

INSERT INTO sample_likes (user_id, sample_id)
SELECT 1, id FROM chemical_samples WHERE title = 'Limestone'
UNION ALL
SELECT 1, id FROM chemical_samples WHERE title = 'Limestone';
