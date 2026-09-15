from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.persistence.models import ChatSession


class ChatSessionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def save(self, chat_session: ChatSession) -> None:
        self.session.add(chat_session)
        await self.session.commit()

    async def find_by_id(self, session_id: UUID) -> ChatSession | None:
        return await self.session.get(ChatSession, session_id)

    async def find_by_user_id(self, user_id: UUID) -> list[ChatSession]:
        result = await self.session.execute(
            select(ChatSession).where(ChatSession.user_id == user_id)
        )
        return list(result.scalars().all())