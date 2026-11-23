import type { Jscw } from './jscwlib';
let loading: Promise<new (params?: object) => Jscw> | undefined;
export function loadJscw(): Promise<new (params?: object) => Jscw> {
  if (window.jscw) return Promise.resolve(window.jscw);
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/vendor/jscwlib-0.3.0.js';
    script.onload = () => window.jscw ? resolve(window.jscw) : reject(new Error('Audio player did not load'));
    script.onerror = () => { loading = undefined; reject(new Error('Audio player could not be loaded')); };
    document.head.appendChild(script);
  });
  return loading;
}
