// Copie e cole este código no console do navegador (F12)
const data = {
    regionais: JSON.parse(localStorage.getItem('regionais') || '[]'),
    oportunidades: JSON.parse(localStorage.getItem('oportunidades') || '[]'),
    quotas: JSON.parse(localStorage.getItem('quotas') || '[]'),
    historicoOportunidades: JSON.parse(localStorage.getItem('historicoOportunidades') || '[]')
};

// Criar um elemento de download
const element = document.createElement('a');
const file = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
element.href = URL.createObjectURL(file);
element.download = 'localStorage.json';

// Simular clique para download
document.body.appendChild(element);
element.click();
document.body.removeChild(element);

console.log('Dados exportados com sucesso!'); 