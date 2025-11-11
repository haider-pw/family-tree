# Family Chart - Ready-to-Use Code Examples

## Table of Contents
1. [Basic SVG Implementation](#basic-svg-implementation)
2. [Modern HTML Card Designs](#modern-html-card-designs)
3. [Custom SVG Cards with D3](#custom-svg-cards-with-d3)
4. [Interactive Features](#interactive-features)
5. [Vue 3 Component](#vue-3-component)
6. [Nuxt 3 Component](#nuxt-3-component)
7. [Sample Data Structure](#sample-data-structure)

---

## Basic SVG Implementation

### Simple Family Tree with SVG Cards

```javascript
// main.js
import * as f3 from 'family-chart'

function initFamilyTree(containerId, familyData) {
  // 1. Create store
  const store = f3.createStore({
    data: familyData,
    node_separation: 250,
    level_separation: 150
  })

  // 2. Create SVG container
  const container = document.querySelector(containerId)
  const svg = f3.createSvg(container)

  // 3. Card configuration
  const card_dim = {
    w: 220,
    h: 70,
    text_x: 75,
    text_y: 15,
    img_w: 60,
    img_h: 60,
    img_x: 5,
    img_y: 5
  }

  // 4. Card click handler
  function onCardClick(d) {
    store.updateMainId(d.data.id)
    store.updateTree({initial: false})
  }

  // 5. Create Card
  const Card = f3.elements.CardSvg({
    store,
    svg,
    card_dim,
    card_display: [
      d => `${d.data["first name"]} ${d.data["last name"]}`,
      d => d.data.birthday || ''
    ],
    mini_tree: true,
    link_break: false,
    onCardClick
  })

  // 6. Create view
  const view = f3.view({
    store,
    cont: container,
    Card
  })

  // 7. Initialize
  store.setOnUpdate(() => view.update())
  store.updateTree({initial: true})

  return { store, view }
}

// Usage
const familyData = [/* your data */]
initFamilyTree('#FamilyChart', familyData)
```

---

## Modern HTML Card Designs

### 1. Glass Morphism Card (Modern & Elegant)

```javascript
function createGlassMorphismCard(f3Chart) {
  return f3Chart
    .setCardHtml()
    .setCardDim({
      w: 240,
      h: 100
    })
    .setCardInnerHtmlCreator((d) => {
      const data = d.data.data
      const genderColor = data.gender === 'M' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(236, 72, 153, 0.3)'

      return `
        <div style="
          width: 100%;
          height: 100%;
          background: ${genderColor};
          backdrop-filter: blur(10px) saturate(180%);
          -webkit-backdrop-filter: blur(10px) saturate(180%);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 16px;
          color: white;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          transition: all 0.3s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: center;
        "
        class="glass-card"
        onmouseover="this.style.transform='translateY(-5px) scale(1.05)'; this.style.boxShadow='0 12px 48px 0 rgba(31, 38, 135, 0.5)'"
        onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 8px 32px 0 rgba(31, 38, 135, 0.37)'">

          <div style="font-size: 18px; font-weight: 700; margin-bottom: 4px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            ${data["first name"]} ${data["last name"] || ''}
          </div>

          <div style="font-size: 13px; opacity: 0.9; margin-bottom: 2px;">
            ${data.birthday ? `Born: ${data.birthday}` : 'Date unknown'}
          </div>

          ${data.gender ? `
            <div style="font-size: 11px; opacity: 0.8; display: inline-block; background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 12px; margin-top: 4px; width: fit-content;">
              ${data.gender === 'M' ? 'Male' : 'Female'}
            </div>
          ` : ''}
        </div>
      `
    })
    .setOnCardClick((d) => {
      f3Chart.updateMain(d.data.id)
    })
}
```

### 2. Gradient Card with Avatar

```javascript
function createGradientCard(f3Chart) {
  return f3Chart
    .setCardHtml()
    .setCardDim({
      w: 260,
      h: 110
    })
    .setCardInnerHtmlCreator((d) => {
      const data = d.data.data
      const gradients = {
        M: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        F: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      }
      const gradient = gradients[data.gender] || 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'

      return `
        <div style="
          width: 100%;
          height: 100%;
          background: ${gradient};
          border-radius: 12px;
          padding: 15px;
          color: white;
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          gap: 12px;
        "
        onmouseover="this.style.transform='scale(1.08) translateY(-3px)'; this.style.boxShadow='0 15px 30px rgba(0,0,0,0.3)'"
        onmouseout="this.style.transform='scale(1) translateY(0)'; this.style.boxShadow='0 10px 20px rgba(0,0,0,0.2)'">

          <div style="
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          ">
            ${data.avatar ? `
              <img src="${data.avatar}" alt="${data["first name"]}" style="width: 100%; height: 100%; object-fit: cover;">
            ` : `
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="${data.gender === 'M' ? '#667eea' : '#f093fb'}"/>
              </svg>
            `}
          </div>

          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 17px; font-weight: 700; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${data["first name"]}
            </div>
            <div style="font-size: 15px; font-weight: 500; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${data["last name"] || ''}
            </div>
            <div style="font-size: 12px; opacity: 0.9;">
              ${data.birthday || 'Unknown'}
            </div>
          </div>
        </div>
      `
    })
    .setOnCardClick((d) => {
      f3Chart.updateMain(d.data.id)
    })
}
```

### 3. Minimalist Card (Clean & Professional)

```javascript
function createMinimalistCard(f3Chart) {
  return f3Chart
    .setCardHtml()
    .setCardDim({
      w: 220,
      h: 90
    })
    .setCardInnerHtmlCreator((d) => {
      const data = d.data.data
      const accentColor = data.gender === 'M' ? '#3b82f6' : '#ec4899'
      const bgColor = d.data.main ? '#f3f4f6' : '#ffffff'

      return `
        <div style="
          width: 100%;
          height: 100%;
          background: ${bgColor};
          border-left: 4px solid ${accentColor};
          border-radius: 8px;
          padding: 14px 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          cursor: pointer;
          transition: all 0.2s ease;
          ${d.data.main ? 'border: 2px solid ' + accentColor + ';' : ''}
        "
        onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.12)'; this.style.transform='translateY(-2px)'"
        onmouseout="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'; this.style.transform='translateY(0)'">

          <div style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 4px; line-height: 1.2;">
            ${data["first name"]} ${data["last name"] || ''}
          </div>

          <div style="font-size: 13px; color: #6b7280; margin-bottom: 6px;">
            ${data.birthday || 'Unknown'}
          </div>

          <div style="display: flex; gap: 6px; align-items: center;">
            <div style="
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: ${accentColor};
            "></div>
            <div style="font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">
              ${data.gender === 'M' ? 'Male' : data.gender === 'F' ? 'Female' : 'Unknown'}
            </div>
          </div>
        </div>
      `
    })
    .setOnCardClick((d) => {
      f3Chart.updateMain(d.data.id)
    })
}
```

### 4. Card with Image Circle (Photo-Focused)

```javascript
function createPhotoCard(f3Chart) {
  return f3Chart
    .setCardHtml()
    .setCardDim({
      w: 180,
      h: 200
    })
    .setCardInnerHtmlCreator((d) => {
      const data = d.data.data
      const borderColor = data.gender === 'M' ? '#3b82f6' : '#ec4899'

      return `
        <div style="
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          cursor: pointer;
          transition: all 0.3s ease;
        "
        onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.15)'"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'">

          <div style="
            width: 100px;
            height: 100px;
            border-radius: 50%;
            border: 3px solid ${borderColor};
            overflow: hidden;
            margin-bottom: 12px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          ">
            ${data.avatar ? `
              <img src="${data.avatar}" alt="${data["first name"]}" style="width: 100%; height: 100%; object-fit: cover;">
            ` : `
              <div style="width: 100%; height: 100%; background: linear-gradient(135deg, ${borderColor}20, ${borderColor}40); display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px; font-weight: bold; color: ${borderColor};">
                  ${data["first name"].charAt(0)}${(data["last name"] || '').charAt(0)}
                </span>
              </div>
            `}
          </div>

          <div style="text-align: center; width: 100%;">
            <div style="font-size: 15px; font-weight: 700; color: #1f2937; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${data["first name"]}
            </div>
            <div style="font-size: 13px; font-weight: 500; color: #6b7280; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${data["last name"] || ''}
            </div>
            <div style="font-size: 11px; color: #9ca3af;">
              ${data.birthday || 'Unknown'}
            </div>
          </div>
        </div>
      `
    })
    .setOnCardClick((d) => {
      f3Chart.updateMain(d.data.id)
    })
}
```

---

## Custom SVG Cards with D3

### Advanced SVG Card with Custom Rendering

```javascript
function createCustomSVGCard(store, svg) {
  const card_dim = {
    w: 240,
    h: 90,
    text_x: 85,
    text_y: 20,
    img_w: 70,
    img_h: 70,
    img_x: 10,
    img_y: 10
  }

  function onCardUpdate(d) {
    const g = d3.select(this)
    const cardInner = g.select('.card-inner')
    cardInner.html('') // Clear existing content

    const data = d.data.data
    const isMain = d.data.main

    // Background rectangle with gradient
    const defs = cardInner.append('defs')
    const gradientId = `gradient-${d.data.id}`

    const gradient = defs.append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%')

    if (data.gender === 'M') {
      gradient.append('stop').attr('offset', '0%').attr('stop-color', '#667eea')
      gradient.append('stop').attr('offset', '100%').attr('stop-color', '#764ba2')
    } else if (data.gender === 'F') {
      gradient.append('stop').attr('offset', '0%').attr('stop-color', '#f093fb')
      gradient.append('stop').attr('offset', '100%').attr('stop-color', '#f5576c')
    } else {
      gradient.append('stop').attr('offset', '0%').attr('stop-color', '#a8edea')
      gradient.append('stop').attr('offset', '100%').attr('stop-color', '#fed6e3')
    }

    // Main card rectangle
    cardInner.append('rect')
      .attr('width', card_dim.w)
      .attr('height', card_dim.h)
      .attr('rx', 10)
      .attr('fill', `url(#${gradientId})`)
      .attr('stroke', isMain ? '#ffd700' : 'none')
      .attr('stroke-width', isMain ? 3 : 0)
      .attr('filter', 'drop-shadow(0px 4px 8px rgba(0,0,0,0.2))')

    // Image circle
    const imageGroup = cardInner.append('g')
      .attr('transform', `translate(${card_dim.img_x}, ${card_dim.img_y})`)

    imageGroup.append('circle')
      .attr('cx', card_dim.img_w / 2)
      .attr('cy', card_dim.img_h / 2)
      .attr('r', card_dim.img_w / 2)
      .attr('fill', 'white')

    if (data.avatar) {
      const clipId = `clip-${d.data.id}`
      const clipPath = defs.append('clipPath')
        .attr('id', clipId)
      clipPath.append('circle')
        .attr('cx', card_dim.img_x + card_dim.img_w / 2)
        .attr('cy', card_dim.img_y + card_dim.img_h / 2)
        .attr('r', card_dim.img_w / 2 - 2)

      cardInner.append('image')
        .attr('href', data.avatar)
        .attr('x', card_dim.img_x + 2)
        .attr('y', card_dim.img_y + 2)
        .attr('width', card_dim.img_w - 4)
        .attr('height', card_dim.img_h - 4)
        .attr('clip-path', `url(#${clipId})`)
        .attr('preserveAspectRatio', 'xMidYMid slice')
    } else {
      // Placeholder icon
      imageGroup.append('text')
        .attr('x', card_dim.img_w / 2)
        .attr('y', card_dim.img_h / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', 30)
        .attr('font-weight', 'bold')
        .attr('fill', data.gender === 'M' ? '#667eea' : '#f093fb')
        .text(data["first name"].charAt(0) + (data["last name"] || '').charAt(0))
    }

    // Text content
    const text = cardInner.append('text')
      .attr('x', card_dim.text_x)
      .attr('y', card_dim.text_y)
      .attr('fill', 'white')
      .attr('font-family', 'Arial, sans-serif')

    text.append('tspan')
      .attr('x', card_dim.text_x)
      .attr('dy', 0)
      .attr('font-size', 16)
      .attr('font-weight', 'bold')
      .text(`${data["first name"]} ${data["last name"] || ''}`)

    text.append('tspan')
      .attr('x', card_dim.text_x)
      .attr('dy', 20)
      .attr('font-size', 13)
      .text(data.birthday || 'Unknown')

    // Gender badge
    const badge = cardInner.append('g')
      .attr('transform', `translate(${card_dim.w - 25}, 10)`)

    badge.append('circle')
      .attr('r', 10)
      .attr('fill', 'rgba(255,255,255,0.3)')

    badge.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', 10)
      .attr('fill', 'white')
      .text(data.gender || '?')

    // Add hover effect
    g.on('mouseenter', function() {
      d3.select(this).select('rect')
        .transition()
        .duration(200)
        .attr('filter', 'drop-shadow(0px 8px 16px rgba(0,0,0,0.3))')
    })

    g.on('mouseleave', function() {
      d3.select(this).select('rect')
        .transition()
        .duration(200)
        .attr('filter', 'drop-shadow(0px 4px 8px rgba(0,0,0,0.2))')
    })
  }

  function onCardClick(d) {
    store.updateMainId(d.data.id)
    store.updateTree({initial: false})
  }

  return f3.elements.CardSvg({
    store,
    svg,
    card_dim,
    onCardUpdate,
    onCardClick,
    mini_tree: true
  })
}
```

---

## Interactive Features

### Add Edit Button to Cards

```javascript
function addEditButton(f3Chart) {
  f3Chart.setCardHtml()
    .setCardInnerHtmlCreator((d) => {
      const data = d.data.data

      return `
        <div class="card-wrapper" style="position: relative; width: 220px; height: 90px;">
          <div class="card-content" style="
            width: 100%;
            height: 100%;
            background: white;
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          ">
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">
              ${data["first name"]} ${data["last name"] || ''}
            </div>
            <div style="font-size: 13px; color: #6b7280;">
              ${data.birthday || 'Unknown'}
            </div>
          </div>

          <button
            class="edit-btn"
            onclick="event.stopPropagation(); handleEdit('${d.data.id}')"
            style="
              position: absolute;
              top: 8px;
              right: 8px;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              border: none;
              background: #3b82f6;
              color: white;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0.8;
              transition: all 0.2s;
            "
            onmouseover="this.style.opacity='1'; this.style.transform='scale(1.1)'"
            onmouseout="this.style.opacity='0.8'; this.style.transform='scale(1)'">
            ✏️
          </button>
        </div>
      `
    })
}

// Define the edit handler globally or in your component
window.handleEdit = function(personId) {
  console.log('Edit person:', personId)
  // Open modal or navigate to edit page
}
```

### Hover Path Highlighting

```javascript
function enablePathHighlighting(f3Chart) {
  // Enable hover path highlighting
  f3Chart.setOnHoverPathToMain()

  // Or custom implementation
  f3Chart.setCardHtml()
    .setCardInnerHtmlCreator((d) => {
      // Your card HTML
      return `<div>...</div>`
    })

  // Add custom hover handlers
  const cards = document.querySelectorAll('.card')
  cards.forEach(card => {
    card.addEventListener('mouseenter', (e) => {
      // Highlight path to main node
      const personId = e.currentTarget.dataset.personId
      highlightPath(personId)
    })

    card.addEventListener('mouseleave', () => {
      // Remove highlighting
      clearHighlighting()
    })
  })
}

function highlightPath(personId) {
  // Find all ancestor nodes
  const ancestors = findAncestors(personId)

  // Add highlight class to path
  ancestors.forEach(ancestorId => {
    const link = document.querySelector(`[data-link="${ancestorId}"]`)
    if (link) {
      link.classList.add('highlighted-path')
    }
  })
}
```

### Context Menu on Right Click

```javascript
function addContextMenu(f3Chart) {
  f3Chart.setCardHtml()
    .setCardInnerHtmlCreator((d) => {
      const data = d.data.data

      return `
        <div
          oncontextmenu="event.preventDefault(); showContextMenu(event, '${d.data.id}')"
          style="
            width: 220px;
            height: 90px;
            background: white;
            border-radius: 8px;
            padding: 12px;
            cursor: pointer;
          ">
          <div style="font-size: 16px; font-weight: 600;">
            ${data["first name"]} ${data["last name"] || ''}
          </div>
          <div style="font-size: 13px; color: #6b7280;">
            ${data.birthday || 'Unknown'}
          </div>
        </div>
      `
    })
}

window.showContextMenu = function(event, personId) {
  event.preventDefault()

  // Remove existing menu
  const existingMenu = document.querySelector('.context-menu')
  if (existingMenu) {
    existingMenu.remove()
  }

  // Create context menu
  const menu = document.createElement('div')
  menu.className = 'context-menu'
  menu.style.cssText = `
    position: fixed;
    left: ${event.clientX}px;
    top: ${event.clientY}px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    padding: 8px 0;
    z-index: 10000;
    min-width: 150px;
  `

  const options = [
    { label: 'View Details', action: () => console.log('View:', personId) },
    { label: 'Edit', action: () => console.log('Edit:', personId) },
    { label: 'Add Child', action: () => console.log('Add child to:', personId) },
    { label: 'Add Spouse', action: () => console.log('Add spouse to:', personId) },
    { label: 'Delete', action: () => console.log('Delete:', personId), danger: true }
  ]

  options.forEach(option => {
    const item = document.createElement('div')
    item.textContent = option.label
    item.style.cssText = `
      padding: 8px 16px;
      cursor: pointer;
      transition: background 0.2s;
      ${option.danger ? 'color: #ef4444;' : ''}
    `
    item.onmouseenter = () => item.style.background = '#f3f4f6'
    item.onmouseleave = () => item.style.background = 'transparent'
    item.onclick = () => {
      option.action()
      menu.remove()
    }
    menu.appendChild(item)
  })

  document.body.appendChild(menu)

  // Close menu on click outside
  setTimeout(() => {
    document.addEventListener('click', () => menu.remove(), { once: true })
  }, 0)
}
```

---

## Vue 3 Component

### Complete Vue 3 Family Chart Component

```vue
<template>
  <div class="family-tree-wrapper">
    <div class="controls">
      <button @click="zoomIn">Zoom In</button>
      <button @click="zoomOut">Zoom Out</button>
      <button @click="resetZoom">Reset</button>
    </div>

    <div ref="chartContainer" class="family-chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as f3 from 'family-chart'

const props = defineProps({
  familyData: {
    type: Array,
    required: true
  },
  mainPersonId: {
    type: String,
    default: null
  },
  cardStyle: {
    type: String,
    default: 'gradient', // 'gradient', 'glass', 'minimalist', 'photo'
    validator: (value) => ['gradient', 'glass', 'minimalist', 'photo'].includes(value)
  }
})

const emit = defineEmits(['person-clicked', 'person-edited', 'tree-updated'])

const chartContainer = ref(null)
let store = null
let view = null
let currentZoom = 1

onMounted(() => {
  initializeChart()
})

watch(() => props.familyData, () => {
  if (store) {
    store.updateTree({initial: false})
  }
})

watch(() => props.mainPersonId, (newId) => {
  if (store && newId) {
    store.updateMainId(newId)
    store.updateTree({initial: false})
  }
})

function initializeChart() {
  // Create store
  store = f3.createStore({
    data: props.familyData,
    node_separation: 250,
    level_separation: 150
  })

  // Create SVG
  const svg = f3.createSvg(chartContainer.value)

  // Card dimensions
  const card_dim = getCardDimensions(props.cardStyle)

  // Card click handler
  function onCardClick(d) {
    emit('person-clicked', d.data)
    store.updateMainId(d.data.id)
    store.updateTree({initial: false})
  }

  // Create Card based on style
  const Card = createCard(props.cardStyle, store, svg, card_dim, onCardClick)

  // Create view
  view = f3.view({
    store,
    cont: chartContainer.value,
    Card
  })

  // Initialize
  store.setOnUpdate(() => {
    view.update()
    emit('tree-updated', store.getData())
  })

  if (props.mainPersonId) {
    store.updateMainId(props.mainPersonId)
  }

  store.updateTree({initial: true})
}

function getCardDimensions(style) {
  const dimensions = {
    gradient: { w: 260, h: 110 },
    glass: { w: 240, h: 100 },
    minimalist: { w: 220, h: 90 },
    photo: { w: 180, h: 200 }
  }
  return dimensions[style] || dimensions.gradient
}

function createCard(style, store, svg, card_dim, onCardClick) {
  // For HTML cards
  if (['gradient', 'glass', 'minimalist', 'photo'].includes(style)) {
    // Return custom HTML card (simplified for brevity)
    return f3.elements.CardHtml({
      store,
      svg,
      card_dim,
      onCardClick
    })
  }

  // For SVG cards
  return f3.elements.CardSvg({
    store,
    svg,
    card_dim,
    card_display: [
      d => `${d.data["first name"]} ${d.data["last name"] || ''}`,
      d => d.data.birthday || ''
    ],
    mini_tree: true,
    onCardClick
  })
}

function zoomIn() {
  currentZoom = Math.min(currentZoom * 1.2, 3)
  applyZoom()
}

function zoomOut() {
  currentZoom = Math.max(currentZoom / 1.2, 0.1)
  applyZoom()
}

function resetZoom() {
  currentZoom = 1
  applyZoom()
}

function applyZoom() {
  if (view) {
    const svg = chartContainer.value.querySelector('svg')
    const g = svg.querySelector('g')
    if (g) {
      const currentTransform = g.getAttribute('transform') || ''
      const translateMatch = currentTransform.match(/translate\(([^)]+)\)/)
      const translate = translateMatch ? translateMatch[1] : '0,0'
      g.setAttribute('transform', `translate(${translate})scale(${currentZoom})`)
    }
  }
}

defineExpose({
  updateMainPerson: (personId) => {
    if (store) {
      store.updateMainId(personId)
      store.updateTree({initial: false})
    }
  },
  getStore: () => store,
  getView: () => view
})
</script>

<style scoped>
.family-tree-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  gap: 8px;
}

.controls button {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.controls button:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.family-chart {
  width: 100%;
  height: 100%;
  background-color: #f9fafb;
  overflow: hidden;
}

/* Dark mode support */
.dark .family-chart {
  background-color: rgb(33, 33, 33);
  color: #fff;
}
</style>
```

---

## Nuxt 3 Component

### Nuxt 3 Composable

```javascript
// composables/useFamilyChart.js
import * as f3 from 'family-chart'

export const useFamilyChart = () => {
  const store = ref(null)
  const view = ref(null)

  const initChart = (container, data, options = {}) => {
    const {
      nodeSeparation = 250,
      levelSeparation = 150,
      mainPersonId = null
    } = options

    // Create store
    store.value = f3.createStore({
      data,
      node_separation: nodeSeparation,
      level_separation: levelSeparation
    })

    // Create SVG
    const svg = f3.createSvg(container)

    // Return setup object
    return {
      store: store.value,
      svg,
      updateMainPerson: (personId) => {
        if (store.value) {
          store.value.updateMainId(personId)
          store.value.updateTree({initial: false})
        }
      }
    }
  }

  return {
    store,
    view,
    initChart
  }
}
```

### Nuxt 3 Component Using Composable

```vue
<template>
  <div>
    <ClientOnly>
      <div ref="chartContainer" class="family-chart" />
    </ClientOnly>
  </div>
</template>

<script setup>
const chartContainer = ref(null)
const { initChart } = useFamilyChart()

const { data: familyData } = await useFetch('/api/family-data')

onMounted(() => {
  if (chartContainer.value && familyData.value) {
    const { store, svg } = initChart(chartContainer.value, familyData.value)

    // Continue with card setup...
  }
})
</script>

<style scoped>
.family-chart {
  width: 100%;
  height: 900px;
  background-color: #f9fafb;
}
</style>
```

---

## Sample Data Structure

### Complete Family Data Example

```json
[
  {
    "id": "1",
    "data": {
      "first name": "Ahmed",
      "last name": "Ali",
      "gender": "M",
      "birthday": "1960",
      "avatar": "/images/ahmed.jpg"
    },
    "rels": {
      "spouses": ["2"],
      "children": ["3", "4"]
    }
  },
  {
    "id": "2",
    "data": {
      "first name": "Fatima",
      "last name": "Hassan",
      "gender": "F",
      "birthday": "1965",
      "avatar": "/images/fatima.jpg"
    },
    "rels": {
      "spouses": ["1"],
      "children": ["3", "4"]
    }
  },
  {
    "id": "3",
    "data": {
      "first name": "Muhammad",
      "last name": "Ahmed",
      "gender": "M",
      "birthday": "1990",
      "avatar": "/images/muhammad.jpg"
    },
    "rels": {
      "parents": ["1", "2"],
      "spouses": ["5"],
      "children": ["6"]
    }
  },
  {
    "id": "4",
    "data": {
      "first name": "Aisha",
      "last name": "Ahmed",
      "gender": "F",
      "birthday": "1992",
      "avatar": "/images/aisha.jpg"
    },
    "rels": {
      "parents": ["1", "2"]
    }
  },
  {
    "id": "5",
    "data": {
      "first name": "Zainab",
      "last name": "Ibrahim",
      "gender": "F",
      "birthday": "1991",
      "avatar": "/images/zainab.jpg"
    },
    "rels": {
      "spouses": ["3"],
      "children": ["6"]
    }
  },
  {
    "id": "6",
    "data": {
      "first name": "Omar",
      "last name": "Muhammad",
      "gender": "M",
      "birthday": "2015",
      "avatar": "/images/omar.jpg"
    },
    "rels": {
      "parents": ["3", "5"]
    }
  }
]
```

---

## Quick Implementation Guide

1. **Choose your card style** based on your design needs
2. **Prepare your data** in the correct JSON format
3. **Copy the appropriate code** from above
4. **Customize colors and dimensions** to match your brand
5. **Add interactivity** as needed for your use case

For your Shajra project, I recommend starting with the **Glass Morphism** or **Gradient Card** designs for a modern, elegant look that works well with genealogical data.
