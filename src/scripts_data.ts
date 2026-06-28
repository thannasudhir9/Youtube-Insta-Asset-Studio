export const PYTHON_SCRIPTS = {
  requirements: `google-api-python-client>=2.115.0
yt-dlp>=2024.3.10
requests>=2.31.0
ffmpeg-python>=0.2.0
python-dotenv>=1.0.1`,

  discovery: `import os
import json
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

def discover_90s_hits(language="telugu", max_results=10):
    """
    Uses the YouTube Data API v3 to search for high-view, high-nostalgia 90s playlists and videos
    for the specified Indian language.
    """
    if not YOUTUBE_API_KEY:
        raise ValueError("YOUTUBE_API_KEY is not set in environment variables.")

    youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
    
    # Language-specific queries to fetch high-nostalgia assets
    queries = {
        "telugu": "90s telugu melody songs hits audio",
        "tamil": "90s tamil melody hit songs spb",
        "hindi": "90s hindi romantic melody songs udit narayan",
        "malayalam": "90s malayalam evergreen hits songs"
    }
    
    query = queries.get(language.lower(), "90s indian nostalgia songs")
    
    print(f"[*] Scouting trends on YouTube for query: '{query}'...")
    
    request = youtube.search().list(
        q=query,
        part="snippet",
        type="video",
        maxResults=max_results,
        relevanceLanguage=language[:2],
        safeSearch="none"
    )
    response = request.execute()
    
    discovered_tracks = []
    
    # For each video, get view metrics to filter for viral potential
    video_ids = [item["id"]["videoId"] for item in response.get("items", []) if "videoId" in item["id"]]
    
    if video_ids:
        stats_request = youtube.videos().list(
            part="statistics,contentDetails",
            id=",".join(video_ids)
        )
        stats_response = stats_request.execute()
        stats_map = {item["id"]: item for item in stats_response.get("items", [])}
        
        for item in response.get("items", []):
            vid_id = item["id"].get("videoId")
            if not vid_id:
                continue
            
            snippet = item["snippet"]
            stats = stats_map.get(vid_id, {})
            view_count = int(stats.get("statistics", {}).get("viewCount", 0))
            duration = stats.get("contentDetails", {}).get("duration", "PT0S")
            
            discovered_tracks.append({
                "video_id": vid_id,
                "title": snippet["title"],
                "description": snippet["description"],
                "channel_title": snippet["channelTitle"],
                "published_at": snippet["publishedAt"],
                "thumbnail": snippet["thumbnails"]["high"]["url"],
                "views": view_count,
                "duration": duration,
                "stream_url": f"https://www.youtube.com/watch?v={vid_id}"
            })
            
    # Sort by view count to rank popular items
    discovered_tracks.sort(key=lambda x: x["views"], reverse=True)
    return discovered_tracks

if __name__ == "__main__":
    try:
        results = discover_90s_hits(language="telugu", max_results=5)
        print(json.dumps(results, indent=2))
    except Exception as e:
        print(f"[Error] Failed to execute trend discovery: {e}")
`,

  generator: `import os
import subprocess
import requests
import json
from dotenv import load_dotenv

load_dotenv()

PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")

def download_audio_clip(youtube_url, output_audio_path="temp_audio.mp3", start_time="00:00:45", duration=30):
    """
    Downloads only the audio from a youtube URL and crops it to the target hook segment.
    Uses 'yt-dlp' under the hood.
    """
    print(f"[*] Downloading audio from {youtube_url}...")
    # Formulate yt-dlp command to stream audio and postprocess it
    cmd = [
        "yt-dlp",
        "-x",
        "--audio-format", "mp3",
        "--audio-quality", "0",
        "--external-downloader", "ffmpeg",
        "--external-downloader-args", f"ffmpeg_i:-ss {start_time} -t {duration}",
        "-o", output_audio_path.replace(".mp3", ""),
        youtube_url
    ]
    subprocess.run(cmd, check=True)
    print(f"[+] Audio successfully captured to {output_audio_path}")


def fetch_pexels_stock_video(query="nostalgic rain", output_video_path="temp_stock.mp4"):
    """
    Searches Pexels for a beautiful vertical video matching our theme (misty rain, cassette, retro, slow drive).
    Downloads the 1080x1920 (vertical) version of the best match.
    """
    if not PEXELS_API_KEY:
        print("[!] No PEXELS_API_KEY found. Defaulting to standard background generation pattern.")
        return False

    print(f"[*] Searching Pexels vertical stock videos for query: '{query}'...")
    headers = {"Authorization": PEXELS_API_KEY}
    url = f"https://api.pexels.com/videos/search?query={query}&per_page=5&orientation=portrait"
    
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"[!] Pexels API returned status {response.status_code}")
        return False
        
    data = response.json()
    videos = data.get("videos", [])
    if not videos:
        print("[!] No vertical stock videos found on Pexels for this query.")
        return False
        
    # Pick the first video and select an HD/vertical file
    video_files = videos[0].get("video_files", [])
    selected_file_url = None
    
    for file in video_files:
        # We want vertical dimensions (width < height, preferably width=720 or 1080)
        if file.get("width") and file.get("height"):
            if file["width"] < file["height"]:
                selected_file_url = file["link"]
                break
                
    if not selected_file_url and video_files:
        selected_file_url = video_files[0]["link"]
        
    if selected_file_url:
        print(f"[*] Downloading stock asset from: {selected_file_url}")
        res = requests.get(selected_file_url, stream=True)
        with open(output_video_path, "wb") as f:
            for chunk in res.iter_content(chunk_size=1024*1024):
                if chunk:
                    f.write(chunk)
        print(f"[+] Stock video downloaded to {output_video_path}")
        return True
    return False


def compile_reels_video(audio_path, stock_video_path, lyrics_overlay_text, output_reels_path="output_reel.mp4"):
    """
    Synthesizes the final vertical (9:16) video with the downloaded audio clip.
    Adds a cinematic vintage vignette overlay, dims the stock background, and burns in 
    the stylized lyrics in the middle with custom fonts using FFMpeg filters.
    """
    print("[*] Launching FFMpeg visual synthesis engine...")
    
    # Escaping text for FFMpeg drawtext filter
    clean_text = lyrics_overlay_text.replace("'", "").replace(":", "")
    
    # FFMpeg command details:
    # 1. Takes the vertical stock video (-i stock_video_path)
    # 2. Takes the audio crop (-i audio_path)
    # 3. Fits dimensions to 1080x1920
    # 4. Dims background (colorchannelmixer) to make white lyrics legible
    # 5. Draws stylized text overlay in the center of the video
    # 6. Sets output length to match the audio clip (30s)
    
    cmd = [
        "ffmpeg", "-y",
        "-i", stock_video_path,
        "-i", audio_path,
        "-filter_complex", (
            # Scale video to reels dimensions (1080x1920)
            "[0:v]scale=1080:1920,setsar=1,"
            # Reduce brightness/contrast slightly for cinematic readability
            "colorlevels=romin=0.05:gomin=0.05:bomin=0.05,"
            # Draw primary lyrics with generous margin and shadow border
            "drawtext=text='" + clean_text + "':fontsize=48:fontcolor=white:"
            "x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.4:boxborderw=20:"
            "shadowcolor=black@0.7:shadowx=4:shadowy=4,"
            # Draw watermark footer (your Instagram page handle)
            "drawtext=text='@the90s_breeze':fontsize=32:fontcolor=white@0.6:"
            "x=(w-text_w)/2:y=h-150"
        ),
        "-c:v", "libx264", "-profile:v", "high", "-level", "4.0",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        output_reels_path
    ]
    
    subprocess.run(cmd, check=True)
    print(f"[+++] Video generation successfully completed! File saved: {output_reels_path}")

if __name__ == "__main__":
    # Test compilation flow
    # download_audio_clip("YOUTUBE_URL_HERE")
    # fetch_pexels_stock_video("retro slow drive")
    # compile_reels_video("temp_audio.mp3", "temp_stock.mp4", "Priya Priyathama...\\nThis 90s nostalgia hits different.")
    pass
`,

  publish: `import os
import requests
import time
from dotenv import load_dotenv

load_dotenv()

# Required Meta Graph API configuration
INSTAGRAM_ACCOUNT_ID = os.getenv("INSTAGRAM_ACCOUNT_ID")
FACEBOOK_ACCESS_TOKEN = os.getenv("FACEBOOK_ACCESS_TOKEN")

def publish_to_instagram_reels(video_url, caption="The nostalgic 90s breeze... 🥺✨"):
    """
    Publishes a video directly to Instagram Reels using the official Meta Graph API.
    Process is split into two HTTP POST steps:
    1. Upload container initialization & polling until upload is processed by Instagram.
    2. Final post publication.
    """
    if not INSTAGRAM_ACCOUNT_ID or not FACEBOOK_ACCESS_TOKEN:
        raise ValueError("INSTAGRAM_ACCOUNT_ID and FACEBOOK_ACCESS_TOKEN are required in your credentials.")

    base_url = f"https://graph.facebook.com/v19.0/{INSTAGRAM_ACCOUNT_ID}"
    
    # Step 1: Initialize the upload container
    print("[*] Initiating Reels video container upload on Instagram...")
    upload_url = f"{base_url}/media"
    payload = {
        "media_type": "REELS",
        "video_url": video_url,
        "caption": caption,
        "access_token": FACEBOOK_ACCESS_TOKEN
    }
    
    response = requests.post(upload_url, data=payload)
    if response.status_code != 200:
        raise Exception(f"Failed to create media container: {response.text}")
        
    container_id = response.json().get("id")
    print(f"[+] Container initialized successfully. ID: {container_id}")
    
    # Step 2: Poll container status until it changes to 'FINISHED'
    status_url = f"https://graph.facebook.com/v19.0/{container_id}"
    params = {
        "fields": "status_code",
        "access_token": FACEBOOK_ACCESS_TOKEN
    }
    
    print("[*] Waiting for Instagram servers to transcode and verify the video asset...")
    attempts = 0
    max_attempts = 15
    while attempts < max_attempts:
        time.sleep(20) # wait 20s
        status_res = requests.get(status_url, params=params)
        if status_res.status_code == 200:
            status_code = status_res.json().get("status_code")
            print(f"    - Current container state: {status_code}")
            if status_code == "FINISHED":
                print("[+] Video asset is successfully transcoded and ready!")
                break
            elif status_code == "ERROR":
                raise Exception("Instagram transcode engine failed with status: ERROR")
        attempts += 1
    else:
        raise TimeoutError("Polling timed out. Video took too long to transcode.")

    # Step 3: Publish the Reel!
    print("[*] Triggering final publication event...")
    publish_url = f"{base_url}/media_publish"
    publish_payload = {
        "creation_id": container_id,
        "access_token": FACEBOOK_ACCESS_TOKEN
    }
    
    final_res = requests.post(publish_url, data=publish_payload)
    if final_res.status_code == 200:
        post_id = final_res.json().get("id")
        print(f"[++++] REEL SUCCESSFULLY PUBLISHED! Instagram Post ID: {post_id}")
        return post_id
    else:
        raise Exception(f"Failed to publish reel: {final_res.text}")

if __name__ == "__main__":
    # Example usage:
    # publish_to_instagram_reels("https://your-public-bucket.s3.amazonaws.com/reels/my_reel.mp4", "Check out this 90s Telugu track!")
    pass
`
};
