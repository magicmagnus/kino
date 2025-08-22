import json
import requests
import os
from pathlib import Path
from urllib.parse import urlparse
import time


def download_posters(json_file_path, output_directory):
    """
    Downloads movie posters from the movies-reference.json file.

    Args:
        json_file_path (str): Path to the movies-reference.json file
        output_directory (str): Directory where posters will be saved
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_directory, exist_ok=True)

    # Load the JSON data
    with open(json_file_path, "r", encoding="utf-8") as file:
        movies_data = json.load(file)

    print(f"Found {len(movies_data)} movies to process...")

    successful_downloads = 0
    failed_downloads = 0

    for movie_id, movie_info in movies_data.items():
        try:
            title = movie_info.get("title", f"movie_{movie_id}")
            slug = movie_info.get("slug", f"movie_{movie_id}")
            poster_url = movie_info.get("posterUrl")

            if not poster_url:
                print(f"No poster URL for {title} (slug: {slug})")
                failed_downloads += 1
                continue

            # Remove the query parameters to get full size image
            # The URL contains parameters like ?w=352&h=528&fm=webp&q=90&fit=crop
            # We'll remove everything after the '?' to get the original image
            clean_url = poster_url.split("?")[0]

            # Get file extension from URL
            parsed_url = urlparse(clean_url)
            file_extension = os.path.splitext(parsed_url.path)[1]

            # If no extension found, default to .jpg
            if not file_extension:
                file_extension = ".jpg"

            # Create filename using slug
            filename = f"{slug}{file_extension}"
            file_path = os.path.join(output_directory, filename)

            # Skip if file already exists
            if os.path.exists(file_path):
                print(f"Skipping {title} - file already exists")
                continue

            print(f"Downloading poster for: {title}")
            print(f"URL: {clean_url}")
            print(f"Saving as: {filename}")

            # Download the image
            response = requests.get(clean_url, timeout=30)
            response.raise_for_status()

            # Save the image
            with open(file_path, "wb") as img_file:
                img_file.write(response.content)

            print(f"✓ Successfully downloaded: {filename}")
            successful_downloads += 1

            # Be nice to the server - add a small delay
            time.sleep(0.5)

        except requests.RequestException as e:
            print(f"✗ Failed to download poster for {title}: {e}")
            failed_downloads += 1

        except Exception as e:
            print(f"✗ Error processing {title}: {e}")
            failed_downloads += 1

    print(f"\nDownload complete!")
    print(f"Successful downloads: {successful_downloads}")
    print(f"Failed downloads: {failed_downloads}")
    print(f"Total movies processed: {len(movies_data)}")


import json
import requests
import os
from pathlib import Path
from urllib.parse import urlparse
import time
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import io


def create_poster_variants(poster_path, slug, variants_dir):
    """
    Creates social media variants of a poster image.

    Args:
        poster_path (str): Path to the original poster
        slug (str): Movie slug for naming
        variants_dir (str): Directory to save variants
    """
    try:
        # Create variants directory if it doesn't exist
        og_dir = os.path.join(variants_dir, "og")  # 1200x630
        square_dir = os.path.join(variants_dir, "square")  # 600x600
        os.makedirs(og_dir, exist_ok=True)
        os.makedirs(square_dir, exist_ok=True)

        # Open the original poster
        with Image.open(poster_path) as img:
            # Convert to RGB if necessary
            if img.mode != "RGB":
                img = img.convert("RGB")

            # Create Open Graph variant (1200x630)
            og_variant = create_og_variant(img, slug)
            og_path = os.path.join(og_dir, f"{slug}.png")  # Changed to .png
            og_variant.save(og_path, "PNG", quality=95)  # Changed to PNG format

            # Create square variant (600x600)
            square_variant = create_square_variant(img, slug)
            square_path = os.path.join(square_dir, f"{slug}.png")  # Changed to .png
            square_variant.save(square_path, "PNG", quality=95)  # Changed to PNG format

            print(f"✓ Created variants for: {slug}")
            return True

    except Exception as e:
        print(f"✗ Failed to create variants for {slug}: {e}")
        return False


def create_og_variant(img, slug):
    """Creates a 1200x630 Open Graph variant with blurred background padding"""
    target_width, target_height = 1200, 630

    # Calculate scaling to fit within target dimensions (not fill)
    scale_x = target_width / img.width
    scale_y = target_height / img.height
    scale = min(scale_x, scale_y)  # Use smaller scale to fit completely

    new_width = int(img.width * scale)
    new_height = int(img.height * scale)

    # Create blurred background
    background = create_blurred_background(img, target_width, target_height)

    # Resize the main image while preserving aspect ratio
    resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

    # Center the resized image on the blurred background
    x_offset = (target_width - new_width) // 2
    y_offset = (target_height - new_height) // 2
    background.paste(resized, (x_offset, y_offset))

    # Add logo with drop shadow - use square logo for OG variant
    add_logo(background, position="bottom-left", size=300, variant_type="og")

    return background


def create_square_variant(img, slug):
    """Creates a 600x600 square variant with blurred background padding"""
    target_size = 600

    # Calculate scaling to fit within square dimensions
    scale = target_size / max(img.width, img.height)  # Use max to ensure it fits
    new_width = int(img.width * scale)
    new_height = int(img.height * scale)

    # Create blurred background
    background = create_blurred_background(img, target_size, target_size)

    # Resize the main image while preserving aspect ratio
    resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

    # Center the resized image on the blurred background between the logo on the left and the right edge
    logo_width = int(target_size * 0.47619047619047616 * 0.56)  # Half of the logo width
    x_offset = ((target_size - new_width) // 2) + logo_width // 2
    y_offset = (target_size - new_height) // 2
    background.paste(resized, (x_offset, y_offset))

    # Add logo - use cropped and rotated preview_image.png for square variant
    add_logo(
        background, position="bottom-left", size=target_size, variant_type="square"
    )

    return background


def add_logo(canvas, position="bottom-left", size=60, variant_type="og"):
    """Adds the logo to the image - different logos for different variants"""
    try:
        if variant_type == "square":
            # For square variant: use preview_image.png, crop to half height, rotate 90°
            logo_paths = [
                "public/preview_image.png",
                "preview_image.png",
                "../public/preview_image.png",
            ]
        else:
            # For OG variant: use preview_image_sq.png as before
            logo_paths = [
                "public/preview_image_sq.png",
                "preview_image_sq.png",
                "src/assets/preview_image_sq.png",
                "../public/preview_image_sq.png",
            ]

        logo_path = None
        for path in logo_paths:
            if os.path.exists(path):
                logo_path = path
                break

        if not logo_path:
            print(f"Warning: Could not find logo file for {variant_type} variant")
            return

        # Open and process the logo
        with Image.open(logo_path) as logo:
            # Convert to RGBA to handle transparency
            if logo.mode != "RGBA":
                logo = logo.convert("RGBA")

            if variant_type == "square":
                # Rotate 90 degrees clockwise
                logo = logo.rotate(90, expand=True)

                # Crop to half height (top half)

                logo = logo.resize(
                    (int(size * 0.47619047619047616), size), Image.Resampling.LANCZOS
                )

                # Crop to the middle 20% of the width
                left = int(logo.width * 0.22)
                right = int(logo.width * 0.78)
                logo = logo.crop((left, 0, right, logo.height))

                canvas.paste(logo, (0, 0), logo)

            else:
                # Resize the logo
                logo = logo.resize((size, size), Image.Resampling.LANCZOS)

                # Calculate position
                padding = 15
                if position == "bottom-left":
                    x = padding
                    y = canvas.height - size - padding
                elif position == "bottom-right":
                    x = canvas.width - size - padding
                    y = canvas.height - size - padding
                elif position == "top-left":
                    x = padding
                    y = padding
                else:  # top-right
                    x = canvas.width - size - padding
                    y = padding

                # Paste the logo
                canvas.paste(logo, (x, y), logo)  # Use logo as mask for transparency

    except Exception as e:
        print(f"Warning: Could not add logo: {e}")


def add_branding(canvas, text, position="bottom-right", size="small"):
    """Adds subtle branding text to the image"""
    try:
        draw = ImageDraw.Draw(canvas)

        # Try to use a nice font, fall back to default if not available
        try:
            font_size = 16 if size == "small" else 24
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()

        # Get text size
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        # Calculate position
        padding = 15  # Increased padding to account for logo
        if position == "bottom-right":
            x = canvas.width - text_width - padding
            y = canvas.height - text_height - padding
        elif position == "bottom-left":
            x = padding + 70  # Extra space to avoid logo
            y = canvas.height - text_height - padding
        else:
            x = padding
            y = padding

        # Draw text with shadow for better visibility
        shadow_offset = 1
        draw.text(
            (x + shadow_offset, y + shadow_offset), text, font=font, fill=(0, 0, 0, 128)
        )
        draw.text((x, y), text, font=font, fill=(255, 255, 255, 200))

    except Exception as e:
        print(f"Warning: Could not add branding: {e}")


def create_blurred_background(img, target_width, target_height):
    """Creates a blurred, scaled version of the image to use as background"""
    from PIL import ImageFilter

    # Calculate how to scale the image to fill the entire target area
    img_ratio = img.width / img.height
    target_ratio = target_width / target_height

    if img_ratio > target_ratio:
        # Image is wider - scale by height to fill
        scale = target_height / img.height
        new_width = int(img.width * scale)
        new_height = target_height
    else:
        # Image is taller - scale by width to fill
        scale = target_width / img.width
        new_width = target_width
        new_height = int(img.height * scale)

    # Resize to fill the background
    background = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

    # If the background is larger than target, crop from center
    if new_width > target_width or new_height > target_height:
        left = (new_width - target_width) // 2
        top = (new_height - target_height) // 2
        right = left + target_width
        bottom = top + target_height
        background = background.crop((left, top, right, bottom))

    # Apply blur effect
    background = background.filter(ImageFilter.GaussianBlur(radius=15))

    # Darken the background slightly to make the main image pop
    from PIL import ImageEnhance

    enhancer = ImageEnhance.Brightness(background)
    background = enhancer.enhance(0.3)  # Make it 30% as bright (70% darker)

    return background


def process_all_posters_for_variants(posters_dir, variants_dir):
    """
    Process all posters in the directory and create social media variants.
    """
    posters_path = Path(posters_dir)
    variants_path = Path(variants_dir)

    if not posters_path.exists():
        print(f"Posters directory not found: {posters_dir}")
        return

    # Get all image files
    image_extensions = {".jpg", ".jpeg", ".png", ".webp"}
    poster_files = [
        f
        for f in posters_path.iterdir()
        if f.is_file() and f.suffix.lower() in image_extensions
    ]

    print(f"Found {len(poster_files)} poster files to process...")

    successful_variants = 0
    failed_variants = 0

    for poster_file in poster_files:
        slug = poster_file.stem  # filename without extension

        if create_poster_variants(poster_file, slug, variants_path):
            successful_variants += 1
        else:
            failed_variants += 1

        # Small delay to avoid overwhelming the system
        time.sleep(0.1)

    print(f"\nVariant creation complete!")
    print(f"Successful: {successful_variants}")
    print(f"Failed: {failed_variants}")


if __name__ == "__main__":
    # Configuration
    json_file_path = Path("src/data/movies-reference.json")
    posters_directory = Path("src/data/posters")
    variants_directory = Path("public/poster-variants")

    # Step 1: Download posters (if needed)
    print("=== DOWNLOADING POSTERS ===")
    download_posters(json_file_path, posters_directory)

    # Step 2: Create social media variants
    print("\n=== CREATING POSTER VARIANTS ===")
    process_all_posters_for_variants(posters_directory, variants_directory)
