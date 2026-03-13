import React, { useMemo, useState } from 'react';
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
  IonCardContent,
  IonButton,
  IonIcon,
  IonText,
  IonProgressBar,
  IonAlert,
} from '@ionic/react';
import {
  cameraOutline,
  helpCircleOutline,
  searchOutline,
  refreshOutline,
  arrowBackOutline,
} from 'ionicons/icons';
import { useTranslation } from '../i18n';
import questionsData from '../data/qcm/fish_qcm_questions.json';
import baseCsv from '../data/qcm/base_fish_qcm.csv?raw';
import './Identify.scss';

type QuestionType = 'qcm' | 'multi_qcm' | 'trinary';

type Question = {
  id: string;
  column?: string;
  label: string;
  description?: string;
  type: QuestionType;
  choices: string[];
  missing_choice?: string;
  weight: number;
};

type FishRecord = {
  id: string;
  name: string;
  scientificName: string;
  traits: Record<string, string[]>;
  image: string;
};

type ScoreResult = {
  fish: FishRecord;
  score: number;
  probability: number;
};

type AnswersMap = Record<string, string[]>;

const STOP_PROBABILITY = 0.9;
const CANDIDATE_SCORE_MARGIN = 2;
const MIN_ANSWERED_QUESTIONS = 3;

const normalizeToken = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');

const toSlug = (value: string) =>
  normalizeToken(value).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const isMissingValue = (value?: string) => {
  if (!value) {
    return true;
  }
  const normalized = normalizeToken(value);
  return normalized === '' || normalized === 'nan' || normalized === '/';
};

const splitTokens = (value: string) => {
  const chunks = value.split(',');
  return chunks.flatMap((chunk) => {
    return chunk
      .split(' ou ')
      .flatMap((part) => part.split(' et '))
      .map((part) => part.trim());
  });
};

const normalizeValueTokens = (value: string, column?: string) => {
  if (isMissingValue(value)) {
    return [];
  }

  const normalized = normalizeToken(value);
  const tokens = splitTokens(value)
    .map((token) => normalizeToken(token))
    .map((token) => (token === 'non' && column === 'tache' ? 'aucune' : token))
    .filter(Boolean);

  const unique = new Set(tokens);
  if (normalized) {
    unique.add(normalized);
  }
  return Array.from(unique);
};

const parseCsvRows = (csv: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];

    if (char === '"') {
      if (inQuotes && csv[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && csv[i + 1] === '\n') {
        i += 1;
      }
      row.push(field);
      field = '';
      if (row.some((cell) => cell.trim() !== '')) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== '')) {
      rows.push(row);
    }
  }

  return rows;
};

const parseFishCsv = (csv: string): FishRecord[] => {
  const rows = parseCsvRows(csv);
  if (!rows.length) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((row, index) => {
    const record: Record<string, string> = {};
    headers.forEach((header, i) => {
      record[header] = (row[i] || '').trim();
    });

    const name = record.espece_nom || `Poisson ${index + 1}`;
    const scientificName = record.nom_scientifique || name;
    const traits: Record<string, string[]> = {};

    headers.forEach((header) => {
      traits[header] = normalizeValueTokens(record[header], header);
    });

    return {
      id: scientificName,
      name,
      scientificName,
      traits,
      image: `/assets/img/qcm/${toSlug(scientificName)}.svg`,
    };
  });
};

const computeScores = (
  fishList: FishRecord[],
  questions: Question[],
  answers: AnswersMap
): ScoreResult[] => {
  const scored = fishList.map((fish) => {
    let score = 0;

    questions.forEach((question) => {
      const answer = answers[question.id];
      if (!answer || answer.length === 0) {
        return;
      }
      const column = question.column || question.id;
      const fishTokens = fish.traits[column] || [];
      if (fishTokens.length === 0) {
        return;
      }
      const matched = answer.some((userToken) =>
        fishTokens.some(
          (fishToken) =>
            fishToken === userToken ||
            fishToken.includes(userToken) ||
            userToken.includes(fishToken)
        )
      );
      score += matched ? question.weight : -question.weight;
    });

    return { fish, score, probability: 0 };
  });

  const maxScore = Math.max(...scored.map((result) => result.score), 0);
  const expScores = scored.map((result) =>
    Math.exp(result.score - maxScore)
  );
  const total = expScores.reduce((sum, value) => sum + value, 0) || 1;

  return scored
    .map((result, index) => ({
      ...result,
      probability: expScores[index] / total,
    }))
    .sort((a, b) => b.probability - a.probability);
};

const getQuestionChoices = (question: Question) => {
  const choices = [...question.choices];
  const missingChoice = question.missing_choice || 'inconnu';
  const normalizedChoices = choices.map((choice) => normalizeToken(choice));
  if (!normalizedChoices.includes(normalizeToken(missingChoice))) {
    choices.push(missingChoice);
  }
  return choices;
};

const normalizeAnswerTokens = (question: Question, values: Array<string | null | undefined>) => {
  const missingChoice = normalizeToken(question.missing_choice || 'inconnu');
  return values
    .filter((value): value is string => typeof value === 'string')
    .map((value) => normalizeToken(value))
    .map((value) =>
      value === 'non' && question.id === 'tache' ? 'aucune' : value
    )
    .filter((value) => value && value !== missingChoice);
};

const Identify: React.FC = () => {
  const { t } = useTranslation();
  const questions = useMemo(
    () => questionsData.questions as Question[],
    []
  );
  const fishList = useMemo(() => parseFishCsv(baseCsv), []);

  const [mode, setMode] = useState<'choice' | 'qcm' | 'result'>('choice');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersMap>({});
  const [draftMulti, setDraftMulti] = useState<string[]>([]);
  const [showPhotoAlert, setShowPhotoAlert] = useState(false);

  const question = questions[currentIndex];
  const progressValue =
    questions.length > 0 ? (currentIndex + 1) / questions.length : 0;

  const results = useMemo(
    () => computeScores(fishList, questions, answers),
    [fishList, questions, answers]
  );

  const startQuestions = () => {
    setMode('qcm');
    setCurrentIndex(0);
    setAnswers({});
    setDraftMulti([]);
  };

  const backToChoices = () => {
    setMode('choice');
    setCurrentIndex(0);
    setAnswers({});
    setDraftMulti([]);
  };

  const submitAnswer = (values: string[]) => {
    if (!question) {
      return;
    }
    const nextAnswers = {
      ...answers,
      [question.id]: normalizeAnswerTokens(question, values),
    };
    setAnswers(nextAnswers);

    const nextResults = computeScores(fishList, questions, nextAnswers);
    const topScore = nextResults[0]?.score ?? 0;
    const topProbability = nextResults[0]?.probability ?? 0;
    const candidateCount = nextResults.filter(
      (result) => result.score >= topScore - CANDIDATE_SCORE_MARGIN
    ).length;
    const answeredCount = Object.values(nextAnswers).filter(
      (value) => value.length > 0
    ).length;
    const canStopEarly = answeredCount >= MIN_ANSWERED_QUESTIONS;

    const isLastQuestion = currentIndex >= questions.length - 1;
    if (
      isLastQuestion ||
      (canStopEarly &&
        (topProbability >= STOP_PROBABILITY || candidateCount <= 3))
    ) {
      setMode('result');
      return;
    }

    setCurrentIndex((index) => index + 1);
    setDraftMulti([]);
  };

  const toggleMultiChoice = (choice: string, checked: boolean) => {
    setDraftMulti((prev) => {
      if (checked) {
        return Array.from(new Set([...prev, choice]));
      }
      return prev.filter((value) => value !== choice);
    });
  };

  const topResults = results.slice(0, 3);
  const showNoMatch =
    topResults.length > 0 && (topResults[0]?.probability || 0) < 0.5;

  return (
    <IonPage id="identify-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonTitle>{t('identifyTitle')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {mode === 'choice' && (
          <div className="identify-options">
            <IonCard className="identify-card">
              <IonCardHeader>
                <IonCardTitle>{t('identifyPhotoTitle')}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p>{t('identifyPhotoDescription')}</p>
                <IonButton
                  expand="block"
                  onClick={() => setShowPhotoAlert(true)}
                >
                  <IonIcon slot="start" icon={cameraOutline} />
                  {t('identifyPhotoTitle')}
                </IonButton>
              </IonCardContent>
            </IonCard>

            <IonCard className="identify-card">
              <IonCardHeader>
                <IonCardTitle>{t('identifyQuestionsTitle')}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p>{t('identifyQuestionsDescription')}</p>
                <IonButton expand="block" onClick={startQuestions}>
                  <IonIcon slot="start" icon={helpCircleOutline} />
                  {t('identifyStart')}
                </IonButton>
              </IonCardContent>
            </IonCard>
          </div>
        )}

        {mode === 'qcm' && question && (
          <div className="identify-qcm">
            <IonProgressBar value={progressValue}></IonProgressBar>
            <IonText color="medium" className="identify-counter">
              {t('identifyQuestionCounter', {
                current: currentIndex + 1,
                total: questions.length,
              })}
            </IonText>
            <h2 className="identify-question">{question.label}</h2>
            {question.description && (
              <p className="identify-description">{question.description}</p>
            )}

            {question.type === 'multi_qcm' ? (
              <div className="identify-choices" key={question.id}>
                {getQuestionChoices(question)
                  .filter(
                    (choice) =>
                      normalizeToken(choice) !==
                      normalizeToken(question.missing_choice || 'inconnu')
                  )
                  .map((choice) => (
                    <label
                      key={`${question.id}-${choice}`}
                      className="identify-choice identify-choice--multi"
                    >
                      <input
                        type="checkbox"
                        checked={draftMulti.includes(choice)}
                        onChange={(event) =>
                          toggleMultiChoice(choice, event.target.checked)
                        }
                      />
                      <span>{choice}</span>
                    </label>
                  ))}
              </div>
            ) : (
              <div className="identify-choices" key={question.id}>
                {getQuestionChoices(question).map((choice) => (
                  <button
                    key={`${question.id}-${choice}`}
                    onClick={() => submitAnswer([choice])}
                    className="identify-choice identify-choice--button"
                    type="button"
                  >
                    <span>{choice}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="identify-actions">
              {question.type === 'multi_qcm' && (
                <IonButton
                  expand="block"
                  onClick={() => submitAnswer(draftMulti)}
                >
                  <IonIcon slot="start" icon={searchOutline} />
                  {t('identifyContinue')}
                </IonButton>
              )}
              <IonButton fill="clear" onClick={backToChoices}>
                <IonIcon slot="start" icon={arrowBackOutline} />
                {t('identifyBack')}
              </IonButton>
            </div>
          </div>
        )}
        {mode === 'qcm' && !question && (
          <div className="identify-qcm">
            <IonText color="medium">{t('identifyQuestionMissing')}</IonText>
            <div className="identify-actions">
              <IonButton expand="block" onClick={backToChoices}>
                {t('identifyBack')}
              </IonButton>
            </div>
          </div>
        )}

        {mode === 'result' && (
          <div className="identify-results">
            <div>
              <h2 className="identify-results__title">
                {t('identifyResultsTitle')}
              </h2>
              <p className="identify-results__intro">
                {showNoMatch
                  ? t('identifyNoMatch')
                  : t('identifyCandidatesTitle')}
              </p>
            </div>

            <div className="identify-results__grid">
              {topResults.map((result) => (
                <IonCard key={result.fish.id} className="identify-result-card">
                  <div className="identify-result-media">
                    <img
                      src={result.fish.image}
                      alt={result.fish.name}
                      loading="lazy"
                    />
                  </div>
                  <IonCardHeader>
                    <IonCardTitle>{result.fish.name}</IonCardTitle>
                    <IonCardSubtitle>
                      {result.fish.scientificName}
                    </IonCardSubtitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonText color="medium" className="identify-confidence">
                      {Math.round(result.probability * 100)}%
                    </IonText>
                  </IonCardContent>
                </IonCard>
              ))}
            </div>

            <div className="identify-results__actions">
              <IonButton expand="block" onClick={startQuestions}>
                <IonIcon slot="start" icon={refreshOutline} />
                {t('identifyRestart')}
              </IonButton>
              <IonButton expand="block" fill="outline" onClick={backToChoices}>
                {t('identifyBack')}
              </IonButton>
            </div>
          </div>
        )}
      </IonContent>
      <IonAlert
        isOpen={showPhotoAlert}
        header={t('identifyPhotoTitle')}
        message={t('identifyPhotoUnavailable')}
        buttons={[t('commonOk')]}
        onDidDismiss={() => setShowPhotoAlert(false)}
      />
    </IonPage>
  );
};

export default Identify;
