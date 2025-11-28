export interface Term {
	id: number
	term: string
	definition: string
	synonyms: string[] | null
	tags: string[] | null
	source_title: string | null
	source_authors: string | null
	source_year: number | null
	source_link: string | null
	created_at: string
	updated_at: string
}

export interface TermCreate {
	term: string
	definition: string
	synonyms?: string[]
	tags?: string[]
	source_title?: string
	source_authors?: string
	source_year?: number
	source_link?: string
}

export type TermUpdate = Partial<TermCreate>

export interface Relation {
	id: number
	source_id: number
	target_id: number
	type: RelationType
}

export type RelationType = 'is-a' | 'part-of' | 'related-to' | 'synonym-of' | 'derived-from'

export interface Graph {
	nodes: Term[]
	edges: Relation[]
}
