export default function Loading() {
  return (
    <main
      aria-label="Loading CredoNomics"
      style={{
        minHeight: '76vh',
        display: 'grid',
        placeItems: 'center',
        padding: '48px 20px',
        background:
          'radial-gradient(circle at 20% 0%, rgba(67,227,174,.07), transparent 28%), #05070b',
        color: '#f5f7fa',
      }}
    >
      <section
        style={{
          width: 'min(820px, 100%)',
          border: '1px solid rgba(255,255,255,.07)',
          borderRadius: 18,
          padding: 28,
          background: '#090d13',
          boxShadow: '0 30px 80px rgba(0,0,0,.28)',
        }}
      >
        <div
          style={{
            width: 148,
            height: 10,
            borderRadius: 999,
            background: 'rgba(67,227,174,.18)',
          }}
        />

        <div
          style={{
            width: '72%',
            height: 42,
            marginTop: 24,
            borderRadius: 9,
            background: 'rgba(255,255,255,.065)',
          }}
        />

        <div
          style={{
            width: '92%',
            height: 12,
            marginTop: 22,
            borderRadius: 999,
            background: 'rgba(255,255,255,.04)',
          }}
        />

        <div
          style={{
            width: '76%',
            height: 12,
            marginTop: 10,
            borderRadius: 999,
            background: 'rgba(255,255,255,.035)',
          }}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 12,
            marginTop: 32,
          }}
        >
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              style={{
                height: 128,
                borderRadius: 13,
                border: '1px solid rgba(255,255,255,.055)',
                background: 'rgba(255,255,255,.018)',
              }}
            />
          ))}
        </div>
      </section>
    </main>
  )
}