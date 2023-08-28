interface Window {
  setProjectFiles: (files: File[]) => void;
  isReady: Promise<void>
  ready: () => void
}