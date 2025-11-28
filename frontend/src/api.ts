import axios from 'axios'
import type { Term, TermCreate, TermUpdate, Relation, Graph } from './types'

const client = axios.create({ baseURL: '/api' })

client.interceptors.request.use((config) => {
	const token = import.meta.env.VITE_API_TOKEN
	if (token) {
		config.headers = config.headers ?? {}
		config.headers['Authorization'] = `Bearer ${token}`
	}
	return config
})

export const listTerms = (query?: string) =>
	client.get<Term[]>('/terms', { params: { query } }).then(r => r.data)

export const getTerm = (id: number) =>
	client.get<Term>(`/terms/${id}`).then(r => r.data)

export const getByKeyword = (keyword: string) =>
	client.get<Term>(`/terms/by-keyword/${encodeURIComponent(keyword)}`).then(r => r.data)

export const createTerm = (data: TermCreate) =>
	client.post<Term>('/terms', data).then(r => r.data)

export const updateTerm = (id: number, data: TermUpdate) =>
	client.put<Term>(`/terms/${id}`, data).then(r => r.data)

export const deleteTerm = (id: number) =>
	client.delete(`/terms/${id}`)

export const listRelations = () =>
	client.get<Relation[]>('/relations').then(r => r.data)

export const createRelation = (data: { source_id: number; target_id: number; type: string }) =>
	client.post<Relation>('/relations', data).then(r => r.data)

export const updateRelation = (id: number, data: Partial<{ source_id: number; target_id: number; type: string }>) =>
	client.put<Relation>(`/relations/${id}`, data).then(r => r.data)

export const deleteRelation = (id: number) =>
	client.delete(`/relations/${id}`)

export const getGraph = () =>
	client.get<Graph>('/graph').then(r => r.data)
