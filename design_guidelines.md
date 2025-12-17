# ScrubSocietyAI Design Guidelines

## Design Approach
**Reference-Based Approach**: Hybrid of LinkedIn (professional networking) + Threads (conversational feed), optimized for medical professionals with emphasis on trust, clarity, and quick information access.

## Core Design Principles
1. **Medical Professionalism**: Clean, trustworthy interface suitable for healthcare professionals
2. **Mobile-First**: All layouts prioritize mobile experience, then enhance for desktop
3. **Two-Click Accessibility**: Critical actions (post case, search drug, message peer) within 2 clicks
4. **Information Density**: Balanced between LinkedIn's structured content and Threads' lightweight feel

## Typography
- **Font Family**: Inter or similar clean sans-serif via Google Fonts
- **Hierarchy**:
  - Page Titles: text-2xl md:text-3xl font-bold
  - Section Headers: text-xl md:text-2xl font-semibold
  - Card Titles: text-lg font-semibold
  - Body Text: text-base leading-relaxed
  - Meta Info (timestamps, credentials): text-sm text-gray-600
  - Labels: text-sm font-medium
- **High Readability**: line-height of 1.6-1.8 for body text, generous letter-spacing for medical terminology

## Color System
- **Primary**: Deep Navy (#0b2540) - Navigation, CTAs, important actions
- **Accent**: Leave unspecified for later implementation
- **Neutrals**: Grays for text hierarchy and borders
- **Semantic Colors**: For drug safety (red/yellow/green indicators), verification badges

## Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 to p-6
- Section spacing: space-y-6 to space-y-8
- Card gaps: gap-4 md:gap-6

**Container Strategy**:
- Mobile: Full-width with px-4 padding
- Desktop: max-w-7xl mx-auto px-6
- Content sections: max-w-4xl for optimal reading

**Responsive Breakpoints**:
- Mobile: Base (< 768px) - Single column, stacked
- Tablet: md (768px+) - 2-column grids
- Desktop: lg (1024px+) - 3-column grids, sidebar layouts

## Navigation Architecture
**Horizontal Top Navbar** (Fixed position):
- Background: Deep Navy (#0b2540)
- Height: h-16
- Layout: Logo left, nav items center (desktop), profile/menu right
- Mobile: Hamburger menu revealing full-screen overlay or slide-in drawer
- Desktop: Horizontal links with search bar integrated
- Active state: Subtle underline or highlight treatment

## Component Library

### Cards (Primary UI Pattern)
- Border radius: rounded-2xl
- Shadow: shadow-md
- Padding: p-4 to p-6
- Hover state: Subtle lift (shadow-lg transition)
- Background: White cards on light gray background
- Border: Optional 1px subtle border for definition

### Feed Cards (Case Posts)
- Doctor info header: Avatar (w-10 h-10 rounded-full), name, credentials, timestamp
- Content area: Title (font-semibold), description, attachments
- Interaction footer: Like, Comment, Share icons with counts
- Spacing: Vertical stack with space-y-3

### Widget Cards (Dashboard)
- Icon + Title header
- Key metric or content (large text or list)
- Action button or link at bottom
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

### Forms
- Input fields: h-12, rounded-lg, border focus:outline-none focus:ring-2
- Labels: Above input, text-sm font-medium mb-2
- Buttons: Primary (navy), h-12, rounded-lg, font-semibold
- Spacing: space-y-4 between fields
- Registration: Progressive disclosure or stepper for multi-field forms

### Buttons
- Primary CTA: Navy background, white text, px-6 py-3, rounded-lg
- Secondary: White/transparent with navy border
- Icon buttons: p-2 to p-3, rounded-full
- States: Built-in hover/active transitions

### Drug Search Interface
- Prominent search input with icon
- Color-coded results cards: Red (contraindicated), Yellow (caution), Green (safe)
- Each result card shows: Drug name, safety status badge, key info

### Chat UI
- Left sidebar: Contact list with avatars and last message preview
- Right panel: Message thread with alternating sender alignment
- Input: Fixed bottom, rounded text area with send button
- Mobile: Full-screen conversation view with back button

### CME Carousel
- Horizontal scroll on mobile (snap-scroll)
- Grid on desktop (2-3 columns)
- Cards: Image thumbnail, title, duration/credits, CTA
- Navigation dots or arrows

## Page-Specific Layouts

### Landing Page
- Hero: Full-width banner with headline, subheadline, dual CTAs (Join Free, See Demo)
- Trust indicators: Verified doctors count, security badge
- Features grid: 3-column (desktop) showcasing key benefits with icons
- Case feed preview: 2-3 sample cards
- Footer: Links, social proof, login

### Dashboard
- Top: Welcome header with doctor name
- Widget grid: 2x3 or 3x2 depending on screen size
- Quick actions bar: Prominent buttons for Post Case, Search Drug, Find Peer
- Bottom: Recent activity feed

### Case Feed
- Infinite scroll list of case cards
- Floating action button (bottom-right): "Post New Case"
- Filter/sort options in top bar
- Pull-to-refresh on mobile

### Profile
- Header: Large avatar, name, credentials, specialty
- Stats row: Posts, Connections, CME Credits
- About section: Bio, education, license info
- Tabs: Cases, Articles, Connections
- Edit button (own profile only)

## Images
**No large hero images specified** - This is a utility-focused professional network. Visual focus is on user-generated content (case images, doctor avatars, CME thumbnails).

**Where to Use Images**:
- Doctor avatars: Throughout (navbar, posts, chat, profile)
- CME/Research thumbnails: Article previews
- Case attachments: Medical images (X-rays, charts) when relevant
- Landing page: Small illustrative icons for features, not full-bleed hero

## Accessibility
- Minimum touch target: 44x44px for all interactive elements
- Contrast ratios meet WCAG AA standards
- Form inputs have associated labels
- Error states clearly communicated
- Keyboard navigation support throughout

## Animations
**Minimal and Purposeful Only**:
- Card hover: Subtle shadow lift (duration-200)
- Page transitions: Fade or slide (duration-300)
- Loading states: Skeleton screens, not spinners
- No decorative animations

## Mobile Optimization
- Bottom navigation consideration for primary actions
- Thumb-friendly zones for critical interactions
- Swipe gestures for chat, feed navigation
- Collapsible sections to manage screen real estate
- Fixed header collapses on scroll to maximize content area