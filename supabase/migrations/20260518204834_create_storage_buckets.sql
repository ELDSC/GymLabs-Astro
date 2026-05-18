-- Buckets aligned with .env:
-- SUPABASE_PRODUCT_IMAGE_BUCKET="images"
-- SUPABASE_HOME_VIDEO_BUCKET="videos"

insert into storage.buckets
  (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'images',
    'images',
    true,
    52428800,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
  ),
  (
    'videos',
    'videos',
    true,
    104857600,
    array['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
  )
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view images bucket objects" on storage.objects;
create policy "Public can view images bucket objects"
on storage.objects
for select
to public
using (bucket_id = 'images');

drop policy if exists "Public can upload images bucket objects" on storage.objects;
create policy "Public can upload images bucket objects"
on storage.objects
for insert
to public
with check (bucket_id = 'images');

drop policy if exists "Public can update images bucket objects" on storage.objects;
create policy "Public can update images bucket objects"
on storage.objects
for update
to public
using (bucket_id = 'images')
with check (bucket_id = 'images');

drop policy if exists "Public can delete images bucket objects" on storage.objects;
create policy "Public can delete images bucket objects"
on storage.objects
for delete
to public
using (bucket_id = 'images');
