// Notification translation strings
// Languages: English (en), Portuguese (pt), Spanish (es), French (fr)
 
export type SupportedLocale = 'en' | 'pt' | 'es' | 'fr';
 
export type NotificationKey =
  | 'ai_response_ready'
  | 'new_message'
  | 'user_action_complete'
  | 'reminder'
  | 'welcome';
 
interface NotificationTemplate {
  title: string;
  body: string;
}
 
export const notificationStrings: Record<
  NotificationKey,
  Record<SupportedLocale, NotificationTemplate>
> = {
  ai_response_ready: {
    en: { title: 'Neuronaut', body: 'Your analysis is ready. Tap to view.' },
    pt: { title: 'Neuronaut', body: 'A sua análise está pronta. Toque para ver.' },
    es: { title: 'Neuronaut', body: 'Tu análisis está listo. Toca para ver.' },
    fr: { title: 'Neuronaut', body: 'Votre analyse est prête. Appuyez pour voir.' },
  },
  new_message: {
    en: { title: 'New message', body: 'You have a new message in Neuronaut.' },
    pt: { title: 'Nova mensagem', body: 'Você tem uma nova mensagem no Neuronaut.' },
    es: { title: 'Nuevo mensaje', body: 'Tienes un nuevo mensaje en Neuronaut.' },
    fr: { title: 'Nouveau message', body: 'Vous avez un nouveau message sur Neuronaut.' },
  },
  user_action_complete: {
    en: { title: 'Action complete', body: 'Your request has been processed.' },
    pt: { title: 'Ação concluída', body: 'O seu pedido foi processado.' },
    es: { title: 'Acción completada', body: 'Tu solicitud ha sido procesada.' },
    fr: { title: 'Action terminée', body: 'Votre demande a été traitée.' },
  },
  reminder: {
    en: { title: 'Reminder', body: 'You have a pending item in Neuronaut.' },
    pt: { title: 'Lembrete', body: 'Você tem um item pendente no Neuronaut.' },
    es: { title: 'Recordatorio', body: 'Tienes un elemento pendiente en Neuronaut.' },
    fr: { title: 'Rappel', body: 'Vous avez un élément en attente sur Neuronaut.' },
  },
  welcome: {
    en: { title: 'Welcome to Neuronaut', body: 'Notifications are now enabled.' },
    pt: { title: 'Bem-vindo ao Neuronaut', body: 'As notificações estão ativadas.' },
    es: { title: 'Bienvenido a Neuronaut', body: 'Las notificaciones están activadas.' },
    fr: { title: 'Bienvenue sur Neuronaut', body: 'Les notifications sont maintenant activées.' },
  },
};
 
/**
 * Resolves a locale string (e.g. "pt-BR", "en-US") to a SupportedLocale.
 * Falls back to 'en' if unsupported.
 */
export function resolveLocale(locale?: string | null): SupportedLocale {
  if (!locale) return 'en';
  const base = locale.toLowerCase().split('-')[0];
  const supported: SupportedLocale[] = ['en', 'pt', 'es', 'fr'];
  return supported.includes(base as SupportedLocale) ? (base as SupportedLocale) : 'en';
}
 
/**
 * Returns a localized notification template.
 * Supports dynamic body override (e.g. personalized AI summary).
 */
export function getNotification(
  key: NotificationKey,
  locale?: string | null,
  overrides?: Partial<NotificationTemplate>
): NotificationTemplate {
  const lang = resolveLocale(locale);
  const base = notificationStrings[key][lang];
  return {
    title: overrides?.title ?? base.title,
    body: overrides?.body ?? base.body,
  };
}