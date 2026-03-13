import React, { useRef } from 'react';
import {
  IonItemSliding,
  IonItem,
  IonLabel,
  IonItemOptions,
  IonItemOption,
  AlertButton,
  useIonToast,
} from '@ionic/react';
import { Session } from '../models/Schedule';
import { useTranslation } from '../i18n';

interface SessionListItemProps {
  session: Session;
  listType: 'all' | 'favorites';
  onAddFavorite: (id: number) => void;
  onRemoveFavorite: (id: number) => void;
  onShowAlert: (
    header: string,
    message: string,
    buttons: AlertButton[]
  ) => void;
  isFavorite: boolean;
}

const SessionListItem: React.FC<SessionListItemProps> = ({
  isFavorite,
  onAddFavorite,
  onRemoveFavorite,
  onShowAlert,
  session,
  listType,
}) => {
  const [presentToast] = useIonToast();
  const ionItemSlidingRef = useRef<HTMLIonItemSlidingElement>(null);
  const { t } = useTranslation();

  const dismissAlert = () => {
    ionItemSlidingRef.current && ionItemSlidingRef.current.close();
  };

  const removeFavoriteSession = (title: string) => {
    onAddFavorite(session.id);
    onShowAlert(
      title,
      t('removeFavoritePrompt'),
      [
        {
          text: t('commonCancel'),
          handler: dismissAlert,
        },
        {
          text: t('commonRemove'),
          handler: () => {
            onRemoveFavorite(session.id);
            dismissAlert();
          },
        },
      ]
    );
  };

  const addFavoriteSession = async () => {
    if (isFavorite) {
      // Prompt to remove favorite
      removeFavoriteSession(t('favoriteAlreadyAdded'));
    } else {
      // Add as a favorite
      onAddFavorite(session.id);

      // Close the open item
      ionItemSlidingRef.current && ionItemSlidingRef.current.close();

      // Create a toast
      presentToast({
        message: t('favoriteAddedToast', { name: session.name }),
        duration: 3000,
        buttons: [
          {
            text: t('commonClose'),
            role: 'cancel',
          },
        ],
      });
    }
  };

  return (
    <IonItemSliding
      ref={ionItemSlidingRef}
      class={'track-' + session.tracks[0].toLowerCase()}
    >
      <IonItem routerLink={`/tabs/schedule/${session.id}`}>
        <IonLabel>
          <h3>{session.name}</h3>
          <p>
            {session.timeStart} &mdash;&nbsp;
            {session.timeEnd}:&nbsp;
            {session.location}
          </p>
        </IonLabel>
      </IonItem>
      <IonItemOptions>
        {listType === 'favorites' ? (
        <IonItemOption
          color="danger"
          onClick={() => removeFavoriteSession(t('removeFavoriteTitle'))}
        >
          {t('commonRemove')}
        </IonItemOption>
      ) : (
        <IonItemOption color="favorite" onClick={addFavoriteSession}>
          {t('commonFavorite')}
        </IonItemOption>
      )}
      </IonItemOptions>
    </IonItemSliding>
  );
};

export default React.memo(SessionListItem);
