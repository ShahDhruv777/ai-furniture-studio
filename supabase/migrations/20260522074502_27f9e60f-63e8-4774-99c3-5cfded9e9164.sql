DELETE FROM favorites WHERE product_id NOT IN (SELECT id FROM products WHERE category = 'Dining Sets');
DELETE FROM saved_customizations WHERE product_id NOT IN (SELECT id FROM products WHERE category = 'Dining Sets');
DELETE FROM products WHERE category != 'Dining Sets';