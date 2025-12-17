'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Trophy, RotateCcw, Clock, Target, ChevronLeft, ChevronRight, Volume2, VolumeX, Music, Palette, Stethoscope, Pill, Heart, AlertTriangle, FlaskConical, BookOpen, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

type Level = {
  size: number;
  name: string;
  difficulty: string;
};

const levels: Level[] = [
  { size: 3, name: 'Easy', difficulty: '3x3' },
  { size: 4, name: 'Medium', difficulty: '4x4' },
  { size: 5, name: 'Hard', difficulty: '5x5' },
];

// Sample data for games
const ayushAllopathyPairs = [
  { 
    ayush: 'Amlapitta', 
    allopathy: 'Gastritis',
    description: 'A condition characterized by increased acidity and inflammation of the stomach lining',
    ayushSymptoms: 'Heartburn, sour belching, nausea, burning sensation in chest, loss of appetite, indigestion',
    allopathySymptoms: 'Abdominal pain, bloating, nausea, vomiting, loss of appetite, feeling of fullness',
    ayushTreatment: 'Amlapittahara diet (cooling foods), Avipattikar churna, Shatavari, Amla, lifestyle modifications, avoiding spicy and sour foods',
    allopathyTreatment: 'Antacids, H2 blockers, Proton pump inhibitors, dietary changes, avoiding triggers like alcohol and NSAIDs',
    integration: 'Combining Ayurvedic cooling herbs with PPI for acute relief, while using diet and lifestyle modifications for long-term management'
  },
  { 
    ayush: 'Prameha', 
    allopathy: 'Diabetes Mellitus',
    description: 'A metabolic disorder characterized by elevated blood glucose levels due to insulin deficiency or resistance',
    ayushSymptoms: 'Excessive urination (Prabhuta mutrata), increased thirst (Trishna), sweet taste in mouth, fatigue, weight loss',
    allopathySymptoms: 'Polyuria, polydipsia, polyphagia, fatigue, blurred vision, slow healing wounds',
    ayushTreatment: 'Bitter herbs (Karela, Methi), Triphala, Gymnema, dietary restrictions, exercise (Vyayama), Panchakarma in some cases',
    allopathyTreatment: 'Metformin, Insulin, Sulfonylureas, DPP-4 inhibitors, SGLT2 inhibitors, dietary management, regular exercise',
    integration: 'Metformin with Gymnema and Karela for better glycemic control, combining modern monitoring with Ayurvedic lifestyle principles'
  },
  { 
    ayush: 'Shwasa', 
    allopathy: 'Asthma',
    description: 'A chronic respiratory condition causing difficulty in breathing due to airway inflammation and constriction',
    ayushSymptoms: 'Difficulty breathing (Shwasa krichrata), wheezing, chest tightness, cough, especially at night',
    allopathySymptoms: 'Shortness of breath, wheezing, chest tightness, coughing, especially nocturnal symptoms',
    ayushTreatment: 'Vasaka, Tulsi, Pranayama, breathing exercises, avoiding triggers, warm oil massage, steam inhalation',
    allopathyTreatment: 'Bronchodilators (Salbutamol), Inhaled corticosteroids, Leukotriene modifiers, Long-acting beta agonists, avoiding allergens',
    integration: 'Inhalers for acute attacks combined with Pranayama for long-term management, Tulsi for immune support alongside preventive medications'
  },
  { 
    ayush: 'Kasa', 
    allopathy: 'Cough',
    description: 'A reflex action to clear the airways of irritants, mucus, or foreign particles',
    ayushSymptoms: 'Dry or productive cough, throat irritation, chest discomfort, hoarseness of voice',
    allopathySymptoms: 'Dry or wet cough, throat irritation, chest pain, difficulty sleeping, fatigue',
    ayushTreatment: 'Honey with ginger, Vasaka, Licorice (Yashtimadhu), warm water gargles, steam inhalation, avoiding cold foods',
    allopathyTreatment: 'Cough suppressants, Expectorants, Antihistamines, Antibiotics if bacterial, staying hydrated, rest',
    integration: 'Modern cough syrups for immediate relief with Ayurvedic herbs like Vasaka for underlying respiratory health, honey for natural soothing'
  },
  { 
    ayush: 'Jwara', 
    allopathy: 'Fever',
    description: 'Elevated body temperature as a response to infection, inflammation, or other pathological conditions',
    ayushSymptoms: 'Increased body temperature, chills, body aches, loss of appetite, fatigue, sweating',
    allopathySymptoms: 'Elevated temperature (>37.5°C), chills, body aches, headache, fatigue, sweating, dehydration',
    ayushTreatment: 'Cooling herbs (Parpataka, Kiratatikta), rest, light diet, plenty of fluids, cooling compresses, avoiding heavy foods',
    allopathyTreatment: 'Paracetamol/Acetaminophen, Ibuprofen, Aspirin (adults), antibiotics if bacterial, rest, hydration, cooling measures',
    integration: 'Paracetamol for immediate temperature reduction with Ayurvedic cooling herbs and dietary modifications for faster recovery and immune support'
  },
  { 
    ayush: 'Arshas', 
    allopathy: 'Hemorrhoids',
    description: 'Swollen and inflamed veins in the rectum and anus causing discomfort and bleeding',
    ayushSymptoms: 'Painful defecation, bleeding, itching, swelling around anus, feeling of incomplete evacuation',
    allopathySymptoms: 'Rectal bleeding, itching, pain, swelling, prolapse, discomfort during bowel movements',
    ayushTreatment: 'Triphala, Arshoghni vati, Sitz bath with warm water, dietary fiber, avoiding constipation, Kshara karma in severe cases',
    allopathyTreatment: 'Topical creams, Sitz baths, Fiber supplements, Stool softeners, Rubber band ligation, Surgery in severe cases',
    integration: 'Topical treatments for immediate relief with Triphala for digestive health, combining surgical options when needed with Ayurvedic preventive care'
  },
  { 
    ayush: 'Kamala', 
    allopathy: 'Jaundice',
    description: 'Yellowing of skin and eyes due to elevated bilirubin levels, indicating liver dysfunction',
    ayushSymptoms: 'Yellow discoloration of skin and eyes, dark urine, pale stools, loss of appetite, fatigue, abdominal discomfort',
    allopathySymptoms: 'Jaundice (yellow skin/eyes), dark urine, pale stools, fatigue, abdominal pain, nausea, weight loss',
    ayushTreatment: 'Liver-protective herbs (Bhringraj, Kutki, Punarnava), light diet, avoiding alcohol, rest, Panchakarma in chronic cases',
    allopathyTreatment: 'Addressing underlying cause, liver function tests, medications based on etiology, dietary modifications, avoiding alcohol, rest',
    integration: 'Modern diagnostic tools to identify cause with Ayurvedic liver-protective herbs, combining allopathic treatment with holistic liver support'
  },
  { 
    ayush: 'Pandu', 
    allopathy: 'Anemia',
    description: 'A condition characterized by reduced red blood cells or hemoglobin, leading to decreased oxygen-carrying capacity',
    ayushSymptoms: 'Pale skin, fatigue, weakness, shortness of breath, dizziness, palpitations, loss of appetite',
    allopathySymptoms: 'Fatigue, weakness, pale skin, shortness of breath, dizziness, irregular heartbeat, cold hands/feet',
    ayushTreatment: 'Iron-rich herbs (Lauha bhasma, Punarnava), Amla, pomegranate, dietary modifications, avoiding incompatible foods',
    allopathyTreatment: 'Iron supplements, Vitamin B12, Folic acid, dietary changes, treating underlying cause, blood transfusion if severe',
    integration: 'Iron supplements with Ayurvedic iron-rich preparations like Lauha bhasma, combining modern hematinics with traditional iron sources'
  },
  { 
    ayush: 'Vatarakta', 
    allopathy: 'Gout',
    description: 'A form of inflammatory arthritis caused by uric acid crystal deposition in joints',
    ayushSymptoms: 'Severe joint pain, especially in big toe, swelling, redness, warmth, limited mobility, pain worse at night',
    allopathySymptoms: 'Intense joint pain, swelling, redness, warmth, tenderness, limited range of motion, often affects big toe',
    ayushTreatment: 'Guggulu, Triphala, avoiding purine-rich foods, warm oil massage, lifestyle modifications, Panchakarma',
    allopathyTreatment: 'NSAIDs, Colchicine, Allopurinol, Febuxostat, dietary restrictions, avoiding alcohol, staying hydrated',
    integration: 'NSAIDs for acute pain relief with Guggulu for long-term management, combining uric acid-lowering drugs with Ayurvedic detoxification'
  },
  { 
    ayush: 'Unmada', 
    allopathy: 'Psychosis',
    description: 'A severe mental health condition involving loss of contact with reality, hallucinations, and delusions',
    ayushSymptoms: 'Delusions, hallucinations, disorganized thinking, inappropriate behavior, social withdrawal, sleep disturbances',
    allopathySymptoms: 'Hallucinations, delusions, disorganized speech, catatonia, negative symptoms, impaired functioning',
    ayushTreatment: 'Brahmi, Shankhpushpi, Medhya rasayana, Sattvic diet, Yoga, meditation, Panchakarma, counseling',
    allopathyTreatment: 'Antipsychotic medications, Psychotherapy, Cognitive behavioral therapy, Family support, Hospitalization if needed',
    integration: 'Antipsychotic medications for symptom control with Brahmi and meditation for cognitive support, combining modern psychiatry with Ayurvedic mind-body approaches'
  },
];

const drugInteractionScenarios = [
  { id: 1, ayurvedic: 'Guggulu', allopathic: 'Warfarin', answer: 'dangerous', explanation: 'Guggulu can increase bleeding risk with anticoagulants' },
  { id: 2, ayurvedic: 'Ashwagandha', allopathic: 'Thyroid medication', answer: 'caution', explanation: 'May affect thyroid hormone levels' },
  { id: 3, ayurvedic: 'Triphala', allopathic: 'Iron supplements', answer: 'safe', explanation: 'Can be taken together with proper timing' },
  { id: 4, ayurvedic: 'Brahmi', allopathic: 'Sedatives', answer: 'caution', explanation: 'May enhance sedative effects' },
  { id: 5, ayurvedic: 'Turmeric', allopathic: 'Blood thinners', answer: 'caution', explanation: 'May increase bleeding risk' },
  { id: 6, ayurvedic: 'Amla', allopathic: 'Vitamin C supplements', answer: 'safe', explanation: 'Both are natural antioxidants' },
  { id: 7, ayurvedic: 'Shankhpushpi', allopathic: 'Antidepressants', answer: 'caution', explanation: 'May interact with serotonin levels' },
  { id: 8, ayurvedic: 'Tulsi', allopathic: 'Antibiotics', answer: 'safe', explanation: 'May support immune function' },
  { id: 9, ayurvedic: 'Arjuna', allopathic: 'Blood pressure medication', answer: 'caution', explanation: 'May enhance hypotensive effects' },
  { id: 10, ayurvedic: 'Neem', allopathic: 'Diabetes medication', answer: 'caution', explanation: 'May enhance hypoglycemic effects' },
];

const complementaryScenarios = [
  { id: 1, condition: 'Chronic Pain', options: ['A', 'B', 'C'], correct: 'A', 
    A: 'Yoga + NSAIDs + Panchakarma', B: 'Only Allopathic painkillers', C: 'Only Ayurvedic herbs' },
  { id: 2, condition: 'Diabetes Type 2', options: ['A', 'B', 'C'], correct: 'A',
    A: 'Metformin + Diet + Exercise + Triphala', B: 'Only insulin', C: 'Only herbal remedies' },
  { id: 3, condition: 'Hypertension', options: ['A', 'B', 'C'], correct: 'A',
    A: 'ACE inhibitors + Lifestyle + Arjuna', B: 'Only medication', C: 'Only meditation' },
  { id: 4, condition: 'Anxiety', options: ['A', 'B', 'C'], correct: 'A',
    A: 'SSRI + Therapy + Brahmi + Meditation', B: 'Only medication', C: 'Only herbs' },
  { id: 5, condition: 'Arthritis', options: ['A', 'B', 'C'], correct: 'A',
    A: 'NSAIDs + Physiotherapy + Guggulu', B: 'Only painkillers', C: 'Only massage' },
  { id: 6, condition: 'Insomnia', options: ['A', 'B', 'C'], correct: 'A',
    A: 'Sleep hygiene + Ashwagandha + Melatonin if needed', B: 'Only sleeping pills', C: 'Only herbs' },
  { id: 7, condition: 'Digestive Issues', options: ['A', 'B', 'C'], correct: 'A',
    A: 'PPI if needed + Diet + Triphala + Probiotics', B: 'Only antacids', C: 'Only Ayurveda' },
  { id: 8, condition: 'Skin Conditions', options: ['A', 'B', 'C'], correct: 'A',
    A: 'Topical steroids if needed + Neem + Turmeric + Diet', B: 'Only steroids', C: 'Only herbs' },
  { id: 9, condition: 'Respiratory Issues', options: ['A', 'B', 'C'], correct: 'A',
    A: 'Inhalers if needed + Pranayama + Tulsi + Steam', B: 'Only inhalers', C: 'Only breathing exercises' },
  { id: 10, condition: 'Cardiac Health', options: ['A', 'B', 'C'], correct: 'A',
    A: 'Cardiac medications + Arjuna + Exercise + Diet', B: 'Only medications', C: 'Only herbs' },
];

const viruddhaCombinations = [
  { id: 1, combination: 'Milk + Fish', incompatible: true, explanation: 'Creates toxins in the body' },
  { id: 2, combination: 'Honey + Ghee (equal)', incompatible: true, explanation: 'Incompatible proportions cause issues' },
  { id: 3, combination: 'Milk + Salt', incompatible: true, explanation: 'Causes skin problems' },
  { id: 4, combination: 'Honey + Hot water', incompatible: true, explanation: 'Creates harmful compounds' },
  { id: 5, combination: 'Curd + Milk', incompatible: true, explanation: 'Incompatible properties' },
  { id: 6, combination: 'Milk + Radish', incompatible: true, explanation: 'Causes digestive issues' },
  { id: 7, combination: 'Honey + Mustard oil', incompatible: true, explanation: 'Creates toxins' },
  { id: 8, combination: 'Milk + Sour fruits', incompatible: true, explanation: 'Causes curdling and indigestion' },
  { id: 9, combination: 'Milk + Jaggery', incompatible: false, explanation: 'Compatible combination' },
  { id: 10, combination: 'Ghee + Rice', incompatible: false, explanation: 'Compatible and nourishing' },
];

const redFlagConditions = [
  { id: 1, condition: 'Acute Myocardial Infarction', isRedFlag: true, explanation: 'Requires immediate Allopathic intervention' },
  { id: 2, condition: 'Stroke symptoms', isRedFlag: true, explanation: 'Time-sensitive, needs urgent care' },
  { id: 3, condition: 'Severe trauma', isRedFlag: true, explanation: 'Emergency medical care required' },
  { id: 4, condition: 'Acute appendicitis', isRedFlag: true, explanation: 'Surgical emergency' },
  { id: 5, condition: 'Meningitis', isRedFlag: true, explanation: 'Life-threatening, needs antibiotics' },
  { id: 6, condition: 'Chronic back pain', isRedFlag: false, explanation: 'Can benefit from integrated approach' },
  { id: 7, condition: 'Mild anxiety', isRedFlag: false, explanation: 'Suitable for complementary care' },
  { id: 8, condition: 'Type 2 Diabetes (stable)', isRedFlag: false, explanation: 'Can use integrated management' },
  { id: 9, condition: 'Acute poisoning', isRedFlag: true, explanation: 'Emergency medical intervention needed' },
  { id: 10, condition: 'Chronic fatigue', isRedFlag: false, explanation: 'Can use holistic approach' },
];

const dosageQuestions = [
  { id: 1, medicine: 'Triphala Churna', question: 'Best time to take?', options: ['A', 'B', 'C'], correct: 'A',
    A: 'Before bed with warm water', B: 'With meals', C: 'Early morning empty stomach' },
  { id: 2, medicine: 'Ashwagandha', question: 'Anupana (vehicle)?', options: ['A', 'B', 'C'], correct: 'A',
    A: 'Milk or warm water', B: 'Cold water', C: 'With tea' },
  { id: 3, medicine: 'Chyawanprash', question: 'Dosage timing?', options: ['A', 'B', 'C'], correct: 'A',
    A: 'Morning empty stomach', B: 'After dinner', C: 'Any time' },
  { id: 4, medicine: 'Brahmi', question: 'Best Anupana?', options: ['A', 'B', 'C'], correct: 'A',
    A: 'Honey or ghee', B: 'Salt water', C: 'With coffee' },
  { id: 5, medicine: 'Guggulu', question: 'Dosage frequency?', options: ['A', 'B', 'C'], correct: 'A',
    A: 'Twice daily with warm water', B: 'Once daily', C: 'Three times with meals' },
  { id: 6, medicine: 'Arjuna', question: 'Anupana?', options: ['A', 'B', 'C'], correct: 'A',
    A: 'Milk or warm water', B: 'Cold milk', C: 'With juice' },
  { id: 7, medicine: 'Amla', question: 'Best time?', options: ['A', 'B', 'C'], correct: 'A',
    A: 'Early morning empty stomach', B: 'After lunch', C: 'Before sleep' },
  { id: 8, medicine: 'Turmeric', question: 'Enhancement?', options: ['A', 'B', 'C'], correct: 'A',
    A: 'With black pepper and ghee', B: 'Plain', C: 'With salt' },
  { id: 9, medicine: 'Shankhpushpi', question: 'Anupana?', options: ['A', 'B', 'C'], correct: 'A',
    A: 'Milk or honey', B: 'Water only', C: 'With sugar' },
  { id: 10, medicine: 'Neem', question: 'Dosage timing?', options: ['A', 'B', 'C'], correct: 'A',
    A: 'Morning empty stomach with warm water', B: 'With meals', C: 'Evening' },
];

export default function PlayGame() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [board, setBoard] = useState<number[]>([]);
  const [solvedBoard, setSolvedBoard] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Game states for different tabs
  const [ayushMatches, setAyushMatches] = useState<{[key: string]: string | null}>({});
  const [drugInteractions, setDrugInteractions] = useState<{[key: number]: string | null}>({});
  const [complementaryAnswers, setComplementaryAnswers] = useState<{[key: number]: string | null}>({});
  const [viruddhaAnswers, setViruddhaAnswers] = useState<{[key: number]: boolean | null}>({});
  const [redFlagAnswers, setRedFlagAnswers] = useState<{[key: number]: boolean | null}>({});
  const [dosageAnswers, setDosageAnswers] = useState<{[key: number]: string | null}>({});
  const [expandedCards, setExpandedCards] = useState<{[key: number]: boolean}>({});

  const level = levels[currentLevel];
  const totalTiles = level.size * level.size;
  const emptyTileIndex = totalTiles - 1; // Last tile is empty

  // Initialize board
  const initializeBoard = useCallback(() => {
    const size = level.size;
    const total = size * size;
    const solved = Array.from({ length: total }, (_, i) => i);
    setSolvedBoard(solved);

    // Create shuffled board
    const shuffled = [...solved];
    do {
      // Fisher-Yates shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    } while (isSolved(shuffled) || !isSolvable(shuffled, size)); // Ensure it's solvable and not already solved

    setBoard(shuffled);
    setMoves(0);
    setTime(0);
    setIsWon(false);
    setGameOver(false);
    setGameStarted(true);
  }, [level.size]);

  // Check if board is solved
  const isSolved = (boardToCheck: number[]) => {
    return boardToCheck.every((val, idx) => val === idx);
  };

  // Check if puzzle is solvable (using inversion count)
  const isSolvable = (boardToCheck: number[], size: number) => {
    let inversions = 0;
    const emptyIndex = boardToCheck.indexOf(totalTiles - 1);
    const emptyRow = Math.floor(emptyIndex / size);

    for (let i = 0; i < boardToCheck.length; i++) {
      if (boardToCheck[i] === totalTiles - 1) continue;
      for (let j = i + 1; j < boardToCheck.length; j++) {
        if (boardToCheck[j] === totalTiles - 1) continue;
        if (boardToCheck[i] > boardToCheck[j]) inversions++;
      }
    }

    if (size % 2 === 1) {
      return inversions % 2 === 0;
    } else {
      return (inversions + size - emptyRow) % 2 === 1;
    }
  };

  // Get valid moves for a tile
  const getValidMoves = (index: number, size: number) => {
    const row = Math.floor(index / size);
    const col = index % size;
    const emptyIndex = board.indexOf(emptyTileIndex);
    const emptyRow = Math.floor(emptyIndex / size);
    const emptyCol = emptyIndex % size;

    const moves: number[] = [];
    
    // Check if adjacent to empty tile
    const isAdjacent = 
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      moves.push(emptyIndex);
    }

    return moves;
  };

  // Handle tile click
  const handleTileClick = (index: number) => {
    if (isWon || !gameStarted) return;

    const validMoves = getValidMoves(index, level.size);
    if (validMoves.length > 0) {
      const newBoard = [...board];
      const emptyIndex = validMoves[0];
      
      // Swap tiles
      [newBoard[index], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[index]];
      
      setBoard(newBoard);
      setMoves(moves + 1);

      // Check if won
      if (isSolved(newBoard)) {
        setIsWon(true);
        setGameOver(true);
      }
    }
  };

  // Timer effect
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameStarted, gameOver]);

  // Initialize on mount and level change
  useEffect(() => {
    initializeBoard();
  }, [initializeBoard]);

  // Music control functions
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          console.log('Audio play failed:', error);
        });
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsMusicPlaying(true);
    const handlePause = () => setIsMusicPlaying(false);
    const handleEnded = () => {
      // Loop the music
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const changeLevel = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentLevel > 0) {
      setCurrentLevel(currentLevel - 1);
    } else if (direction === 'next' && currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn={false} />
      
      {/* Background Music - Hidden Audio Element */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        // Replace with your music file path
        // You can add the file to public/music/ folder
        src="/music/game_bg_sound.mp3"
      />

      {/* Music Control - Floating Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2">
        <div className="bg-card border border-border rounded-lg shadow-lg p-1.5 sm:p-2 flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-7 w-7 sm:h-8 sm:w-8"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </Button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-16 sm:w-20 h-1.5 sm:h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            title="Volume"
          />
        </div>
        <Button
          onClick={toggleMusic}
          size="lg"
          variant="secondary"
          className="rounded-full shadow-lg h-12 w-12 sm:h-14 sm:w-14"
          title={isMusicPlaying ? 'Pause Music' : 'Play Music'}
        >
          {isMusicPlaying ? (
            <Music className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          ) : (
            <Music className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </Button>
      </div>

      <main className="pt-20 px-3 sm:px-4 pb-20 sm:pb-12 max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Medical Challenge Games</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Test your knowledge of Ayurvedic and Allopathic medicine integration</p>
            </div>
            <Link href="/draw-game">
              <Button variant="outline" className="gap-2">
                <Palette className="w-4 h-4" />
                Drawing Canvas
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="ayush-allopathy" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 h-auto p-2 mb-6 bg-transparent">
            <TabsTrigger 
              value="ayush-allopathy" 
              className="group flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium transition-all duration-300 rounded-lg border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-700 hover:from-cyan-100 hover:to-blue-100 hover:border-cyan-500 hover:shadow-lg hover:scale-105 data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:border-cyan-600 data-[state=active]:shadow-xl"
            >
              <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 group-data-[state=active]:text-white transition-colors duration-300" />
              <span className="hidden sm:inline">AYUSH Meets Allopathy</span>
              <span className="sm:hidden">AYUSH Match</span>
            </TabsTrigger>
            <TabsTrigger 
              value="drug-interaction" 
              className="group flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium transition-all duration-300 rounded-lg border-2 border-purple-500/30 bg-gradient-to-br from-purple-50 to-violet-50 text-purple-700 hover:from-purple-100 hover:to-violet-100 hover:border-purple-500 hover:shadow-lg hover:scale-105 data-[state=active]:from-purple-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:border-purple-600 data-[state=active]:shadow-xl"
            >
              <Pill className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 group-data-[state=active]:text-white transition-colors duration-300" />
              <span className="hidden sm:inline">Drug Interaction</span>
              <span className="sm:hidden">Drug Safety</span>
            </TabsTrigger>
            <TabsTrigger 
              value="complementary" 
              className="group flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium transition-all duration-300 rounded-lg border-2 border-pink-500/30 bg-gradient-to-br from-pink-50 to-rose-50 text-pink-700 hover:from-pink-100 hover:to-rose-100 hover:border-pink-500 hover:shadow-lg hover:scale-105 data-[state=active]:from-pink-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:border-pink-600 data-[state=active]:shadow-xl"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 group-data-[state=active]:text-white transition-colors duration-300" />
              <span className="hidden sm:inline">Complementary Manager</span>
              <span className="sm:hidden">Integration</span>
            </TabsTrigger>
            <TabsTrigger 
              value="viruddha" 
              className="group flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium transition-all duration-300 rounded-lg border-2 border-orange-500/30 bg-gradient-to-br from-orange-50 to-amber-50 text-orange-700 hover:from-orange-100 hover:to-amber-100 hover:border-orange-500 hover:shadow-lg hover:scale-105 data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:border-orange-600 data-[state=active]:shadow-xl"
            >
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 group-data-[state=active]:text-white transition-colors duration-300" />
              <span className="hidden sm:inline">Viruddha Dravya</span>
              <span className="sm:hidden">Incompatible</span>
            </TabsTrigger>
            <TabsTrigger 
              value="red-flags" 
              className="group flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium transition-all duration-300 rounded-lg border-2 border-red-500/30 bg-gradient-to-br from-red-50 to-rose-50 text-red-700 hover:from-red-100 hover:to-rose-100 hover:border-red-500 hover:shadow-lg hover:scale-105 data-[state=active]:from-red-500 data-[state=active]:to-rose-500 data-[state=active]:text-white data-[state=active]:border-red-600 data-[state=active]:shadow-xl"
            >
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 group-data-[state=active]:text-white transition-colors duration-300" />
              <span className="hidden sm:inline">Integration Red Flags</span>
              <span className="sm:hidden">Red Flags</span>
            </TabsTrigger>
            <TabsTrigger 
              value="dosage" 
              className="group flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium transition-all duration-300 rounded-lg border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-700 hover:from-emerald-100 hover:to-green-100 hover:border-emerald-500 hover:shadow-lg hover:scale-105 data-[state=active]:from-emerald-500 data-[state=active]:to-green-500 data-[state=active]:text-white data-[state=active]:border-emerald-600 data-[state=active]:shadow-xl"
            >
              <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 group-data-[state=active]:text-white transition-colors duration-300" />
              <span className="hidden sm:inline">Dosage & Timing</span>
              <span className="sm:hidden">Dosage</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tile-game" 
              className="group flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium transition-all duration-300 rounded-lg border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-700 hover:from-indigo-100 hover:to-blue-100 hover:border-indigo-500 hover:shadow-lg hover:scale-105 data-[state=active]:from-indigo-500 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:border-indigo-600 data-[state=active]:shadow-xl"
            >
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 group-data-[state=active]:text-white transition-colors duration-300" />
              <span className="hidden sm:inline">Tile Game</span>
              <span className="sm:hidden">Puzzle</span>
            </TabsTrigger>
          </TabsList>

          {/* AYUSH Meets Allopathy Tab */}
          <TabsContent value="ayush-allopathy" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Stethoscope className="w-8 h-8 text-cyan-600" />
                <div>
                  <h2 className="text-2xl font-bold">AYUSH Meets Allopathy</h2>
                  <p className="text-muted-foreground">Comprehensive comparison of Ayurvedic and Allopathic conditions with detailed descriptions</p>
                </div>
              </div>
              <div className="space-y-4">
                {ayushAllopathyPairs.map((pair, index) => {
                  const isExpanded = expandedCards[index];
                  return (
                    <Card key={index} className="p-4 border-2 border-cyan-200 hover:border-cyan-400 transition-all">
                      {/* Header Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-lg border-2 border-cyan-300">
                          <p className="text-xs font-semibold text-cyan-700 mb-1 uppercase tracking-wide">Ayurvedic Term</p>
                          <p className="text-xl font-bold text-cyan-900 mb-2">{pair.ayush}</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-300">
                          <p className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wide">Allopathic Term</p>
                          <p className="text-xl font-bold text-blue-900 mb-2">{pair.allopathy}</p>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">{pair.description}</p>
                      </div>

                      {/* Expand/Collapse Button */}
                      <Button
                        variant="ghost"
                        onClick={() => setExpandedCards({...expandedCards, [index]: !isExpanded})}
                        className="w-full justify-between mb-2 text-cyan-700 hover:text-cyan-900 hover:bg-cyan-50"
                      >
                        <span className="font-semibold">
                          {isExpanded ? 'Hide Details' : 'Show Detailed Information'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 space-y-4 border-t pt-4">
                          {/* Symptoms Comparison */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                              <h4 className="font-bold text-cyan-800 mb-2 flex items-center gap-2">
                                <Stethoscope className="w-4 h-4" />
                                Ayurvedic Symptoms
                              </h4>
                              <p className="text-sm text-cyan-900 leading-relaxed">{pair.ayushSymptoms}</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                              <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                <Stethoscope className="w-4 h-4" />
                                Allopathic Symptoms
                              </h4>
                              <p className="text-sm text-blue-900 leading-relaxed">{pair.allopathySymptoms}</p>
                            </div>
                          </div>

                          {/* Treatment Comparison */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                              <h4 className="font-bold text-cyan-800 mb-2 flex items-center gap-2">
                                <FlaskConical className="w-4 h-4" />
                                Ayurvedic Treatment
                              </h4>
                              <p className="text-sm text-cyan-900 leading-relaxed">{pair.ayushTreatment}</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                              <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                <FlaskConical className="w-4 h-4" />
                                Allopathic Treatment
                              </h4>
                              <p className="text-sm text-blue-900 leading-relaxed">{pair.allopathyTreatment}</p>
                            </div>
                          </div>

                          {/* Integration Approach */}
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                            <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                              <Heart className="w-4 h-4" />
                              Integrated Approach
                            </h4>
                            <p className="text-sm text-green-900 leading-relaxed font-medium">{pair.integration}</p>
                          </div>

                          {/* Match Indicator */}
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <span className="text-sm font-semibold text-green-700">Verified Match: {pair.ayush} ↔ {pair.allopathy}</span>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Drug Interaction Safety Check Tab */}
          <TabsContent value="drug-interaction" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Pill className="w-8 h-8 text-purple-600" />
                <div>
                  <h2 className="text-2xl font-bold">Drug Interaction Safety Check</h2>
                  <p className="text-muted-foreground">Evaluate safety of combining Ayurvedic and Allopathic drugs</p>
                </div>
              </div>
              <div className="space-y-4">
                {drugInteractionScenarios.map((scenario) => {
                  const selected = drugInteractions[scenario.id];
                  const isCorrect = selected === scenario.answer;
                  return (
                    <Card key={scenario.id} className="p-4 border-2">
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Scenario {scenario.id}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                            {scenario.ayurvedic}
                          </span>
                          <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-semibold">
                            {scenario.allopathic}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mb-3">
                        {['safe', 'caution', 'dangerous'].map((option) => {
                          const bgColor = option === 'safe' ? 'bg-green-100 hover:bg-green-200' :
                                         option === 'caution' ? 'bg-yellow-100 hover:bg-yellow-200' :
                                         'bg-red-100 hover:bg-red-200';
                          const textColor = option === 'safe' ? 'text-green-700' :
                                          option === 'caution' ? 'text-yellow-700' :
                                          'text-red-700';
                          return (
                            <Button
                              key={option}
                              variant={selected === option ? 'default' : 'outline'}
                              onClick={() => setDrugInteractions({...drugInteractions, [scenario.id]: option})}
                              className={`${bgColor} ${textColor} border-2`}
                            >
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </Button>
                          );
                        })}
                      </div>
                      {selected && (
                        <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            {isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            <span className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                              {isCorrect ? 'Correct!' : `Correct answer: ${scenario.answer}`}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{scenario.explanation}</p>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Complementary Condition Manager Tab */}
          <TabsContent value="complementary" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-8 h-8 text-pink-600" />
                <div>
                  <h2 className="text-2xl font-bold">Complementary Condition Manager</h2>
                  <p className="text-muted-foreground">Choose effective integrated management plans</p>
                </div>
              </div>
              <div className="space-y-4">
                {complementaryScenarios.map((scenario) => {
                  const selected = complementaryAnswers[scenario.id];
                  const isCorrect = selected === scenario.correct;
                  return (
                    <Card key={scenario.id} className="p-4 border-2">
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Case {scenario.id}</p>
                        <h3 className="text-lg font-bold text-pink-700 mb-3">{scenario.condition}</h3>
                        <p className="text-sm font-semibold mb-3">Select the best integrated treatment plan:</p>
                      </div>
                      <div className="space-y-2 mb-3">
                        {scenario.options.map((option) => (
                          <Button
                            key={option}
                            variant={selected === option ? 'default' : 'outline'}
                            onClick={() => setComplementaryAnswers({...complementaryAnswers, [scenario.id]: option})}
                            className={`w-full justify-start text-left h-auto py-3 ${
                              selected === option ? 'bg-pink-100 text-pink-900 border-pink-300' : ''
                            }`}
                          >
                            <span className="font-semibold mr-2">{option}:</span>
                            <span>{scenario[option as 'A' | 'B' | 'C']}</span>
                          </Button>
                        ))}
                      </div>
                      {selected && (
                        <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                          <div className="flex items-center gap-2">
                            {isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            <span className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                              {isCorrect ? 'Excellent choice! This is the best integrated approach.' : `Correct answer: ${scenario.correct} - ${scenario[scenario.correct as 'A' | 'B' | 'C']}`}
                            </span>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Viruddha Dravya Challenge Tab */}
          <TabsContent value="viruddha" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
                <div>
                  <h2 className="text-2xl font-bold">Viruddha Dravya Challenge</h2>
                  <p className="text-muted-foreground">Identify incompatible herb-food or food-food combinations</p>
                </div>
              </div>
              <div className="space-y-4">
                {viruddhaCombinations.map((item) => {
                  const selected = viruddhaAnswers[item.id];
                  const isCorrect = selected === item.incompatible;
                  return (
                    <Card key={item.id} className="p-4 border-2">
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Question {item.id}</p>
                        <h3 className="text-lg font-bold text-orange-700 mb-3">{item.combination}</h3>
                        <p className="text-sm mb-3">Is this combination incompatible (Viruddha)?</p>
                      </div>
                      <div className="flex gap-2 mb-3">
                        <Button
                          variant={selected === true ? 'default' : 'outline'}
                          onClick={() => setViruddhaAnswers({...viruddhaAnswers, [item.id]: true})}
                          className={`${selected === true ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700 border-orange-300'}`}
                        >
                          Yes, Incompatible
                        </Button>
                        <Button
                          variant={selected === false ? 'default' : 'outline'}
                          onClick={() => setViruddhaAnswers({...viruddhaAnswers, [item.id]: false})}
                          className={`${selected === false ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 border-green-300'}`}
                        >
                          No, Compatible
                        </Button>
                      </div>
                      {selected !== null && (
                        <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            {isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            <span className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                              {isCorrect ? 'Correct!' : `Incorrect. This combination is ${item.incompatible ? 'incompatible' : 'compatible'}.`}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.explanation}</p>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Integration Red Flags Tab */}
          <TabsContent value="red-flags" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <h2 className="text-2xl font-bold">Integration Red Flags</h2>
                  <p className="text-muted-foreground">Recognize dangerous conditions requiring urgent Allopathic care</p>
                </div>
              </div>
              <div className="space-y-4">
                {redFlagConditions.map((condition) => {
                  const selected = redFlagAnswers[condition.id];
                  const isCorrect = selected === condition.isRedFlag;
                  return (
                    <Card key={condition.id} className="p-4 border-2 border-red-200">
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Case {condition.id}</p>
                        <h3 className="text-lg font-bold text-red-700 mb-3">{condition.condition}</h3>
                        <p className="text-sm mb-3">Is this a red flag requiring urgent Allopathic intervention?</p>
                      </div>
                      <div className="flex gap-2 mb-3">
                        <Button
                          variant={selected === true ? 'default' : 'outline'}
                          onClick={() => setRedFlagAnswers({...redFlagAnswers, [condition.id]: true})}
                          className={`${selected === true ? 'bg-red-500 text-white' : 'bg-red-50 text-red-700 border-red-300'}`}
                        >
                          Yes, Red Flag
                        </Button>
                        <Button
                          variant={selected === false ? 'default' : 'outline'}
                          onClick={() => setRedFlagAnswers({...redFlagAnswers, [condition.id]: false})}
                          className={`${selected === false ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 border-green-300'}`}
                        >
                          No, Can Use Integrated Care
                        </Button>
                      </div>
                      {selected !== null && (
                        <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            {isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            <span className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                              {isCorrect ? 'Correct!' : `Incorrect. This is ${condition.isRedFlag ? 'a red flag' : 'not a red flag'}.`}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{condition.explanation}</p>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Dosage & Timing Expert Tab */}
          <TabsContent value="dosage" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <FlaskConical className="w-8 h-8 text-emerald-600" />
                <div>
                  <h2 className="text-2xl font-bold">Dosage & Timing Expert</h2>
                  <p className="text-muted-foreground">Test knowledge of correct Ayurvedic dosage, timing, and Anupana</p>
                </div>
              </div>
              <div className="space-y-4">
                {dosageQuestions.map((question) => {
                  const selected = dosageAnswers[question.id];
                  const isCorrect = selected === question.correct;
                  return (
                    <Card key={question.id} className="p-4 border-2">
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Question {question.id}</p>
                        <h3 className="text-lg font-bold text-emerald-700 mb-2">{question.medicine}</h3>
                        <p className="text-base font-semibold mb-3">{question.question}</p>
                      </div>
                      <div className="space-y-2 mb-3">
                        {question.options.map((option) => (
                          <Button
                            key={option}
                            variant={selected === option ? 'default' : 'outline'}
                            onClick={() => setDosageAnswers({...dosageAnswers, [question.id]: option})}
                            className={`w-full justify-start text-left h-auto py-3 ${
                              selected === option ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : ''
                            }`}
                          >
                            <span className="font-semibold mr-2">{option}:</span>
                            <span>{question[option as 'A' | 'B' | 'C']}</span>
                          </Button>
                        ))}
                      </div>
                      {selected && (
                        <div className={`p-3 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                          <div className="flex items-center gap-2">
                            {isCorrect ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                            <span className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                              {isCorrect ? 'Correct! This is the proper Ayurvedic practice.' : `Correct answer: ${question.correct} - ${question[question.correct as 'A' | 'B' | 'C']}`}
                            </span>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* Tile Game Tab */}
          <TabsContent value="tile-game" className="space-y-6">
            <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
                <h2 className="text-lg sm:text-xl font-semibold text-center sm:text-left">Level Selection</h2>
                <div className="flex items-center justify-center gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => changeLevel('prev')}
                    disabled={currentLevel === 0}
                    className="h-9 w-9 sm:h-10 sm:w-10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="text-center min-w-[150px] sm:min-w-[200px]">
                    <div className="font-semibold text-base sm:text-lg">{level.name}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{level.difficulty} Grid</div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => changeLevel('next')}
                    disabled={currentLevel === levels.length - 1}
                    className="h-9 w-9 sm:h-10 sm:w-10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Game Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <Card className="p-3 sm:p-4 text-center">
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
                  <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span className="text-xs sm:text-sm text-muted-foreground">Moves</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold">{moves}</div>
              </Card>
              <Card className="p-3 sm:p-4 text-center">
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span className="text-xs sm:text-sm text-muted-foreground">Time</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold">{formatTime(time)}</div>
              </Card>
              <Card className="p-3 sm:p-4 text-center">
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-1">
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  <span className="text-xs sm:text-sm text-muted-foreground">Level</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold">{currentLevel + 1}/{levels.length}</div>
              </Card>
            </div>

            {/* Game Board */}
            <Card className="p-3 sm:p-6 mb-4 sm:mb-6">
              <div className="flex justify-center overflow-x-auto">
                <div
                  className="grid gap-1.5 sm:gap-2 bg-muted p-2 sm:p-4 rounded-lg w-full max-w-full sm:max-w-[500px]"
                  style={{
                    gridTemplateColumns: `repeat(${level.size}, minmax(0, 1fr))`,
                  }}
                >
                  {board.map((tile, index) => {
                    const isEmpty = tile === emptyTileIndex;
                    const isAdjacent = getValidMoves(index, level.size).length > 0;

                    return (
                      <button
                        key={index}
                        onClick={() => handleTileClick(index)}
                        disabled={isEmpty || !isAdjacent || isWon}
                        className={`
                          aspect-square rounded-md sm:rounded-lg font-bold transition-all duration-200
                          ${level.size === 3 ? 'text-base sm:text-lg' :
                            level.size === 4 ? 'text-sm sm:text-base' :
                            'text-xs sm:text-sm'}
                          ${isEmpty
                            ? 'bg-transparent cursor-not-allowed'
                            : isAdjacent && !isWon
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95'
                            : 'bg-muted-foreground/20 text-foreground cursor-not-allowed opacity-60'
                          }
                          ${isWon && !isEmpty ? 'bg-green-500 text-white' : ''}
                        `}
                      >
                        {!isEmpty && tile + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Win Message */}
            {isWon && (
              <Card className="p-4 sm:p-8 mb-4 sm:mb-6 text-center bg-green-500/10 border-green-500/50">
                <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold mb-2 text-green-500">Congratulations! You Won!</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  You completed the {level.name} level in {moves} moves and {formatTime(time)}!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button onClick={initializeBoard} size="lg" className="w-full sm:w-auto">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Play Again
                  </Button>
                  {currentLevel < levels.length - 1 && (
                    <Button
                      onClick={() => {
                        setCurrentLevel(currentLevel + 1);
                      }}
                      size="lg"
                      variant="secondary"
                      className="w-full sm:w-auto"
                    >
                      Next Level
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Control Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button onClick={initializeBoard} variant="outline" size="lg" className="w-full sm:w-auto">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Game
              </Button>
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                  Back to Home
                </Button>
              </Link>
            </div>

            {/* Instructions */}
            <Card className="p-4 sm:p-6 mt-4 sm:mt-6">
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">How to Play</h3>
              <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-sm sm:text-base text-muted-foreground">
                <li>Click on any tile adjacent to the empty space to move it</li>
                <li>Arrange the tiles in numerical order from 1 to {totalTiles - 1}</li>
                <li>The empty space should be at the bottom right</li>
                <li>Try to complete the puzzle in as few moves and time as possible!</li>
              </ul>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

