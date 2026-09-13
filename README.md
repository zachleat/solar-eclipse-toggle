# `<solar-eclipse-toggle>` Web Component

An accessible light/dark theme toggle button that follows your system preference by default.

* [Demo](https://zachleat.github.io/solar-eclipse-toggle/demo.html) on GitHub Pages

## Installation

```
npm install @zachleat/solar-eclipse-toggle
```

Include the stylesheet and the script on your web site:

```html
<link rel="stylesheet" href="solar-eclipse-toggle.css">
<script type="module" src="solar-eclipse-toggle.js"></script>
```

The stylesheet is also exported as `@zachleat/solar-eclipse-toggle/style.css`.

## Usage

Define the icons once as reusable symbols (copy the full paths from `demo.html`):

```html
<svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden">
	<symbol id="se-icon-moon" viewBox="0 0 512 512"><!-- Font Awesome moon --></symbol>
	<symbol id="se-icon-sun" viewBox="0 -32 576 576"><!-- Font Awesome sun --></symbol>
	<symbol id="se-icon-half" viewBox="0 0 512 512"><!-- Font Awesome circle-half-stroke --></symbol>
</svg>
```

Then use the component markup:

```html
<solar-eclipse-toggle>
	<button type="button" class="se-button" disabled>
		<span class="se-label">
			<span class="se-label-dark"><svg class="se-icon" aria-hidden="true" focusable="false" width="16" height="16" fill="currentColor"><use href="#se-icon-moon"/></svg>Use dark theme</span>
			<span class="se-label-light"><svg class="se-icon" aria-hidden="true" focusable="false" width="16" height="16" fill="currentColor"><use href="#se-icon-sun"/></svg>Use light theme</span>
			<span class="se-label-unknown"><svg class="se-icon" aria-hidden="true" focusable="false" width="16" height="16" fill="currentColor"><use href="#se-icon-half"/></svg>Theme</span>
		</span>
		<span class="se-system">System</span>
	</button>
</solar-eclipse-toggle>
```

Add this to your `<head>` to apply a saved theme before first paint:

```html
<script>
try {
	var theme = localStorage.getItem("theme");
	if(theme === "light" || theme === "dark") {
		document.documentElement.setAttribute("data-theme", theme);
	}
} catch(e) {}
</script>
```

Write your dark styles for both the system preference and the override:

```css
@media (prefers-color-scheme: dark) {
	:root:not([data-theme="light"]) {
		color-scheme: dark;
		/* dark styles */
	}
}
:root[data-theme="dark"] {
	color-scheme: dark;
	/* dark styles */
}
```

## Features

* Follows `prefers-color-scheme` until a visitor picks the other theme, which is saved to `localStorage`.
* Choosing the system theme again clears the saved override.
* A plain `<button>` named for what it does next (“Use dark theme”), with no `aria-pressed` state.
* Announces the new theme in a `role="status"` live region, since screen readers don’t reliably announce name changes.
* Labels, icons, and the SYSTEM label switch with CSS, so the button width never changes.
* Before JavaScript runs (or without it), the button is disabled and shows `.se-label-unknown` with SYSTEM.
* Multiple instances, other tabs, and live system preference changes all stay in sync.

### Options

* `storage-key`: `localStorage` key. Default: `theme`
* `status-light`, `status-dark`, `status-auto`: announcements. Defaults: `Light theme on`, `Dark theme on`, `matching your system`
* Listen for the bubbling `theme-change` event, with `event.detail` of `{ theme, auto }`.
* Translate by editing the markup and the `status-*` attributes.

### Skip automatic definition

Add `?nodefine` to the script URL to [skip the `customElements.define` call](https://www.zachleat.com/web/nodefine/):

```html
<script type="module">
import { SolarEclipseToggle } from "./solar-eclipse-toggle.js?nodefine";

SolarEclipseToggle.define();
</script>
```

The stylesheet targets the `solar-eclipse-toggle` tag name.

### Styling

Styles are in the `solar-eclipse-toggle` cascade layer, so your own styles win. Colors use custom properties, with `light` and `dark` naming the current page theme:

* `--se-light-color`, `--se-light-border`, `--se-light-icon`, `--se-light-hover`
* `--se-dark-color`, `--se-dark-border`, `--se-dark-icon`, `--se-dark-hover`
* `--se-focus`

## Credits

Demo icons are [Font Awesome Free](https://fontawesome.com/license/free) (CC BY 4.0).
