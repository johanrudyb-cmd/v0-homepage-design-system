/**
 * Configuration de la formation : Personal Branding + Coaching optionnel.
 * Modules avec vidéos (style Skool) + coaching personnalisé 59€/mois.
 */

export interface FormationModule {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // YouTube ou Vimeo
  /** Durée estimée (optionnel) */
  duration?: string;
}

export const FORMATION_CONFIG = {
  title: 'Développez votre Personal Branding',
  tagline: 'Positionnez-vous sur les réseaux et développez votre marque',
  description:
    'Une mini formation gratuite pour apprendre à développer votre personal branding et à faire grandir votre marque sur les réseaux sociaux. Stratégie, visibilité et cohérence pour vous démarquer.',

  /** Modules avec encart vidéo (style Skool) */
  modules: [
    {
      id: 'module-1',
      title: 'Module 1 : Pourquoi le personal branding est essentiel',
      description: 'Comprenez l\'importance de votre image personnelle pour développer votre marque sur les réseaux sociaux.',
      videoUrl: '',
      duration: '~10 min',
    },
    {
      id: 'module-2',
      title: 'Module 2 : Définir votre positionnement',
      description: 'Identifiez votre identité de marque personnelle et ce qui vous différencie.',
      videoUrl: '',
      duration: '~12 min',
    },
    {
      id: 'module-3',
      title: 'Module 3 : Stratégie de contenu Instagram & TikTok',
      description: 'Construisez une stratégie de contenu alignée avec votre marque et vos objectifs.',
      videoUrl: '',
      duration: '~15 min',
    },
    {
      id: 'module-4',
      title: 'Module 4 : Cohérence image / marque',
      description: 'Créez une cohérence entre votre image personnelle et votre marque de vêtements.',
      videoUrl: '',
      duration: '~10 min',
    },
    {
      id: 'module-5',
      title: 'Module 5 : E-réputation et storytelling',
      description: 'Gérez votre présence en ligne et racontez votre histoire de façon authentique.',
      videoUrl: '',
      duration: '~12 min',
    },
  ] as FormationModule[],

  /** Calendly : réserver un appel pour poser des questions */
  calendlyUrl: '', // Ex: https://calendly.com/votre-compte/appel

  /** Coaching personnalisé : 59€/mois (optionnel) */
  coachingPrice: 59,
  coachingUrl: '', // Lien de paiement ou inscription au coaching
  coachingTitle: 'Coaching personnalisé',
  coachingDescription:
    'Accompagnement individuel pour appliquer concrètement votre stratégie : feedback sur vos posts, aide à la création de contenu, optimisation de votre présence.',
};
