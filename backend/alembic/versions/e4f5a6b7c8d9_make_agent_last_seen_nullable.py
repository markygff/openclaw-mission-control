"""make agent last_seen_at nullable

Revision ID: e4f5a6b7c8d9
Revises: d3e4f5a6b7c8
Create Date: 2026-02-04 07:10:00.000000

"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "e4f5a6b7c8d9"
down_revision = "d3e4f5a6b7c8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("agents", "last_seen_at", existing_type=sa.DateTime(), nullable=True)


def downgrade() -> None:
    op.alter_column("agents", "last_seen_at", existing_type=sa.DateTime(), nullable=False)
