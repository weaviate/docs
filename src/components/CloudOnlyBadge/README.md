# CloudOnlyBadge Component

A reusable badge component to clearly mark features that are only available in Weaviate Cloud. Designed to stand out on OSS documentation pages while maintaining brand consistency.

## Usage

The component is globally available in all MDX files (registered in `src/theme/MDXComponents.js`).

### Basic usage

```mdx
<CloudOnlyBadge />
```

This displays: **☁️ Weaviate Cloud only** with a brand gradient background and hover tooltip.

### Custom text

```mdx
<CloudOnlyBadge text="Cloud feature" />
```

### Custom tooltip

```mdx
<CloudOnlyBadge tooltip="This feature requires a Weaviate Cloud Services account" />
```

### Custom link

```mdx
<CloudOnlyBadge href="/cloud/manage-clusters" />
```

### Custom tooltip position

```mdx
<!-- Position tooltip below the badge -->
<CloudOnlyBadge position="bottom" />

<!-- Position tooltip to the right -->
<CloudOnlyBadge position="right" />
```

### With custom className

```mdx
<CloudOnlyBadge className="my-custom-class" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | string | `"Weaviate Cloud only"` | The text to display in the badge |
| `tooltip` | string | `"This feature requires Weaviate Cloud - a fully managed service with automatic scaling, backups, and monitoring. Click to learn more."` | Tooltip text shown on hover in a styled popover |
| `href` | string | `"/cloud"` | Link destination when badge is clicked |
| `position` | string | `"top"` | Tooltip position: `top`, `bottom`, `left`, `right`, `top-left`, `top-right`, `bottom-left`, `bottom-right` |
| `className` | string | `""` | Additional CSS classes to apply |

## Design

The badge uses a **GitHub-style matte design** with Weaviate brand colors for a professional, subtle appearance:

### Visual Design
- **Style**: Matte, flat design inspired by GitHub badges
- **Color scheme**:
  - Light mode: Weaviate teal `#0069B4` (from brand guidelines)
  - Dark mode: Brighter teal `#1a8ccc` for visibility
- **Border**: Subtle 1px border for definition
- **Shadow**: Minimal shadow (0 1px 3px) for subtle depth
- **Icon**: Font Awesome cloud icon (`fa-regular fa-cloud`)
- **Typography**: Bold, compact, 0.8125rem size (GitHub-style)
- **Spacing**: Compact padding (0.35rem 0.75rem) for inline use

### Interaction Effects
- **Subtle hover** - Slightly brighter background color
- **Minimal lift** - Elevates 1px with gentle shadow increase
- **Press state** - Returns to baseline for tactile feedback
- **Smooth transitions** - 0.2s ease for responsive feel

### Tooltip
- **Styled popover** - Uses the existing Tooltip component for professional appearance
- **Smart positioning** - Automatically adjusts to avoid viewport edges
- **Dark mode support** - Adapts to theme automatically
- **Arrow pointer** - Clear visual connection to badge

### Purpose & Messaging
- **Position**: Usually at the top of documentation pages before the main content
- **Style philosophy**: Subtle and professional (GitHub-style) rather than flashy
- **Tooltip messaging**: Educates first-time users about Weaviate Cloud benefits:
  - Explains what Cloud is (fully managed service)
  - Highlights key value props (scaling, backups, monitoring)
  - Includes clear call-to-action (click to learn more)
- **Brand consistency**: Uses official Weaviate teal from style guide
- **Accessibility**: High contrast white text on teal background, clear clickable affordance

## Design Rationale

This badge follows the **GitHub badge philosophy**:
- **Matte, not glossy** - Professional and understated
- **Compact size** - Works inline with text
- **Minimal effects** - Subtle hover states, no flashy animations
- **Clear hierarchy** - Visible but doesn't dominate the page

The tooltip provides **value-focused messaging** for first-time users who may not know what Weaviate Cloud offers, converting curiosity into clicks.

## Examples

### At the top of a document

```mdx
---
title: Query Agent search
---

<CloudOnlyBadge />

The Weaviate Query Agent answers natural language queries...
```

### Inline with text

```mdx
This feature <CloudOnlyBadge text="Cloud only" /> requires a Weaviate Cloud instance.
```

### Custom link and tooltip

```mdx
<CloudOnlyBadge
  href="/cloud/manage-clusters"
  tooltip="Learn how to manage your Weaviate Cloud clusters"
/>
```

### Custom tooltip position

```mdx
<!-- Position tooltip below the badge -->
<CloudOnlyBadge position="bottom" />

<!-- Position tooltip to the right, useful for sidebar or narrow layouts -->
<CloudOnlyBadge position="right" />
```

### Link to external resource

```mdx
<CloudOnlyBadge
  text="Sign up for Cloud"
  href="https://console.weaviate.cloud"
  tooltip="Create your Weaviate Cloud account"
/>
```

## Technical Details

- Built with React and SCSS modules
- Uses Docusaurus Link component for routing
- Integrates with existing Tooltip component
- Supports theme detection via `[data-theme="dark"]`
- CSS animations use GPU-accelerated transforms
