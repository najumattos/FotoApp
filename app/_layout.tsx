import { Stack, useRouter } from 'expo-router';
import { createContext, useState, useContext, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

// 1. Model (Interface)
interface Anamnese {
  id: number;
  foto: string;
  descricao: string;
}

// 2. Contrato do Contexto (Interface)
interface AnamneseContextType {
  listaAnamnese: Anamnese[];
  adicionarAnamnese: (nova: Anamnese) => void;
}

const AnamneseContext = createContext<AnamneseContextType | undefined>(undefined);

// Configuração de como o alerta aparece com o app aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    // Adicione estes dois abaixo para satisfazer o TypeScript:
    shouldShowBanner: true, 
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const [listaAnamnese, setListaAnamnese] = useState<Anamnese[]>([]);
  const router = useRouter();
  
  // Hook que "escuta" o clique na notificação
  const lastNotificationResponse = Notifications.useLastNotificationResponse();

  // Efeito colateral para tratar o clique
  useEffect(() => {
    if (
      lastNotificationResponse &&
      lastNotificationResponse.notification.request.content.data.screen &&
      lastNotificationResponse.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
    ) {
      const { screen } = lastNotificationResponse.notification.request.content.data;
      
      // Se o dado da notificação for 'Explore', redireciona
      if (screen === 'Explore') {
        router.push('/explore');
      }
    }
  }, [lastNotificationResponse]);

  const adicionarAnamnese = (nova: Anamnese) => {
    setListaAnamnese((prev) => [...prev, nova]);
  };

  return (
    <AnamneseContext.Provider value={{ listaAnamnese, adicionarAnamnese }}>
      <Stack>
        {/* Aqui garantimos que a navegação por abas seja a principal */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AnamneseContext.Provider>
  );
}

// 3. Hook Customizado (Service Locator)
export const useAnamnese = () => {
  const context = useContext(AnamneseContext);
  if (!context) throw new Error('useAnamnese deve ser usado dentro de um Provider');
  return context;
};