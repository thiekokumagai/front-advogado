import { useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw } from 'lucide-react';

export function PWAUpdatePrompt() {
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) {
      if (registration) {
        const checkUpdate = async () => {
          if (!navigator.onLine) return;
          try {
            await fetch(swScriptUrl, { cache: 'no-store', headers: { 'cache-control': 'no-cache' } });
            await registration.update();
          } catch (e) {
            console.debug('Erro na checagem de SW:', e);
          }
        };

        setInterval(checkUpdate, 20000);
        window.addEventListener('focus', checkUpdate);
        window.addEventListener('online', checkUpdate);
      }
    },
    onRegisterError(error: any) {
      console.error('PWA SW Register Error:', error);
    },
  });

  const handleReload = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          () => {
            window.location.reload();
          },
          { once: true },
        );
      }

      await updateServiceWorker(true);

      setTimeout(() => {
        window.location.reload();
      }, 600);
    } catch (e) {
      console.error('Erro ao atualizar PWA:', e);
      window.location.reload();
    }
  };

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-[9999] flex items-center justify-between gap-3 rounded-2xl border bg-slate-900 border-amber-500/40 p-4 text-slate-100 shadow-2xl animate-in fade-in slide-in-from-bottom-5">
      <div className="flex flex-col text-sm">
        <span className="font-bold text-amber-400">Nova versão disponível! 🎉</span>
        <span className="text-slate-400 text-xs">Uma atualização do Portal IA para Advogados está disponível.</span>
      </div>
      <button
        onClick={handleReload}
        disabled={isUpdating}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shrink-0 disabled:opacity-50"
      >
        <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
        {isUpdating ? 'Atualizando...' : 'Atualizar'}
      </button>
    </div>
  );
}
