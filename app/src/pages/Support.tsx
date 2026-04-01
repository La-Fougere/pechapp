import React, { useState } from 'react';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonPage,
  IonButtons,
  IonMenuButton,
  IonRow,
  IonCol,
  IonButton,
  IonTextarea,
  IonIcon,
  useIonToast,
} from '@ionic/react';
import { informationCircleOutline } from 'ionicons/icons';
import './Support.scss';
import { connect } from '../data/connect';
import { useTranslation } from '../i18n';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const SUPPORT_ENDPOINT = '/webhook.php';

interface StateProps {
  darkMode: boolean;
}

const Support: React.FC<StateProps> = ({ darkMode }) => {
  const [present] = useIonToast();
  const [supportMessage, setSupportMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const isOnline = useNetworkStatus();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const trimmedMessage = supportMessage.trim();
    if (!trimmedMessage || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(SUPPORT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Support webhook failed: ${response.status}`);
      }

      setSupportMessage('');
      setSubmitted(false);
      present({
        message: t('supportRequestSent'),
        duration: 3000,
      });
    } catch (error) {
      console.error('Support request failed', error);
      present({
        message: t('supportRequestFailed'),
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonPage id="support-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>{t('navSupport')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {!isOnline && (
          <div
            className={`offline-banner offline-banner--offline ${darkMode ? 'offline-banner--dark' : ''}`}
            role="status"
            aria-live="polite"
          >
            <IonIcon className="offline-banner__icon" icon={informationCircleOutline} />
            <div className="offline-banner__text">
              {t('offlineBannerMessage')}
            </div>
          </div>
        )}
        <div className="support-logo">
          <img src="/assets/img/appicon.svg" alt={t('ionicLogoAlt')} />
        </div>

        <div className="support-form">
          <form onSubmit={submit} noValidate>
            <IonTextarea
              label={t('supportMessageLabel')}
              labelPlacement="stacked"
              fill="solid"
              value={supportMessage}
              name="supportQuestion"
              rows={6}
              errorText={
                submitted && !supportMessage
                  ? t('supportMessageRequired')
                  : ''
              }
              onIonInput={(e) => setSupportMessage(e.detail.value!)}
              required
            />

            <IonRow>
              <IonCol>
                <IonButton expand="block" type="submit" disabled={isSubmitting}>
                  {t('commonSubmit')}
                </IonButton>
              </IonCol>
            </IonRow>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default connect<{}, StateProps, {}>({
  mapStateToProps: (state) => ({
    darkMode: state.user.darkMode,
  }),
  component: Support,
});
