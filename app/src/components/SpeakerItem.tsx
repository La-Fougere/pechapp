import React from 'react';
import { Session } from '../models/Schedule';
import { Speaker } from '../models/Speaker';
import {
  IonCard,
  IonCardHeader,
  IonItem,
  IonLabel,
  IonAvatar,
  IonCardContent,
  IonList,
} from '@ionic/react';
import { useTranslation } from '../i18n';

interface SpeakerItemProps {
  speaker: Speaker;
  sessions: Session[];
}

const SpeakerItem: React.FC<SpeakerItemProps> = ({ speaker, sessions }) => {
  const { t } = useTranslation();

  return (
    <>
      <IonCard className="speaker-card">
        <IonCardHeader>
          <IonItem
            button
            detail={false}
            lines="none"
            className="speaker-item"
            routerLink={`/tabs/speakers/${speaker.id}`}
          >
            <IonAvatar slot="start">
              <img src={speaker.profilePic} alt={t('speakerProfilePicAlt')} />
            </IonAvatar>
            <IonLabel>
              <h2>{speaker.name}</h2>
              <p>{speaker.title}</p>
            </IonLabel>
          </IonItem>
        </IonCardHeader>

        <IonCardContent>
          <IonList lines="none">
            {sessions.map((session) => (
              <IonItem
                detail={false}
                routerLink={`/tabs/speakers/sessions/${session.id}`}
                key={session.name}
              >
                <IonLabel>
                  <h3>{session.name}</h3>
                </IonLabel>
              </IonItem>
            ))}
            <IonItem detail={false} routerLink={`/tabs/speakers/${speaker.id}`}>
              <IonLabel>
                <h3>{t('aboutSpeaker', { name: speaker.name })}</h3>
              </IonLabel>
            </IonItem>
          </IonList>
        </IonCardContent>
      </IonCard>
    </>
  );
};

export default SpeakerItem;
