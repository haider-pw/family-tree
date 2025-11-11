# Family Chart Library - Comprehensive Research Guide

## Overview

**Library:** family-chart by donatso
**Version:** 0.7.2 (latest on npm), though you mentioned using 0.9.0
**GitHub:** https://github.com/donatso/family-chart
**Built on:** D3.js
**License:** MIT
**Framework Support:** React, Vue, Angular, Svelte, Vanilla JavaScript

### Key Features
- Interactive family trees with zoom and pan capabilities
- Customizable styling (colors, fonts, layout)
- Full TypeScript support with type definitions
- Real-time dynamic updates
- Multiple card component types (SVG and HTML)
- Mini-tree visualization
- Custom click handlers and interactions

---

## Installation

```bash
npm install family-chart
# or
yarn add family-chart
```

---

## Core Concepts

### 1. Data Structure

Family members are defined as JSON objects with the following schema:

```javascript
{
  "id": "unique-id-here",  // UUID or numeric string
  "data": {
    "first name": "John",
    "last name": "Doe",
    "gender": "M",           // "M" or "F"
    "birthday": "1980",      // Optional: year or empty string
    "avatar": "url-to-image" // Optional: defaults to placeholder
  },
  "rels": {
    "spouses": ["spouse-id"],
    "children": ["child-id-1", "child-id-2"],
    "parents": ["parent-id-1", "parent-id-2"]
  }
}
```

**Important Notes:**
- Relationships are bidirectional (if A lists B as spouse, B should list A)
- Empty strings indicate missing optional data (not null)
- IDs must be unique across the entire dataset
- The data supports multi-generational family trees

---

## Basic Implementation

### Minimal Setup (SVG Cards)

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="path/to/family-chart.css">
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <script src="path/to/family-chart.js"></script>
</head>
<body>
  <div id="FamilyChart" style="width:100%;height:900px;"></div>

  <script>
    // Fetch your data
    fetch('path/to/data.json')
      .then(res => res.json())
      .then(data => createTree(data))

    function createTree(data) {
      // 1. Create store
      const store = f3.createStore({
        data: data,
        node_separation: 250,    // Horizontal spacing
        level_separation: 150    // Vertical spacing between generations
      })

      // 2. Create SVG container
      const cont = document.querySelector('#FamilyChart')
      const svg = f3.createSvg(cont)

      // 3. Configure card dimensions
      const card_dim = {
        w: 220,        // Width
        h: 70,         // Height
        text_x: 75,    // Text X position
        text_y: 15,    // Text Y position
        img_w: 60,     // Image width
        img_h: 60,     // Image height
        img_x: 5,      // Image X position
        img_y: 5       // Image Y position
      }

      // 4. Define card click handler
      function onCardClick(d) {
        store.updateMainId(d.data.id)
        store.updateTree({initial: false})
      }

      // 5. Create Card element (SVG)
      const Card = f3.elements.CardSvg({
        store,
        svg,
        card_dim,
        card_display: [
          d => `${d.data["first name"]} ${d.data["last name"]}`
        ],
        mini_tree: true,
        link_break: false,
        onCardClick
      })

      // 6. Create view
      const view = f3.view({
        store,
        cont,
        Card
      })

      // 7. Initial render
      store.setOnUpdate(() => view.update())
      store.updateTree({initial: true})
    }
  </script>
</body>
</html>
```

---

## Card Types and Customization

### SVG Cards (CardSvg)

**Best for:** Simple, performant cards with basic styling

```javascript
const CardSvg = f3.elements.CardSvg({
  store,
  svg,
  card_dim: {
    w: 220,
    h: 70,
    text_x: 75,
    text_y: 15,
    img_w: 60,
    img_h: 60,
    img_x: 5,
    img_y: 5
  },
  card_display: [
    d => `${d.data["first name"]} ${d.data["last name"]}`,
    d => d.data.birthday
  ],
  mini_tree: true,
  link_break: false,
  onCardClick: (d) => {
    store.updateMainId(d.data.id)
    store.updateTree({initial: false})
  }
})
```

**Configuration Options:**
- `card_dim`: Dimension object for positioning
- `card_display`: Array of functions returning text to display
- `mini_tree`: Boolean to show mini tree visualization
- `link_break`: Boolean to control link breaking behavior
- `onCardClick`: Click handler function
- `onCardUpdate`: Function called during card rendering

### HTML Cards (CardHtml)

**Best for:** Rich, modern cards with custom HTML/CSS

```javascript
const f3Chart = f3.createChart({
  cont: document.querySelector('#FamilyChart'),
  data: data
})

const f3Card = f3Chart
  .setCardHtml()
  .setCardDisplay([
    ["first name", "last name"],
    ["birthday"]
  ])
  .setStyle('imageCircleRect')  // or 'imageCircle', 'imageRect', 'rect', 'default'
  .setCardImageField('avatar')
  .setCardDim({
    w: 220,
    h: 70,
    img_w: 60,
    img_h: 60
  })
  .setOnCardClick((d) => {
    f3Chart.updateMain(d.data.id)
  })
```

**Built-in Styles:**
- `default`: Basic card style
- `imageCircleRect`: Circular image with rectangular card
- `imageCircle`: Circular image only
- `imageRect`: Rectangular image with card
- `rect`: Rectangle card without image

---

## Custom Card Templates

### Method 1: Custom SVG Cards with onCardUpdate

```javascript
function onCardUpdate(d) {
  const g = d3.select(this)
  const card_inner = g.select('.card-inner')

  // Clear existing content
  card_inner.html('')

  // Add custom rectangle
  card_inner.append('rect')
    .attr('width', card_dim.w)
    .attr('height', card_dim.h)
    .attr('rx', 5)
    .attr('fill', d.data.data.gender === 'M' ? 'rgb(120, 159, 172)' : 'rgb(196, 138, 146)')

  // Add text
  const text = card_inner.append('text')
    .attr('x', 10)
    .attr('y', 20)
    .attr('fill', '#fff')

  text.append('tspan')
    .text(`${d.data.data["first name"]} ${d.data.data["last name"]}`)

  text.append('tspan')
    .attr('x', 10)
    .attr('dy', 20)
    .attr('font-size', 12)
    .text(d.data.data.birthday)
}

const Card = f3.elements.CardSvg({
  store,
  svg,
  card_dim,
  onCardUpdate,
  onCardClick
})
```

### Method 2: Custom Main Node

```javascript
function Card(tree, svg, onCardClick) {
  return function (d) {
    // Custom styling for main/selected node
    if (d.data.main) {
      this.innerHTML = ''
      const card = d3.select(this)

      card.append('rect')
        .attr('width', 220)
        .attr('height', 70)
        .attr('fill', '#fff')
        .attr('stroke', '#333')
        .attr('stroke-width', 3)

      card.append('text')
        .attr('x', 110)
        .attr('y', 35)
        .attr('text-anchor', 'middle')
        .attr('font-size', 16)
        .attr('font-weight', 'bold')
        .text('Selected Person')

      return
    }

    // Standard card for other nodes
    return f3.elements.CardSvg({
      store,
      svg,
      card_dim: {w:220, h:70, text_x:75, text_y:15, img_w:60, img_h:60, img_x:5, img_y:5},
      card_display: [d => `${d.data["first name"]} ${d.data["last name"]}`],
      onCardClick
    })(d)
  }
}
```

### Method 3: Custom HTML Card with setCardInnerHtmlCreator

```javascript
f3Chart.setCardHtml()
  .setCardInnerHtmlCreator((d) => {
    const data = d.data.data
    return `
      <div style="
        width: 220px;
        height: 70px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 10px;
        padding: 15px;
        color: white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        cursor: pointer;
        transition: transform 0.2s;
      ">
        <div style="font-size: 16px; font-weight: bold;">
          ${data["first name"]} ${data["last name"]}
        </div>
        <div style="font-size: 12px; opacity: 0.9; margin-top: 5px;">
          ${data.birthday || 'Unknown'}
        </div>
        ${data.gender ? `<div style="font-size: 10px; margin-top: 5px;">Gender: ${data.gender}</div>` : ''}
      </div>
    `
  })
```

---

## Styling Examples

### Modern Gradient Cards with CSS

```javascript
const styles = `
  .card-male {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .card-female {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  .card-base {
    border-radius: 12px;
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .card-base:hover {
    transform: scale(1.1) translateY(-5px);
    box-shadow: 0 15px 30px rgba(0,0,0,0.3);
  }

  .card-main {
    transform: scale(1.2);
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    border: 3px solid #ffd700;
  }
`
```

### Glass Morphism Style

```javascript
.setCardInnerHtmlCreator((d) => {
  const data = d.data.data
  return `
    <div style="
      width: 220px;
      height: 90px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 15px;
      color: white;
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    ">
      <div style="font-size: 18px; font-weight: 600; margin-bottom: 5px;">
        ${data["first name"]} ${data["last name"]}
      </div>
      <div style="font-size: 12px; opacity: 0.8;">
        ${data.birthday || 'Date unknown'}
      </div>
    </div>
  `
})
```

### Minimalist Modern Design

```javascript
.setCardInnerHtmlCreator((d) => {
  const data = d.data.data
  const genderColor = data.gender === 'M' ? '#3b82f6' : '#ec4899'

  return `
    <div style="
      width: 200px;
      height: 80px;
      background: white;
      border-left: 4px solid ${genderColor};
      border-radius: 8px;
      padding: 12px 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: all 0.2s;
    ">
      <div style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 4px;">
        ${data["first name"]} ${data["last name"]}
      </div>
      <div style="font-size: 13px; color: #6b7280;">
        ${data.birthday || 'Unknown'}
      </div>
    </div>
  `
})
```

---

## Interactive Features

### Adding Custom Buttons to Cards

```javascript
function onCardUpdate(d) {
  const g = d3.select(this).select('.card-inner')

  // Add custom button
  const btn = g.append('g')
    .attr('class', 'customAddBtn')
    .style('cursor', 'pointer')
    .attr('transform', `translate(${card_dim.w - 12}, ${card_dim.h - 12})scale(0.08)`)

  btn.append('circle')
    .attr('r', 100)
    .attr('fill', '#4ade80')

  btn.append('line')
    .attr('x1', -50)
    .attr('x2', 50)
    .attr('y1', 0)
    .attr('y2', 0)
    .attr('stroke', '#fff')
    .attr('stroke-width', 20)

  btn.append('line')
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', -50)
    .attr('y2', 50)
    .attr('stroke', '#fff')
    .attr('stroke-width', 20)

  btn.on('click', (event) => {
    event.stopPropagation()
    console.log('Add button clicked for:', d.data.data["first name"])
    // Add your custom action here
  })
}
```

### Hover Effects with Path Highlighting

```javascript
// For HTML cards
f3Chart.setOnHoverPathToMain()  // Enable path highlighting on hover

// Custom hover implementation
function onCardUpdate(d) {
  const card = d3.select(this)

  card.on('mouseenter', function() {
    d3.select(this).select('rect')
      .transition()
      .duration(200)
      .attr('transform', 'scale(1.1)')
      .attr('filter', 'drop-shadow(0px 5px 10px rgba(0,0,0,0.3))')
  })

  card.on('mouseleave', function() {
    d3.select(this).select('rect')
      .transition()
      .duration(200)
      .attr('transform', 'scale(1)')
      .attr('filter', 'none')
  })
}
```

---

## Configuration Options

### Store Configuration

```javascript
const store = f3.createStore({
  data: familyData,              // Your family data array
  node_separation: 250,          // Horizontal spacing between nodes
  level_separation: 150,         // Vertical spacing between generations
  initial_zoom: 1,               // Initial zoom level
  min_zoom: 0.1,                 // Minimum zoom level
  max_zoom: 3,                   // Maximum zoom level
  transition_time: 1000          // Animation duration in ms
})
```

### Card Dimension Configuration (CardDim)

```typescript
interface CardDim {
  w?: number           // Card width
  h?: number           // Card height
  text_x?: number      // Text horizontal position
  text_y?: number      // Text vertical position
  img_w?: number       // Image width
  img_h?: number       // Image height
  img_x?: number       // Image horizontal position
  img_y?: number       // Image vertical position
  height_auto?: boolean // Enable automatic height
}
```

**Dimension Aliases:**
- `width` → `w`
- `height` → `h`
- `img_width` → `img_w`
- `img_height` → `img_h`

---

## API Methods

### Store Methods

```javascript
// Update main/focused person
store.updateMainId('person-id')

// Refresh tree visualization
store.updateTree({initial: false})

// Set update listener
store.setOnUpdate(() => view.update())

// Get current data
const data = store.getData()
```

### CardSvg Methods

```javascript
const card = new f3.CardSvg(container, store)

// Configure display
card.setCardDisplay([
  d => `${d.data["first name"]} ${d.data["last name"]}`
])

// Set dimensions
card.setCardDim({w: 220, h: 70})

// Enable mini tree
card.setMiniTree(true)

// Set link break
card.setLinkBreak(false)

// Set click handler
card.setOnCardClick((d) => {
  console.log('Clicked:', d.data.data)
})

// Set update callback
card.setOnCardUpdate(function(d) {
  // Custom rendering logic
})

// Get card renderer
const renderer = card.getCard()
```

### CardHtml Methods

```javascript
const card = f3Chart.setCardHtml()

// Set display fields
card.setCardDisplay([
  ["first name", "last name"],
  ["birthday"]
])

// Set card style
card.setStyle('imageCircleRect')

// Set image field
card.setCardImageField('avatar')

// Set fallback icon
card.setDefaultPersonIcon((d) => {
  return d.data.gender === 'M' ? 'male-icon.svg' : 'female-icon.svg'
})

// Set custom HTML creator
card.setCardInnerHtmlCreator((d) => {
  return `<div>Custom HTML</div>`
})

// Enable hover path highlighting
card.setOnHoverPathToMain()

// Disable hover path highlighting
card.unsetOnHoverPathToMain()

// Set click handler
card.setOnCardClick((d) => {
  console.log('Clicked:', d)
})

// Set dimensions
card.setCardDim({w: 220, h: 90})

// Reset dimensions
card.resetCardDim()

// Enable mini tree
card.setMiniTree(true)
```

---

## Advanced Examples

### Vue 3 Integration

```vue
<template>
  <div ref="chartContainer" class="family-chart"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as f3 from 'family-chart'

const chartContainer = ref(null)

onMounted(() => {
  const data = [
    // Your family data
  ]

  const store = f3.createStore({
    data,
    node_separation: 250,
    level_separation: 150
  })

  const svg = f3.createSvg(chartContainer.value)

  const Card = f3.elements.CardSvg({
    store,
    svg,
    card_dim: {w: 220, h: 70, text_x: 75, text_y: 15, img_w: 60, img_h: 60, img_x: 5, img_y: 5},
    card_display: [d => `${d.data["first name"]} ${d.data["last name"]}`],
    mini_tree: true,
    onCardClick: (d) => {
      store.updateMainId(d.data.id)
      store.updateTree({initial: false})
    }
  })

  const view = f3.view({
    store,
    cont: chartContainer.value,
    Card
  })

  store.setOnUpdate(() => view.update())
  store.updateTree({initial: true})
})
</script>

<style scoped>
.family-chart {
  width: 100%;
  height: 900px;
  background-color: rgb(33, 33, 33);
  color: #fff;
}
</style>
```

### Dynamic Data Updates

```javascript
// Add a new family member
function addFamilyMember(newPerson) {
  const currentData = store.getData()
  currentData.push(newPerson)

  store.updateTree({initial: false})
}

// Update a person's information
function updatePerson(personId, updates) {
  const currentData = store.getData()
  const person = currentData.find(p => p.id === personId)

  if (person) {
    Object.assign(person.data, updates)
    store.updateTree({initial: false})
  }
}

// Remove a family member
function removeFamilyMember(personId) {
  const currentData = store.getData()
  const index = currentData.findIndex(p => p.id === personId)

  if (index !== -1) {
    currentData.splice(index, 1)
    store.updateTree({initial: false})
  }
}
```

---

## Best Practices

### 1. Performance Optimization

- Use SVG cards for simple designs (faster rendering)
- Use HTML cards for rich, complex designs
- Limit the number of visible nodes in large trees
- Implement lazy loading for very large family trees
- Use `mini_tree: false` for better performance on large datasets

### 2. Responsive Design

```javascript
// Adjust card dimensions based on screen size
const isMobile = window.innerWidth < 768
const card_dim = isMobile
  ? {w: 150, h: 50, text_x: 50, text_y: 10, img_w: 40, img_h: 40, img_x: 5, img_y: 5}
  : {w: 220, h: 70, text_x: 75, text_y: 15, img_w: 60, img_h: 60, img_x: 5, img_y: 5}
```

### 3. Accessibility

```javascript
// Add ARIA labels
function onCardUpdate(d) {
  d3.select(this)
    .attr('role', 'button')
    .attr('aria-label', `${d.data.data["first name"]} ${d.data.data["last name"]}`)
    .attr('tabindex', 0)
}

// Keyboard navigation
card.on('keypress', (event, d) => {
  if (event.key === 'Enter' || event.key === ' ') {
    onCardClick(d)
  }
})
```

### 4. Modern Design Principles

- Use subtle shadows for depth: `box-shadow: 0 4px 6px rgba(0,0,0,0.1)`
- Smooth transitions: `transition: all 0.3s ease`
- Consistent border radius: `border-radius: 8px` to `12px`
- Gender-based color coding for quick visual identification
- Hover effects to indicate interactivity
- Clear visual hierarchy with font sizes and weights
- Proper spacing and padding for readability

### 5. Color Palettes

**Modern Gradient Scheme:**
```javascript
const colors = {
  male: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  female: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  neutral: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
}
```

**Minimalist Scheme:**
```javascript
const colors = {
  male: '#3b82f6',      // Blue
  female: '#ec4899',    // Pink
  neutral: '#6b7280',   // Gray
  background: '#ffffff',
  text: '#1f2937'
}
```

**Dark Mode Scheme:**
```javascript
const darkColors = {
  male: 'rgb(120, 159, 172)',
  female: 'rgb(196, 138, 146)',
  background: 'rgb(33, 33, 33)',
  text: '#ffffff',
  cardBg: 'rgba(255, 255, 255, 0.1)'
}
```

---

## Troubleshooting

### Common Issues

**1. Cards not displaying:**
- Ensure D3.js is loaded before family-chart
- Check that data structure matches expected format
- Verify container has defined width and height

**2. Clicking doesn't work:**
- Make sure `onCardClick` is properly defined
- Check that `pointer-events: auto` is set
- Verify event handlers aren't being blocked

**3. Layout issues:**
- Adjust `node_separation` and `level_separation` values
- Check `card_dim` values are appropriate for your design
- Ensure container has sufficient space

**4. Performance problems:**
- Switch from HTML to SVG cards
- Disable `mini_tree` for large datasets
- Reduce transition times
- Implement virtual scrolling for large trees

---

## Resources

- **GitHub Repository:** https://github.com/donatso/family-chart
- **Examples:** https://donatso.github.io/family-chart/examples/
- **NPM Package:** https://www.npmjs.com/package/family-chart
- **CodePen Vue Example:** https://codepen.io/donatso/pen/poMBjZe
- **Visual Builder:** Available on the documentation site

---

## Example Files to Study

The repository includes these excellent examples:

1. `1-basic-tree.html` - Foundation example
2. `3-custom-tree-card.html` - Custom card styling
3. `4-custom-main-node.html` - Customizing the selected node
4. `5-custom-text-display.html` - Custom text rendering
5. `6-html-cards.html` - HTML-based cards
6. `7-custom-elements-and-actions.html` - Interactive elements
7. `11-html-card-styling.html` - Card styling techniques

---

## Quick Start Checklist

- [ ] Install family-chart via npm/yarn
- [ ] Structure your family data in the correct JSON format
- [ ] Set up HTML container with proper dimensions
- [ ] Import D3.js and family-chart libraries
- [ ] Create store with your data and spacing preferences
- [ ] Choose between SVG or HTML cards
- [ ] Configure card dimensions and display fields
- [ ] Set up click handlers for interactivity
- [ ] Create and mount the view
- [ ] Test zoom, pan, and click functionality
- [ ] Apply custom styling and branding
- [ ] Optimize for your target devices

---

## Next Steps for Your Shajra Project

1. **Data Preparation:** Convert your family lineage data to the required JSON format
2. **Card Design:** Choose between SVG (simpler) or HTML (more flexible) cards
3. **Styling:** Implement a modern design with:
   - Glass morphism effects for elegance
   - Gender-based color coding
   - Smooth hover animations
   - Clear typography hierarchy
4. **Interactivity:** Add custom actions for:
   - Viewing detailed person information
   - Editing family member data (future backend integration)
   - Filtering and searching the tree
5. **Mobile Optimization:** Ensure cards and interactions work well on touch devices

---

*Research compiled from official documentation, source code analysis, and example implementations.*
*Last updated based on family-chart version 0.7.2 (npm), with considerations for version 0.9.0.*
