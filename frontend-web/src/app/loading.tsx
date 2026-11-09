export default function Loading() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <div className="brand-mark">
            <span className="brand-mark__eyebrow">AI Impact Observatory</span>
            <span className="brand-mark__title">Loading...</span>
          </div>
        </div>
      </header>
      <main className="site-main">
        <div className="page-stack" style={{ alignItems: "center", paddingTop: "4rem" }}>
          <div className="loading-spinner"></div>
        </div>
      </main>
    </div>
  );
}
