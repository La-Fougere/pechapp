import React from 'react';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonPage,
  IonButtons,
  IonMenuButton,
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonButton,
} from '@ionic/react';
import { connect } from '../data/connect';
import { setDarkMode, setLanguage } from '../data/user/user.actions';
import type { Language } from '../data/user/user.state';
import { useTranslation } from '../i18n';
import './Settings.scss';

interface StateProps {
  darkMode: boolean;
  language: Language;
}

interface DispatchProps {
  setDarkMode: typeof setDarkMode;
  setLanguage: typeof setLanguage;
}

const Settings: React.FC<StateProps & DispatchProps> = ({
  darkMode,
  language,
  setDarkMode,
  setLanguage,
}) => {
  const { t } = useTranslation();

  return (
    <IonPage id="settings-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>{t('settingsTitle')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList inset>
          <IonItem>
            <IonLabel>{t('darkMode')}</IonLabel>
            <IonToggle
              slot="end"
              checked={darkMode}
              onIonChange={(e) => setDarkMode(e.detail.checked)}
            />
          </IonItem>
          <IonItem>
            <IonLabel>{t('settingsLanguage')}</IonLabel>
            <IonSelect
              value={language}
              interface="popover"
              interfaceOptions={{ header: t('settingsLanguage') }}
              onIonChange={(e) => setLanguage(e.detail.value as Language)}
            >
              <IonSelectOption value="fr">
                {t('languageFrench')}
              </IonSelectOption>
              <IonSelectOption value="en">
                {t('languageEnglish')}
              </IonSelectOption>
            </IonSelect>
          </IonItem>
        </IonList>
        <div className="settings-actions">
          <IonButton expand="block" routerLink="/tutorial">
            {t('showTutorial')}
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default connect<{}, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    darkMode: state.user.darkMode,
    language: state.user.language,
  }),
  mapDispatchToProps: {
    setDarkMode,
    setLanguage,
  },
  component: Settings,
});
