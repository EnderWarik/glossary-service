import type { RelationType } from './types'

const RELATION_LABELS: Record<RelationType, string> = {
	'is-a': 'является',
	'part-of': 'часть',
	'related-to': 'связан с',
	'synonym-of': 'синоним',
	'derived-from': 'происходит от'
}

export function getRelationLabel(type: RelationType): string {
	return RELATION_LABELS[type]
}

export function isRelationType(value: string): value is RelationType {
	return value in RELATION_LABELS
}

interface AxiosLikeError extends Error {
	response?: { data?: { detail?: string } }
}

function isAxiosLikeError(e: Error): e is AxiosLikeError {
	return 'response' in e
}

export function parseError(e: Error): string {
	if (isAxiosLikeError(e) && e.response?.data?.detail) {
		return e.response.data.detail
	}
	return e.message || 'Неизвестная ошибка'
}
