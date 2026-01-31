import { prisma } from './prisma';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}

/**
 * Crée une notification pour un utilisateur
 */
export async function createNotification({
  userId,
  title,
  message,
  type = 'info',
  link,
}: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
      },
    });
    return notification;
  } catch (error) {
    console.error('Erreur lors de la création de la notification:', error);
    return null;
  }
}

/**
 * Notifications pour événements importants
 */
export const NotificationHelpers = {
  /**
   * Notification quand un design est complété
   */
  async designCompleted(userId: string, designType: string, designId: string) {
    return createNotification({
      userId,
      title: 'Design complété ! 🎨',
      message: `Votre ${designType} a été généré avec succès. Vous pouvez maintenant le télécharger ou l'utiliser pour créer un devis.`,
      type: 'success',
      link: `/design-studio?design=${designId}`,
    });
  },

  /**
   * Notification quand un devis est envoyé
   */
  async quoteSent(userId: string, factoryName: string, quoteId: string) {
    return createNotification({
      userId,
      title: 'Devis envoyé 📧',
      message: `Votre demande de devis a été envoyée à ${factoryName}. Vous recevrez une réponse sous peu.`,
      type: 'info',
      link: `/sourcing?quote=${quoteId}`,
    });
  },

  /**
   * Notification quand un devis est reçu
   */
  async quoteReceived(userId: string, factoryName: string, quoteId: string) {
    return createNotification({
      userId,
      title: 'Nouveau devis reçu ! 💰',
      message: `${factoryName} a répondu à votre demande de devis. Consultez les détails pour continuer.`,
      type: 'success',
      link: `/sourcing?quote=${quoteId}`,
    });
  },

  /**
   * Notification quand un contenu UGC est généré
   */
  async ugcGenerated(userId: string, contentType: 'virtual_tryon' | 'script', brandId: string) {
    const contentLabel = contentType === 'virtual_tryon' ? 'Virtual Try-On' : 'script UGC';
    return createNotification({
      userId,
      title: `Contenu ${contentLabel} généré ! ✨`,
      message: `Votre ${contentLabel} a été créé avec succès. Vous pouvez le télécharger ou le réutiliser.`,
      type: 'success',
      link: `/ugc`,
    });
  },

  /**
   * Notification quand une phase du Launch Map est complétée
   */
  async phaseCompleted(userId: string, phaseNumber: number, phaseName: string) {
    return createNotification({
      userId,
      title: `Phase ${phaseNumber} complétée ! 🎉`,
      message: `Félicitations ! Vous avez complété la phase "${phaseName}". Continuez votre parcours vers le lancement de votre marque.`,
      type: 'success',
      link: '/launch-map',
    });
  },

  /**
   * Notification pour rappel d'action
   */
  async actionReminder(userId: string, action: string, link: string) {
    return createNotification({
      userId,
      title: 'Rappel d\'action 📌',
      message: action,
      type: 'info',
      link,
    });
  },
};
