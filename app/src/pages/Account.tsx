import React, { useState } from 'react';
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
  IonAlert,
} from '@ionic/react';
import './Account.scss';
import { setUsername } from '../data/user/user.actions';
import { connect } from '../data/connect';
import { RouteComponentProps } from 'react-router';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTranslation } from '../i18n';

interface OwnProps extends RouteComponentProps {}

interface StateProps {
  username?: string;
}

interface DispatchProps {
  setUsername: typeof setUsername;
}

interface AccountProps extends OwnProps, StateProps, DispatchProps {}

const Account: React.FC<AccountProps> = ({ setUsername, username }) => {
  const [showAlert, setShowAlert] = useState(false);
  const isOnline = useNetworkStatus();
  const { t } = useTranslation();

  const clicked = (text: string) => {
    console.log(`Clicked ${text}`);
  };

  return (
    <IonPage id="account-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>{t('navAccount')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {username && (
          <div className="ion-padding-top ion-text-center">
            <div
              className={`avatar-wrapper offline-resource ${isOnline ? '' : 'offline-resource--offline'}`}
            >
              {isOnline ? (
                <img
                  className="offline-resource__content"
                  src="https://www.gravatar.com/avatar?d=mm&s=140"
                  alt={t('avatarAlt')}
                />
              ) : (
                <div
                  className="avatar-placeholder offline-resource__content"
                  role="img"
                  aria-label={t('avatarAlt')}
                ></div>
              )}
              {!isOnline && (
                <div
                  className="offline-resource__overlay"
                  role="status"
                  aria-live="polite"
                >
                  {t('offlineMessage')}
                </div>
              )}
            </div>
            <h2>{username}</h2>
            <IonList inset>
              <IonItem onClick={() => clicked(t('updatePicture'))}>
                {t('updatePicture')}
              </IonItem>
              <IonItem onClick={() => setShowAlert(true)}>
                {t('changeUsername')}
              </IonItem>
              <IonItem onClick={() => clicked(t('changePassword'))}>
                {t('changePassword')}
              </IonItem>
              <IonItem routerLink="/support" routerDirection="none">
                {t('navSupport')}
              </IonItem>
              <IonItem routerLink="/logout" routerDirection="none">
                {t('navLogout')}
              </IonItem>
            </IonList>
          </div>
        )}
      </IonContent>
      <IonAlert
        isOpen={showAlert}
        header={t('changeUsername')}
        buttons={[
          t('commonCancel'),
          {
            text: t('commonOk'),
            handler: (data) => {
              setUsername(data.username);
            },
          },
        ]}
        inputs={[
          {
            type: 'text',
            name: 'username',
            value: username,
            placeholder: t('usernamePlaceholder'),
          },
        ]}
        onDidDismiss={() => setShowAlert(false)}
      />
    </IonPage>
  );
};

export default connect<OwnProps, StateProps, DispatchProps>({
  mapStateToProps: (state) => ({
    username: state.user.username,
  }),
  mapDispatchToProps: {
    setUsername,
  },
  component: Account,
});
