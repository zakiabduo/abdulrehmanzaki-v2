"use client";
import { Component, type ReactNode } from "react";

/** If WebGL is unavailable the page still works; the 3D layer simply does not render. */
export default class SceneBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) { console.error("3D scene failed to render", error); }
  render() { return this.state.failed ? (this.props.fallback ?? null) : this.props.children; }
}
