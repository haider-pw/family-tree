<template>
  <div class="relative w-full h-full">
    <div ref="chartContainer" class="family-chart-container"/>

    <!-- Zoom Controls -->
    <div class="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
      <button
        @click="zoomIn"
        class="w-10 h-10 rounded-lg bg-white/90 dark:bg-surface-dark/90 border border-heritage-green/20 dark:border-heritage-gold/20 hover:bg-white dark:hover:bg-surface-dark transition-colors flex items-center justify-center shadow-lg"
        aria-label="Zoom in"
      >
        <svg class="w-5 h-5 text-text-primary-light dark:text-text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      <button
        @click="zoomOut"
        class="w-10 h-10 rounded-lg bg-white/90 dark:bg-surface-dark/90 border border-heritage-green/20 dark:border-heritage-gold/20 hover:bg-white dark:hover:bg-surface-dark transition-colors flex items-center justify-center shadow-lg"
        aria-label="Zoom out"
      >
        <svg class="w-5 h-5 text-text-primary-light dark:text-text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </button>
      <button
        @click="resetZoom"
        class="w-10 h-10 rounded-lg bg-white/90 dark:bg-surface-dark/90 border border-heritage-green/20 dark:border-heritage-gold/20 hover:bg-white dark:hover:bg-surface-dark transition-colors flex items-center justify-center shadow-lg"
        aria-label="Reset zoom"
      >
        <svg class="w-5 h-5 text-text-primary-light dark:text-text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
      <button
        @click="centerTree"
        class="w-10 h-10 rounded-lg bg-white/90 dark:bg-surface-dark/90 border border-heritage-green/20 dark:border-heritage-gold/20 hover:bg-white dark:hover:bg-surface-dark transition-colors flex items-center justify-center shadow-lg"
        aria-label="Center tree"
      >
        <svg class="w-5 h-5 text-text-primary-light dark:text-text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 01.553-.894L9 2m0 18l6-3m-6 3V2m6 18l5.447-2.724A1 1 0 0021 16.382V5.618a1 1 0 00-.553-.894L15 2m0 18V2" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { createChart, handlers } from 'family-chart';
import type { Datum, TreeDatum } from 'family-chart';

const props = defineProps<{
  familyData: Datum[];
  ancestryDepth: number;
  progenyDepth: number;
}>();

const chartContainer = ref<HTMLElement | null>(null);
let familyChartInstance: ReturnType<typeof createChart> | null = null;
let svgElement: SVGElement | null = null;
let resizeObserver: ResizeObserver | null = null;

const renderChart = () => {
  if (chartContainer.value && props.familyData) {
    if (!familyChartInstance) {
      // Use the proper family-chart API
      const cont = chartContainer.value;

      // Create the chart instance
      familyChartInstance = createChart(cont, props.familyData);

      // Configure chart spacing and depth
      familyChartInstance
        .setCardXSpacing(280)
        .setCardYSpacing(150)
        .setAncestryDepth(props.ancestryDepth)
        .setProgenyDepth(props.progenyDepth);

      const cardHtml = (d: TreeDatum) => {
        // Safety checks for data structure
        if (!d || !d.data) {
          console.warn('Card render: Invalid data structure', d);
          return '<div class="node-card">Invalid data</div>';
        }

        // d.data contains the nested data object from our JSON
        const personData = d.data.data || {};
        const mainDatum = familyChartInstance?.getMainDatum();
        const isMain = mainDatum && (mainDatum.id === d.data.id || mainDatum.id === d.id);

        return `
          <div class="node-card glass-card" data-gender="${personData.gender || 'M'}" data-main="${isMain}">
            <div class="card-border"></div>
            <div class="card-inner">
              ${personData.img ? `
                <div class="avatar">
                  <img src="${personData.img}" alt="${personData.name || 'Unknown'}" />
                </div>
              ` : `
                <div class="avatar avatar-placeholder">
                  <span class="avatar-initial">${personData.name ? personData.name.charAt(0) : '?'}</span>
                </div>
              `}
              <div class="card-content">
                <div class="name">${personData.name || 'Unknown'}</div>
                ${isMain ? `<div class="relationship">Main Person</div>` : ''}
              </div>
            </div>
          </div>
        `;
      };

      const card = familyChartInstance.setCardHtml();
      card.setCardDim({
          w: 260,
          h: 96
        })
        .setCardInnerHtmlCreator(cardHtml)
        .setOnCardClick((d: TreeDatum) => {
          // Safety check for data structure
          if (!d || !d.data) {
            console.warn('Card click: Invalid data structure', d);
            return;
          }

          const nodeId = d.data.id || d.id;
          if (nodeId && familyChartInstance) {
            familyChartInstance.updateMainId(nodeId);
            familyChartInstance.updateTree({ tree_position: 'main_to_middle', transition_time: 500 });
          }
        });

      // Get the SVG element for zoom handlers
      svgElement = cont.querySelector('svg') as SVGElement;

      // Set explicit SVG dimensions to fill container
      if (svgElement) {
        const containerRect = cont.getBoundingClientRect();
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', '100%');
        svgElement.style.width = '100%';
        svgElement.style.height = '100%';

        // Set viewBox to ensure proper scaling
        const viewBoxWidth = containerRect.width || window.innerWidth;
        const viewBoxHeight = containerRect.height || (window.innerHeight - 100);
        svgElement.setAttribute('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`);
        svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      }

      // Initial tree render with fit to container
      familyChartInstance.updateTree({ initial: true, tree_position: 'fit' });

      // Force a re-fit after a delay to ensure proper sizing
      setTimeout(() => {
        if (svgElement && familyChartInstance) {
          const containerRect = cont.getBoundingClientRect();
          // Use handlers to manually fit the tree
          handlers.treeFit({
            svg: svgElement,
            svg_dim: { w: containerRect.width, h: containerRect.height },
            tree_dim: { w: containerRect.width, h: containerRect.height },
            transition_time: 500
          });
        }
      }, 100);
    } else {
      familyChartInstance.updateData(props.familyData);
      familyChartInstance.updateTree({ tree_position: 'fit' });
    }
  }
};

// Zoom control methods using the handlers API
const zoomIn = () => {
  if (svgElement) {
    handlers.manualZoom({ amount: 1.2, svg: svgElement, transition_time: 300 });
  }
};

const zoomOut = () => {
  if (svgElement) {
    handlers.manualZoom({ amount: 1 / 1.2, svg: svgElement, transition_time: 300 });
  }
};

const resetZoom = () => {
  if (svgElement && chartContainer.value) {
    // Reset zoom and fit tree to container
    handlers.zoomTo(svgElement, 1);
    const containerRect = chartContainer.value.getBoundingClientRect();
    handlers.treeFit({
      svg: svgElement,
      svg_dim: { w: containerRect.width, h: containerRect.height },
      tree_dim: { w: containerRect.width * 0.9, h: containerRect.height * 0.9 }, // Use 90% of container for better fit
      transition_time: 300
    });
  }
};

const centerTree = () => {
  if (familyChartInstance && svgElement && chartContainer.value) {
    // First update tree position
    familyChartInstance.updateTree({
      tree_position: 'main_to_middle',
      transition_time: 500
    });

    // Then ensure proper fit
    setTimeout(() => {
      const containerRect = chartContainer.value!.getBoundingClientRect();
      handlers.treeFit({
        svg: svgElement,
        svg_dim: { w: containerRect.width, h: containerRect.height },
        tree_dim: { w: containerRect.width * 0.9, h: containerRect.height * 0.9 },
        transition_time: 300
      });
    }, 100);
  }
};

// Handle container resize
const handleResize = () => {
  if (familyChartInstance && svgElement && chartContainer.value) {
    const containerRect = chartContainer.value.getBoundingClientRect();

    // Update SVG dimensions
    svgElement.setAttribute('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`);

    // Re-fit the tree to the new container size
    familyChartInstance.updateTree({
      tree_position: 'fit',
      transition_time: 300
    });

    // Ensure proper fit with handlers
    setTimeout(() => {
      handlers.treeFit({
        svg: svgElement,
        svg_dim: { w: containerRect.width, h: containerRect.height },
        tree_dim: { w: containerRect.width * 0.9, h: containerRect.height * 0.9 },
        transition_time: 300
      });
    }, 100);
  }
};

onMounted(() => {
  renderChart();

  // Set up resize observer
  if (chartContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(chartContainer.value);
  }

  // Also listen to window resize as a fallback
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  // Clean up
  if (resizeObserver && chartContainer.value) {
    resizeObserver.unobserve(chartContainer.value);
    resizeObserver.disconnect();
  }
  window.removeEventListener('resize', handleResize);
});

watch(() => props.familyData, () => {
  if (familyChartInstance) {
    familyChartInstance.updateData(props.familyData);
    familyChartInstance.updateTree({ tree_position: 'fit' });
  } else {
    renderChart();
  }
}, { deep: true });

watch([() => props.ancestryDepth, () => props.progenyDepth], ([newAncestryDepth, newProgenyDepth]) => {
  if (familyChartInstance) {
    familyChartInstance
      .setAncestryDepth(newAncestryDepth)
      .setProgenyDepth(newProgenyDepth)
      .updateTree({
        tree_position: 'main_to_middle',
        transition_time: 500
      });
  }
});
</script>

<style scoped>
.family-chart-container {
  @apply w-full h-full relative overflow-auto;
  background: linear-gradient(135deg, #FDFBF7 0%, #F5F3EE 100%);
  min-height: 600px;
}

:global(.dark) .family-chart-container {
  background: linear-gradient(135deg, #1A1F1C 0%, #243831 100%);
}

/* Ensure SVG fills the container and has smooth transitions */
.family-chart-container :deep(svg) {
  width: 100% !important;
  height: 100% !important;
  min-height: 600px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom scrollbar for chart area */
.family-chart-container::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.family-chart-container::-webkit-scrollbar-track {
  @apply bg-transparent;
}

.family-chart-container::-webkit-scrollbar-thumb {
  @apply bg-heritage-green/20 dark:bg-heritage-gold/20 rounded-full;
}

.family-chart-container::-webkit-scrollbar-thumb:hover {
  @apply bg-heritage-green/30 dark:bg-heritage-gold/30;
}

/* Glass Morphism Card Styles */
.family-chart-container :deep(.node-card.glass-card) {
  width: 260px;
  min-height: 96px;
  position: relative;
  border-radius: 12px;
  background: rgba(253, 251, 247, 0.75);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(15, 95, 74, 0.1);
  box-shadow:
    0 2px 8px rgba(15, 95, 74, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.06);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  overflow: hidden;
}

:global(.dark) .family-chart-container :deep(.node-card.glass-card) {
  background: rgba(36, 56, 49, 0.85);
  border: 1px solid rgba(212, 175, 55, 0.15);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.3),
    0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Gender Border Accent */
.family-chart-container :deep(.card-border) {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #0F5F4A 0%, #0D4F3D 100%);
  transition: width 0.2s ease;
}

.family-chart-container :deep(.node-card[data-gender="F"] .card-border) {
  background: linear-gradient(180deg, #D4AF37 0%, #C19B2E 100%);
}

:global(.dark) .family-chart-container :deep(.card-border) {
  background: linear-gradient(180deg, #0F5F4A 0%, #1A7A5E 100%);
}

:global(.dark) .family-chart-container :deep(.node-card[data-gender="F"] .card-border) {
  background: linear-gradient(180deg, #D4AF37 0%, #E6C24A 100%);
}

/* Card Inner Layout */
.family-chart-container :deep(.card-inner) {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px 14px 12px;
  position: relative;
  z-index: 1;
}

/* Avatar */
.family-chart-container :deep(.avatar) {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
  border: 2px solid rgba(15, 95, 74, 0.15);
  background: linear-gradient(135deg, #F5F3EE 0%, #E8E6E1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

:global(.dark) .family-chart-container :deep(.avatar) {
  border: 2px solid rgba(212, 175, 55, 0.2);
  background: linear-gradient(135deg, #2A3D36 0%, #1F2E28 100%);
}

.family-chart-container :deep(.avatar img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.family-chart-container :deep(.avatar-initial) {
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px;
  font-weight: 600;
  color: #0F5F4A;
}

:global(.dark) .family-chart-container :deep(.avatar-initial) {
  color: #D4AF37;
}

/* Content Area */
.family-chart-container :deep(.card-content) {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.family-chart-container :deep(.name) {
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
  color: #1E2D27;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.dark) .family-chart-container :deep(.name) {
  color: #F5F3EE;
}

.family-chart-container :deep(.relationship) {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  color: #D4AF37;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

:global(.dark) .family-chart-container :deep(.relationship) {
  color: #E6C24A;
}

/* Hover State */
.family-chart-container :deep(.node-card.glass-card:hover) {
  transform: translateY(-2px);
  box-shadow:
    0 8px 16px rgba(15, 95, 74, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.08),
    inset 0 0 0 1px rgba(212, 175, 55, 0.2);
  border-color: rgba(212, 175, 55, 0.3);
}

:global(.dark) .family-chart-container :deep(.node-card.glass-card:hover) {
  box-shadow:
    0 8px 16px rgba(0, 0, 0, 0.4),
    0 2px 4px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(212, 175, 55, 0.3);
  border-color: rgba(212, 175, 55, 0.4);
}

.family-chart-container :deep(.node-card.glass-card:hover .card-border) {
  width: 6px;
}

.family-chart-container :deep(.node-card.glass-card:hover .avatar) {
  transform: scale(1.05);
  border-color: rgba(212, 175, 55, 0.4);
}

/* Main/Focused Person State */
.family-chart-container :deep(.node-card.glass-card[data-main="true"]) {
  background: rgba(253, 251, 247, 0.95);
  border: 2px solid #D4AF37;
  box-shadow:
    0 0 0 4px rgba(212, 175, 55, 0.15),
    0 8px 24px rgba(15, 95, 74, 0.2),
    0 2px 8px rgba(0, 0, 0, 0.1);
}

:global(.dark) .family-chart-container :deep(.node-card.glass-card[data-main="true"]) {
  background: rgba(36, 56, 49, 0.95);
  border: 2px solid #E6C24A;
  box-shadow:
    0 0 0 4px rgba(230, 194, 74, 0.2),
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.3);
}

.family-chart-container :deep(.node-card.glass-card[data-main="true"] .name) {
  color: #0F5F4A;
  font-size: 19px;
}

:global(.dark) .family-chart-container :deep(.node-card.glass-card[data-main="true"] .name) {
  color: #E6C24A;
}

/* Active/Click State */
.family-chart-container :deep(.node-card.glass-card:active) {
  transform: translateY(0);
  transition-duration: 0.1s;
}

/* Connection Lines Styling */
.family-chart-container :deep(.link) {
  stroke: #5A6B64;
  stroke-width: 2px;
  fill: none;
  opacity: 0.4;
  transition: all 0.3s ease;
}

:global(.dark) .family-chart-container :deep(.link) {
  stroke: #A8B5AF;
  opacity: 0.3;
}

.family-chart-container :deep(.link:hover),
.family-chart-container :deep(.link.highlighted) {
  stroke: #D4AF37;
  stroke-width: 3px;
  opacity: 0.8;
}

:global(.dark) .family-chart-container :deep(.link:hover),
:global(.dark) .family-chart-container :deep(.link.highlighted) {
  stroke: #E6C24A;
  opacity: 0.9;
}
</style>
