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
  IonCardContent,
  IonButton,
  IonIcon,
  IonText,
  IonProgressBar,
  IonAlert,
  IonModal,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/react';
import {
  cameraOutline,
  helpCircleOutline,
  searchOutline,
  refreshOutline,
  arrowBackOutline,
  closeOutline,
  chevronBackOutline,
  chevronForwardOutline,
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

type SpeciesDetails = {
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

type ScoreResult = {
  fish: FishRecord;
  score: number;
  probability: number;
};

type AnswersMap = Record<string, string[]>;

type SheetSpecies = {
  name?: string;
  latin_name?: string;
  appellation_speciale?: string;
  code_fao?: string;
  taille_minimale?: string;
  obligation_de_debarquement?: string;
  textes_reglementaires?: string;
  autre?: string;
  description?: string;
  habitat?: string;
  diet?: string;
  period?: string;
  image?: string;
};

const STOP_PROBABILITY = 0.9;
const CANDIDATE_SCORE_MARGIN = 2;
const MIN_ANSWERED_QUESTIONS = 3;
const DEFAULT_IMAGE = '/assets/img/fish/fish-hero.svg';

const normalizeToken = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');

const toSlug = (value: string) =>
  normalizeToken(value).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const cleanText = (value?: string | null) =>
  typeof value === 'string' ? value.replace(/\r\n/g, '\n').trim() : '';

const normalizeSize = (value?: string | null) => {
  const cleaned = cleanText(value);
  if (!cleaned) return 'Taille à compléter.';
  return cleaned.replace(/(\d)(cm)/gi, '$1 cm').replace(/\s+/g, ' ').trim();
};

const buildRegulation = (
  textes?: string | null,
  obligation?: string | null,
  autre?: string | null
) => {
  const parts: string[] = [];
  const cleanedTextes = cleanText(textes);
  if (cleanedTextes) {
    parts.push(`Textes applicables :\n${cleanedTextes}`);
  }
  const cleanedObligation = cleanText(obligation);
  if (cleanedObligation) {
    parts.push(`Obligation de débarquement : ${cleanedObligation}`);
  }
  const cleanedAutre = cleanText(autre);
  if (cleanedAutre) {
    parts.push(`Autre :\n${cleanedAutre}`);
  }
  return parts.length > 0 ? parts.join('\n\n') : 'Réglementation à compléter.';
};

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
  const [speciesDetails, setSpeciesDetails] = useState<SpeciesDetails[]>([]);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [activeResultIndex, setActiveResultIndex] = useState(0);

  const question = questions[currentIndex];
  const progressValue =
    questions.length > 0 ? (currentIndex + 1) / questions.length : 0;

  const results = useMemo(
    () => computeScores(fishList, questions, answers),
    [fishList, questions, answers]
  );

  useEffect(() => {
    let isMounted = true;

    const loadSheet = async () => {
      try {
        const response = await fetch('/assets/sheet.json', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`Failed to load sheet.json (${response.status})`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('sheet.json payload is not an array');
        }
        const mapped = data
          .map((row: SheetSpecies) => {
            const name = cleanText(row.name);
            const latinName = cleanText(row.latin_name);
            if (!name || !latinName) {
              return null;
            }
            const description = cleanText(row.description);
            const habitat = cleanText(row.habitat);
            const diet = cleanText(row.diet);
            const period = cleanText(row.period);

            return {
              name,
              latinName,
              image: cleanText(row.image) || DEFAULT_IMAGE,
              description:
                description || `Fiche descriptive de ${name} à compléter.`,
              habitat: habitat || 'Habitat à compléter.',
              size: normalizeSize(row.taille_minimale),
              diet: diet || 'Régime alimentaire à compléter.',
              period: period || 'Période de présence à compléter.',
              regulation: buildRegulation(
                row.textes_reglementaires ?? null,
                row.obligation_de_debarquement ?? null,
                row.autre ?? null
              ),
            };
          })
          .filter((entry): entry is SpeciesDetails => Boolean(entry));

        if (mapped.length > 0 && isMounted) {
          setSpeciesDetails(mapped);
        }
      } catch (error) {
        console.warn('Unable to load sheet.json, using fallback data.', error);
      }
    };

    loadSheet();

    return () => {
      isMounted = false;
    };
  }, []);

  const speciesDetailsMap = useMemo(() => {
    const map = new Map<string, SpeciesDetails>();
    speciesDetails.forEach((entry) => {
      map.set(toSlug(entry.latinName), entry);
      map.set(toSlug(entry.name), entry);
    });
    return map;
  }, [speciesDetails]);

  const resolveSpeciesDetails = (fish: FishRecord): SpeciesDetails => {
    const latinKey = toSlug(fish.scientificName || '');
    const nameKey = toSlug(fish.name || '');
    return (
      speciesDetailsMap.get(latinKey) ||
      speciesDetailsMap.get(nameKey) || {
        name: fish.name,
        latinName: fish.scientificName || fish.name,
        image: fish.image || DEFAULT_IMAGE,
        description: `Fiche descriptive de ${fish.name} à compléter.`,
        habitat: 'Habitat à compléter.',
        size: 'Taille à compléter.',
        diet: 'Régime alimentaire à compléter.',
        period: 'Période de présence à compléter.',
        regulation: 'Réglementation à compléter.',
      }
    );
  };

  const resolveResultImage = (fish: FishRecord) => {
    const latinKey = toSlug(fish.scientificName || '');
    const nameKey = toSlug(fish.name || '');
    return (
      speciesDetailsMap.get(latinKey)?.image ||
      speciesDetailsMap.get(nameKey)?.image ||
      fish.image ||
      DEFAULT_IMAGE
    );
  };

  const startQuestions = () => {
    setMode('qcm');
    setCurrentIndex(0);
    setAnswers({});
    setDraftMulti([]);
    setIsResultModalOpen(false);
  };

  const backToChoices = () => {
    setMode('choice');
    setCurrentIndex(0);
    setAnswers({});
    setDraftMulti([]);
    setIsResultModalOpen(false);
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
  const activeResult = topResults[activeResultIndex];
  const activeDetails = activeResult
    ? resolveSpeciesDetails(activeResult.fish)
    : null;
  const activePercent = activeResult
    ? Math.round(activeResult.probability * 100)
    : 0;
  const showNoMatch =
    topResults.length > 0 && (topResults[0]?.probability || 0) < 0.5;

  useEffect(() => {
    if (activeResultIndex >= topResults.length) {
      setActiveResultIndex(0);
    }
  }, [activeResultIndex, topResults.length]);

  const openResultModal = (index: number) => {
    setActiveResultIndex(index);
    setIsResultModalOpen(true);
  };

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
              {topResults.map((result, index) => (
                <IonCard
                  key={result.fish.id}
                  className="identify-result-card"
                  role="button"
                  tabIndex={0}
                  onClick={() => openResultModal(index)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openResultModal(index);
                    }
                  }}
                >
                  <div className="identify-result-media">
                    <img
                      src={resolveResultImage(result.fish)}
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

            <IonModal
              isOpen={isResultModalOpen}
              onDidDismiss={() => setIsResultModalOpen(false)}
              className="identify-species-modal"
            >
              <IonHeader>
                <IonToolbar>
                  <IonTitle>
                    {activeDetails?.name || t('speciesDetailsTitle')}
                    {activeDetails ? ` (${activePercent}%)` : ''}
                  </IonTitle>
                  <IonButtons slot="end">
                    <IonButton onClick={() => setIsResultModalOpen(false)}>
                      <IonIcon slot="icon-only" icon={closeOutline} />
                    </IonButton>
                  </IonButtons>
                </IonToolbar>
              </IonHeader>
              <IonContent className="identify-species-modal__content">
                {activeDetails && (
                  <div className="identify-species-modal__body">
                    <div className="identify-species-header">
                      <img src={activeDetails.image} alt={activeDetails.name} />
                      <h2>{activeDetails.name}</h2>
                      <IonText color="medium">
                        <p className="identify-species-latin">
                          {activeDetails.latinName}
                        </p>
                      </IonText>
                      <p className="identify-species-description">
                        {activeDetails.description}
                      </p>
                    </div>
                    <IonList inset>
                      <IonItem>
                        <IonLabel>{t('speciesHabitatLabel')}</IonLabel>
                        <IonText slot="end">{activeDetails.habitat}</IonText>
                      </IonItem>
                      <IonItem>
                        <IonLabel>{t('speciesSizeLabel')}</IonLabel>
                        <IonText slot="end">{activeDetails.size}</IonText>
                      </IonItem>
                      <IonItem>
                        <IonLabel>{t('speciesDietLabel')}</IonLabel>
                        <IonText slot="end">{activeDetails.diet}</IonText>
                      </IonItem>
                      <IonItem>
                        <IonLabel>{t('speciesPeriodLabel')}</IonLabel>
                        <IonText slot="end">{activeDetails.period}</IonText>
                      </IonItem>
                    </IonList>
                    <div className="identify-species-regulation">
                      <h3 className="identify-species-regulation__title">
                        {t('speciesRegulationLabel')}
                      </h3>
                      <p className="identify-species-regulation__text">
                        {activeDetails.regulation}
                      </p>
                    </div>
                    <div className="identify-species-modal__nav">
                      <IonButton
                        fill="clear"
                        onClick={() =>
                          setActiveResultIndex((index) => Math.max(0, index - 1))
                        }
                        disabled={activeResultIndex === 0}
                      >
                        <IonIcon slot="start" icon={chevronBackOutline} />
                        {t('commonPrevious')}
                      </IonButton>
                      <IonButton
                        fill="clear"
                        onClick={() =>
                          setActiveResultIndex((index) =>
                            Math.min(topResults.length - 1, index + 1)
                          )
                        }
                        disabled={activeResultIndex >= topResults.length - 1}
                      >
                        {t('commonNext')}
                        <IonIcon slot="end" icon={chevronForwardOutline} />
                      </IonButton>
                    </div>
                  </div>
                )}
              </IonContent>
            </IonModal>
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
