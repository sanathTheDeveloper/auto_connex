# Auto Connex Typography & Brand Guidelines

## Brand Colors (from color-swatches.png)

| Color | Hex | Usage |
|-------|-----|-------|
| **Primary** | `#0ABAB5` | Buttons, links, active states, primary CTAs |
| **Secondary** | `#008985` | Secondary buttons, hover states, gradients |
| **Accent** | `#FF3864` | Warning CTAs, highlights, error states |
| **Background** | `#FFFFFF` | Main background, cards |
| **BG Alt** | `#F5F1E3` | Alternative background, cream/beige sections |
| **Success** | `#08605D` | Success states, verified badges, trust indicators |
| **Text** | `#050505` | Primary text, headings |
| **Text Alt** | `#F0F0F0` | Light text on dark backgrounds |

## Font Families

### Volkhov (Serif - Display & Headers)
- **Usage**: Headlines, page titles, dashboard headers, hero text
- **Variants**: `display`, `h1`, `h2`
- **Character**: Modern, professional, authoritative
- **Best for**: Data-heavy interfaces, quick decision-making moments

### Vesper Libre (Serif - Body & UI)
- **Usage**: Body text, form labels, captions, buttons, listings
- **Variants**: `h3`, `h4`, `body`, `bodySmall`, `caption`, `label`
- **Character**: Clean, smooth, readable
- **Best for**: Transactional interfaces, vehicle listings, forms

## Text Component Variants

| Variant | Font | Size (Mobile) | Weight | Use Case |
|---------|------|---------------|--------|----------|
| `display` | Volkhov | 34px | Bold | Logo, hero text |
| `h1` | Volkhov | 28px | Bold | Page titles |
| `h2` | Volkhov | 24px | Bold | Section headers (dashboards) |
| `h3` | Vesper Libre | 20px | Regular | Subsection headers |
| `h4` | Vesper Libre | 17px | Regular | Small headers, card titles |
| `body` | Vesper Libre | 15px | Regular | Default body text |
| `bodySmall` | Vesper Libre | 14px | Regular | Secondary body text |
| `caption` | Vesper Libre | 13px | Regular | Captions, metadata, form hints |
| `label` | Vesper Libre | 12px | Medium | Form labels, button text |

## SignupScreen Typography Rules

### Step Titles
```tsx
<Text variant="h4" weight="bold">Step Title</Text>
```
- Use `h4` variant with `bold` weight
- Centered alignment
- Color: `text` (default)

### Step Subtitles
```tsx
<Text variant="caption" weight="medium" style={styles.stepSubtitle}>
  Subtitle description
</Text>
```
- Use `caption` variant with `medium` weight
- Centered, slightly muted (greyscale700)

### Form Labels
```tsx
<Input label="Field Name" ... />
```
- Handled by Input component
- Uses `caption` variant internally

### Info Banners (e.g., Escrow Banner)
```tsx
<Text variant="caption" weight="semibold" style={styles.escrowTitle}>
  Banner Title
</Text>
<Text variant="caption" style={styles.escrowText}>
  Banner description text
</Text>
```
- Title: `caption` + `semibold`, colored (success/primary)
- Body: `caption` + regular, text color with opacity

### Button Text
- Primary buttons: White text on primary/success background
- Outline buttons: Primary color text

### Terms & Links
```tsx
<Text variant="caption" style={styles.termsLink}>
  Terms of Service
</Text>
```
- Use primary color for links
- `fontWeight: '600'` for emphasis

## Spacing Guidelines

| Element | Spacing |
|---------|---------|
| Between sections | `Spacer size="lg"` or `size="xl"` |
| Between form fields | `Spacer size="sm"` or `size="md"` |
| After titles | `Spacer size="xs"` or `size="sm"` |
| Before buttons | `Spacer size="md"` |

## Implementation Checklist

- [ ] All headings use appropriate `variant` prop
- [ ] Form labels use `caption` or `label` variant
- [ ] Body text uses `body` or `bodySmall`
- [ ] Links use `primary` color with semibold weight
- [ ] Error states use `accent` (#FF3864) color
- [ ] Success states use `success` (#08605D) color
- [ ] No hardcoded font families - always use Text component
