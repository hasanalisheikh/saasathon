-- Remove the retired website feedback intake from the MVP.

UPDATE requests
SET source = 'manual'
WHERE source = 'widget';

DROP TABLE IF EXISTS widget_comments CASCADE;
