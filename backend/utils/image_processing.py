from pathlib import Path

from PIL import Image as PILImage

from config import MAX_THUMBNAIL_SIZE


def generate_thumbnail(original_path: Path, thumbnail_path: Path, max_size: int = MAX_THUMBNAIL_SIZE):
    try:
        with PILImage.open(original_path) as img:
            if img.mode in ('RGBA', 'LA', 'P'):
                rgb_img = PILImage.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = rgb_img
            elif img.mode != 'RGB':
                img = img.convert('RGB')
            
            img.thumbnail((max_size, max_size), PILImage.Resampling.LANCZOS)
            img.save(thumbnail_path, 'JPEG', quality=85, optimize=True)
    except Exception as e:
        print(f"Thumbnail generation failed: {e}")
