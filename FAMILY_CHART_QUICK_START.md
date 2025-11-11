# Family Chart Library - Quick Start Guide

## Research Summary

I've completed comprehensive research on the `family-chart` library by donatso. Here's everything you need to know to implement beautiful, interactive family tree visualizations for your Shajra project.

---

## Key Findings

### Library Overview
- **Name:** family-chart
- **Version:** 0.7.2 (npm), you mentioned using 0.9.0
- **Built on:** D3.js
- **License:** MIT
- **Framework Support:** React, Vue, Angular, Svelte, Vanilla JavaScript
- **GitHub:** https://github.com/donatso/family-chart
- **Examples:** https://donatso.github.io/family-chart/examples/

### Core Capabilities
- SVG and HTML card rendering
- Interactive zoom and pan
- Custom card templates
- Click handlers and events
- Mini-tree visualization
- Gender-based styling
- Dynamic tree updates
- Path highlighting on hover

---

## Two Main Approaches

### 1. SVG Cards (CardSvg)
**Best for:** Simple, fast rendering with basic styling

**Pros:**
- Better performance
- Lighter weight
- Easier to customize with D3.js
- Built-in mini-tree support

**Cons:**
- More limited styling options
- Requires D3.js knowledge for complex customization

### 2. HTML Cards (CardHtml)
**Best for:** Rich, modern designs with CSS

**Pros:**
- Full CSS capabilities
- Modern effects (gradients, glass morphism, shadows)
- Easier for web developers
- More flexible layouts

**Cons:**
- Slightly heavier
- Can be slower with large datasets

---

## Essential API Methods

### Store Configuration
```javascript
const store = f3.createStore({
  data: familyData,           // Your family data array
  node_separation: 250,       // Horizontal spacing
  level_separation: 150       // Vertical spacing between generations
})
```

### CardSvg Configuration
```javascript
const Card = f3.elements.CardSvg({
  store,                      // Store instance
  svg,                        // SVG container
  card_dim: {                 // Card dimensions
    w: 220,                   // Width
    h: 70,                    // Height
    text_x: 75,               // Text X position
    text_y: 15,               // Text Y position
    img_w: 60,                // Image width
    img_h: 60,                // Image height
    img_x: 5,                 // Image X position
    img_y: 5                  // Image Y position
  },
  card_display: [             // Array of display functions
    d => `${d.data["first name"]} ${d.data["last name"]}`
  ],
  mini_tree: true,            // Show mini tree
  link_break: false,          // Link breaking behavior
  onCardClick: (d) => {},     // Click handler
  onCardUpdate: function(d) {} // Custom rendering
})
```

### CardHtml Configuration
```javascript
f3Chart.setCardHtml()
  .setCardDisplay([
    ["first name", "last name"],
    ["birthday"]
  ])
  .setStyle('imageCircleRect')  // Built-in styles
  .setCardDim({ w: 220, h: 70 })
  .setCardInnerHtmlCreator((d) => {
    // Return custom HTML string
    return `<div>...</div>`
  })
  .setOnCardClick((d) => {})
  .setOnHoverPathToMain()       // Enable path highlighting
```

---

## Data Structure

Each family member requires:

```javascript
{
  "id": "unique-id",           // Required: Unique identifier
  "data": {                    // Required: Person information
    "first name": "John",      // Required
    "last name": "Doe",        // Optional
    "gender": "M",             // Optional: "M" or "F"
    "birthday": "1980",        // Optional: Year or empty string
    "avatar": "/path/to/image" // Optional: Image URL
  },
  "rels": {                    // Required: Relationships
    "spouses": ["spouse-id"],
    "children": ["child-id"],
    "parents": ["parent-id"]
  }
}
```

**Important:**
- Relationships are bidirectional
- IDs must be unique
- Empty strings for missing data (not null)

---

## Recommended Card Designs for Shajra

### Option 1: Glass Morphism (Most Modern)
- Semi-transparent background with blur effect
- Elegant and contemporary
- Works great with photos
- Best for modern applications

**Characteristics:**
```css
background: rgba(59, 130, 246, 0.3);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.3);
```

### Option 2: Gradient Cards (Most Visual)
- Vibrant gradient backgrounds
- Gender-based color coding
- Eye-catching and memorable
- Best for presentations

**Characteristics:**
```css
Male: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Female: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)
```

### Option 3: Minimalist (Most Professional)
- Clean white background
- Color accent border
- Clear typography
- Best for formal applications

**Characteristics:**
```css
background: white;
border-left: 4px solid #3b82f6;
box-shadow: 0 2px 8px rgba(0,0,0,0.08);
```

### Option 4: Photo-Focused (Most Personal)
- Large circular avatar
- Vertical layout
- Name-focused design
- Best for family trees with photos

**Characteristics:**
```css
100px circular image
Centered layout
Border color by gender
```

---

## Implementation Checklist

### Step 1: Installation
```bash
yarn add family-chart
# or
npm install family-chart
```

### Step 2: Import Dependencies
```javascript
import * as f3 from 'family-chart'
import 'd3' // If not already included
```

### Step 3: Prepare Data
- Convert your family data to the required JSON format
- Ensure all IDs are unique
- Verify relationships are bidirectional

### Step 4: Choose Card Type
- SVG for simple, fast cards
- HTML for modern, styled cards

### Step 5: Customize Design
- Select color scheme
- Choose card dimensions
- Define hover effects
- Add interactivity

### Step 6: Test
- Verify zoom and pan work
- Test click handlers
- Check mobile responsiveness
- Ensure performance is acceptable

---

## Common Customizations

### Gender-Based Colors
```javascript
const genderColor = data.gender === 'M' ? '#3b82f6' : '#ec4899'
```

### Hover Effects
```javascript
onmouseover="this.style.transform='scale(1.1)'"
onmouseout="this.style.transform='scale(1)'"
```

### Custom Main Node
```javascript
if (d.data.main) {
  // Different styling for selected person
  // Larger size, different color, border, etc.
}
```

### Add Interactive Buttons
```javascript
// Edit button, add relative button, etc.
<button onclick="event.stopPropagation(); handleEdit('${d.data.id}')">
  Edit
</button>
```

---

## Performance Tips

1. **Use SVG cards** for large family trees (100+ people)
2. **Disable mini_tree** if not needed (performance boost)
3. **Lazy load images** in card templates
4. **Optimize card dimensions** for your use case
5. **Reduce transition times** for smoother feel

---

## Nuxt 3 Integration Notes

### Use ClientOnly Component
```vue
<ClientOnly>
  <div ref="chartContainer" class="family-chart" />
</ClientOnly>
```

### Create Composable
```javascript
// composables/useFamilyChart.js
export const useFamilyChart = () => {
  // Chart initialization logic
}
```

### Load Data from API
```javascript
const { data: familyData } = await useFetch('/api/shajra-data')
```

### Store in Pinia (Future)
```javascript
// stores/shajra.js
export const useShajraStore = defineStore('shajra', {
  state: () => ({
    familyData: [],
    mainPersonId: null
  })
})
```

---

## Next Steps for Your Project

### Immediate (Week 1)
1. ✅ Research complete
2. Create sample data file with 5-10 family members
3. Implement basic SVG card version
4. Test in your Nuxt app

### Short Term (Week 2-3)
1. Design custom card template (choose from provided examples)
2. Implement HTML cards with your chosen design
3. Add click handlers to show person details
4. Style for your brand colors

### Medium Term (Week 4-6)
1. Create full data import/conversion tool
2. Add zoom controls UI
3. Implement search functionality
4. Add filters (by generation, gender, etc.)

### Long Term (Future)
1. Backend API integration
2. Edit functionality
3. Add new family members
4. Photo upload
5. Print/export features

---

## File References

I've created three comprehensive documentation files for you:

1. **FAMILY_CHART_RESEARCH.md** - Complete library documentation
   - Full API reference
   - All configuration options
   - TypeScript types
   - Best practices

2. **FAMILY_CHART_EXAMPLES.md** - Ready-to-use code
   - 4 complete card designs
   - Interactive features
   - Vue 3 component
   - Nuxt 3 integration
   - Sample data

3. **FAMILY_CHART_QUICK_START.md** - This file
   - Quick reference
   - Implementation checklist
   - Design recommendations

---

## Design Recommendation for Shajra

Based on the nature of your project (family lineage for Syed/Sadaat families), I recommend:

**Primary Choice: Glass Morphism with Gradient Accent**
- Modern and elegant
- Respectful and professional
- Works well with or without photos
- Gender-based subtle color coding
- Beautiful on both light and dark backgrounds

**Alternative: Minimalist with Color Border**
- Very clean and readable
- Professional appearance
- Fast rendering
- Clear hierarchy
- Easy to print/export

**For Special Occasions: Gradient Cards**
- Eye-catching for presentations
- Great for demonstrations
- Memorable visual impact

---

## Color Palette Suggestions

### Traditional Islamic Colors
```javascript
const colors = {
  male: '#2E7D32',      // Deep green
  female: '#7B1FA2',    // Royal purple
  accent: '#D4AF37',    // Gold
  background: '#FAFAFA',
  text: '#212121'
}
```

### Modern Neutral
```javascript
const colors = {
  male: '#3b82f6',      // Blue
  female: '#ec4899',    // Pink
  accent: '#8b5cf6',    // Purple
  background: '#ffffff',
  text: '#1f2937'
}
```

### Dark Mode
```javascript
const colors = {
  male: 'rgb(120, 159, 172)',
  female: 'rgb(196, 138, 146)',
  background: 'rgb(33, 33, 33)',
  text: '#ffffff',
  cardBg: 'rgba(255, 255, 255, 0.1)'
}
```

---

## Support Resources

- **GitHub Issues:** https://github.com/donatso/family-chart/issues
- **Examples:** https://donatso.github.io/family-chart/examples/
- **CodePen Vue Example:** https://codepen.io/donatso/pen/poMBjZe
- **Author Email:** donatso.dev@gmail.com

---

## Quick Code Snippet to Get Started

```vue
<!-- components/ShajraChart.vue -->
<template>
  <ClientOnly>
    <div ref="chartContainer" class="shajra-chart"></div>
  </ClientOnly>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as f3 from 'family-chart'

const chartContainer = ref(null)

onMounted(async () => {
  // Load your data
  const response = await fetch('/assets/shajra-data.json')
  const data = await response.json()

  // Create store
  const store = f3.createStore({
    data,
    node_separation: 250,
    level_separation: 150
  })

  // Create SVG
  const svg = f3.createSvg(chartContainer.value)

  // Create Card
  const Card = f3.elements.CardSvg({
    store,
    svg,
    card_dim: {w:220, h:70, text_x:75, text_y:15, img_w:60, img_h:60, img_x:5, img_y:5},
    card_display: [d => `${d.data["first name"]} ${d.data["last name"]}`],
    mini_tree: true,
    onCardClick: (d) => {
      store.updateMainId(d.data.id)
      store.updateTree({initial: false})
    }
  })

  // Create view
  const view = f3.view({ store, cont: chartContainer.value, Card })

  // Initialize
  store.setOnUpdate(() => view.update())
  store.updateTree({initial: true})
})
</script>

<style scoped>
.shajra-chart {
  width: 100%;
  height: 900px;
  background-color: #f9fafb;
}
</style>
```

---

## Troubleshooting Quick Guide

| Issue | Solution |
|-------|----------|
| Cards not showing | Check container has height, D3.js loaded, data format correct |
| Click not working | Verify `pointer-events: auto` and handler defined |
| Layout weird | Adjust `node_separation` and `level_separation` values |
| Performance slow | Use SVG cards, disable mini_tree, reduce dataset size |
| Zoom not working | Check D3 zoom behavior is enabled (default) |
| Images not loading | Verify avatar URLs are correct and accessible |

---

**Ready to start?** Begin with the basic SVG implementation in `FAMILY_CHART_EXAMPLES.md` and gradually add the styling and features you need!
