import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { api } from '../services/api';
import { Bell, ShieldCheck } from 'lucide-react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useRegisterSW({
    onRegisteredSW(_swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) {
      if (registration) {
        setSwRegistration(registration);
      }
    },
    onRegisterError(error: any) {
      console.error('SW registration error', error);
    },
  });

  const subscribeToPush = async (registration: ServiceWorkerRegistration) => {
    try {
      if (!('Notification' in window)) {
        alert('Este navegador não suporta notificações push.');
        return;
      }

      const permission = await Notification.requestPermission();
      setShowBanner(false);

      if (permission === 'granted') {
        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.warn('VITE_VAPID_PUBLIC_KEY não configurada.');
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        // Envia a inscrição para o backend NestJS
        await api.post('/auth/web-push-subscription', {
          subscription: subscription.toJSON(),
        });
      }
    } catch (error) {
      console.error('Erro ao ativar notificações push:', error);
    }
  };

  useEffect(() => {
    if (!('Notification' in window)) return;

    if (swRegistration && Notification.permission === 'default') {
      setShowBanner(true);
    } else if (swRegistration && Notification.permission === 'granted') {
      registrationCheck(swRegistration);
    }
  }, [swRegistration]);

  const registrationCheck = async (registration: ServiceWorkerRegistration) => {
    try {
      const sub = await registration.pushManager.getSubscription();
      if (!sub) {
        subscribeToPush(registration);
      } else {
        await api.post('/auth/web-push-subscription', {
          subscription: sub.toJSON(),
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!showBanner || !swRegistration) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
      <div className="flex w-full max-w-md flex-col gap-5 rounded-3xl bg-slate-900 border border-amber-500/40 p-8 text-slate-100 shadow-2xl space-y-2">
        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl mx-auto flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20">
          <Bell className="w-7 h-7 stroke-[2.2]" />
        </div>

        <div className="flex flex-col text-center space-y-1">
          <span className="text-xl font-bold text-slate-100">Ativar Notificações Push</span>
          <span className="text-xs text-slate-400 leading-relaxed">
            Receba alertas instantâneos de petições concluídas, jurisprudências e atualizações do escritório diretamente no seu navegador.
          </span>
        </div>

        <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row pt-2">
          <button
            type="button"
            onClick={() => setShowBanner(false)}
            className="w-full rounded-xl bg-slate-800 px-5 py-3 text-xs font-bold text-slate-400 hover:text-slate-200 transition"
          >
            Agora não
          </button>
          <button
            type="button"
            onClick={() => subscribeToPush(swRegistration)}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-5 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            Ativar Notificações
          </button>
        </div>
      </div>
    </div>
  );
}
