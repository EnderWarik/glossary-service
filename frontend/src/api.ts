import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
})

api.interceptors.request.use((config) => {
    const token = import.meta.env.VITE_API_TOKEN
    if (token) {
        config.headers = config.headers ?? {}
        ;(config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }
    return config
})

export interface SourceInfo { title?: string; authors?: string; year?: number; link?: string }
export interface Term { id: number; term: string; definition: string; synonyms?: string[]; tags?: string[]; source?: SourceInfo; created_at: string; updated_at: string }
export interface TermCreate { term: string; definition: string; synonyms?: string[]; tags?: string[]; source?: SourceInfo }
export interface TermUpdate extends Partial<TermCreate> {}

export async function listTerms(query?: string) {
	const res = await api.get<Term[]>('/terms', { params: { query } })
	return res.data
}
export async function getByKeyword(keyword: string) {
	const res = await api.get<Term>(`/terms/by-keyword/${encodeURIComponent(keyword)}`)
	return res.data
}
export async function createTerm(data: TermCreate) {
	const res = await api.post<Term>('/terms', data)
	return res.data
}
export async function updateTerm(id: number, data: TermUpdate) {
	const res = await api.put<Term>(`/terms/${id}`, data)
	return res.data
}
export async function deleteTerm(id: number) {
	await api.delete(`/terms/${id}`)
}

export interface Relation { id: number; source_id: number; target_id: number; type: string }
export interface Graph { nodes: Term[]; edges: Relation[] }
export async function getGraph() {
	const res = await api.get<Graph>('/graph')
	return res.data
}

export async function createRelationApi(data: { source_id: number; target_id: number; type: string }) {
	const res = await api.post<Relation>('/relations', data)
	return res.data
}

export async function updateRelation(id: number, data: Partial<{ source_id: number; target_id: number; type: string }>) {
	const res = await api.put<Relation>(`/relations/${id}`, data)
	return res.data
}

export async function deleteRelation(id: number) {
	await api.delete(`/relations/${id}`)
}

export async function listRelations() {
	const res = await api.get<Relation[]>('/relations')
	return res.data
}
