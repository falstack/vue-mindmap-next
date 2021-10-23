<template>
  <div>
    <svg ref="mountPoint" class="mindmap-svg"></svg>
  </div>
</template>

<script setup lang="ts">
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  select,
  zoom,
  zoomIdentity
} from 'd3'

import { d3Connections, d3Nodes, d3Drag, d3PanZoom, onTick } from './utils/d3'

import { getDimensions, getViewBox } from './utils/dimensions'
import subnodesToHTML from './utils/subnodesToHTML'
import nodeToHTML from './utils/nodeToHTML'

import { Ref, ref, onMounted, onUpdated } from 'vue'

interface Props {
  nodes: any[]
  connections: any[]
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  nodes: () => [],
  connections: () => [],
  editable: false
})

const simulation = ref(
  forceSimulation()
    .force(
      'link',
      forceLink().id((node) => node.text)
    )
    .force('charge', forceManyBody())
    .force('collide', forceCollide().radius(100))
)
const mountPoint: Ref<null | Element> = ref(null)

const prepareNodes = () => {
  const render = (node) => {
    node.html = nodeToHTML(node)
    node.nodesHTML = subnodesToHTML(node.nodes)

    const dimensions = getDimensions(node.html, {}, 'mindmap-node')
    node.width = dimensions.width
    node.height = dimensions.height

    const nodesDimensions = getDimensions(
      node.nodesHTML,
      {},
      'mindmap-subnodes-text'
    )
    node.nodesWidth = nodesDimensions.width
    node.nodesHeight = nodesDimensions.height
  }

  props.nodes.forEach((node) => render(node))
}

const prepareEditor = (svg, conns, nodes, subnodes) => {
  nodes
    .attr('class', 'mindmap-node mindmap-node--editable')
    .on('dbclick', (node) => {
      node.fx = null
      node.fy = null
    })

  nodes.call(d3Drag(simulation.value, svg, nodes))

  // Tick the simulation 100 times
  for (let i = 0; i < 100; i += 1) {
    simulation.value.tick()
  }

  setTimeout(() => {
    simulation.value
      .alphaTarget(0.5)
      .on('tick', () => onTick(conns, nodes, subnodes))
  }, 200)
}

const renderMap = () => {
  const svg = select(mountPoint.value)

  // Clear the SVG in case there's stuff already there.
  svg.selectAll('*').remove()

  // Add subnode group
  svg.append('g').attr('id', 'mindmap-subnodes')

  prepareNodes()

  // Bind data to SVG elements and set all the properties to render them
  const connections = d3Connections(svg, props.connections)
  const { nodes, subnodes } = d3Nodes(svg, props.nodes)

  nodes.append('title').text((node) => node.note)

  // Bind nodes and connections to the simulation
  simulation.value.nodes(props.nodes).force('link').links(props.connections)

  if (props.editable) {
    prepareEditor(svg, connections, nodes, subnodes)
  }

  // Tick the simulation 100 times
  for (let i = 0; i < 100; i += 1) {
    simulation.value.tick()
  }

  onTick(connections, nodes, subnodes)

  svg
    .attr('viewBox', getViewBox(nodes.data()))
    .call(d3PanZoom(svg))
    .on('dbClick.zoom', null)
}

onMounted(() => {
  renderMap()
})

onUpdated(() => {
  if (!mountPoint.value) {
    return
  }

  zoom().transform(select(mountPoint.value), zoomIdentity)

  renderMap()
})
</script>

<style lang="scss">
@import './style';
</style>
