# UI Design Tokens

## Document Purpose
- This file defines the concrete visual token values for the Vue redesign.
- Builder should treat these values as the default implementation baseline for `tokens.css`.
- If a Builder run needs to deviate from a value, it should stay within the same visual family and keep the change minimal.

## Token Naming Rules
- Use semantic names rather than page-specific names.
- Prefer `--color-*`, `--font-*`, `--text-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--layout-*`, `--motion-*`.
- Do not create one-off tokens for a single page unless Planner explicitly approves it.

## Color Tokens

### Core Palette
| Token | Value | Usage |
| --- | --- | --- |
| `--color-bg` | `#f3efe7` | Primary app background |
| `--color-bg-strong` | `#e7dfd2` | Stronger page wash, hero backing, highlighted layout zones |
| `--color-surface` | `#fbf8f2` | Main card and panel background |
| `--color-surface-soft` | `#f6f1e8` | Soft section backgrounds, inset surfaces |
| `--color-surface-strong` | `#efe7da` | Elevated or emphasized section surface |
| `--color-text` | `#1f2a33` | Main text color |
| `--color-text-soft` | `#41505c` | Slightly softened text for secondary headings |
| `--color-muted` | `#69737a` | Metadata and supporting copy |
| `--color-muted-soft` | `#8c938f` | Placeholders and low-emphasis labels |
| `--color-inverse` | `#fbf8f2` | Text on dark backgrounds |

### Accent Palette
Accent is locked to a clay/copper family.

| Token | Value | Usage |
| --- | --- | --- |
| `--color-accent` | `#a65a3a` | Primary accent, key buttons, active accents |
| `--color-accent-hover` | `#8f4a2d` | Primary hover state |
| `--color-accent-soft` | `#ead8cb` | Soft fills for accent-tinted surfaces |
| `--color-accent-strong` | `#7c3d25` | Strong text/icon use on pale accent backgrounds |

### Border and Divider Palette
| Token | Value | Usage |
| --- | --- | --- |
| `--color-border` | `#d8d0c4` | Default border |
| `--color-border-strong` | `#bcae9b` | Strong border, active control border |
| `--color-divider` | `rgba(31, 42, 51, 0.08)` | Soft dividers and separators |

### Status Palette
| Token | Value | Usage |
| --- | --- | --- |
| `--color-danger-bg` | `#f8e5e1` | Error background |
| `--color-danger-text` | `#8b3527` | Error text |
| `--color-danger-border` | `#dfb4a9` | Error border |
| `--color-success-bg` | `#e6f1e8` | Success background |
| `--color-success-text` | `#2f6842` | Success text |
| `--color-success-border` | `#b7d0bd` | Success border |
| `--color-warning-bg` | `#f8efdc` | Warning background |
| `--color-warning-text` | `#8b6330` | Warning text |
| `--color-warning-border` | `#e0c89b` | Warning border |
| `--color-info-bg` | `#e7eef3` | Info background |
| `--color-info-text` | `#34566c` | Info text |
| `--color-info-border` | `#b8cad8` | Info border |

## Typography Tokens

### Font Families
Keep the stack local-safe and editorial in tone.

| Token | Value | Usage |
| --- | --- | --- |
| `--font-body` | `"Segoe UI", "PingFang TC", "Microsoft JhengHei", sans-serif` | Body copy, forms, metadata |
| `--font-display` | `"Georgia", "Times New Roman", "Noto Serif TC", serif` | Large headings, article titles, hero titles |
| `--font-mono` | `"Consolas", "SFMono-Regular", "Courier New", monospace` | Code snippets |

### Type Scale
| Token | Value | Usage |
| --- | --- | --- |
| `--text-display` | `clamp(2.75rem, 5vw, 4.5rem)` | Homepage hero title |
| `--text-page-title` | `clamp(2rem, 3vw, 3rem)` | Major page headings |
| `--text-section-title` | `1.5rem` | Section headers |
| `--text-card-title` | `1.25rem` | Article card title |
| `--text-body-lg` | `1.0625rem` | Large body copy |
| `--text-body` | `1rem` | Standard text |
| `--text-body-sm` | `0.9375rem` | Supporting body copy |
| `--text-meta` | `0.8125rem` | Metadata, labels |
| `--text-code` | `0.9375rem` | Inline/block code |

### Line Heights
| Token | Value | Usage |
| --- | --- | --- |
| `--line-tight` | `1.15` | Display and large headings |
| `--line-heading` | `1.25` | Standard headings |
| `--line-body` | `1.7` | Paragraphs and card summaries |
| `--line-reading` | `1.82` | Article body |
| `--line-meta` | `1.45` | Metadata and labels |

### Letter Spacing
| Token | Value | Usage |
| --- | --- | --- |
| `--tracking-tight` | `-0.02em` | Hero and article titles |
| `--tracking-normal` | `0` | Default text |
| `--tracking-wide` | `0.08em` | Eyebrow labels |

## Spacing Tokens
Use a clear scale and reuse it everywhere.

| Token | Value | Usage |
| --- | --- | --- |
| `--space-2` | `0.125rem` | Micro gaps |
| `--space-4` | `0.25rem` | Tight gaps |
| `--space-6` | `0.375rem` | Small gaps |
| `--space-8` | `0.5rem` | Small spacing |
| `--space-10` | `0.625rem` | Compact spacing |
| `--space-12` | `0.75rem` | Compact panel padding |
| `--space-16` | `1rem` | Base spacing |
| `--space-20` | `1.25rem` | Medium spacing |
| `--space-24` | `1.5rem` | Card padding |
| `--space-32` | `2rem` | Section gap |
| `--space-40` | `2.5rem` | Large section spacing |
| `--space-48` | `3rem` | Hero / page spacing |
| `--space-64` | `4rem` | Wide vertical spacing |

## Radius Tokens
| Token | Value | Usage |
| --- | --- | --- |
| `--radius-sm` | `10px` | Inputs, compact buttons |
| `--radius-md` | `14px` | Standard controls and notices |
| `--radius-lg` | `20px` | Cards and panels |
| `--radius-xl` | `28px` | Large hero or feature surfaces |
| `--radius-pill` | `999px` | Pills, tags, chip-like controls |

## Shadow Tokens
| Token | Value | Usage |
| --- | --- | --- |
| `--shadow-soft` | `0 10px 30px rgba(58, 48, 37, 0.08)` | Default surface elevation |
| `--shadow-medium` | `0 18px 45px rgba(58, 48, 37, 0.12)` | Feature cards, hero surfaces |
| `--shadow-focus` | `0 0 0 4px rgba(166, 90, 58, 0.14)` | Focus halo |

## Layout Tokens
| Token | Value | Usage |
| --- | --- | --- |
| `--layout-page-max` | `1180px` | Default content width |
| `--layout-wide-max` | `1280px` | Feature or hero width |
| `--layout-reading-max` | `760px` | Article body width |
| `--layout-shell-padding` | `clamp(1rem, 2vw, 1.5rem)` | Main horizontal padding |
| `--layout-shell-padding-mobile` | `0.875rem` | Narrow-screen padding |
| `--layout-section-gap` | `var(--space-32)` | Default page section gap |
| `--layout-card-gap` | `var(--space-16)` | Gap inside grouped cards |

## Control Tokens
| Token | Value | Usage |
| --- | --- | --- |
| `--control-height-sm` | `2.25rem` | Small controls |
| `--control-height-md` | `2.75rem` | Standard inputs and buttons |
| `--control-height-lg` | `3.25rem` | Large hero search / CTA controls |
| `--control-padding-x` | `0.9rem` | Standard horizontal control padding |
| `--control-padding-y` | `0.7rem` | Standard vertical control padding |

## Motion Tokens
| Token | Value | Usage |
| --- | --- | --- |
| `--motion-fast` | `140ms` | Quick state transitions |
| `--motion-base` | `220ms` | Default hover/focus transition |
| `--motion-slow` | `360ms` | Surface reveal and page-level transitions |
| `--ease-standard` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Default UI easing |

## Breakpoints
| Token | Value | Usage |
| --- | --- | --- |
| `--breakpoint-sm` | `640px` | Small mobile threshold |
| `--breakpoint-md` | `768px` | Tablet / stacked layout threshold |
| `--breakpoint-lg` | `1024px` | Desktop threshold |
| `--breakpoint-xl` | `1280px` | Wide layout threshold |

## Primitive Usage Rules
- Buttons should use control height tokens and radius tokens instead of page-local magic numbers.
- Inputs and textareas should use shared border, focus, and background tokens.
- Cards and panels should use only `--radius-lg` or `--radius-xl` unless a compact use case clearly needs `--radius-md`.
- Article reading surfaces should reference `--layout-reading-max`.
- Section spacing should be built from the spacing scale, not ad hoc values.

## Allowed Flex Range for Builder
- Small visual tuning within `4px` or `0.25rem` is acceptable when needed for alignment.
- Accent hover and surface tint values may be slightly adjusted if contrast or interaction polish requires it.
- New tokens may be added only when they are broadly reusable across more than one page or component family.

## Disallowed Builder Shortcuts
- Do not hardcode unrelated hex values across pages instead of using tokens.
- Do not create a second shadow system or second spacing scale.
- Do not invent page-specific container widths when an existing layout token fits.
