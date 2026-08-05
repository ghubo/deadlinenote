import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // no-op
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen grid place-items-center bg-brand-cream dark:bg-stone-950 px-4">
          <div className="bg-white dark:bg-stone-900 border border-gray-100 dark:border-stone-800 rounded-xl p-6 max-w-md w-full text-center">
            <p className="text-sm text-gray-500 dark:text-stone-400 mb-2">Terjadi kesalahan tak terduga.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand-dark text-white dark:bg-brand-cream dark:text-brand-dark text-sm rounded-lg hover:opacity-90"
            >
              Muat ulang
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
