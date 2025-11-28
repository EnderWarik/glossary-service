<script setup lang="ts">
defineProps<{ tab: 'list' | 'graph' }>()
const emit = defineEmits<{ 'update:tab': ['list' | 'graph'] }>()
</script>

<template>
	<header class="header">
		<h1>Glossary</h1>
		<nav class="tabs">
			<button 
				:class="['tab', { active: tab === 'list' }]" 
				@click="emit('update:tab', 'list')"
			>
				Список
			</button>
			<button 
				:class="['tab', { active: tab === 'graph' }]" 
				@click="emit('update:tab', 'graph')"
			>
				Граф
			</button>
		</nav>
	</header>
</template>

<style scoped>
.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px 24px;
	border-bottom: 1px solid var(--gray-200);
	background: var(--white);
}

.header h1 {
	margin: 0;
	font-size: 18px;
	font-weight: 600;
	letter-spacing: -0.3px;
}

.tabs {
	display: flex;
	gap: 4px;
}

.tab {
	padding: 6px 14px;
	border: none;
	background: transparent;
	color: var(--gray-500);
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	transition: var(--transition);
	border-radius: var(--radius);
}

.tab:hover {
	color: var(--black);
	background: var(--gray-100);
}

.tab.active {
	background: var(--black);
	color: var(--white);
}
</style>
