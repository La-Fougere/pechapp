import { useCallback, useContext } from 'react';
import { AppContext } from './data/AppContext';
import type { Language } from './data/user/user.state';
import { enUS, fr } from 'date-fns/locale';

export const DEFAULT_LANGUAGE: Language = 'fr';

const translations = {
  fr: {
    appTitle: "Pêch'App",
    menuConference: 'Navigation',
    menuTutorial: 'Tutoriel',
    menuInfo: 'Infos',
    navHome: 'Accueil',
    navSpecies: 'Espèces',
    navLegislation: 'Législation',
    navIdentify: 'Identifier un poisson',
    navSchedule: 'Programme',
    navSpeakers: 'Intervenants',
    navMap: 'Carte',
    navAbout: 'À propos',
    navAccount: 'Compte',
    navSupport: 'Support',
    navLogout: 'Déconnexion',
    navLogin: 'Connexion',
    navSignup: 'Inscription',
    navSettings: 'Paramètres',
    darkMode: 'Mode sombre',
    showTutorial: 'Rejouer le tutoriel',
    commonCancel: 'Annuler',
    commonReset: 'Réinitialiser',
    commonDone: 'Terminé',
    commonClose: 'Fermer',
    commonRemove: 'Retirer',
    commonFavorite: 'Favori',
    commonFavorites: 'Favoris',
    commonAll: 'Tous',
    commonSearch: 'Rechercher',
    commonFilter: 'Filtrer',
    commonSelectAll: 'Tout sélectionner',
    commonDeselectAll: 'Tout désélectionner',
    commonDate: 'Date',
    commonLocation: 'Lieu',
    commonPassword: 'Mot de passe',
    commonSubmit: 'Envoyer',
    commonSkip: 'Passer',
    commonContinue: 'Continuer',
    commonCreate: 'Créer',
    commonOk: 'OK',
    commonPrevious: 'Précédent',
    commonNext: 'Suivant',
    settingsTitle: 'Paramètres',
    settingsLanguage: 'Langue',
    languageFrench: 'Français',
    languageEnglish: 'English',
    aboutPopoverLearn: 'Apprendre Ionic',
    aboutPopoverDocumentation: 'Documentation',
    aboutPopoverShowcase: 'Vitrine',
    aboutPopoverGithub: 'Dépôt GitHub',
    filterSessionsTitle: 'Filtrer les sessions',
    tracksLabel: 'Thèmes',
    noSessionsFound: 'Aucune session trouvée',
    favoriteAlreadyAdded: 'Favori déjà ajouté',
    removeFavoriteTitle: 'Retirer le favori',
    removeFavoritePrompt:
      'Souhaitez-vous retirer cette session de vos favoris ?',
    favoriteAddedToast: '{{name}} a bien été ajouté aux favoris.',
    sessionNotFound: 'Session introuvable',
    refreshComplete: 'Actualisation terminée',
    postingToNetwork: 'Publication sur {{network}}',
    aboutSpeaker: 'À propos de {{name}}',
    speakerProfilePicAlt: "Photo de profil de l'intervenant",
    speakerNotFound: 'Intervenant introuvable',
    shareSpeaker: 'Partager {{name}}',
    copyLink: 'Copier le lien',
    shareVia: 'Partager via ...',
    emailWithAddress: 'E-mail ( {{email}} )',
    callWithNumber: 'Appeler ( {{phone}} )',
    sayHelloOnSocial: 'Dites bonjour sur les réseaux sociaux !',
    offlineMessage:
      'Vous ne pouvez pas voir/utiliser ceci en mode hors ligne.',
    offlineStatus:
      'Mode hors ligne activé. Certaines ressources externes peuvent être indisponibles.',
    offlineBannerMessage:
      'Vous êtes actuellement en mode hors ligne, certaines fonctionnalités peuvent être désactivées.',
    dataLoadError:
      "Certaines données n'ont pas pu être chargées. Le mode hors ligne est limité.",
    updatePicture: 'Mettre à jour la photo',
    changeUsername: "Changer le nom d'utilisateur",
    changePassword: 'Changer le mot de passe',
    usernamePlaceholder: "nom d'utilisateur",
    usernameLabel: "Nom d'utilisateur",
    usernameRequired: "Le nom d'utilisateur est requis",
    passwordLabel: 'Mot de passe',
    passwordRequired: 'Le mot de passe est requis',
    supportMessageLabel: "Saisissez votre message d'assistance ci-dessous",
    supportMessageRequired: "Le message d'assistance est requis",
    supportNotice:
      "Ceci n'envoie pas réellement une demande de support.",
    supportRequestSent: "Votre demande d'assistance a été envoyée.",
    supportRequestFailed:
      "Impossible d'envoyer la demande d'assistance. Réessayez plus tard.",
    ionicLogoAlt: "Logo Pêch'App",
    avatarAlt: 'avatar',
    tutorialWelcome: 'Bienvenue sur',
    tutorialIntroBold: "Pêch'App",
    tutorialIntroText:
      'vous aide à identifier les poissons grâce à des fiches visuelles et des repères simples.',
    tutorialWhatIsIonic: 'Reconnaître les espèces',
    tutorialIonicDescription:
      'comparez les silhouettes, tailles et habitats pour éviter les confusions.',
    tutorialWhatIsAppflow: "Comprendre l'habitat",
    tutorialAppflowDescription:
      'repérez où chaque espèce se cache et à quelle période la trouver.',
    tutorialReadyToPlay: 'Prêt à explorer ?',
    watch: 'Regarder',
    addToCalendar: 'Ajouter au calendrier',
    markAsUnwatched: 'Marquer comme non regardé',
    downloadVideo: 'Télécharger la vidéo',
    leaveFeedback: 'Laisser un avis',
    aboutSectionTitle: 'À propos',
    aboutHeroAlt: "Illustration d'un poisson",
    aboutHeadline: "Pêch'App, votre compagnon au bord de l'eau",
    aboutIntro:
      "Identifiez les poissons d'eau douce en quelques secondes et gardez les bonnes pratiques en tête. Pêch'App est en version alpha : certaines informations restent à vérifier et l'application n'est pas encore 100% fonctionnelle.",
    aboutMissionTitle: 'Notre mission',
    aboutMissionBody:
      "Rendre l'identification des espèces simple, rapide et fiable pour tous les pêcheurs.",
    aboutHowTitle: 'Comment ça marche',
    aboutHowBody:
      "Parcourez les espèces, comparez les critères (taille, habitat, période), puis enregistrez vos observations.",
    aboutDataTitle: 'Données & mises à jour',
    aboutDataBody:
      "Les contenus sont mis à jour régulièrement et restent disponibles hors ligne après une première visite.",
    aboutContactTitle: 'Contact',
    aboutContactBody:
      'Une erreur ou un doute ? Signalez-le depuis la page Support.',
    detailsTitle: 'Détails',
    selectLocationHeader: 'Choisir un lieu',
    internetTitle: 'Internet',
    wifiNetworkLabel: 'Réseau Wi-Fi',
    appSectionTitle: 'Application',
    lastUpdateLabel: 'Dernière mise à jour',
    lastUpdateUnavailable: 'Indisponible',
    forceUpdateApp: "Forcer la mise à jour de l'application",
    homeHeadline: 'Identifiez les poissons en un clin d’œil',
    homeIntro:
      'Des fiches claires, des repères visuels, et la réglementation à jour.',
    homeHeroAlt: 'Illustration de poisson',
    homeIdentifyFish: 'Identifier un poisson',
    homeExploreSpecies: 'Explorer les espèces',
    homeExploreLegislation: 'Voir la législation',
    identifyTitle: 'Identifier un poisson',
    identifyPhotoTitle: 'Identifier avec une photo',
    identifyPhotoDescription:
      'Analyse d’image pour reconnaître l’espèce (bientôt disponible).',
    identifyQuestionsTitle: 'Identifier avec des questions (Hors-ligne)',
    identifyQuestionsDescription:
      'Répondez à quelques questions pour trouver l’espèce.',
    identifyPhotoUnavailable:
      "L'identification par photo n'est pas encore disponible.",
    identifyStart: 'Commencer',
    identifyContinue: 'Continuer',
    identifyBack: 'Retour',
    identifyRestart: 'Recommencer',
    identifyQuestionCounter: 'Question {{current}} / {{total}}',
    identifyResultsTitle: 'Résultat',
    identifyCandidatesTitle: 'Espèces possibles',
    identifyNoMatch:
      "Aucune espèce ne correspond clairement. Voici les plus proches.",
    identifyQuestionMissing:
      'Question indisponible. Vous pouvez relancer l’identification.',
    legislationHeadline: 'Actualités de la réglementation',
    legislationIntro:
      'Retrouvez ici les derniers textes et rappels officiels pour pêcher en règle.',
    legislationArticle1Title: 'Arrêté du 9 juillet 2024',
    legislationArticle1Date: 'Publié le 09/07/2024',
    legislationArticle1Summary:
      'Mise à jour des tailles minimales pour le brochet et le sandre dans plusieurs départements.',
    legislationArticle2Title: 'Circulaire du 3 mai 2024',
    legislationArticle2Date: 'Publié le 03/05/2024',
    legislationArticle2Summary:
      'Rappels sur la pêche de nuit et les conditions d’utilisation des leurres lumineux.',
    legislationArticle3Title: 'Communiqué du 12 mars 2024',
    legislationArticle3Date: 'Publié le 12/03/2024',
    legislationArticle3Summary:
      'Évolution des quotas journaliers pour les salmonidés et périodes de fermeture associées.',
    legislationArticle4Title: "Note d'information du 28 janvier 2024",
    legislationArticle4Date: 'Publié le 28/01/2024',
    legislationArticle4Summary:
      'Protection des zones de frayère : restrictions temporaires sur certains plans d’eau.',
    speciesDetailsTitle: "Détails de l'espèce",
    speciesHabitatLabel: 'Habitat',
    speciesSizeLabel: 'Taille',
    speciesDietLabel: 'Régime',
    speciesPeriodLabel: 'Période',
    speciesRegulationLabel: 'Réglementation',
    speciesPikeName: 'Brochet',
    speciesPikeLatin: 'Esox lucius',
    speciesPikeDescription:
      'Prédateur emblématique des eaux calmes, le brochet se reconnaît à son corps allongé.',
    speciesPikeHabitat: 'Lacs, étangs, rivières lentes',
    speciesPikeSize: '40 à 100 cm',
    speciesPikeDiet: 'Poissons, amphibiens',
    speciesPikePeriod: 'Printemps, automne',
    speciesPikeRegulation: 'Taille légale variable selon département',
    speciesPerchName: 'Perche',
    speciesPerchLatin: 'Perca fluviatilis',
    speciesPerchDescription:
      'Rayures verticales et nageoires orangées : une espèce facile à repérer.',
    speciesPerchHabitat: 'Lacs, canaux, rivières modérées',
    speciesPerchSize: '15 à 35 cm',
    speciesPerchDiet: 'Insectes, petits poissons',
    speciesPerchPeriod: 'Été, automne',
    speciesPerchRegulation: 'Consultez les quotas locaux',
    speciesTroutName: 'Truite fario',
    speciesTroutLatin: 'Salmo trutta fario',
    speciesTroutDescription:
      'Poisson d’eaux vives, apprécié pour sa robe tachetée et sa vivacité.',
    speciesTroutHabitat: 'Rivières fraîches, torrents',
    speciesTroutSize: '20 à 45 cm',
    speciesTroutDiet: 'Larves, insectes, alevins',
    speciesTroutPeriod: 'Printemps, été',
    speciesTroutRegulation: 'Périodes de fermeture strictes',
    speciesZanderName: 'Sandre',
    speciesZanderLatin: 'Sander lucioperca',
    speciesZanderDescription:
      'Prédateur nocturne, sensible à la lumière et aux vibrations.',
    speciesZanderHabitat: 'Rivières larges, lacs profonds',
    speciesZanderSize: '45 à 80 cm',
    speciesZanderDiet: 'Poissons, écrevisses',
    speciesZanderPeriod: 'Printemps, été',
    speciesZanderRegulation: 'Taille légale et quota local',
  },
  en: {
    appTitle: "Pech'App",
    menuConference: 'Navigation',
    menuTutorial: 'Tutorial',
    menuInfo: 'Info',
    navHome: 'Home',
    navSpecies: 'Species',
    navLegislation: 'Regulations',
    navIdentify: 'Identify a fish',
    navSchedule: 'Schedule',
    navSpeakers: 'Speakers',
    navMap: 'Map',
    navAbout: 'About',
    navAccount: 'Account',
    navSupport: 'Support',
    navLogout: 'Logout',
    navLogin: 'Login',
    navSignup: 'Signup',
    navSettings: 'Settings',
    darkMode: 'Dark Mode',
    showTutorial: 'Replay tutorial',
    commonCancel: 'Cancel',
    commonReset: 'Reset',
    commonDone: 'Done',
    commonClose: 'Close',
    commonRemove: 'Remove',
    commonFavorite: 'Favorite',
    commonFavorites: 'Favorites',
    commonAll: 'All',
    commonSearch: 'Search',
    commonFilter: 'Filter',
    commonSelectAll: 'Select All',
    commonDeselectAll: 'Deselect All',
    commonDate: 'Date',
    commonLocation: 'Location',
    commonPassword: 'Password',
    commonSubmit: 'Submit',
    commonSkip: 'Skip',
    commonContinue: 'Continue',
    commonCreate: 'Create',
    commonOk: 'Ok',
    commonPrevious: 'Previous',
    commonNext: 'Next',
    settingsTitle: 'Settings',
    settingsLanguage: 'Language',
    languageFrench: 'Français',
    languageEnglish: 'English',
    aboutPopoverLearn: 'Learn Ionic',
    aboutPopoverDocumentation: 'Documentation',
    aboutPopoverShowcase: 'Showcase',
    aboutPopoverGithub: 'GitHub Repo',
    filterSessionsTitle: 'Filter Sessions',
    tracksLabel: 'Tracks',
    noSessionsFound: 'No Sessions Found',
    favoriteAlreadyAdded: 'Favorite already added',
    removeFavoriteTitle: 'Remove Favorite',
    removeFavoritePrompt:
      'Would you like to remove this session from your favorites?',
    favoriteAddedToast: '{{name}} was successfully added as a favorite.',
    sessionNotFound: 'Session not found',
    refreshComplete: 'Refresh complete',
    postingToNetwork: 'Posting to {{network}}',
    aboutSpeaker: 'About {{name}}',
    speakerProfilePicAlt: 'Speaker profile pic',
    speakerNotFound: 'Speaker not found',
    shareSpeaker: 'Share {{name}}',
    copyLink: 'Copy Link',
    shareVia: 'Share via ...',
    emailWithAddress: 'Email ( {{email}} )',
    callWithNumber: 'Call ( {{phone}} )',
    sayHelloOnSocial: 'Say hello on social media!',
    offlineMessage: "You can't see/use that in offline mode.",
    offlineStatus:
      'Offline mode enabled. Some external resources may be unavailable.',
    offlineBannerMessage:
      'You are currently offline. Some features may be disabled.',
    dataLoadError:
      'Some data could not be loaded. Offline mode is limited.',
    updatePicture: 'Update Picture',
    changeUsername: 'Change Username',
    changePassword: 'Change Password',
    usernamePlaceholder: 'username',
    usernameLabel: 'Username',
    usernameRequired: 'Username is required',
    passwordLabel: 'Password',
    passwordRequired: 'Password is required',
    supportMessageLabel: 'Enter your support message below',
    supportMessageRequired: 'Support message is required',
    supportNotice: 'This does not actually send a support request.',
    supportRequestSent: 'Your support request has been sent.',
    supportRequestFailed:
      'Unable to send the support request. Please try again later.',
    ionicLogoAlt: "Pech'App logo",
    avatarAlt: 'avatar',
    tutorialWelcome: 'Welcome to',
    tutorialIntroBold: "Pech'App",
    tutorialIntroText:
      'helps you identify fish with visual cues and key identifiers.',
    tutorialWhatIsIonic: 'Recognize species',
    tutorialIonicDescription:
      'compare silhouettes, sizes, and habitats to avoid confusion.',
    tutorialWhatIsAppflow: 'Understand habitats',
    tutorialAppflowDescription:
      'learn where each species hides and when to find it.',
    tutorialReadyToPlay: 'Ready to explore?',
    watch: 'Watch',
    addToCalendar: 'Add to Calendar',
    markAsUnwatched: 'Mark as Unwatched',
    downloadVideo: 'Download Video',
    leaveFeedback: 'Leave Feedback',
    aboutSectionTitle: 'About',
    aboutHeroAlt: 'Fish illustration',
    aboutHeadline: "Pech'App, your riverside companion",
    aboutIntro:
      "Identify freshwater fish quickly and keep the right practices in mind. Pech'App is in alpha: some information still needs verification and the app is not yet 100% functional.",
    aboutMissionTitle: 'Our mission',
    aboutMissionBody:
      'Make species identification simple, fast, and reliable for every angler.',
    aboutHowTitle: 'How it works',
    aboutHowBody:
      'Browse species, compare key traits, and save your observations for later.',
    aboutDataTitle: 'Data & updates',
    aboutDataBody:
      'Content is updated regularly and stays available offline after your first visit.',
    aboutContactTitle: 'Contact',
    aboutContactBody:
      'Spot an error or need help? Reach us via the Support page.',
    detailsTitle: 'Details',
    selectLocationHeader: 'Select a Location',
    internetTitle: 'Internet',
    wifiNetworkLabel: 'Wifi network',
    appSectionTitle: 'App',
    lastUpdateLabel: 'Last update',
    lastUpdateUnavailable: 'Unavailable',
    forceUpdateApp: 'Force app update',
    homeHeadline: 'Identify fish at a glance',
    homeIntro:
      'Clear species cards, visual cues, and up-to-date regulations.',
    homeHeroAlt: 'Fish illustration',
    homeIdentifyFish: 'Identify a fish',
    homeExploreSpecies: 'Explore species',
    homeExploreLegislation: 'View regulations',
    identifyTitle: 'Identify a fish',
    identifyPhotoTitle: 'Identify with a photo',
    identifyPhotoDescription:
      'Image-based recognition (coming soon).',
    identifyQuestionsTitle: 'Identify with questions (Offline)',
    identifyQuestionsDescription:
      'Answer a few questions to narrow down the species.',
    identifyPhotoUnavailable: 'Photo identification is not available yet.',
    identifyStart: 'Start',
    identifyContinue: 'Continue',
    identifyBack: 'Back',
    identifyRestart: 'Restart',
    identifyQuestionCounter: 'Question {{current}} / {{total}}',
    identifyResultsTitle: 'Result',
    identifyCandidatesTitle: 'Possible species',
    identifyNoMatch:
      'No clear match yet. Here are the closest candidates.',
    identifyQuestionMissing:
      'Question unavailable. You can restart the identification.',
    legislationHeadline: 'Latest regulation updates',
    legislationIntro:
      'Find the newest official texts and reminders to stay compliant.',
    legislationArticle1Title: 'Decree of July 9, 2024',
    legislationArticle1Date: 'Published 07/09/2024',
    legislationArticle1Summary:
      'Updated minimum sizes for pike and zander in several departments.',
    legislationArticle2Title: 'Circular of May 3, 2024',
    legislationArticle2Date: 'Published 05/03/2024',
    legislationArticle2Summary:
      'Reminders about night fishing and rules for illuminated lures.',
    legislationArticle3Title: 'Notice of March 12, 2024',
    legislationArticle3Date: 'Published 03/12/2024',
    legislationArticle3Summary:
      'Updated daily quotas for salmonids and related closure periods.',
    legislationArticle4Title: 'Information note of January 28, 2024',
    legislationArticle4Date: 'Published 01/28/2024',
    legislationArticle4Summary:
      'Spawning areas protection: temporary restrictions on selected waters.',
    speciesDetailsTitle: 'Species details',
    speciesHabitatLabel: 'Habitat',
    speciesSizeLabel: 'Size',
    speciesDietLabel: 'Diet',
    speciesPeriodLabel: 'Best period',
    speciesRegulationLabel: 'Regulation',
    speciesPikeName: 'Pike',
    speciesPikeLatin: 'Esox lucius',
    speciesPikeDescription:
      'An iconic predator of calm waters, recognized by its elongated body.',
    speciesPikeHabitat: 'Lakes, ponds, slow rivers',
    speciesPikeSize: '40 to 100 cm',
    speciesPikeDiet: 'Fish, amphibians',
    speciesPikePeriod: 'Spring, fall',
    speciesPikeRegulation: 'Legal size varies by region',
    speciesPerchName: 'Perch',
    speciesPerchLatin: 'Perca fluviatilis',
    speciesPerchDescription:
      'Vertical stripes and orange fins make it easy to spot.',
    speciesPerchHabitat: 'Lakes, canals, moderate rivers',
    speciesPerchSize: '15 to 35 cm',
    speciesPerchDiet: 'Insects, small fish',
    speciesPerchPeriod: 'Summer, fall',
    speciesPerchRegulation: 'Check local quotas',
    speciesTroutName: 'Brown trout',
    speciesTroutLatin: 'Salmo trutta fario',
    speciesTroutDescription:
      'A fast freshwater fish known for its spotted coat.',
    speciesTroutHabitat: 'Cool rivers, streams',
    speciesTroutSize: '20 to 45 cm',
    speciesTroutDiet: 'Larvae, insects, fry',
    speciesTroutPeriod: 'Spring, summer',
    speciesTroutRegulation: 'Strict closure periods',
    speciesZanderName: 'Zander',
    speciesZanderLatin: 'Sander lucioperca',
    speciesZanderDescription:
      'A nocturnal predator, sensitive to light and vibrations.',
    speciesZanderHabitat: 'Wide rivers, deep lakes',
    speciesZanderSize: '45 to 80 cm',
    speciesZanderDiet: 'Fish, crayfish',
    speciesZanderPeriod: 'Spring, summer',
    speciesZanderRegulation: 'Legal size and local quota',
  },
} as const;

const trackTranslations: Record<Language, Record<string, string>> = {
  fr: {
    React: 'React',
    Documentation: 'Documentation',
    Food: 'Restauration',
    Ionic: 'Ionic',
    Tooling: 'Outillage',
    Design: 'Design',
    Services: 'Services',
    Workshop: 'Atelier',
    Communication: 'Communication',
    Navigation: 'Navigation',
  },
  en: {
    React: 'React',
    Documentation: 'Documentation',
    Food: 'Food',
    Ionic: 'Ionic',
    Tooling: 'Tooling',
    Design: 'Design',
    Services: 'Services',
    Workshop: 'Workshop',
    Communication: 'Communication',
    Navigation: 'Navigation',
  },
};

export type TranslationKey = keyof typeof translations.en;

const interpolationRegex = /\{\{(\w+)\}\}/g;

export function translate(
  language: Language,
  key: TranslationKey,
  vars?: Record<string, string | number>
) {
  const dictionary = translations[language] || translations[DEFAULT_LANGUAGE];
  const template = dictionary[key] || translations[DEFAULT_LANGUAGE][key] || key;
  if (!vars) {
    return template;
  }
  return template.replace(interpolationRegex, (_, token) => {
    const value = vars[token];
    return value === undefined ? '' : String(value);
  });
}

export function translateTrack(language: Language, track: string) {
  return trackTranslations[language]?.[track] || track;
}

export function getDateLocale(language: Language) {
  return language === 'fr' ? fr : enUS;
}

export function useTranslation() {
  const { state } = useContext(AppContext);
  const language = state.user.language || DEFAULT_LANGUAGE;
  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(language, key, vars),
    [language]
  );
  const tTrack = useCallback(
    (track: string) => translateTrack(language, track),
    [language]
  );
  return { t, tTrack, language };
}
