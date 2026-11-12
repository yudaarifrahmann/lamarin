-- Add image/webp and image/jpg to allowed_mime_types in application-documents bucket
-- Required for the image-to-PDF conversion feature added in document attachment processing

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]
WHERE id = 'application-documents';

