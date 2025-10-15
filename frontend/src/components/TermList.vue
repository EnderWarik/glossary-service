<script setup lang="ts">
import { useCssModule } from 'vue'
import type { Term } from '../api'

const styles = useCssModule()

const props = defineProps<{ terms: Term[]; saving: boolean }>()
const emit = defineEmits<{ (e: 'edit', term: Term): void; (e: 'remove', term: Term): void }>()

function onEdit(t: Term) { emit('edit', t) }
function onRemove(t: Term) { emit('remove', t) }
</script>

<template>
	<ul :class="styles.list">
		<li v-for="t in props.terms" :key="t.id" :class="styles.item">
			<div>
				<strong>{{ t.term }}</strong>
				<p :class="styles.definition">{{ t.definition }}</p>
				<div v-if="t.tags?.length" :class="styles.meta">
					<span v-for="tag in t.tags" :key="tag" :class="styles.tag">#{{ tag }}</span>
				</div>
			</div>
			<div :class="styles.actions">
				<button :class="styles.btn" @click="onEdit(t)">Редактировать</button>
				<button :class="[styles.btn, styles.ghost]" @click="onRemove(t)" :disabled="props.saving">Удалить</button>
			</div>
		</li>
	</ul>
</template>

<style module>
.list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:12px; }
.item { display:flex; justify-content:space-between; gap:12px; padding:12px; border:1px solid #eee; border-radius:8px; background:#fafafa; }
.definition { color:#374151; margin:6px 0; }
.meta { display:flex; flex-wrap:wrap; gap:6px; }
.tag { background:#eef2ff; color:#3730a3; padding:2px 6px; border-radius:6px; font-size:12px; }
.actions { display:flex; gap:8px; align-items:center; }
.btn { padding:6px 10px; border:1px solid #ddd; border-radius:6px; background:#fff; cursor:pointer; }
.btn:disabled { opacity:.6; cursor:not-allowed; }
.ghost { background:transparent; }
</style>


