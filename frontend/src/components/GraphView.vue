<script setup lang="ts">
import { onMounted, ref } from 'vue'
import cytoscape, { type Core } from 'cytoscape'
import { getGraph } from '../api'
import { getRelationLabel, parseError } from '../utils'

const container = ref<HTMLDivElement | null>(null)
const nodesCount = ref(0)
const edgesCount = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)
const currentLayout = ref<'cose' | 'concentric' | 'grid'>('cose')

let cy: Core | null = null

function applyStyles(instance: Core) {
	instance.style().fromJson([
		{
			selector: 'node',
			style: {
				label: 'data(label)',
				'background-color': '#0a0a0a',
				color: '#0a0a0a',
				'text-valign': 'bottom',
				'text-halign': 'center',
				'font-size': 11,
				'font-weight': 500,
				width: 24,
				height: 24,
				'border-width': 2,
				'border-color': '#fff',
				'text-margin-y': 6
			}
		},
		{
			selector: 'edge',
			style: {
				'curve-style': 'bezier',
				'target-arrow-shape': 'triangle',
				'target-arrow-color': '#a3a3a3',
				'line-color': '#a3a3a3',
				width: 1,
				'arrow-scale': 1,
				label: 'data(label)',
				'font-size': 9,
				color: '#737373',
				'text-background-color': '#fff',
				'text-background-opacity': 1,
				'text-background-padding': '2px',
				'text-rotation': 'autorotate'
			}
		},
		{ selector: '.faded', style: { opacity: 0.1 } },
		{
			selector: '.highlight',
			style: {
				'background-color': '#404040',
				'border-color': '#0a0a0a',
				'line-color': '#404040',
				'target-arrow-color': '#404040'
			}
		}
	]).update()
}

function wireInteractions() {
	if (!cy) return
	cy.on('tap', 'node', (evt) => {
		if (!cy) return
		const neighborhood = evt.target.closedNeighborhood()
		cy.elements().addClass('faded').removeClass('highlight')
		neighborhood.removeClass('faded').addClass('highlight')
	})
	cy.on('tap', (evt) => {
		if (evt.target === cy) {
			cy.elements().removeClass('faded').removeClass('highlight')
		}
	})
}

function fit() {
	cy?.fit(undefined, 40)
}

function runLayout(name: 'cose' | 'concentric' | 'grid') {
	currentLayout.value = name
	cy?.layout({ name, animate: false }).run()
	fit()
}

async function build() {
	loading.value = true
	error.value = null
	try {
		const data = await getGraph()
		nodesCount.value = data.nodes.length
		edgesCount.value = data.edges.length

		cy?.destroy()
		cy = cytoscape({
			container: container.value!,
			elements: [
				...data.nodes.map(n => ({ data: { id: String(n.id), label: n.term } })),
				...data.edges.map(e => ({
					data: {
						id: `e-${e.id}`,
						source: String(e.source_id),
						target: String(e.target_id),
						label: getRelationLabel(e.type)
					}
				}))
			],
			layout: { name: currentLayout.value, animate: false }
		})
		applyStyles(cy)
		wireInteractions()
		fit()
	} catch (e) {
		error.value = e instanceof Error ? parseError(e) : 'Неизвестная ошибка'
	} finally {
		loading.value = false
	}
}

onMounted(build)

defineExpose({ refresh: build })
</script>

<template>
	<div class="graph-container">
		<div class="graph-card">
			<div class="graph-header">
				<div class="header-left">
					<span class="title">Граф связей</span>
					<span class="stats">{{ nodesCount }} узлов · {{ edgesCount }} связей</span>
				</div>
				<div class="toolbar">
					<select class="input input--sm" v-model="currentLayout" @change="runLayout(currentLayout)">
						<option value="cose">COSE</option>
						<option value="concentric">Concentric</option>
						<option value="grid">Grid</option>
					</select>
					<button class="btn btn--sm" @click="fit" :disabled="loading">Fit</button>
					<button class="btn btn--sm" @click="build" :disabled="loading">
						{{ loading ? 'Загрузка' : 'Обновить' }}
					</button>
				</div>
			</div>
			
			<div v-if="error" class="error-banner">{{ error }}</div>
			
			<div ref="container" class="canvas">
				<div v-if="!edgesCount && !loading" class="canvas-empty">
					<p>Нет связей для отображения</p>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.graph-card {
	border: 1px solid var(--gray-200);
	border-radius: var(--radius);
	overflow: hidden;
}

.graph-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 16px;
	border-bottom: 1px solid var(--gray-200);
	background: var(--gray-50);
	flex-wrap: wrap;
	gap: 12px;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 16px;
}

.title {
	font-size: 13px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	color: var(--gray-600);
}

.stats {
	font-size: 12px;
	color: var(--gray-500);
}

.toolbar {
	display: flex;
	gap: 8px;
	align-items: center;
}

.toolbar select {
	width: 120px;
}

.error-banner {
	margin: 12px 16px;
	padding: 8px 12px;
	background: var(--gray-100);
	border-left: 2px solid var(--black);
	font-size: 13px;
}

.canvas {
	width: 100%;
	height: 70vh;
	min-height: 400px;
	background: var(--white);
	position: relative;
}

.canvas-empty {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	text-align: center;
	color: var(--gray-400);
}

.canvas-empty p {
	margin: 0;
	font-size: 13px;
}
</style>
