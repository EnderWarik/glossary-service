<script setup lang="ts">
import { computed, useCssModule } from 'vue'
import type { TermCreate } from '../api'

const styles = useCssModule()

const props = defineProps<{ form: TermCreate; editing: boolean; saving: boolean }>()
const emit = defineEmits<{ (e: 'submit'): void }>()

const synonymsText = computed({
	get: () => (props.form.synonyms && props.form.synonyms.length ? props.form.synonyms.join(', ') : ''),
	set: (val: string) => {
		const parts = val.split(',').map(v => v.trim()).filter(Boolean)
		props.form.synonyms = parts.length ? parts : []
	}
})

const tagsText = computed({
	get: () => (props.form.tags && props.form.tags.length ? props.form.tags.join(', ') : ''),
	set: (val: string) => {
		const parts = val.split(',').map(v => v.trim()).filter(Boolean)
		props.form.tags = parts.length ? parts : []
	}
})

function onSubmit() {
	emit('submit')
}
</script>

<template>
	<form @submit.prevent="onSubmit" :class="styles.form">
		<label>
			<span>Термин</span>
			<input :class="styles.input" v-model="props.form.term" required />
		</label>
		<label>
			<span>Определение</span>
			<textarea :class="styles.textarea" v-model="props.form.definition" rows="6" required />
		</label>
		<div :class="styles.row2">
			<label>
				<span>Синонимы</span>
				<input :class="styles.input" v-model="synonymsText" placeholder="через запятую" />
			</label>
			<label>
				<span>Теги</span>
				<input :class="styles.input" v-model="tagsText" placeholder="через запятую" />
			</label>
		</div>
		<fieldset :class="styles.fieldset">
			<legend>Источник</legend>
			<div :class="styles.row2">
				<label>
					<span>Название</span>
					<input :class="styles.input" v-model="(props.form as any).source.title" />
				</label>
				<label>
					<span>Авторы</span>
					<input :class="styles.input" v-model="(props.form as any).source.authors" />
				</label>
			</div>
			<div :class="styles.row2">
				<label>
					<span>Год</span>
					<input :class="styles.input" type="number" v-model.number="(props.form as any).source.year" />
				</label>
				<label>
					<span>Ссылка</span>
					<input :class="styles.input" v-model="(props.form as any).source.link" />
				</label>
			</div>
		</fieldset>
		<button :class="[styles.btn, styles.primary]" type="submit" :disabled="props.saving">{{ props.editing ? 'Сохранить' : 'Добавить' }}</button>
	</form>
</template>

<style module>
.form { display:flex; flex-direction:column; gap:10px; }
.row2 { display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
.fieldset { border:1px solid #eee; border-radius:8px; padding:10px 12px; }
.btn { padding:8px 12px; border:1px solid #111; border-radius:8px; background:#111; color:#fff; cursor:pointer; }
.btn:disabled { opacity:.6; cursor:not-allowed; }
.primary { background:#111; color:#fff; border-color:#111; }
.input { background:#fff; border:1px solid #ddd; border-radius:8px; padding:8px 10px; width:100%; }
.textarea { background:#fff; border:1px solid #ddd; border-radius:8px; padding:8px 10px; min-height:120px; width:100%; }
</style>


