import { useState } from 'react';
import Oportunidades from './Oportunidades';
import Vendas from './Vendas';

const Layout = () => {
  const [activeTab, setActiveTab] = useState<'oportunidades' | 'vendas'>('oportunidades');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header com Logo e Abas */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo e Título */}
            <div className="flex items-center">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Adistec Lenovo</h1>
            </div>

            {/* Abas */}
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('oportunidades')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'oportunidades'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Oportunidades
              </button>
              <button
                onClick={() => setActiveTab('vendas')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'vendas'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Vendas
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'oportunidades' ? <Oportunidades /> : <Vendas />}
      </main>
    </div>
  );
};

export default Layout; 