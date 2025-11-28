<script setup lang="ts">
import { computed } from 'vue'
import type { TermCreate } from '../types'

const props = defineProps<{ form: TermCreate; editing: boolean; saving: boolean }>()
const emit = defineEmits<{ submit: [] }>()

const synonymsText = computed({
	get: () => props.form.synonyms?.join(', ') ?? '',
	set: (val: string) => {
		props.form.synonyms = val.split(',').map(v => v.trim()).filter(Boolean)
	}
})

const tagsText = computed({
	get: () => props.form.tags?.join(', ') ?? '',
	set: (val: string) => {
		props.form.tags = val.split(',').map(v => v.trim()).filter(Boolean)
	}
})
</script>

<template>
	<div class="form-card">
		<div class="form-header">
			<span class="title">{{ editing ? 'Редактирование' : 'Новый термин' }}</span>
		</div>
		<form class="form" @submit.prevent="emit('submit')">
			<label class="field">
				<span class="label">Термин</span>
				<input class="input" v-model="props.form.term" required />
			</label>
			
			<label class="field">
				<span class="label">Определение</span>
				<textarea class="textarea" v-model="props.form.definition" rows="3" required />
			</label>
			
			<div class="row">
				<label class="field">
					<span class="label">Синонимы</span>
					<input class="input" v-model="synonymsText" placeholder="через запятую" />
				</label>
				<label class="field">
					<span class="label">Теги</span>
					<input class="input" v-model="tagsText" placeholder="через запятую" />
				</label>
			</div>
			
			<fieldset class="fieldset">
				<legend>Источник</legend>
				<div class="row">
					<label class="field">
						<span class="label">Название</span>
						<input class="input" v-model="props.form.source_title" />
					</label>
					<label class="field">
						<span class="label">Авторы</span>
						<input class="input" v-model="props.form.source_authors" />
					</label>
				</div>
				<div class="row">
					<label class="field">
						<span class="label">Год</span>
						<input class="input" type="number" v-model.number="props.form.source_year" />
					</label>
					<label class="field">
						<span class="label">Ссылка</span>
						<input class="input" v-model="props.form.source_link" />
					</label>
				</div>
			</fieldset>
			
			<button class="btn btn--primary" type="submit" :disabled="saving">
				{{ editing ? 'Сохранить' : 'Добавить' }}
			</button>
		</form>
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

.row {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12px;
}

.fieldset {
	border: 1px solid var(--gray-200);
	border-radius: var(--radius);
	padding: 12px;
	margin: 0;
}

.fieldset legend {
	font-size: 12px;
	font-weight: 500;
	color: var(--gray-500);
	padding: 0 6px;
}

.fieldset .row {
	margin-top: 8px;
}

.fieldset .row:first-of-type {
	margin-top: 0;
}
</style>
