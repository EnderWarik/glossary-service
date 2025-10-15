<script setup lang="ts">
import { ref, onMounted, useCssModule, watch } from 'vue'
import { listTerms, listRelations, updateRelation, deleteRelation, createTerm, updateTerm, deleteTerm, createRelationApi, type Term, type TermCreate, type Relation } from './api'
import GraphView from './components/GraphView.vue'
import HeaderTabs from './components/HeaderTabs.vue'
import SearchToolbar from './components/SearchToolbar.vue'
import TermList from './components/TermList.vue'
import TermForm from './components/TermForm.vue'
import RelationForm from './components/RelationForm.vue'
import RelationsList from './components/RelationsList.vue'

const styles = useCssModule()

const terms = ref<Term[]>([])
const relations = ref<Relation[]>([])
const q = ref('')
const editing = ref<Term | null>(null)
const form = ref<TermCreate>({ term: '', definition: '', synonyms: [], tags: [], source: { title: '', authors: '', year: undefined, link: '' } })
const tab = ref<'list'|'graph'>('list')
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)

const graphRef = ref<InstanceType<typeof GraphView> | null>(null)

async function createRelation(payload: { source_id: number | null; target_id: number | null; type: 'is-a'|'part-of'|'related-to'|'synonym-of'|'derived-from' }) {
	if (!payload.source_id || !payload.target_id || payload.source_id === payload.target_id) {
		error.value = 'Выберите разные узлы'
		return
	}
	try {
		saving.value = true
		error.value = null
        await createRelationApi({ source_id: payload.source_id, target_id: payload.target_id, type: payload.type })
        await reloadRelations()
        if (tab.value === 'graph') graphRef.value?.refresh()
	} catch (e: any) {
		error.value = e?.response?.data?.detail || e?.message || 'Не удалось создать связь'
	} finally {
		saving.value = false
	}
}

async function reload() {
	try {
		loading.value = true
		error.value = null
        terms.value = await listTerms(q.value || undefined)
        await reloadRelations()
	} catch (e: any) {
		error.value = e?.response?.data?.detail || e?.message || 'Не удалось загрузить данные'
	} finally {
		loading.value = false
	}
}

async function reloadRelations() {
    try {
        relations.value = await listRelations()
    } catch (e:any) {
    }
}

async function updateRelationHandler(id: number, data: Partial<Relation>) {
    try {
        saving.value = true
        error.value = null
        await updateRelation(id, data)
        await reloadRelations()
        if (tab.value === 'graph') graphRef.value?.refresh()
    } catch (e:any) {
        error.value = e?.response?.data?.detail || e?.message || 'Не удалось изменить связь'
    } finally {
        saving.value = false
    }
}

async function deleteRelationHandler(id: number) {
    try {
        saving.value = true
        error.value = null
        await deleteRelation(id)
        await reloadRelations()
        if (tab.value === 'graph') graphRef.value?.refresh()
    } catch (e:any) {
        error.value = e?.response?.data?.detail || e?.message || 'Не удалось удалить связь'
    } finally {
        saving.value = false
    }
}

function edit(t: Term) {
	editing.value = t
	form.value = { term: t.term, definition: t.definition, synonyms: t.synonyms, tags: t.tags, source: t.source }
}

async function save() {
	try {
		saving.value = true
		error.value = null
		if (editing.value) {
			await updateTerm(editing.value.id, form.value)
			editing.value = null
		} else {
			await createTerm(form.value)
		}
		form.value = { term: '', definition: '', synonyms: [], tags: [], source: { title: '', authors: '', year: undefined, link: '' } }
		reload()
	} catch (e: any) {
		error.value = e?.response?.data?.detail || e?.message || 'Ошибка сохранения'
	} finally {
		saving.value = false
	}
}

async function remove(t: Term) {
	try {
		saving.value = true
		error.value = null
		await deleteTerm(t.id)
		reload()
	} catch (e: any) {
		error.value = e?.response?.data?.detail || e?.message || 'Ошибка удаления'
	} finally {
		saving.value = false
	}
}

onMounted(reload)

watch(tab, (val) => {
    if (val === 'graph') graphRef.value?.refresh()
})


</script>

<template>
	<div :class="styles.wrap">
		<HeaderTabs :tab="tab" @update:tab="val => tab = val" />
		<main :class="styles.main">
			<section v-if="tab==='list'">
				<SearchToolbar v-model:q="q" :loading="loading" :error="error" @search="reload" />
				<div :class="styles.grid">
					<div>
						<TermList :terms="terms" :saving="saving" @edit="edit" @remove="remove" />
					</div>
					<div>
						<h3>{{ editing ? 'Изменить термин' : 'Добавить термин' }}</h3>
						<TermForm :form="form" :editing="!!editing" :saving="saving" @submit="save" />
						<hr style="border:none;border-top:1px solid #eee; margin:12px 0;" />
						<h3>Добавить связь</h3>
						<RelationForm :terms="terms" :saving="saving" @submit="createRelation" />
						<hr style="border:none;border-top:1px solid #eee; margin:12px 0;" />
						<h3>Связи</h3>
						<RelationsList :relations="relations" :terms="terms" :saving="saving" @update="updateRelationHandler" @remove="deleteRelationHandler" />
					</div>
				</div>
			</section>
			<section v-else>
				<GraphView ref="graphRef" />
			</section>
		</main>
	</div>
</template>

<style module>
.wrap { display: flex; flex-direction: column; min-height: 100vh; font-family: system-ui, sans-serif; }
.main { flex:1; padding: 16px; }
.toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; }
.grid { display:grid; grid-template-columns: 1fr 1fr; gap:16px; }
.search { display:flex; gap:8px; }
.error { color:#b91c1c; font-size:14px; }
</style>
