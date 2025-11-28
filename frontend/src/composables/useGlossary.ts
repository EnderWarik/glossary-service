import { ref } from 'vue'
import * as api from '../api'
import type { Term, TermCreate, Relation, RelationType } from '../types'
import { parseError } from '../utils'

const emptyForm = (): TermCreate => ({
	term: '',
	definition: '',
	synonyms: [],
	tags: [],
	source_title: '',
	source_authors: '',
	source_year: undefined,
	source_link: ''
})

export function useGlossary() {
	const terms = ref<Term[]>([])
	const relations = ref<Relation[]>([])
	const query = ref('')
	const editing = ref<Term | null>(null)
	const form = ref<TermCreate>(emptyForm())

	const loading = ref(false)
	const saving = ref(false)
	const error = ref<string | null>(null)

	async function loadTerms() {
		loading.value = true
		error.value = null
		try {
			terms.value = await api.listTerms(query.value || undefined)
			await loadRelations()
		} catch (e) {
			error.value = e instanceof Error ? parseError(e) : 'Неизвестная ошибка'
		} finally {
			loading.value = false
		}
	}

	async function loadRelations() {
		loading.value = true
		error.value = null
		try {
			relations.value = await api.listRelations()
		} catch (e) {
			error.value = e instanceof Error ? parseError(e) : 'Неизвестная ошибка'
		} finally {
			loading.value = false
		}
	}

	function startEdit(term: Term) {
		editing.value = term
		form.value = {
			term: term.term,
			definition: term.definition,
			synonyms: term.synonyms ?? [],
			tags: term.tags ?? [],
			source_title: term.source_title ?? '',
			source_authors: term.source_authors ?? '',
			source_year: term.source_year ?? undefined,
			source_link: term.source_link ?? ''
		}
	}

	function resetForm() {
		editing.value = null
		form.value = emptyForm()
	}

	async function saveTerm() {
		saving.value = true
		error.value = null
		try {
			if (editing.value) {
				await api.updateTerm(editing.value.id, form.value)
			} else {
				await api.createTerm(form.value)
			}
			resetForm()
			await loadTerms()
		} catch (e) {
			error.value = e instanceof Error ? parseError(e) : 'Неизвестная ошибка'
		} finally {
			saving.value = false
		}
	}

	async function removeTerm(term: Term) {
		saving.value = true
		error.value = null
		try {
			await api.deleteTerm(term.id)
			await loadTerms()
		} catch (e) {
			error.value = e instanceof Error ? parseError(e) : 'Неизвестная ошибка'
		} finally {
			saving.value = false
		}
	}

	async function addRelation(payload: { source_id: number | null; target_id: number | null; type: RelationType }) {
		if (!payload.source_id || !payload.target_id || payload.source_id === payload.target_id) {
			error.value = 'Выберите разные узлы'
			return
		}
		saving.value = true
		error.value = null
		try {
			await api.createRelation({ source_id: payload.source_id, target_id: payload.target_id, type: payload.type })
			await loadRelations()
		} catch (e) {
			error.value = e instanceof Error ? parseError(e) : 'Неизвестная ошибка'
		} finally {
			saving.value = false
		}
	}

	async function editRelation(id: number, data: Partial<Relation>) {
		saving.value = true
		error.value = null
		try {
			await api.updateRelation(id, data)
			await loadRelations()
		} catch (e) {
			error.value = e instanceof Error ? parseError(e) : 'Неизвестная ошибка'
		} finally {
			saving.value = false
		}
	}

	async function removeRelation(id: number) {
		saving.value = true
		error.value = null
		try {
			await api.deleteRelation(id)
			await loadRelations()
		} catch (e) {
			error.value = e instanceof Error ? parseError(e) : 'Неизвестная ошибка'
		} finally {
			saving.value = false
		}
	}

	return {
		terms,
		relations,
		query,
		editing,
		form,
		loading,
		saving,
		error,
		loadTerms,
		loadRelations,
		startEdit,
		resetForm,
		saveTerm,
		removeTerm,
		addRelation,
		editRelation,
		removeRelation
	}
}
