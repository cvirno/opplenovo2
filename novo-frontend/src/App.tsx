import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          Controle Lenovo
        </h1>
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-card-foreground mb-4">
            Bem-vindo ao Controle Lenovo
          </h2>
          <p className="text-muted-foreground mb-4">
            Esta é a nova versão do sistema de controle de oportunidades da Lenovo.
          </p>
          <button
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            onClick={() => setCount((count) => count + 1)}
          >
            Contador: {count}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App 