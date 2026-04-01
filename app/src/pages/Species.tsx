import React, { useEffect, useMemo, useState } from 'react';
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

const Species: React.FC = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);

  const species = useMemo<SpeciesInfo[]>(
    () => {
      const image = '/assets/img/fish/fish-hero.svg';
      const makeSpecies = (name: string, latinName: string): SpeciesInfo => ({
        name,
        latinName,
        image,
        description: `Fiche descriptive de ${name} à compléter.`,
        habitat: 'Habitat à compléter.',
        size: 'Taille à compléter.',
        diet: 'Régime alimentaire à compléter.',
        period: 'Période de présence à compléter.',
        regulation: 'Réglementation à compléter.',
      });

      return [
        makeSpecies('Bar', 'Dicentrarchus labrax'),
        makeSpecies('Sparaillon', 'Diplodus annularis'),
        makeSpecies('Sar à museau pointu', 'Diplodus puntazzo'),
        makeSpecies('Sar commun', 'Diplodus sargus'),
        makeSpecies('Sar à tête noire', 'Diplodus vulgaris'),
        makeSpecies('Anchois', 'Engraulis encrasicolus'),
        makeSpecies('Mérou Royal', 'Mycteroperca rubra'),
        makeSpecies('Marbré', 'Lithognathus mormyrus'),
        makeSpecies('Merlu commun', 'Merluccius merluccius'),
        makeSpecies('Rouget Barbet de roche', 'Mullus surmuletus'),
        makeSpecies('Pageot acarné', 'Pagellus acarne'),
        makeSpecies('Dorade rose', 'Pagellus bogaraveo'),
        makeSpecies('Pageot commun', 'Pagellus erythrinus'),
        makeSpecies('Pagre commun', 'Pagrus pagrus'),
        makeSpecies('Cernier atlantique', 'Polyprion americanus'),
        makeSpecies('Sardine', 'Sardina pilchardus'),
        makeSpecies('Maquereau', 'Scomber scombrus'),
        makeSpecies('Sole commune', 'Solea vulgaris'),
        makeSpecies('Dorade royale', 'Sparus aurata'),
        makeSpecies('Chinchard', 'Trachurus trachurus'),
      ];
    },
    [t]
  );

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
