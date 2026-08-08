import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null; info: string }

/** 画面が真っ白になるのを防ぐ。何が起きたかを日本語で表示する。 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: '' }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ info: info.componentStack || '' })
    console.error('[AIサポートブラウザ] 画面エラー', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="h-full overflow-y-auto p-8">
        <div className="card mx-auto max-w-3xl">
          <p aria-hidden className="text-5xl">⚠️</p>
          <h2 className="mt-3 text-2xl font-bold">この画面を表示できませんでした</h2>
          <p className="mt-2 text-lg" style={{ color: 'var(--c-subink)' }}>
            左のメニューから、ほかの画面をお使いください。下の内容を開発者にお知らせいただくと修正できます。
          </p>
          <pre className="mt-5 overflow-x-auto rounded-xl p-4 text-sm"
            style={{ background: 'var(--c-base)', color: 'var(--c-danger)' }}>
{String(this.state.error?.message || this.state.error)}
{this.state.info}
          </pre>
          <button type="button" className="btn btn-primary mt-5"
            onClick={() => this.setState({ error: null, info: '' })}>
            もう一度ためす
          </button>
        </div>
      </div>
    )
  }
}
