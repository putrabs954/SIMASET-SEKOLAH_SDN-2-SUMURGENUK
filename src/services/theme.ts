export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'simaset_theme_mode_v1';

class ThemeService {
  private currentMode: ThemeMode = 'system';
  private listeners: Set<(mode: ThemeMode, isDark: boolean) => void> = new Set();
  private mediaQuery: MediaQueryList | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
        this.currentMode = saved;
      }
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', () => {
        if (this.currentMode === 'system') {
          this.applyTheme();
        }
      });
      this.applyTheme();
    }
  }

  public getMode(): ThemeMode {
    return this.currentMode;
  }

  public isDark(): boolean {
    if (this.currentMode === 'dark') return true;
    if (this.currentMode === 'light') return false;
    return this.mediaQuery ? this.mediaQuery.matches : false;
  }

  public setMode(mode: ThemeMode): void {
    this.currentMode = mode;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {}
    this.applyTheme();
  }

  private applyTheme(): void {
    if (typeof document === 'undefined') return;
    const isDark = this.isDark();
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    this.listeners.forEach(cb => cb(this.currentMode, isDark));
  }

  public subscribe(cb: (mode: ThemeMode, isDark: boolean) => void): () => void {
    this.listeners.add(cb);
    cb(this.currentMode, this.isDark());
    return () => this.listeners.delete(cb);
  }
}

export const themeService = new ThemeService();
