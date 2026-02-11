# Design System: Enterprise Minimal + Optional Glass

## Principles
1. Clarity first: typography and spacing create hierarchy before color does.
2. Token-only styling: no ad hoc hex values in page code.
3. Accessibility by default: visible focus, semantic controls, reduced motion support.
4. Effects are optional: solid mode is baseline; glass mode is additive and constrained.

## Token Model

### Color roles
- `--background`, `--foreground`: page base.
- `--card`, `--card-foreground`: primary surface and text.
- `--popover`, `--popover-foreground`: overlays.
- `--primary`, `--primary-foreground`: action emphasis.
- `--secondary`, `--secondary-foreground`: secondary actions.
- `--muted`, `--muted-foreground`: support text and low-emphasis containers.
- `--accent`, `--accent-foreground`: interactive hover states.
- `--destructive`, `--destructive-foreground`: destructive actions.
- `--success`, `--success-foreground`: positive status states.
- `--warning`, `--warning-foreground`: caution status states.
- `--border`, `--input`, `--ring`: structure and focus.
- `--brand-gradient-end`: premium gradient endpoint for branded accents.

### Typography
- `font-sans`: body and interface text.
- `font-display`: page titles and hero/section headings.
- Scale rules:
- Display: 36-56px, tight line-height.
- Heading: 24-32px.
- Body: 14-18px.
- Meta: 12-13px.

### Spacing
- 4px baseline scale.
- Common steps: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- Layout gutters:
- mobile: 16px
- tablet: 24px
- desktop: 32px

### Radius and elevation
- Radius scale:
- small: 10px
- medium: 14px
- large: 18px
- x-large: 24px
- Elevation scale:
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`
- Blur scale:
- `--blur-sm`, `--blur-md`, `--blur-lg`
- Z-index scale:
- `--z-base`, `--z-dropdown`, `--z-overlay`, `--z-modal`, `--z-toast`

### Motion
- Duration scale: 120ms, 160ms, 200ms, 260ms.
- Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)` for entrance/hover transitions.
- If `prefers-reduced-motion: reduce`, transitions and keyframe animations are minimized.

## Effects Mode

### Mode contract
- `data-ui-effects="solid"` (default)
- `data-ui-effects="glass"`

### Glass rules
1. Apply only to surface components (`Card`, shell panels, menus, dialogs).
2. Never apply to page-wide text layers or body backgrounds.
3. Keep blur subtle and borders soft.
4. Preserve readable contrast in both light and dark themes.

## Component Inventory and Patterns

### Core input and actions
- `Button`: variants `default`, `secondary`, `outline`, `ghost`, `destructive`, `premium`, `link`.
- `Input`, `Textarea`, `Select`, `Switch`, `Checkbox`, `RadioGroup`.
- Form fields must provide labels and inline error text.

### Feedback and overlays
- `Alert`, `Toast`, `Tooltip`.
- `Dialog` (modal) and `Drawer` (sheet) for focused tasks.

### Navigation and structure
- `Tabs`, `DropdownMenu`, `Breadcrumbs`, `Pagination`.
- `PageHeader` pattern: title + summary + action slot.

### Data display
- `Card`, `Table`, `Badge`, `Avatar`.
- Data states:
- loading: skeletons
- empty: explicit empty-state component
- error: alert banner with recovery action

### Flow helpers
- `Stepper` for multi-step processes.
- `Status` pattern for success/warning/error callouts.

## Layout Rules

### Shell layout
- Desktop app/admin: fixed left rail + top bar + scrollable content region.
- Public: compact top nav + single content container.
- Mobile: top bar + drawer menu; avoid dense multi-row headers.

### Page structure
1. `PageContainer`
2. `PageHeader`
3. `Toolbar` (optional)
4. `Content`
5. `StatusRegion`

## Internal Visual Contract
- Internal reference route: `/ui-showcase` (authenticated app area).
- Must include every foundation primitive and key pattern:
- forms and input controls
- table shell and pagination
- empty states and skeletons
- dialogs/drawers/tooltips/dropdowns
- toasts/alerts/stepper

## Accessibility Standards
1. Every interactive element must be keyboard reachable.
2. Use visible focus style (`ring`) on keyboard interaction.
3. Do not rely on color alone for status semantics.
4. Ensure all icon-only controls have accessible names.
5. For dialogs/drawers, trap focus and restore focus on close.
6. Respect reduced-motion preference.

## Do and Don’t

### Do
- Use tokenized utilities and component variants.
- Reuse shared primitives for consistency.
- Keep spacing rhythm and heading hierarchy consistent.

### Don’t
- Add raw hex/rgb colors directly in page-level class strings.
- Add decorative blur/glow behind body text.
- Introduce large-motion effects on routine interactions.

## Responsive Standards
1. Content width uses a consistent max container.
2. Tables degrade gracefully via horizontal scroll wrappers.
3. Toolbars stack cleanly on mobile.
4. Navigation keeps touch targets >= 44px on mobile.
