<script setup lang="ts">
import { ref } from 'vue'
import type { Term, RelationType } from '../types'

defineProps<{ terms: Term[]; saving: boolean }>()
const emit = defineEmits<{ submit: [{ source_id: number | null; target_id: number | null; type: RelationType }] }>()

const sourceId = ref<number | null>(null)
const targetId = ref<number | null>(null)
const type = ref<RelationType>('related-to')

function submit() {
	emit('submit', { source_id: sourceId.value, target_id: targetId.value, type: type.value })
}
</script>

<template>
	<div class="form-card">
		<div class="form-header">
			<span class="title">Новая связь</span>
		</div>
		<div class="form">
			<div class="form-row">
				<label class="field">
					<span class="label">Источник</span>
					<select class="input" v-model.number="sourceId">
						<option :value="null">—</option>
						<option v-for="t in terms" :key="t.id" :value="t.id">{{ t.term }}</option>
					</select>
				</label>
				
				<span class="arrow">→</span>
				
				<label class="field">
					<span class="label">Приёмник</span>
					<select class="input" v-model.number="targetId">
						<option :value="null">—</option>
						<option v-for="t in terms" :key="t.id" :value="t.id">{{ t.term }}</option>
					</select>
				</label>
			</div>
			
			<label class="field">
				<span class="label">Тип</span>
				<select class="input" v-model="type">
					<option value="is-a">является</option>
					<option value="part-of">часть</option>
					<option value="related-to">связан с</option>
					<option value="synonym-of">синоним</option>
					<option value="derived-from">происходит от</option>
				</select>
			</label>
			
			<button class="btn btn--primary" @click="submit" :disabled="saving">
				Создать связь
			</button>
		</div>
	</div>
</template>

<style scoped>
.form-card {
	border: 1px solid var(--gray-200);
	border-radius: var(--radius);
}

.form-header {
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

.form {
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 16px;
}

.form-row {
	display: grid;
	grid-template-columns: 1fr auto 1fr;
	gap: 12px;
	align-items: end;
}

.arrow {
	padding-bottom: 10px;
	color: var(--gray-400);
	font-size: 16px;
}

.field {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.label {
	font-size: 12px;
	font-weight: 500;
	color: var(--gray-600);
}
</style>
