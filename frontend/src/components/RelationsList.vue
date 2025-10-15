<script setup lang="ts">
import { computed, ref, useCssModule } from 'vue'
import type { Relation, Term } from '../api'

const styles = useCssModule()

const props = defineProps<{ relations: Relation[]; terms: Term[]; saving: boolean }>()
const emit = defineEmits<{ (e: 'update', id: number, data: Partial<Relation>): void; (e: 'remove', id: number): void }>()

const termById = computed(() => {
	const map = new Map<number, Term>()
	for (const t of props.terms) map.set(t.id, t)
	return map
})

function ruType(t: string) {
	switch (t) {
		case 'is-a': return 'является'
		case 'part-of': return 'часть'
		case 'related-to': return 'связан с'
		case 'synonym-of': return 'синоним'
		case 'derived-from': return 'происходит от'
		default: return t
	}
}
function label(r: Relation) {
	return `${termById.value.get(r.source_id)?.term ?? r.source_id} —[${ruType(r.type)}]→ ${termById.value.get(r.target_id)?.term ?? r.target_id}`
}

const editingId = ref<number | null>(null)
const draft: any = ref<Partial<Relation>>({})

function startEdit(r: Relation) {
	editingId.value = r.id
	draft.value = { source_id: r.source_id, target_id: r.target_id, type: r.type }
}
function cancelEdit() {
	editingId.value = null
	draft.value = {}
}
function saveEdit(id: number) {
	emit('update', id, draft.value)
	cancelEdit()
}
</script>

<template>
	<ul :class="styles.list">
		<li v-for="r in props.relations" :key="r.id" :class="styles.item">
			<div v-if="editingId!==r.id" :class="styles.row">
				<span>{{ label(r) }}</span>
				<div :class="styles.actions">
					<button :class="styles.btn" @click="startEdit(r)">Изм.</button>
					<button :class="[styles.btn, styles.ghost]" @click="emit('remove', r.id)" :disabled="props.saving">Удалить</button>
				</div>
			</div>
			<div v-else :class="styles.edit">
				<select :class="styles.input" v-model.number="draft.source_id">
					<option v-for="t in props.terms" :key="t.id" :value="t.id">{{ t.term }}</option>
				</select>
				<select :class="styles.input" v-model.number="draft.target_id">
					<option v-for="t in props.terms" :key="t.id" :value="t.id">{{ t.term }}</option>
				</select>
				<select :class="styles.input" v-model="draft.type">
					<option value="is-a">является</option>
					<option value="part-of">часть</option>
					<option value="related-to">связан с</option>
					<option value="synonym-of">синоним</option>
					<option value="derived-from">происходит от</option>
				</select>
				<div :class="styles.actions">
					<button :class="[styles.btn, styles.primary]" @click="saveEdit(r.id)" :disabled="props.saving">Сохранить</button>
					<button :class="[styles.btn, styles.ghost]" @click="cancelEdit">Отмена</button>
				</div>
			</div>
		</li>
	</ul>
</template>

<style module>
.list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:10px; }
.item { display:flex; flex-direction:column; gap:8px; padding:10px; border:1px solid #eee; border-radius:8px; background:#fafafa; }
.row { display:flex; align-items:center; justify-content:space-between; gap:10px; }
.edit { display:grid; grid-template-columns: 1fr 1fr 1fr auto; gap:8px; align-items:center; }
.actions { display:flex; gap:8px; }
.btn { padding:6px 10px; border:1px solid #ddd; border-radius:6px; background:#fff; cursor:pointer; }
.btn:disabled { opacity:.6; cursor:not-allowed; }
.ghost { background:transparent; }
.primary { background:#111; color:#fff; border-color:#111; }
.input { background:#fff; border:1px solid #ddd; border-radius:6px; padding:6px 8px; }
</style>


