import React, { useEffect, useState } from 'react';
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
  IonIcon,
} from '@ionic/react';
import { informationCircleOutline } from 'ionicons/icons';
import { connect } from '../data/connect';
import { setDarkMode, setLanguage } from '../data/user/user.actions';
import type { Language } from '../data/user/user.state';
import { getCacheLastUpdatedData } from '../data/dataApi';
import { useTranslation } from '../i18n';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
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
  const isOnline = useNetworkStatus();
  const [cacheUpdatedAt, setCacheUpdatedAt] = useState<string | undefined>();

  useEffect(() => {
    let isMounted = true;
    const loadCacheTimestamp = async () => {
      const value = await getCacheLastUpdatedData();
      if (isMounted) {
        setCacheUpdatedAt(value);
      }
    };
    loadCacheTimestamp();
    return () => {
      isMounted = false;
    };
  }, [isOnline]);

  const formatCacheDate = (value?: string) => {
    if (!value) {
      return t('lastUpdateUnavailable');
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return t('lastUpdateUnavailable');
    }
    const locale = language === 'fr' ? 'fr-FR' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(parsed);
  };

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
        {!isOnline && (
          <div
            className={`offline-banner offline-banner--offline ${darkMode ? 'offline-banner--dark' : ''}`}
            role="status"
            aria-live="polite"
          >
            <IonIcon
              className="offline-banner__icon"
              icon={informationCircleOutline}
            />
            <div className="offline-banner__text">
              {t('offlineBannerMessage')}
            </div>
          </div>
        )}
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
          <IonItem>
            <IonLabel>{t('lastUpdateLabel')}</IonLabel>
            <div className="settings-cache-date" slot="end">
              {formatCacheDate(cacheUpdatedAt)}
            </div>
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
