"""create processed_analyses

Revision ID: c3f1a2d4e5b6
Revises: b924c07c0193
Create Date: 2026-10-20 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3f1a2d4e5b6'
down_revision: Union[str, Sequence[str], None] = 'b924c07c0193'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('processed_analyses',
    sa.Column('analysis_id', sa.UUID(), nullable=False),
    sa.Column('processed_at', sa.DateTime(timezone=True), nullable=False),
    sa.PrimaryKeyConstraint('analysis_id'),
    schema='rag'
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('processed_analyses', schema='rag')
