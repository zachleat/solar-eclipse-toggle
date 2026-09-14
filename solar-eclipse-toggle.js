export class SolarEclipseToggle extends HTMLElement {
	static tagName = "solar-eclipse-toggle";

	static define(tagName = this.tagName, registry = window.customElements) {
		if(registry && !registry.get(tagName)) {
			registry.define(tagName, this);
		}
	}

	// The stylesheet reads this attribute, so it isn't configurable
	static themeAttribute = "data-theme";

	static attributes = {
		storageKey: "storage-key",
		statusLight: "status-light",
		statusDark: "status-dark",
		statusAuto: "status-auto",
	};

	static defaults = {
		storageKey: "theme",
		statusLight: "Light theme on",
		statusDark: "Dark theme on",
		statusAuto: "matching your system",
	};

	static classes = {
		status: "se-status",
	};

	static events = {
		change: "theme-change",
	};

	static #instances = new Set();
	static #listening = false;

	static get systemTheme() {
		return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
	}

	static isTheme(value) {
		return value === "light" || value === "dark";
	}

	// Keep other tabs in sync
	static listen() {
		if(this.#listening) {
			return;
		}
		this.#listening = true;

		window.addEventListener("storage", event => {
			for(let instance of this.#instances) {
				if(event.key === instance.storageKey) {
					instance.applyTheme(event.newValue, false);
				}
			}
		});
	}

	#getAttr(name) {
		return this.getAttribute(SolarEclipseToggle.attributes[name]) ?? SolarEclipseToggle.defaults[name];
	}

	get storageKey() {
		return this.#getAttr("storageKey");
	}

	get isAuto() {
		return !SolarEclipseToggle.isTheme(document.documentElement.getAttribute(SolarEclipseToggle.themeAttribute));
	}

	get theme() {
		let value = document.documentElement.getAttribute(SolarEclipseToggle.themeAttribute);
		return SolarEclipseToggle.isTheme(value) ? value : SolarEclipseToggle.systemTheme;
	}

	// Choosing the system theme clears the override so the page follows the OS again.
	applyTheme(theme, persist = true) {
		let root = document.documentElement;
		let auto = !SolarEclipseToggle.isTheme(theme) || theme === SolarEclipseToggle.systemTheme;
		if(auto) {
			root.removeAttribute(SolarEclipseToggle.themeAttribute);
		} else {
			root.setAttribute(SolarEclipseToggle.themeAttribute, theme);
		}

		if(persist) {
			try {
				if(auto) {
					localStorage.removeItem(this.storageKey);
				} else {
					localStorage.setItem(this.storageKey, theme);
				}
			} catch(e) {}
		}
	}

	getStatus() {
		let status = this.#getAttr(this.theme === "dark" ? "statusDark" : "statusLight");
		return this.isAuto ? `${status}, ${this.#getAttr("statusAuto")}.` : `${status}.`;
	}

	// Sets min-width to the width with SYSTEM shown, so toggling SYSTEM’s display doesn’t resize it
	setWidth() {
		if(!this.isConnected) {
			return;
		}
		this.style.minWidth = "";
		this.setAttribute("data-se-measure", "");
		let { width } = this.getBoundingClientRect();
		this.removeAttribute("data-se-measure");
		this.style.minWidth = `${Math.ceil(width)}px`;
	}

	connectedCallback() {
		let button = this.querySelector(":scope > button");
		if(!button) {
			return;
		}

		SolarEclipseToggle.listen();
		SolarEclipseToggle.#instances.add(this);

		// Fallback for pages without the inline <head> script (which avoids a flash of the wrong theme)
		if(this.isAuto) {
			try {
				let stored = localStorage.getItem(this.storageKey);
				if(SolarEclipseToggle.isTheme(stored)) {
					this.applyTheme(stored, false);
				}
			} catch(e) {}
		}

		// Disabled in the markup until JavaScript can handle clicks
		button.disabled = false;

		this.setWidth();
		// Web fonts can change the width after load
		document.fonts?.ready.then(() => this.setWidth());

		// Added on connect (not click) so screen readers are already watching the live region
		if(!this.querySelector(`.${SolarEclipseToggle.classes.status}`)) {
			let status = document.createElement("span");
			status.className = SolarEclipseToggle.classes.status;
			status.setAttribute("role", "status");
			this.append(status);
		}

		if(button.hasAttribute("data-se-bound")) {
			return;
		}
		button.setAttribute("data-se-bound", "");
		button.addEventListener("click", () => {
			this.applyTheme(this.theme === "dark" ? "light" : "dark");

			for(let instance of SolarEclipseToggle.#instances) {
				let status = instance.querySelector(`.${SolarEclipseToggle.classes.status}`);
				if(status) {
					status.textContent = instance === this ? this.getStatus() : "";
				}
			}

			this.dispatchEvent(new CustomEvent(SolarEclipseToggle.events.change, {
				bubbles: true,
				detail: {
					theme: this.theme,
					auto: this.isAuto,
				},
			}));
		});
	}

	disconnectedCallback() {
		SolarEclipseToggle.#instances.delete(this);
	}
}

// Opt out with `solar-eclipse-toggle.js?nodefine`, see https://www.zachleat.com/web/nodefine/
if(!(new URL(import.meta.url)).searchParams.has("nodefine")) {
	SolarEclipseToggle.define();
}
