import React, { useEffect, useState } from 'react';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonPage,
  IonButtons,
  IonMenuButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonIcon,
  IonModal,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonText,
} from '@ionic/react';
import {
  closeOutline,
  chevronBackOutline,
  chevronForwardOutline,
} from 'ionicons/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperInstance } from 'swiper';
import 'swiper/css';
import { useLocation } from 'react-router';
import { useTranslation } from '../i18n';
import './Species.scss';

type SpeciesInfo = {
  name: string;
  latinName: string;
  image: string;
  description: string;
  habitat: string;
  size: string;
  diet: string;
  period: string;
  regulation: string;
};

type SpeciesRaw = {
  name: string;
  latinName: string;
  appellation?: string | null;
  codeFao?: string | null;
  textes?: string | null;
  taille?: string | null;
  obligation?: string | null;
  autre?: string | null;
  description?: string | null;
  habitat?: string | null;
  diet?: string | null;
  period?: string | null;
  image?: string | null;
};

type SheetSpecies = {
  name?: string;
  latin_name?: string;
  appellation_speciale?: string;
  code_fao?: string;
  taille_minimale?: string;
  obligation_de_debarquement?: string;
  textes_reglementaires?: string;
  autre?: string;
  description?: string;
  habitat?: string;
  diet?: string;
  period?: string;
  image?: string;
};

const DEFAULT_IMAGE = '/assets/img/fish/fish-hero.svg';

const cleanText = (value?: string | null) =>
  typeof value === 'string' ? value.replace(/\r\n/g, '\n').trim() : '';

const normalizeToken = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');

const toSlug = (value: string) =>
  normalizeToken(value).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const normalizeSize = (value?: string | null) => {
  const cleaned = cleanText(value);
  if (!cleaned) return 'Taille à compléter.';
  return cleaned.replace(/(\d)(cm)/gi, '$1 cm').replace(/\s+/g, ' ').trim();
};

const buildDescription = (
  name: string,
  description?: string | null,
  appellation?: string | null,
  codeFao?: string | null
) => {
  const parts: string[] = [];
  const cleanedDescription = cleanText(description);
  if (cleanedDescription) {
    parts.push(cleanedDescription);
  }
  const cleanedAppellation = cleanText(appellation);
  if (cleanedAppellation && cleanedAppellation !== '/') {
    parts.push(`Appellation spéciale : ${cleanedAppellation}`);
  }
  const cleanedCode = cleanText(codeFao);
  if (cleanedCode) {
    parts.push(`Code FAO : ${cleanedCode}`);
  }
  return parts.length > 0
    ? parts.join(' • ')
    : `Fiche descriptive de ${name} à compléter.`;
};

const buildRegulation = (
  textes?: string | null,
  obligation?: string | null,
  autre?: string | null
) => {
  const parts: string[] = [];
  const cleanedTextes = cleanText(textes);
  if (cleanedTextes) {
    parts.push(`Textes applicables :\n${cleanedTextes}`);
  }
  const cleanedObligation = cleanText(obligation);
  if (cleanedObligation) {
    parts.push(`Obligation de débarquement : ${cleanedObligation}`);
  }
  const cleanedAutre = cleanText(autre);
  if (cleanedAutre) {
    parts.push(`Autre :\n${cleanedAutre}`);
  }
  return parts.length > 0 ? parts.join('\n\n') : 'Réglementation à compléter.';
};

const makeSpecies = ({
  name,
  latinName,
  appellation,
  codeFao,
  textes,
  taille,
  obligation,
  autre,
  description,
  habitat,
  diet,
  period,
  image,
}: SpeciesRaw): SpeciesInfo => ({
  name,
  latinName,
  image: cleanText(image) || DEFAULT_IMAGE,
  description: buildDescription(name, description, appellation, codeFao),
  habitat: cleanText(habitat) || 'Habitat à compléter.',
  size: normalizeSize(taille),
  diet: cleanText(diet) || 'Régime alimentaire à compléter.',
  period: cleanText(period) || 'Période de présence à compléter.',
  regulation: buildRegulation(textes, obligation, autre),
});

const FALLBACK_SPECIES: SpeciesInfo[] = [
  makeSpecies({
    name: 'Bar',
    latinName: 'Dicentrarchus labrax',
    appellation: 'Loup de mer',
    codeFao: 'BSS',
    textes: `- Règlement (UE) 2019/1241
- Réglement (UE) 2019/1022
-Annexe III,  Réglement n°1967/2006 modifié`,
    taille: '25cm',
    obligation: 'Oui',
    autre: `Rejets autorisés (dérogation à l'obligation de débarquement) :

-jusqu’à un maximum de 5 % du total des captures annuelles de
ces espèces par des navires utilisant des chaluts de fond;
-jusqu’à un maximum de 3 % du total des captures
annuelles de ces espèces par des navires utilisant des filets maillants
et des trémails;
-jusqu’à un maximum de 1 % du
total des captures annuelles de ces espèces par des navires utilisant
des lignes et des hameçons`,
  }),
  makeSpecies({
    name: 'Sparaillon',
    latinName: 'Diplodus annularis',
    appellation: 'Pataclet',
    codeFao: 'ANN',
    textes: `- Règlement (UE) 2019/1241
- Réglement (UE) 2019/1022
-Annexe III,  Réglement n°1967/2006 modifié`,
    taille: '12 cm',
    obligation: 'Oui',
    autre: `Rejets autorisés (dérogation à l'obligation de débarquement) :

-jusqu’à un maximum de 5 % du total des captures annuelles de
ces espèces par des navires utilisant des chaluts de fond;
-jusquà un maximum de 3 % du total des captures
annuelles de ces espèces par des navires utilisant des filets maillants
et des trémails;
-jusquà un maximum de 1 % du
total des captures annuelles de ces espèces par des navires utilisant
des lignes et des hameçons`,
  }),
  makeSpecies({
    name: 'Sar à museau pointu',
    latinName: 'Diplodus puntazzo',
    appellation: '/',
    codeFao: 'SHR',
    textes: `- Règlement (UE) 2019/1241
- Réglement (UE) 2019/1022
-Annexe III,  Réglement n°1967/2006 modifié`,
    taille: '18 cm',
    obligation: 'Oui',
    autre: `Rejets autorisés (dérogation à l'obligation de débarquement) :

-jusquà un maximum de 5 % du total des captures annuelles de
ces espèces par des navires utilisant des chaluts de fond;
-jusquà un maximum de 3 % du total des captures
annuelles de ces espèces par des navires utilisant des filets maillants
et des trémails;
-jusquà un maximum de 1 % du
total des captures annuelles de ces espèces par des navires utilisant
des lignes et des hameçons`,
  }),
  makeSpecies({
    name: 'Sar commun',
    latinName: 'Diplodus sargus',
    appellation: '/',
    codeFao: 'SWA',
    textes: `- Règlement (UE) 2019/1241
- Réglement (UE) 2019/1022
-Annexe III,  Réglement n°1967/2006 modifié`,
    taille: '23 cm',
    obligation: 'Oui',
    autre: `Rejets autorisés (dérogation à l'obligation de débarquement) :

-jusquà un maximum de 5 % du total des captures annuelles de
ces espèces par des navires utilisant des chaluts de fond;
-jusquà un maximum de 3 % du total des captures
annuelles de ces espèces par des navires utilisant des filets maillants
et des trémails;
-jusquà un maximum de 1 % du
total des captures annuelles de ces espèces par des navires utilisant
des lignes et des hameçons`,
  }),
  makeSpecies({
    name: 'Sar à tête noire',
    latinName: 'Diplodus vulgaris',
    appellation: '/',
    codeFao: 'CTB',
    textes: `- Règlement (UE) 2019/1241
- Réglement (UE) 2019/1022
-Annexe III,  Réglement n°1967/2006 modifié`,
    taille: '18 cm',
    obligation: 'Oui',
    autre: `Rejets autorisés (dérogation à l'obligation de débarquement) :

-jusquà un maximum de 5 % du total des captures annuelles de
ces espèces par des navires utilisant des chaluts de fond;
-jusquà un maximum de 3 % du total des captures
annuelles de ces espèces par des navires utilisant des filets maillants
et des trémails;
-jusquà un maximum de 1 % du
total des captures annuelles de ces espèces par des navires utilisant
des lignes et des hameçons`,
  }),
  makeSpecies({
    name: 'Anchois',
    latinName: 'Engraulis encrasicolus',
    appellation: '/',
    codeFao: 'ANE',
    textes: `- Règlement (UE) 2019/1241
- Réglement (UE) 2019/1022
-Annexe III,  Réglement n°1967/2006 modifié`,
    taille: '9 cm',
    obligation: 'Oui',
    autre: null,
  }),
  makeSpecies({
    name: 'Mérou Royal',
    latinName: 'Mycteroperca rubra',
    appellation: '/',
    codeFao: 'BSX',
    textes: `- Règlement (UE) 2019/1241

-Annexe III,  Réglement n°1967/2006 modifié

- règlementation de la pêche du mérou dans les eaux maritimes en Méditerranée continentale : arrêté préfectoral n° R93-2023-12-08-00001

- règlementation de la pêche de différentes espèces de mérous dans les eaux territoriales autour de la Corse : arrêté préfectoral n° R93-2023-12-20-00002`,
    taille: '45 cm',
    obligation: 'Oui',
    autre: `Rejets autorisés (dérogation à l'obligation de débarquement) :

-jusquà un maximum de 5 % du total des captures annuelles de
ces espèces par des navires utilisant des chaluts de fond;
-jusquà un maximum de 3 % du total des captures
annuelles de ces espèces par des navires utilisant des filets maillants
et des trémails;
-jusquà un maximum de 1 % du
total des captures annuelles de ces espèces par des navires utilisant
des lignes et des hameçons`,
  }),
  makeSpecies({
    name: 'Marbré',
    latinName: 'Lithognathus mormyrus',
    appellation: '/',
    codeFao: 'SSB',
    textes: `- Règlement (UE) 2019/1241
- Réglement (UE) 2019/1022
-Annexe III,  Réglement n°1967/2006 modifié`,
    taille: '20 cm',
    obligation: 'Oui',
    autre: `Rejets autorisés (dérogation à l'obligation de débarquement) :

-jusquà un maximum de 5 % du total des captures annuelles de
ces espèces par des navires utilisant des chaluts de fond;
-jusquà un maximum de 3 % du total des captures
annuelles de ces espèces par des navires utilisant des filets maillants
et des trémails;
-jusquà un maximum de 1 % du
total des captures annuelles de ces espèces par des navires utilisant
des lignes et des hameçons`,
  }),
  makeSpecies({
    name: 'Merlu commun',
    latinName: 'Merluccius merluccius',
    appellation: '/',
    codeFao: 'HKE',
    textes: `- Règlement (UE) 2019/1241
- Réglement (UE) 2019/1022
-Annexe III,  Réglement n°1967/2006 modifié`,
    taille: '20 cm',
    obligation: 'Oui',
    autre: `Merlu commun (mise en place d'un plafond de capture (quota) pour les fileyeurs en Méditerranée : référence pas trouvée

Rejets :
 - jusquà un maximum de 5 % du total des captures
annuelles de ces espèces par des navires utilisant des chaluts de
fond;
- jusquà un maximum de 1 % du total des captures
annuelles de ces espèces par des navires utilisant des filets maillants
et des trémails`,
  }),
  makeSpecies({
    name: 'Rouget Barbet de roche',
    latinName: 'Mullus surmuletus',
    appellation: null,
    codeFao: 'MUR',
    textes: `- Règlement (UE) 2019/1241
- Réglement (UE) 2019/1022
-Annexe III,  Réglement n°1967/2006 modifié`,
    taille: '11 cm',
    obligation: 'Oui',
    autre: `Rejets :
 - jusquà un maximum de 5 % du total des captures
annuelles de ces espèces par des navires utilisant des chaluts de
fond;
- jusquà un maximum de 1 % du total des captures
annuelles de ces espèces par des navires utilisant des filets maillants
et des trémails`,
  }),
  makeSpecies({
    name: 'Pageot acarné',
    latinName: 'Pagellus acarne',
    appellation: null,
    codeFao: 'SBA',
    textes: `- Règlement (UE) 2019/1241
- Réglement (UE) 2019/1022
-Annexe III,  Réglement n°1967/2006 modifié`,
    taille: '17 cm',
    obligation: 'Oui',
    autre: `Rejets autorisés (dérogation à l'obligation de débarquement) :

-jusquà un maximum de 5 % du total des captures annuelles de
ces espèces par des navires utilisant des chaluts de fond;
-jusquà un maximum de 3 % du total des captures
annuelles de ces espèces par des navires utilisant des filets maillants
et des trémails;
-jusquà un maximum de 1 % du
total des captures annuelles de ces espèces par des navires utilisant
des lignes et des hameçons`,
  }),
  makeSpecies({
    name: 'Dorade rose',
    latinName: 'Pagellus bogaraveo',
    appellation: null,
    codeFao: 'SBR',
    textes: `- Règlement (UE) 2019/1241
- Réglement (UE) 2019/1022
-Annexe III,  Réglement n°1967/2006 modifié`,
    taille: '33 cm',
    obligation: 'Oui',
    autre: `Rejets autorisés (dérogation à l'obligation de débarquement) :
- pour les captures au moyen d'hameçons et de lignes
-jusquà un maximum de 5 % du total des captures annuelles de
ces espèces par des navires utilisant des chaluts de fond;
-jusquà un maximum de 3 % du total des captures
annuelles de ces espèces par des navires utilisant des filets maillants
et des trémails;

-jusquà un maximum de 1 % du
total des captures annuelles de ces espèces par des navires utilisant
des lignes et des hameçons`,
  }),
  makeSpecies({
    name: 'Pageot commun',
    latinName: 'Pagellus erythrinus',
    appellation: '/',
    codeFao: 'PAC',
    textes: `- Règlement (UE) 2019/1241
- Réglement (UE) 2019/1022
-Annexe III,  Réglement n°1967/2006 modifié`,
    taille: '15 cm',
    obligation: 'Oui',
    autre: `Rejets autorisés (dérogation à l'obligation de débarquement) :

-jusquà un maximum de 5 % du total des captures annuelles de
ces espèces par des navires utilisant des chaluts de fond;
-jusquà un maximum de 3 % du total des captures
annuelles de ces espèces par des navires utilisant des filets maillants
et des trémails;
-jusquà un maximum de 1 % du
total des captures annuelles de ces espèces par des navires utilisant
des lignes et des hameçons`,
  }),
  makeSpecies({
    name: 'Pagre commun',
    latinName: 'Pagrus pagrus',
    appellation: null,
    codeFao: 'RPG',
    textes: `- Règlement (UE) 2019/1241
- Réglement (UE) 2019/1022
-Annexe III,  Réglement n°1967/2006 modifié`,
    taille: '18 cm',
    obligation: 'Oui',
    autre: `Rejets autorisés (dérogation à l'obligation de débarquement) :

-jusquà un maximum de 5 % du total des captures annuelles de
ces espèces par des navires utilisant des chaluts de fond;
-jusquà un maximum de 3 % du total des captures
annuelles de ces espèces par des navires utilisant des filets maillants
et des trémails;
-jusquà un maximum de 1 % du
total des captures annuelles de ces espèces par des navires utilisant
des lignes et des hameçons`,
  }),
  makeSpecies({
    name: 'Cernier atlantique',
    latinName: 'Polyprion americanus',
    appellation: '/',
    codeFao: 'WRF',
    textes: `- Règlement (UE) 2019/1241

-Annexe III,  Réglement n°1967/2006 modifié

- règlementation de la pêche du mérou dans les eaux maritimes en Méditerranée continentale : arrêté préfectoral n° R93-2023-12-08-00001

- règlementation de la pêche de différentes espèces de mérous dans les eaux territoriales autour de la Corse : arrêté préfectoral n° R93-2023-12-20-00002`,
    taille: '45 cm',
    obligation: 'Oui',
    autre: `Pêche sous-marine interdite

Rejets autorisés (dérogation à l'obligation de débarquement) :

-jusquà un maximum de 5 % du total des captures annuelles de
ces espèces par des navires utilisant des chaluts de fond;
-jusquà un maximum de 3 % du total des captures
annuelles de ces espèces par des navires utilisant des filets maillants
et des trémails;
-jusquà un maximum de 1 % du
total des captures annuelles de ces espèces par des navires utilisant
des lignes et des hameçons`,
  }),
  makeSpecies({
    name: 'Sardine',
    latinName: 'Sardina pilchardus',
    appellation: '/',
    codeFao: 'PIL',
    textes: `- Règlement (UE) 2019/1241
- Réglement (UE) 2019/1022
-Annexe III,  Réglement n°1967/2006 modifié`,
    taille: '11 cm',
    obligation: 'Oui',
    autre:
      'En Méditerranée, pour les engins traînants ciblant la sardine et l’anchois, le maillage minimal est fixé à 20mm (R(UE) 2019/1241 annexe IV partie B).',
  }),
  makeSpecies({
    name: 'Maquereau',
    latinName: 'Scomber scombrus',
    appellation: '/',
    codeFao: 'MAC',
    textes: `- Règlement (UE) 2019/1241
- Réglement (UE) 2019/1022
-Annexe III,  Réglement n°1967/2006 modifié`,
    taille: '18 cm',
    obligation: 'Oui',
    autre: null,
  }),
  makeSpecies({
    name: 'Sole commune',
    latinName: 'Solea vulgaris',
    appellation: '/',
    codeFao: 'SOL',
    textes: `- Règlement (UE) 2019/1241
- Réglement (UE) 2019/1022
-Annexe III,  Réglement n°1967/2006 modifié`,
    taille: '20 cm',
    obligation: 'Oui',
    autre: `Rejets autorisés (dérogation à l'obligation de débarquement) :

-jusquà un maximum de 5 % du total des captures annuelles de
ces espèces par des navires utilisant des chaluts de fond;
-jusquà un maximum de 3 % du total des captures
annuelles de ces espèces par des navires utilisant des filets maillants
et des trémails;
-jusquà un maximum de 1 % du
total des captures annuelles de ces espèces par des navires utilisant
des lignes et des hameçons`,
  }),
  makeSpecies({
    name: 'Dorade royale',
    latinName: 'Sparus aurata',
    appellation: '/',
    codeFao: 'SBG',
    textes: `- Règlement (UE) 2019/1241
- Réglement (UE) 2019/1022
-Annexe III,  Réglement n°1967/2006 modifié`,
    taille: '20 cm',
    obligation: 'Oui',
    autre: `Rejets autorisés (dérogation à l'obligation de débarquement) :

-jusquà un maximum de 5 % du total des captures annuelles de
ces espèces par des navires utilisant des chaluts de fond;
-jusquà un maximum de 3 % du total des captures
annuelles de ces espèces par des navires utilisant des filets maillants
et des trémails;
-jusquà un maximum de 1 % du
total des captures annuelles de ces espèces par des navires utilisant
des lignes et des hameçons`,
  }),
  makeSpecies({
    name: 'Chinchard',
    latinName: 'Trachurus trachurus',
    appellation: 'Sévereau',
    codeFao: 'HOM',
    textes: `- Règlement (UE) 2019/1241
- Réglement (UE) 2019/1022
-Annexe III,  Réglement n°1967/2006 modifié`,
    taille: '15 cm',
    obligation: 'Oui',
    autre: null,
  }),
];

const Species: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);

  const [species, setSpecies] = useState<SpeciesInfo[]>(FALLBACK_SPECIES);

  useEffect(() => {
    let isMounted = true;

    const loadSheet = async () => {
      try {
        const response = await fetch('/assets/sheet.json', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to load sheet.json (${response.status})`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('sheet.json payload is not an array');
        }
        const mapped = data
          .map((row: SheetSpecies) => {
            const name = cleanText(row.name);
            const latinName = cleanText(row.latin_name);
            if (!name || !latinName) {
              return null;
            }
            const appellation = cleanText(row.appellation_speciale);
            return makeSpecies({
              name,
              latinName,
              appellation: appellation || null,
              codeFao: cleanText(row.code_fao) || null,
              textes: row.textes_reglementaires ?? null,
              taille: row.taille_minimale ?? null,
              obligation: row.obligation_de_debarquement ?? null,
              autre: row.autre ?? null,
              description: row.description ?? null,
              habitat: row.habitat ?? null,
              diet: row.diet ?? null,
              period: row.period ?? null,
              image: row.image ?? null,
            });
          })
          .filter((entry): entry is SpeciesInfo => Boolean(entry));

        if (mapped.length > 0 && isMounted) {
          setSpecies(mapped);
        }
      } catch (error) {
        console.warn('Unable to load sheet.json, using fallback data.', error);
      }
    };

    loadSheet();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const focus = params.get('focus') || params.get('species');
    if (!focus) {
      return;
    }
    const target = toSlug(focus);
    if (!target) {
      return;
    }
    const index = species.findIndex((fish) => {
      return (
        toSlug(fish.latinName) === target || toSlug(fish.name) === target
      );
    });
    if (index >= 0) {
      setActiveIndex(index);
      setIsModalOpen(true);
    }
  }, [location.search, species]);


  useEffect(() => {
    if (isModalOpen && swiper) {
      swiper.slideTo(activeIndex, 0);
    }
  }, [isModalOpen, activeIndex, swiper]);

  const openDetails = (index: number) => {
    setActiveIndex(index);
    setIsModalOpen(true);
  };

  return (
    <IonPage id="species-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>{t('navSpecies')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="species-grid">
          {species.map((fish, index) => (
            <IonCard
              key={fish.name}
              className="species-card"
              onClick={() => openDetails(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  openDetails(index);
                }
              }}
            >
              <div className="species-card__media">
                <img src={fish.image} alt={fish.name} />
              </div>
              <IonCardHeader>
                <IonCardTitle>{fish.name}</IonCardTitle>
                <IonCardSubtitle>{fish.latinName}</IonCardSubtitle>
              </IonCardHeader>
            </IonCard>
          ))}
        </div>

        <IonModal
          isOpen={isModalOpen}
          onDidDismiss={() => setIsModalOpen(false)}
          className="species-modal"
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>
                {species[activeIndex]?.name || t('speciesDetailsTitle')}
              </IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsModalOpen(false)}>
                  <IonIcon slot="icon-only" icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="species-modal__content">
            <div className="species-modal__body">
              <Swiper
                onSwiper={setSwiper}
                onSlideChange={(instance) => setActiveIndex(instance.activeIndex)}
                initialSlide={activeIndex}
                className="species-swiper"
              >
                {species.map((fish) => (
                  <SwiperSlide key={fish.name}>
                    <div className="species-slide" style={{ padding: '0 0 16px' }}>
                      <div
                        className="species-slide__header"
                        style={{ padding: '12px 16px 0', textAlign: 'center' }}
                      >
                        <img
                          src={fish.image}
                          alt={fish.name}
                          style={{
                            width: 'min(320px, 100%)',
                            display: 'block',
                            margin: '0 auto 16px',
                          }}
                        />
                        <h2>{fish.name}</h2>
                        <IonText color="medium">
                          <p className="species-slide__latin">{fish.latinName}</p>
                        </IonText>
                        <p className="species-slide__description">
                          {fish.description}
                        </p>
                      </div>
                      <IonList inset>
                        <IonItem>
                          <IonLabel>{t('speciesHabitatLabel')}</IonLabel>
                          <IonText slot="end">{fish.habitat}</IonText>
                        </IonItem>
                        <IonItem>
                          <IonLabel>{t('speciesSizeLabel')}</IonLabel>
                          <IonText slot="end">{fish.size}</IonText>
                        </IonItem>
                        <IonItem>
                          <IonLabel>{t('speciesDietLabel')}</IonLabel>
                          <IonText slot="end">{fish.diet}</IonText>
                        </IonItem>
                        <IonItem>
                          <IonLabel>{t('speciesPeriodLabel')}</IonLabel>
                          <IonText slot="end">{fish.period}</IonText>
                        </IonItem>
                      </IonList>
                      <div className="species-regulation">
                        <h3 className="species-regulation__title">
                          {t('speciesRegulationLabel')}
                        </h3>
                        <p className="species-regulation__text">
                          {fish.regulation}
                        </p>
                      </div>
                    </div>
                </SwiperSlide>
              ))}
              </Swiper>
              <div className="species-modal__nav">
                <IonButton
                  fill="clear"
                  onClick={() => swiper?.slidePrev()}
                  disabled={activeIndex === 0}
                >
                  <IonIcon slot="start" icon={chevronBackOutline} />
                  {t('commonPrevious')}
                </IonButton>
                <IonButton
                  fill="clear"
                  onClick={() => swiper?.slideNext()}
                  disabled={activeIndex === species.length - 1}
                >
                  {t('commonNext')}
                  <IonIcon slot="end" icon={chevronForwardOutline} />
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Species;
