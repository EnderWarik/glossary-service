<script setup lang="ts">
import { useCssModule } from 'vue'
import type { Term } from '../api'

const styles = useCssModule()

const props = defineProps<{
	terms: Term[]
	saving: boolean
}>()

const emit = defineEmits<{
	(e: 'submit', payload: { source_id: number | null; target_id: number | null; type: 'is-a'|'part-of'|'related-to'|'synonym-of'|'derived-from' }): void
}>()

let source_id: number | null = null
let target_id: number | null = null
let type: 'is-a'|'part-of'|'related-to'|'synonym-of'|'derived-from' = 'related-to'

function submit() {
	emit('submit', { source_id, target_id, type })
}
</script>

<template>
	<div :class="styles.form">
		<label>
			<span>Источник</span>
			<select :class="styles.input" v-model.number="source_id">
				<option :value="null">—</option>
				<option v-for="t in props.terms" :key="t.id" :value="t.id">{{ t.term }}</option>
			</select>
		</label>
		<label>
			<span>Приёмник</span>
			<select :class="styles.input" v-model.number="target_id">
				<option :value="null">—</option>
				<option v-for="t in props.terms" :key="t.id" :value="t.id">{{ t.term }}</option>
			</select>
		</label>
		<label>
			<span>Тип</span>
			<select :class="styles.input" v-model="type">
				<option value="is-a">является</option>
				<option value="part-of">часть</option>
				<option value="related-to">связан с</option>
				<option value="synonym-of">синоним</option>
				<option value="derived-from">происходит от</option>
			</select>
		</label>
		<div>
			<button :class="[styles.btn, styles.primary]" @click="submit" :disabled="props.saving">Создать связь</button>
		</div>
	</div>
</template>

<style module>
.form { display:flex; flex-direction:column; gap:10px; }
.btn { padding:8px 12px; border:1px solid #111; border-radius:8px; background:#111; color:#fff; cursor:pointer; }
.btn:disabled { opacity:.6; cursor:not-allowed; }
.primary { background:#111; color:#fff; border-color:#111; }
.input { background:#fff; border:1px solid #ddd; border-radius:8px; padding:8px 10px; width:100%; }
</style>


