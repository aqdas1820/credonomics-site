export default function Loading() {
  return (
    <div className="cn-route-loading" role="status" aria-label="Loading page">
      <div className="cn-route-loading-bar" />
      <div className="cn-route-loading-shell">
        <div className="cn-route-loading-line cn-route-loading-short" />
        <div className="cn-route-loading-line cn-route-loading-title" />
        <div className="cn-route-loading-line" />
        <div className="cn-route-loading-line cn-route-loading-medium" />
      </div>
    </div>
  )
}