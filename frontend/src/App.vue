<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useGlossary } from './composables/useGlossary'
import GraphView from './components/GraphView.vue'
import HeaderTabs from './components/HeaderTabs.vue'
import SearchToolbar from './components/SearchToolbar.vue'
import TermList from './components/TermList.vue'
import TermForm from './components/TermForm.vue'
import RelationForm from './components/RelationForm.vue'
import RelationsList from './components/RelationsList.vue'

const {
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
	saveTerm,
	removeTerm,
	addRelation,
	editRelation,
	removeRelation
} = useGlossary()

const tab = ref<'list' | 'graph'>('list')
const graphRef = ref<InstanceType<typeof GraphView> | null>(null)

onMounted(loadTerms)

watch(tab, (val) => {
	if (val === 'graph') graphRef.value?.refresh()
})

async function handleAddRelation(payload: Parameters<typeof addRelation>[0]) {
	await addRelation(payload)
	if (tab.value === 'graph') graphRef.value?.refresh()
}

async function handleEditRelation(id: number, data: Parameters<typeof editRelation>[1]) {
	await editRelation(id, data)
	if (tab.value === 'graph') graphRef.value?.refresh()
}

async function handleRemoveRelation(id: number) {
	await removeRelation(id)
	if (tab.value === 'graph') graphRef.value?.refresh()
}
</script>

<template>
	<div class="app">
		<HeaderTabs v-model:tab="tab" />
		<main class="main">
			<section v-if="tab === 'list'" class="list-view">
				<SearchToolbar v-model="query" :loading="loading" :error="error" @search="loadTerms" />
				<div class="grid">
					<div class="col-terms">
						<TermList :terms="terms" :saving="saving" @edit="startEdit" @remove="removeTerm" />
					</div>
					<div class="col-forms">
						<TermForm :form="form" :editing="!!editing" :saving="saving" @submit="saveTerm" />
						<RelationForm :terms="terms" :saving="saving" @submit="handleAddRelation" />
						<RelationsList
							:relations="relations"
							:terms="terms"
							:saving="saving"
							@update="handleEditRelation"
							@remove="handleRemoveRelation"
						/>
					</div>
				</div>
			</section>
			<section v-else class="graph-view">
				<GraphView ref="graphRef" />
			</section>
		</main>
	</div>
</template>

<style scoped>
.app {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background: var(--white);
}

.main {
	flex: 1;
	padding: 24px;
	max-width: 1400px;
	margin: 0 auto;
	width: 100%;
}

.grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 24px;
	align-items: start;
}

.col-forms {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

@media (max-width: 1024px) {
	.grid {
		grid-template-columns: 1fr;
	}
}
</style>
