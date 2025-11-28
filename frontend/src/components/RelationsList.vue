<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Relation, Term, RelationType } from '../types'
import { getRelationLabel } from '../utils'

interface RelationDraft {
	source_id: number
	target_id: number
	type: RelationType
}

const props = defineProps<{ relations: Relation[]; terms: Term[]; saving: boolean }>()
const emit = defineEmits<{ update: [number, Partial<Relation>]; remove: [number] }>()

const termById = computed(() => new Map(props.terms.map(t => [t.id, t])))

function getLabel(r: Relation) {
	const src = termById.value.get(r.source_id)?.term ?? r.source_id
	const tgt = termById.value.get(r.target_id)?.term ?? r.target_id
	return { src, type: getRelationLabel(r.type), tgt }
}

const editingId = ref<number | null>(null)
const draft = ref<RelationDraft | null>(null)

function startEdit(r: Relation) {
	editingId.value = r.id
	draft.value = { source_id: r.source_id, target_id: r.target_id, type: r.type }
}

function cancelEdit() {
	editingId.value = null
	draft.value = null
}

function saveEdit(id: number) {
	if (draft.value) {
		emit('update', id, draft.value)
	}
	cancelEdit()
}
</script>

<template>
	<div class="relations-card">
		<div class="card-header">
			<span class="title">Связи</span>
			<span class="count">{{ relations.length }}</span>
		</div>
		<ul class="list">
			<li v-for="r in relations" :key="r.id" class="item">
				<div v-if="editingId !== r.id" class="row">
					<div class="relation-display">
						<span class="term source">{{ getLabel(r).src }}</span>
						<span class="type">{{ getLabel(r).type }}</span>
						<span class="term target">{{ getLabel(r).tgt }}</span>
					</div>
					<div class="actions">
						<button class="btn btn--sm btn--ghost" @click="startEdit(r)">Изм.</button>
						<button class="btn btn--sm btn--ghost" @click="emit('remove', r.id)" :disabled="saving">Уд.</button>
					</div>
				</div>
				<div v-else-if="draft" class="edit">
					<select class="input input--sm" v-model.number="draft.source_id">
						<option v-for="t in terms" :key="t.id" :value="t.id">{{ t.term }}</option>
					</select>
					<select class="input input--sm" v-model="draft.type">
						<option value="is-a">является</option>
						<option value="part-of">часть</option>
						<option value="related-to">связан с</option>
						<option value="synonym-of">синоним</option>
						<option value="derived-from">происходит от</option>
					</select>
					<select class="input input--sm" v-model.number="draft.target_id">
						<option v-for="t in terms" :key="t.id" :value="t.id">{{ t.term }}</option>
					</select>
					<div class="actions">
						<button class="btn btn--sm btn--primary" @click="saveEdit(r.id)" :disabled="saving">Ок</button>
						<button class="btn btn--sm btn--ghost" @click="cancelEdit">×</button>
					</div>
				</div>
			</li>
		</ul>
		<div v-if="!relations.length" class="empty">
			<p>Нет связей</p>
		</div>
	</div>
</template>

<style scoped>
.relations-card {
	border: 1px solid var(--gray-200);
	border-radius: var(--radius);
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	border-bottom: 1px solid var(--gray-200);
	background: var(--gray-50);
}

.title {
	font-size: 13px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	color: var(--gray-600);
}

.count {
	font-size: 12px;
	color: var(--gray-500);
}

.list {
	list-style: none;
	margin: 0;
	padding: 0;
	max-height: 240px;
	overflow-y: auto;
}

.item {
	padding: 10px 16px;
	border-bottom: 1px solid var(--gray-100);
}

.item:last-child {
	border-bottom: none;
}

.item:hover {
	background: var(--gray-50);
}

.row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}

.relation-display {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 13px;
}

.term {
	font-weight: 500;
}

.term.source {
	color: var(--black);
}

.term.target {
	color: var(--gray-600);
}

.type {
	color: var(--gray-400);
	font-size: 12px;
}

.edit {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr auto;
	gap: 8px;
	align-items: center;
}

.actions {
	display: flex;
	gap: 4px;
}

.empty {
	padding: 24px 16px;
	text-align: center;
	color: var(--gray-400);
}

.empty p {
	margin: 0;
	font-size: 13px;
}
</style>
