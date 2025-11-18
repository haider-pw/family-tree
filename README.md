# Shajra - Family Lineage Tracker!!!

A modern web application for storing, updating, and visualizing family lineage, built with Nuxt 3, Vue 3, and Supabase.

## Features

- **Authentication**: Secure user authentication with Supabase Auth
- **Multi-Tree Support**: Users can create and manage multiple family trees
- **Interactive Visualization**: Family tree visualization using family-chart library
- **Complete CRUD Operations**: Full create, read, update, delete for trees and members
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- **Dark Mode**: Full dark mode support with theme persistence
- **Type Safety**: Complete TypeScript coverage
- **State Management**: Pinia store for reactive global state
- **SSR Compatible**: Server-side rendering ready

## Tech Stack

- **Framework**: Nuxt 3 (Vue 3)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth
- **State Management**: Pinia
- **Visualization**: family-chart library (built on D3.js)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Code Quality**: Prettier, ESLint

## Quick Start

### Prerequisites

- Node.js 18+ and Yarn
- A Supabase account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shajra
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Copy your project URL and API key

4. **Configure environment**
   ```bash
   # Create .env file
   SUPABASE_URL=your-project-url
   SUPABASE_KEY=your-anon-key
   ```

5. **Run database migrations**
   - Open Supabase SQL Editor
   - Run the SQL from `/supabase/migrations/001_initial_schema.sql`

6. **Start development server**
   ```bash
   yarn dev
   ```

7. **Visit** `http://localhost:3000`

For detailed setup instructions, see [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

## Documentation

- **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Complete setup guide
- **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - Developer reference with code examples
- **[SUPABASE_INTEGRATION_SUMMARY.md](SUPABASE_INTEGRATION_SUMMARY.md)** - Architecture overview
- **[supabase/README.md](supabase/README.md)** - Database migration instructions

## Development Commands

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Run TypeScript type checking
yarn typecheck

# Run ESLint
yarn lint
```

## Project Structure

```
shajra/
├── supabase/
│   ├── migrations/           # Database schema migrations
│   │   └── 001_initial_schema.sql
│   ├── sample-data.sql       # Sample data for testing
│   └── README.md
├── types/
│   └── database.ts           # TypeScript type definitions
├── composables/
│   ├── useFamilyTree.ts      # Family tree operations
│   └── useFamilyMembers.ts   # Member & relationship operations
├── stores/
│   └── familyTree.ts         # Pinia store for state management
├── server/
│   └── api/
│       ├── family-trees/     # Tree CRUD endpoints
│       └── family-members/   # Member CRUD endpoints
├── pages/
│   ├── index.vue             # Main tree viewer
│   ├── login.vue             # Login page
│   └── signup.vue            # Signup page
├── components/
│   └── ShajraChart.vue       # Family tree visualization
├── middleware/
│   └── auth.ts               # Authentication middleware
└── assets/                   # Static assets
```

## Database Schema

The application uses a PostgreSQL database with the following tables:

- **profiles** - User profiles (extends auth.users)
- **family_trees** - Family tree collections
- **family_members** - Individual people in trees
- **relationships** - Connections between members

All tables are protected with Row Level Security (RLS) policies ensuring users can only access their own data.

## Features

### Authentication
- Email/password signup and login
- Secure session management
- Protected routes with middleware
- Automatic profile creation on signup

### Family Trees
- Create multiple trees per user
- Set default tree
- Update tree name and description
- Delete trees (cascade deletes members/relationships)

### Family Members
- Add members with name, gender, birth/death years
- Optional profile photos and notes
- Update member information
- Delete members (cascade deletes relationships)

### Relationships
- Define parent-child relationships
- Link spouses
- Automatic bidirectional relationship handling
- Transform to visualization format

### UI/UX
- Responsive design (mobile, tablet, desktop)
- Dark mode with persistence
- Loading and error states
- Empty state handling
- Accessibility features

## API Endpoints

### Family Trees
- `GET /api/family-trees` - Get all trees
- `POST /api/family-trees` - Create tree
- `GET /api/family-trees/:id` - Get tree with members
- `PATCH /api/family-trees/:id` - Update tree
- `DELETE /api/family-trees/:id` - Delete tree

### Family Members
- `POST /api/family-members` - Create member
- `PATCH /api/family-members/:id` - Update member
- `DELETE /api/family-members/:id` - Delete member

All endpoints require authentication and validate user ownership.

## Usage Example

```typescript
// Using the Pinia store
import { useFamilyTreeStore } from '~/stores/familyTree'

const store = useFamilyTreeStore()

// Initialize (loads user's trees)
await store.initialize()

// Create a tree
await store.createTree({
  name: 'My Family Tree',
  description: 'Our family history',
  is_default: true
})

// Create a member
await store.createMember({
  tree_id: store.activeTreeId,
  name: 'John Doe',
  gender: 'M',
  birth_year: 1950
})

// Access data
console.log(store.trees)      // All trees
console.log(store.members)    // Current tree members
console.log(store.chartData)  // Visualization data
```

## Future Development TODOs

### Advanced Tree Management
- [ ] Interactive add/edit/delete UI for members
- [ ] Drag-and-drop interface for tree building
- [ ] Visual relationship builder
- [ ] Support for complex family structures
- [ ] Import/export GEDCOM files

### Enhanced Features
- [ ] Photo upload to Supabase Storage
- [ ] Rich text notes with formatting
- [ ] Timeline view of family history
- [ ] Search and filter functionality
- [ ] Export to PDF/PNG
- [ ] Print-friendly views

### Collaboration
- [ ] Share trees with other users
- [ ] Collaborative editing with permissions
- [ ] Activity history and version control
- [ ] Comments and discussions

### UI/UX Improvements
- [ ] Multiple tree layout options
- [ ] Zoom and pan controls
- [ ] Minimap for large trees
- [ ] Highlight relationship paths
- [ ] Keyboard navigation
- [ ] Screen reader support

### Technical Enhancements
- [ ] Email verification
- [ ] Password reset
- [ ] Two-factor authentication
- [ ] Rate limiting
- [ ] Pagination for large trees
- [ ] Caching strategies
- [ ] Unit and E2E tests
- [ ] Performance benchmarking

## Security

- Row Level Security (RLS) on all tables
- Authentication required for all API endpoints
- Users can only access their own data
- Input validation client and server-side
- SQL injection protection via Supabase
- XSS prevention via Vue's automatic escaping

## Performance

- Indexed database queries
- Pinia store caching
- Lazy loading of tree data
- Efficient relationship building
- Optimized for trees with hundreds of members

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers supported

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT

## Support

For issues and questions:
- Check the documentation in this repository
- Review [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for setup issues
- See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for development help

---

**Status**: Production-ready with complete Supabase integration
**Version**: 1.0.0
**Last Updated**: 2025-11-11
