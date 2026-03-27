import { Stack } from 'expo-router';
import { createContext, useState, useContext } from 'react';

// 1. Definimos a "Interface" do nosso objeto (Como um Model em C#)
interface Anamnese {
  id: number;
  foto: string;
  descricao: string;
}

// 2. Criamos o "Contrato" do Contexto
interface AnamneseContextType {
  listaAnamnese: Anamnese[];
  adicionarAnamnese: (nova: Anamnese) => void;
}

const AnamneseContext = createContext<AnamneseContextType | undefined>(undefined);

export default function RootLayout() {
  const [listaAnamnese, setListaAnamnese] = useState<Anamnese[]>([]);

  const adicionarAnamnese = (nova: Anamnese) => {
    setListaAnamnese((prev) => [...prev, nova]);
  };

  return (
    <AnamneseContext.Provider value={{ listaAnamnese, adicionarAnamnese }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AnamneseContext.Provider>
  );
}

// 3. Hook para facilitar o uso (Como um Service Locator)
export const useAnamnese = () => {
  const context = useContext(AnamneseContext);
  if (!context) throw new Error('useAnamnese deve ser usado dentro de um Provider');
  return context;
};