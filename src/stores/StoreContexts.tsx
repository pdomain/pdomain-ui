/**
 * Store context providers and context-bound hooks — covering #163.
 *
 * Each store factory (createSelectionStore, createViewportStore,
 * createWorklistStore, createUIPrefsStore) has a matching context:
 *
 *   <SelectionStoreProvider value={store}>
 *   <ViewportStoreProvider value={store}>
 *   <WorklistStoreProvider value={store}>
 *   <UIPrefsStoreProvider value={store}>
 *
 * And a matching hook:
 *
 *   useSelection()  → SelectionState (with actions)
 *   useViewport()   → ViewportState (with actions)
 *   useWorklist()   → WorklistStoreState (with actions)
 *   useUIPrefs()    → UIPrefsStoreState (with actions)
 *   useTheme()      → 'dark' | 'light'
 *   useDensity()    → 'compact' | 'normal' | 'comfortable'
 *   useLayerColor(layer) → string
 *   useStatusColor(status) → string
 *   useAccentColor() → { fg: string; bg: string }
 *
 * All hooks throw if used outside the matching provider.
 */
import * as React from 'react';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { SelectionStore } from './createSelectionStore.js';
import type { ViewportStore } from './createViewportStore.js';
import type { WorklistStore } from './createWorklistStore.js';
import type { UIPrefsStore } from './createUIPrefsStore.js';

// ─── Selection ────────────────────────────────────────────────────────────────

const SelectionStoreContext = React.createContext<SelectionStore | null>(null);

export interface SelectionStoreProviderProps {
  value: SelectionStore;
  children: React.ReactNode;
}

export function SelectionStoreProvider({ value, children }: SelectionStoreProviderProps) {
  return <SelectionStoreContext.Provider value={value}>{children}</SelectionStoreContext.Provider>;
}

export function useSelection() {
  const store = React.useContext(SelectionStoreContext);
  if (!store) throw new Error('useSelection() must be used inside <SelectionStoreProvider>');
  return useStore(store);
}

// ─── Viewport ─────────────────────────────────────────────────────────────────

const ViewportStoreContext = React.createContext<ViewportStore | null>(null);

export interface ViewportStoreProviderProps {
  value: ViewportStore;
  children: React.ReactNode;
}

export function ViewportStoreProvider({ value, children }: ViewportStoreProviderProps) {
  return <ViewportStoreContext.Provider value={value}>{children}</ViewportStoreContext.Provider>;
}

export function useViewport() {
  const store = React.useContext(ViewportStoreContext);
  if (!store) throw new Error('useViewport() must be used inside <ViewportStoreProvider>');
  return useStore(store);
}

// ─── Worklist ─────────────────────────────────────────────────────────────────

const WorklistStoreContext = React.createContext<WorklistStore | null>(null);

export interface WorklistStoreProviderProps {
  value: WorklistStore;
  children: React.ReactNode;
}

export function WorklistStoreProvider({ value, children }: WorklistStoreProviderProps) {
  return <WorklistStoreContext.Provider value={value}>{children}</WorklistStoreContext.Provider>;
}

export function useWorklist() {
  const store = React.useContext(WorklistStoreContext);
  if (!store) throw new Error('useWorklist() must be used inside <WorklistStoreProvider>');
  return useStore(store);
}

// ─── UIPrefs ──────────────────────────────────────────────────────────────────

const UIPrefsStoreContext = React.createContext<UIPrefsStore | null>(null);

export interface UIPrefsStoreProviderProps {
  value: UIPrefsStore;
  children: React.ReactNode;
}

export function UIPrefsStoreProvider({ value, children }: UIPrefsStoreProviderProps) {
  return <UIPrefsStoreContext.Provider value={value}>{children}</UIPrefsStoreContext.Provider>;
}

export function useUIPrefs() {
  const store = React.useContext(UIPrefsStoreContext);
  if (!store) throw new Error('useUIPrefs() must be used inside <UIPrefsStoreProvider>');
  return useStore(store);
}

export function useTheme() {
  const store = React.useContext(UIPrefsStoreContext);
  if (!store) throw new Error('useTheme() must be used inside <UIPrefsStoreProvider>');
  return useStore(store, (s) => s.prefs.theme);
}

export function useDensity() {
  const store = React.useContext(UIPrefsStoreContext);
  if (!store) throw new Error('useDensity() must be used inside <UIPrefsStoreProvider>');
  return useStore(store, (s) => s.prefs.density);
}

export function useFontScale() {
  const store = React.useContext(UIPrefsStoreContext);
  if (!store) throw new Error('useFontScale() must be used inside <UIPrefsStoreProvider>');
  return useStore(store, (s) => s.prefs.fontScale);
}

export function useLayerColor(layer: 'block' | 'para' | 'line' | 'word') {
  const store = React.useContext(UIPrefsStoreContext);
  if (!store) throw new Error('useLayerColor() must be used inside <UIPrefsStoreProvider>');
  return useStore(store, (s) => s.getLayerColor(layer));
}

export function useStatusColor(status: 'exact' | 'fuzzy' | 'mismatch' | 'ocr' | 'gt') {
  const store = React.useContext(UIPrefsStoreContext);
  if (!store) throw new Error('useStatusColor() must be used inside <UIPrefsStoreProvider>');
  return useStore(store, (s) => s.getStatusColor(status));
}

export function useAccentColor() {
  const store = React.useContext(UIPrefsStoreContext);
  if (!store) throw new Error('useAccentColor() must be used inside <UIPrefsStoreProvider>');
  return useStore(
    store,
    useShallow((s) => s.getAccentColor()),
  );
}

export function useDockPinned() {
  const store = React.useContext(UIPrefsStoreContext);
  if (!store) throw new Error('useDockPinned() must be used inside <UIPrefsStoreProvider>');
  return useStore(store, (s) => s.prefs.dockPinned ?? false);
}

export function useDockWidth() {
  const store = React.useContext(UIPrefsStoreContext);
  if (!store) throw new Error('useDockWidth() must be used inside <UIPrefsStoreProvider>');
  return useStore(store, (s) => s.prefs.dockWidth ?? 420);
}
