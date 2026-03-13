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
    () => [
      {
        name: t('speciesPikeName'),
        latinName: t('speciesPikeLatin'),
        image: '/assets/img/fish/fish-pike.svg',
        description: t('speciesPikeDescription'),
        habitat: t('speciesPikeHabitat'),
        size: t('speciesPikeSize'),
        diet: t('speciesPikeDiet'),
        period: t('speciesPikePeriod'),
        regulation: t('speciesPikeRegulation'),
      },
      {
        name: t('speciesPerchName'),
        latinName: t('speciesPerchLatin'),
        image: '/assets/img/fish/fish-perch.svg',
        description: t('speciesPerchDescription'),
        habitat: t('speciesPerchHabitat'),
        size: t('speciesPerchSize'),
        diet: t('speciesPerchDiet'),
        period: t('speciesPerchPeriod'),
        regulation: t('speciesPerchRegulation'),
      },
      {
        name: t('speciesTroutName'),
        latinName: t('speciesTroutLatin'),
        image: '/assets/img/fish/fish-trout.svg',
        description: t('speciesTroutDescription'),
        habitat: t('speciesTroutHabitat'),
        size: t('speciesTroutSize'),
        diet: t('speciesTroutDiet'),
        period: t('speciesTroutPeriod'),
        regulation: t('speciesTroutRegulation'),
      },
      {
        name: t('speciesZanderName'),
        latinName: t('speciesZanderLatin'),
        image: '/assets/img/fish/fish-zander.svg',
        description: t('speciesZanderDescription'),
        habitat: t('speciesZanderHabitat'),
        size: t('speciesZanderSize'),
        diet: t('speciesZanderDiet'),
        period: t('speciesZanderPeriod'),
        regulation: t('speciesZanderRegulation'),
      },
    ],
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
          <IonContent>
            <Swiper
              onSwiper={setSwiper}
              onSlideChange={(instance) => setActiveIndex(instance.activeIndex)}
              initialSlide={activeIndex}
              className="species-swiper"
            >
              {species.map((fish) => (
                <SwiperSlide key={fish.name}>
                  <div className="species-slide">
                    <div className="species-slide__header">
                      <img src={fish.image} alt={fish.name} />
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
                      <IonItem>
                        <IonLabel>{t('speciesRegulationLabel')}</IonLabel>
                        <IonText slot="end">{fish.regulation}</IonText>
                      </IonItem>
                    </IonList>
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
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Species;
