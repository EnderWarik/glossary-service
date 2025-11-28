export interface Term {
  id: number;
  term: string;
  definition: string;
  synonyms: string | null;
  tags: string | null;
  source_title: string | null;
  source_authors: string | null;
  source_year: number | null;
  source_link: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Relation {
  id: number;
  source_id: number;
  target_id: number;
  type: string;
}

export interface TermResponse {
  id: number;
  term: string;
  definition: string;
  synonyms: string[] | null;
  tags: string[] | null;
  source_title: string | null;
  source_authors: string | null;
  source_year: number | null;
  source_link: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface TermCreate {
  term: string;
  definition: string;
  synonyms?: string[];
  tags?: string[];
  source_title?: string;
  source_authors?: string;
  source_year?: number;
  source_link?: string;
}

export type TermUpdate = Partial<TermCreate>;

export interface RelationCreate {
  source_id: number;
  target_id: number;
  type: string;
}

export type RelationUpdate = Partial<RelationCreate>;

export function formatTerm(term: Term): TermResponse {
  return {
    id: term.id,
    term: term.term,
    definition: term.definition,
    synonyms: term.synonyms?.split(',').map(s => s.trim()).filter(Boolean) ?? null,
    tags: term.tags?.split(',').map(s => s.trim()).filter(Boolean) ?? null,
    source_title: term.source_title,
    source_authors: term.source_authors,
    source_year: term.source_year,
    source_link: term.source_link,
    created_at: term.created_at,
    updated_at: term.updated_at,
  };
}
