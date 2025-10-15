from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = '0001_init'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
	op.create_table(
		'terms',
		sa.Column('id', sa.Integer(), primary_key=True),
		sa.Column('term', sa.String(length=255), nullable=False, unique=True),
		sa.Column('definition', sa.Text(), nullable=False),
		sa.Column('synonyms', sa.Text(), nullable=True),
		sa.Column('tags', sa.Text(), nullable=True),
		sa.Column('source_title', sa.String(length=512), nullable=True),
		sa.Column('source_authors', sa.String(length=512), nullable=True),
		sa.Column('source_year', sa.Integer(), nullable=True),
		sa.Column('source_link', sa.String(length=1024), nullable=True),
		sa.Column('created_at', sa.DateTime(), nullable=False),
		sa.Column('updated_at', sa.DateTime(), nullable=False),
	)
	op.create_index('ix_terms_term', 'terms', ['term'], unique=True)

	op.create_table(
		'relations',
		sa.Column('id', sa.Integer(), primary_key=True),
		sa.Column('source_id', sa.Integer(), sa.ForeignKey('terms.id', ondelete='CASCADE'), nullable=False),
		sa.Column('target_id', sa.Integer(), sa.ForeignKey('terms.id', ondelete='CASCADE'), nullable=False),
		sa.Column('type', sa.String(length=64), nullable=False),
	)
	op.create_index('ix_relations_source', 'relations', ['source_id'])
	op.create_index('ix_relations_target', 'relations', ['target_id'])
	op.create_index('ix_relations_type', 'relations', ['type'])

def downgrade() -> None:
	op.drop_index('ix_relations_type', table_name='relations')
	op.drop_index('ix_relations_target', table_name='relations')
	op.drop_index('ix_relations_source', table_name='relations')
	op.drop_table('relations')
	op.drop_index('ix_terms_term', table_name='terms')
	op.drop_table('terms')
