import asyncio
from supabase import create_client, Client

from app.core.config import settings

BUCKET_NAME = "documents"

_client: Client = create_client(settings.supabase_url, settings.supabase_service_role_key)


class FileDownloadError(Exception):
    pass


async def download_file(storage_path: str) -> bytes:
    try:
        return await asyncio.to_thread(
            _client.storage.from_(BUCKET_NAME).download, storage_path
        )
    except Exception as exc:
        raise FileDownloadError(f"Failed to download file at '{storage_path}': {exc}") from exc