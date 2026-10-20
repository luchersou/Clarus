from uuid import UUID

from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.persistence.models import ProcessedAnalysis


class ProcessedAnalysisRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def try_claim(self, analysis_id: UUID) -> bool:
        """Records the analysis as processed. Returns False if it already was."""
        statement = (
            insert(ProcessedAnalysis)
            .values(analysis_id=analysis_id)
            .on_conflict_do_nothing(index_elements=[ProcessedAnalysis.analysis_id])
            .returning(ProcessedAnalysis.analysis_id)
        )
        result = await self.session.execute(statement)
        await self.session.commit()
        return result.scalar_one_or_none() is not None
