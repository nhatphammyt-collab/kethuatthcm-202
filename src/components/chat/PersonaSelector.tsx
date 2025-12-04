import { ChatPersona } from '../../types/chat';

interface PersonaSelectorProps {
  personas: ChatPersona[];
  selectedPersona: ChatPersona | null;
  onSelect: (persona: ChatPersona) => void;
}

export default function PersonaSelector({ personas, selectedPersona, onSelect }: PersonaSelectorProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-3">Chọn Trợ lý AI:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {personas.map((persona) => (
          <button
            key={persona.id}
            onClick={() => onSelect(persona)}
            className={`p-4 rounded-xl border-2 transition-all hover:scale-105 hover:shadow-lg ${
              selectedPersona?.id === persona.id
                ? 'border-current shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            style={{
              color: selectedPersona?.id === persona.id ? persona.color : '#374151',
              backgroundColor: selectedPersona?.id === persona.id ? `${persona.color}10` : 'white'
            }}
          >
            <div className="text-3xl mb-2">{persona.icon}</div>
            <div className="font-bold text-sm mb-1">{persona.name}</div>
            <div className="text-xs opacity-75 line-clamp-2">{persona.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
