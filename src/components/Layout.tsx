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
          <div className="flex flex-col py-4">
            {/* Logo e Título */}
            <div className="flex items-center mb-8">
              <img src="/logo.png" alt="Logo" className="h-8 w-auto mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Adistec Lenovo</h1>
            </div>

            {/* Abas */}
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => setActiveTab('oportunidades')}
                className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'oportunidades'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Oportunidades
              </button>
              <button
                onClick={() => setActiveTab('vendas')}
                className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'vendas'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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