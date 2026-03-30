import React, { useRef, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  useIonViewWillEnter,
} from '@ionic/react';
import { arrowForward } from 'ionicons/icons';
import { setMenuEnabled } from '../data/sessions/sessions.actions';
import { setHasSeenTutorial } from '../data/user/user.actions';
import './Tutorial.scss';
import { connect } from '../data/connect';
import { RouteComponentProps } from 'react-router';
import { useTranslation } from '../i18n';

interface OwnProps extends RouteComponentProps {}
interface DispatchProps {
  setHasSeenTutorial: typeof setHasSeenTutorial;
  setMenuEnabled: typeof setMenuEnabled;
}

interface TutorialProps extends OwnProps, DispatchProps {}

const Tutorial: React.FC<TutorialProps> = ({
  history,
  setHasSeenTutorial,
  setMenuEnabled,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useIonViewWillEnter(() => {
    setMenuEnabled(false);
    // Scroll to first slide when entering the tutorial
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: 0,
        behavior: 'smooth'
      });
    }
  });

  const startApp = async () => {
    await setHasSeenTutorial(true);
    await setMenuEnabled(true);
    history.push('/tabs/home', { direction: 'none' });
  };

  return (
    <IonPage id="tutorial-page">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="end">
            <IonButton color="primary" onClick={startApp}>
              {t('commonSkip')}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="slider" ref={sliderRef}>
          <section>
            <div className="swiper-item">
              <img
                src="/assets/img/fish/fish-hero.svg"
                alt=""
                className="slide-image"
              />
              <h2 className="slide-title">
                {t('tutorialWelcome')} <b>{t('appTitle')}</b>
              </h2>
              <p>
                <b>{t('tutorialIntroBold')}</b> {t('tutorialIntroText')}
              </p>
            </div>
          </section>
          <section>
            <div className="swiper-item">
              <img
                src="/assets/img/fish/fish-pike.svg"
                alt=""
                className="slide-image"
              />
              <h2 className="slide-title">{t('tutorialWhatIsIonic')}</h2>
              <p>
                <b>Ionic Framework</b> {t('tutorialIonicDescription')}
              </p>
            </div>
          </section>
          <section>
            <div className="swiper-item">
              <img
                src="/assets/img/fish/fish-perch.svg"
                alt=""
                className="slide-image"
              />
              <h2 className="slide-title">{t('tutorialWhatIsAppflow')}</h2>
              <p>
                <b>Appflow</b> {t('tutorialAppflowDescription')}
              </p>
            </div>
          </section>
          <section>
            <div className="swiper-item">
              <img
                src="/assets/img/fish/fish-trout.svg"
                alt=""
                className="slide-image"
              />
              <h2 className="slide-title">{t('tutorialReadyToPlay')}</h2>
              <IonButton fill="clear" onClick={startApp}>
                {t('commonContinue')}
                <IonIcon slot="end" icon={arrowForward} />
              </IonButton>
            </div>
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default connect<OwnProps, {}, DispatchProps>({
  mapDispatchToProps: {
    setHasSeenTutorial,
    setMenuEnabled,
  },
  component: Tutorial,
});
