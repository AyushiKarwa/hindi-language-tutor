/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Course } from '../types';

export const COURSES: Course[] = [
  {
    id: 'c-beginner',
    title: 'Hindi Beginner Basics',
    description: 'Learn the Hindi Alphabet (Devanagari), Vowels (Swar), Consonants (Vyanjan), and basic pronunciation.',
    category: 'Beginner',
    lessons: [
      {
        id: 'l-alphabet',
        courseId: 'c-beginner',
        title: 'Hindi Alphabet (वर्णमाला)',
        description: 'An introduction to the beautiful Devanagari script used to write Hindi.',
        xpReward: 30,
        coinsReward: 10,
        exercises: [
          {
            id: 'ex-al-1',
            type: 'flashcard',
            question: 'Learn the first vowel of Devanagari script.',
            hindiQuestion: 'अ',
            audioText: 'अ',
            hint: 'Pronounced as the "a" in "about" or "agree".',
            options: [],
            correctAnswer: 'a'
          },
          {
            id: 'ex-al-2',
            type: 'multiple-choice',
            question: 'What is the english roman transliteration for the vowel "अ"?',
            hindiQuestion: 'अ',
            audioText: 'अ',
            options: ['a', 'aa', 'i', 'ee'],
            correctAnswer: 'a',
            explanation: 'The letter "अ" is the short "a" sound, transliterated as "a".'
          },
          {
            id: 'ex-al-3',
            type: 'matching',
            question: 'Match the Devanagari vowels to their Roman representations.',
            pairs: [
              { hindi: 'अ', english: 'a' },
              { hindi: 'आ', english: 'aa' },
              { hindi: 'इ', english: 'i' },
              { hindi: 'ई', english: 'ee' }
            ],
            correctAnswer: 'अ:a,आ:aa,इ:i,ई:ee'
          },
          {
            id: 'ex-al-4',
            type: 'speaking',
            question: 'Speak the vowel aloud into your microphone.',
            hindiQuestion: 'अ',
            audioText: 'अ',
            correctAnswer: 'a',
            hint: 'Say "uh" like the "a" in "agree".'
          },
          {
            id: 'ex-al-5',
            type: 'writing',
            question: 'Type the english transliteration for "आ" (Long vowel "aa").',
            hindiQuestion: 'आ',
            audioText: 'आ',
            correctAnswer: 'aa',
            hint: 'It sounds like "a" in "father".'
          }
        ]
      },
      {
        id: 'l-swar',
        courseId: 'c-beginner',
        title: 'Swar - Vowels (स्वर)',
        description: 'Explore Hindi vowels in depth and how they form sounds.',
        xpReward: 35,
        coinsReward: 12,
        exercises: [
          {
            id: 'ex-sw-1',
            type: 'flashcard',
            question: 'Learn Vowels "उ" and "ऊ".',
            hindiQuestion: 'उ',
            audioText: 'उ',
            hint: 'उ sounds like "u" in "put". ऊ sounds like "oo" in "boot".',
            options: [],
            correctAnswer: 'u'
          },
          {
            id: 'ex-sw-2',
            type: 'multiple-choice',
            question: 'Which of these is the long vowel sound of "oo" as in "boot"?',
            options: ['इ', 'ई', 'उ', 'ऊ'],
            correctAnswer: 'ऊ',
            explanation: 'ऊ is the long vowel, similar to "oo" in "boot".'
          },
          {
            id: 'ex-sw-3',
            type: 'translation',
            question: 'Translate the word "Imli" (Tamarind) vowel starter. Which letter starts "इमली"?',
            hindiQuestion: 'इमली',
            audioText: 'इमली',
            options: ['अ', 'इ', 'उ', 'ऋ'],
            correctAnswer: 'इ',
            explanation: 'Imli starts with the short "i" sound, represented by "इ".'
          },
          {
            id: 'ex-sw-4',
            type: 'speaking',
            question: 'Pronounce the word for Vowel - Swar.',
            hindiQuestion: 'स्वर',
            audioText: 'स्वर',
            correctAnswer: 'swar',
            hint: 'Say "Swar".'
          }
        ]
      },
      {
        id: 'l-vyanjan',
        courseId: 'c-beginner',
        title: 'Vyanjan - Consonants (व्यंजन)',
        description: 'Learn Hindi consonants starting from the Ka-varg (क वर्ग).',
        xpReward: 40,
        coinsReward: 15,
        exercises: [
          {
            id: 'ex-vy-1',
            type: 'flashcard',
            question: 'Learn the first consonant of Devanagari script.',
            hindiQuestion: 'क',
            audioText: 'क',
            hint: 'Pronounced as the "k" in "kite".',
            options: [],
            correctAnswer: 'ka'
          },
          {
            id: 'ex-vy-2',
            type: 'multiple-choice',
            question: 'What is the Devanagari consonant for "Kh" sound as in "Khan"?',
            options: ['क', 'ख', 'ग', 'घ'],
            correctAnswer: 'ख',
            explanation: 'The letter "ख" represents the aspirated "kh" sound.'
          },
          {
            id: 'ex-vy-3',
            type: 'matching',
            question: 'Match the consonants with their roman transliteration.',
            pairs: [
              { hindi: 'क', english: 'ka' },
              { hindi: 'ख', english: 'kha' },
              { hindi: 'ग', english: 'ga' },
              { hindi: 'घ', english: 'gha' }
            ],
            correctAnswer: 'क:ka,ख:kha,ग:ga,घ:gha'
          },
          {
            id: 'ex-vy-4',
            type: 'writing',
            question: 'Type the letter corresponding to the sound "ga" in Devnagari (क, ख, ग, घ).',
            correctAnswer: 'ग',
            hint: 'Ga as in "gate" is written as ग.'
          }
        ]
      }
    ]
  },
  {
    id: 'c-vocabulary',
    title: 'Basic Vocabulary (शब्दावली)',
    description: 'Master daily vocabulary for family, greetings, food, animals, colors, and numbers.',
    category: 'Basic',
    lessons: [
      {
        id: 'l-greetings',
        courseId: 'c-vocabulary',
        title: 'Greetings & Introductions',
        description: 'Learn standard greetings like Namaste and basic introductions.',
        xpReward: 30,
        coinsReward: 10,
        exercises: [
          {
            id: 'ex-gr-1',
            type: 'flashcard',
            question: 'Welcome and Hello in Hindi.',
            hindiQuestion: 'नमस्ते',
            audioText: 'नमस्ते',
            hint: 'Namaste - The most common formal greeting in India.',
            options: [],
            correctAnswer: 'Namaste'
          },
          {
            id: 'ex-gr-2',
            type: 'multiple-choice',
            question: 'How do you say "Thank You" in Hindi?',
            options: ['नमस्ते (Namaste)', 'धन्यवाद (Dhanyavaad)', 'अलविदा (Alvida)', 'सुप्रभात (Suprabhaat)'],
            correctAnswer: 'धन्यवाद (Dhanyavaad)',
            explanation: 'धन्यवाद (Dhanyavaad) means "Thank you".'
          },
          {
            id: 'ex-gr-3',
            type: 'sentence-building',
            question: 'Construct the sentence "My name is Amit".',
            options: ['मेरा', 'नाम', 'अमित', 'है'],
            correctAnswer: 'मेरा नाम अमित है',
            explanation: 'मेरा (My) नाम (name) अमित (Amit) है (is).'
          },
          {
            id: 'ex-gr-4',
            type: 'speaking',
            question: 'Say hello in Hindi.',
            hindiQuestion: 'नमस्ते',
            audioText: 'नमस्ते',
            correctAnswer: 'namaste',
            hint: 'Namaste'
          }
        ]
      },
      {
        id: 'l-family',
        courseId: 'c-vocabulary',
        title: 'Family Relations',
        description: 'Words for mother, father, brother, sister, and more.',
        xpReward: 35,
        coinsReward: 12,
        exercises: [
          {
            id: 'ex-fa-1',
            type: 'flashcard',
            question: 'Mother and Father.',
            hindiQuestion: 'माता और पिता',
            audioText: 'माता और पिता',
            hint: 'Mata (Mother) and Pita (Father). Often called Maa and Papa colloquially.',
            options: [],
            correctAnswer: 'mother and father'
          },
          {
            id: 'ex-fa-2',
            type: 'multiple-choice',
            question: 'What is the Hindi word for "Brother"?',
            options: ['बहन (Behan)', 'भाई (Bhaai)', 'दोस्त (Dost)', 'बेटा (Beta)'],
            correctAnswer: 'भाई (Bhaai)',
            explanation: 'भाई (Bhaai) means brother. बहन (Behan) means sister.'
          },
          {
            id: 'ex-fa-3',
            type: 'matching',
            question: 'Match the family members.',
            pairs: [
              { hindi: 'माता', english: 'Mother' },
              { hindi: 'पिता', english: 'Father' },
              { hindi: 'भाई', english: 'Brother' },
              { hindi: 'बहन', english: 'Sister' }
            ],
            correctAnswer: 'माता:Mother,पिता:Father,भाई:Brother,बहन:Sister'
          }
        ]
      }
    ]
  },
  {
    id: 'c-grammar',
    title: 'Hindi Grammar (व्याकरण)',
    description: 'Learn Hindi pronouns, verbs, tenses, sentence formation, and adjectives.',
    category: 'Grammar',
    lessons: [
      {
        id: 'l-pronouns',
        courseId: 'c-grammar',
        title: 'Pronouns (सर्वनाम)',
        description: 'Words for I, you, he, she, we, and they.',
        xpReward: 40,
        coinsReward: 15,
        exercises: [
          {
            id: 'ex-pr-1',
            type: 'flashcard',
            question: 'I and You in Hindi.',
            hindiQuestion: 'मैं और आप',
            audioText: 'मैं और आप',
            hint: 'Main (I) and Aap (You - formal).',
            options: [],
            correctAnswer: 'I and you'
          },
          {
            id: 'ex-pr-2',
            type: 'multiple-choice',
            question: 'What is the informal/friendly word for "You" in Hindi?',
            options: ['आप (Aap)', 'तुम (Tum)', 'मैं (Main)', 'वह (Wah)'],
            correctAnswer: 'तुम (Tum)',
            explanation: 'आप is polite/formal, तुम is friendly, and तू is very intimate.'
          },
          {
            id: 'ex-pr-3',
            type: 'sentence-building',
            question: 'Construct the sentence: "I am a student".',
            options: ['मैं', 'छात्र', 'हूँ'],
            correctAnswer: 'मैं छात्र हूँ',
            explanation: 'मैं (I) छात्र (student) हूँ (am).'
          }
        ]
      }
    ]
  },
  {
    id: 'c-conversation',
    title: 'Hindi Conversation (वार्तालाप)',
    description: 'Practice real-life conversations for school, office, shopping, hotels, and daily life.',
    category: 'Conversation',
    lessons: [
      {
        id: 'l-shopping',
        courseId: 'c-conversation',
        title: 'Shopping Dialogue',
        description: 'Learn how to ask for prices and buy items.',
        xpReward: 45,
        coinsReward: 20,
        exercises: [
          {
            id: 'ex-sh-1',
            type: 'flashcard',
            question: 'How much does this cost?',
            hindiQuestion: 'यह कितने का है?',
            audioText: 'यह कितने का है?',
            hint: 'Yeh kitne ka hai? - Useful phrase for shopping.',
            options: [],
            correctAnswer: 'how much is this'
          },
          {
            id: 'ex-sh-2',
            type: 'multiple-choice',
            question: 'Which word means "expensive" in Hindi?',
            options: ['सस्ता (Sasta)', 'महँगा (Mahanga)', 'बड़ा (Bada)', 'अच्छा (Achha)'],
            correctAnswer: 'महँगा (Mahanga)',
            explanation: 'महँगा (Mahanga) means expensive. सस्ता (Sasta) means cheap.'
          },
          {
            id: 'ex-sh-3',
            type: 'speaking',
            question: 'Ask "How much does this cost?" in Hindi.',
            hindiQuestion: 'यह कितने का है?',
            audioText: 'यह कितने का है?',
            correctAnswer: 'yeh kitne ka hai',
            hint: 'Yeh kitne ka hai'
          }
        ]
      }
    ]
  },
  {
    id: 'c-advanced',
    title: 'Advanced Hindi (उन्नत)',
    description: 'Deepen your knowledge with rich stories, formal Hindi, essays, and listening practice.',
    category: 'Advanced',
    lessons: [
      {
        id: 'l-story',
        courseId: 'c-advanced',
        title: 'The Thirsty Crow (प्यासा कौआ)',
        description: 'Read the famous Panchatantra story and answer comprehension questions.',
        xpReward: 50,
        coinsReward: 25,
        exercises: [
          {
            id: 'ex-st-1',
            type: 'reading',
            question: 'Read the story and understand the message.',
            passage: 'एक कौआ बहुत प्यासा था। उसे एक घड़े में थोड़ा पानी मिला। कौवे ने घड़े में छोटे-छोटे कंकड़ डाले, जिससे पानी ऊपर आ गया और कौवे ने पानी पीकर अपनी प्यास बुझाई। सीख: जहाँ चाह, वहाँ राह।',
            hindiQuestion: 'प्यासा कौआ',
            audioText: 'एक कौआ बहुत प्यासा था। उसे एक घड़े में थोड़ा पानी मिला। कौवे ने घड़े में छोटे-छोटे कंकड़ डाले, जिससे पानी ऊपर आ गया और कौवे ने पानी पीकर अपनी प्यास बुझाई।',
            correctAnswer: 'understood'
          },
          {
            id: 'ex-st-2',
            type: 'multiple-choice',
            question: 'What did the crow drop in the pitcher (घड़ा)?',
            options: ['फल (Fruits)', 'पत्ते (Leaves)', 'कंकड़ (Pebbles)', 'फूल (Flowers)'],
            correctAnswer: 'कंकड़ (Pebbles)',
            explanation: 'The crow dropped pebbles (कंकड़) to raise the water level.'
          }
        ]
      }
    ]
  }
];
