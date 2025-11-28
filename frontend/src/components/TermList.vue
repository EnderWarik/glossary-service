<script setup lang="ts">
import type { Term } from '../types'

defineProps<{ terms: Term[]; saving: boolean }>()
const emit = defineEmits<{ edit: [Term]; remove: [Term] }>()
</script>

<template>
	<div class="list-container">
		<div class="list-header">
			<span class="title">Термины</span>
			<span class="count">{{ terms.length }}</span>
		</div>
		<ul class="list">
			<li v-for="t in terms" :key="t.id" class="item">
				<div class="item-content">
					<div class="item-header">
						<strong>{{ t.term }}</strong>
						<span v-if="t.source_year" class="year">{{ t.source_year }}</span>
					</div>
					<p class="definition">{{ t.definition }}</p>
					<div v-if="t.tags?.length" class="tags">
						<span v-for="tag in t.tags" :key="tag" class="tag">{{ tag }}</span>
					</div>
					<div v-if="t.synonyms?.length" class="synonyms">
						Синонимы: {{ t.synonyms.join(', ') }}
					</div>
				</div>
				<div class="actions">
					<button class="btn btn--sm" @click="emit('edit', t)">Изменить</button>
					<button class="btn btn--sm btn--ghost" @click="emit('remove', t)" :disabled="saving">Удалить</button>
				</div>
			</li>
		</ul>
		<div v-if="!terms.length" class="empty">
			<p>Нет терминов</p>
		</div>
	</div>
</template>

<style scoped>
.list-container {
	border: 1px solid var(--gray-200);
	border-radius: var(--radius);
}

.list-header {
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
	max-height: 65vh;
	overflow-y: auto;
}

.item {
	display: flex;
	justify-content: space-between;
	gap: 16px;
	padding: 16px;
	border-bottom: 1px solid var(--gray-100);
}

.item:last-child {
	border-bottom: none;
}

.item:hover {
	background: var(--gray-50);
}

.item-content {
	flex: 1;
	min-width: 0;
}

.item-header {
	display: flex;
	align-items: baseline;
	gap: 8px;
	margin-bottom: 6px;
}

.item-header strong {
	font-size: 14px;
	font-weight: 600;
}

.year {
	font-size: 12px;
	color: var(--gray-400);
}

.definition {
	margin: 0 0 8px;
	color: var(--gray-700);
	font-size: 13px;
	line-height: 1.5;
}

.tags {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
	margin-bottom: 6px;
}

.tag {
	background: var(--gray-100);
	color: var(--gray-600);
	padding: 2px 8px;
	border-radius: 2px;
	font-size: 11px;
}

.synonyms {
	font-size: 12px;
	color: var(--gray-500);
}

.actions {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.empty {
	padding: 32px 16px;
	text-align: center;
	color: var(--gray-400);
}

.empty p {
	margin: 0;
	font-size: 13px;
}
</style>
