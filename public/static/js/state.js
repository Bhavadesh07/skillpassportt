// Reactive Application State Store
class AppState {
  constructor() {
    this.state = {
      user: null,
      activePortal: null,
      unreadCount: 0,
    };
    this.listeners = new Set();
  }

  get() {
    return { ...this.state };
  }

  set(patch) {
    this.state = { ...this.state, ...patch };
    this._notify();
  }

  setUser(user) {
    this.state = {
      ...this.state,
      user,
      activePortal: user ? user.role : null,
    };
    this._notify();
  }

  clearUser() {
    this.state = {
      user: null,
      activePortal: null,
      unreadCount: 0,
    };
    this._notify();
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  _notify() {
    for (const fn of this.listeners) {
      try {
        fn(this.get());
      } catch (e) {
        console.error('State listener error:', e);
      }
    }
  }
}

export const appState = new AppState();
