import React, { useReducer } from 'react';
import axios from 'axios';
import LessonContext from './lessonContext';
import lessonReducer from './lessonReducer';
import {
  GET_LESSONS,
  GET_LESSON,
  CLEAR_LESSON,
  LESSON_ERROR,
  SET_LOADING
} from '../types';

// Demo data for lessons
const demoLessons = [
  {
    id: '1',
    title: 'Basics of Hindi Alphabet',
    level: 'beginner',
    description: 'Learn the Hindi alphabet (Devanagari script) and basic pronunciation',
    content: [
      {
        type: 'text',
        content: 'Hindi uses the Devanagari script which has 13 vowels and 33 consonants. Let\'s start with a few basic vowels:'
      },
      {
        type: 'text',
        content: 'अ (a) - Short "a" as in "about"\n\nआ (aa) - Long "a" as in "father"\n\nइ (i) - Short "i" as in "sit"\n\nई (ee) - Long "e" as in "feet"'
      },
      {
        type: 'audio',
        text: 'अ आ इ ई',
        englishText: 'a aa i ee',
        examples: [
          { hindi: 'अनार', english: 'Pomegranate (anaar)' },
          { hindi: 'आम', english: 'Mango (aam)' },
          { hindi: 'इमली', english: 'Tamarind (imli)' },
          { hindi: 'ईख', english: 'Sugarcane (eekh)' }
        ]
      },
      {
        type: 'text',
        content: 'Next, let\'s look at a few basic consonants:\n\nक (ka)\n\nख (kha)\n\nग (ga)\n\nघ (gha)'
      },
      {
        type: 'audio',
        text: 'क ख ग घ',
        englishText: 'ka kha ga gha',
        examples: [
          { hindi: 'कमल', english: 'Lotus (kamal)' },
          { hindi: 'खरगोश', english: 'Rabbit (khargosh)' },
          { hindi: 'गाय', english: 'Cow (gaay)' },
          { hindi: 'घर', english: 'House (ghar)' }
        ]
      },
      {
        type: 'exercise',
        question: 'Which of the following is the long "a" sound in Hindi?',
        options: ['अ', 'आ', 'इ', 'ई'],
        correctAnswer: 'आ',
        optionsAudio: [true, true, true, true]
      },
      {
        type: 'exercise',
        question: 'Match the Hindi character to its sound',
        audioPrompt: 'ई',
        audioPromptEnglish: 'Which option matches this sound?',
        options: ['अ (a)', 'आ (aa)', 'इ (i)', 'ई (ee)'],
        correctAnswer: 'ई (ee)',
        optionsAudio: [true, true, true, true]
      },
      {
        type: 'exercise',
        question: 'Which of these is the word for "house" in Hindi?',
        options: ['कमल', 'खरगोश', 'गाय', 'घर'],
        correctAnswer: 'घर',
        optionsAudio: [true, true, true, true]
      }
    ]
  },
  {
    id: '2',
    title: 'Basic Greetings',
    level: 'beginner',
    description: 'Learn common greetings and introductions in Hindi',
    content: [
      {
        type: 'text',
        content: 'In Hindi, the most common greeting is "Namaste" (नमस्ते), which can be used at any time of day.'
      },
      {
        type: 'text',
        content: 'नमस्ते (Namaste) - Hello/Greetings\n\nशुभ प्रभात (Shubh Prabhat) - Good Morning\n\nआप कैसे हैं? (Aap kaise hain?) - How are you?'
      },
      {
        type: 'audio',
        text: 'नमस्ते',
        englishText: 'Namaste (Hello)',
        examples: [
          { hindi: 'नमस्ते, आप कैसे हैं?', english: 'Hello, how are you?' },
          { hindi: 'नमस्ते, मेरा नाम राहुल है।', english: 'Hello, my name is Rahul.' },
          { hindi: 'शुभ प्रभात, आज मौसम अच्छा है।', english: 'Good morning, the weather is nice today.' }
        ]
      },
      {
        type: 'audio',
        text: 'आप कैसे हैं?',
        englishText: 'How are you?',
        examples: [
          { hindi: 'मैं अच्छा हूँ, धन्यवाद।', english: 'I am fine, thank you.' },
          { hindi: 'मैं ठीक हूँ, आप कैसे हैं?', english: 'I am okay, how are you?' },
          { hindi: 'मैं बहुत अच्छा हूँ।', english: 'I am very well.' }
        ]
      },
      {
        type: 'exercise',
        question: 'How do you say "How are you?" in Hindi?',
        options: ['नमस्ते', 'शुभ प्रभात', 'आप कैसे हैं?', 'धन्यवाद'],
        correctAnswer: 'आप कैसे हैं?',
        optionsAudio: [true, true, true, true]
      },
      {
        type: 'exercise',
        audioPrompt: 'नमस्ते',
        audioPromptEnglish: 'What does this greeting mean?',
        question: 'What does the greeting above mean?',
        options: ['Good morning', 'Hello', 'Good night', 'Thank you'],
        correctAnswer: 'Hello',
        optionsAudio: [false, false, false, false]
      },
      {
        type: 'exercise',
        question: 'Complete this greeting dialogue:',
        audioPrompt: 'नमस्ते, आप कैसे हैं?',
        audioPromptEnglish: 'Hello, how are you?',
        options: ['मैं अच्छा हूँ', 'धन्यवाद', 'मेरा नाम राहुल है', 'शुभ रात्रि'],
        correctAnswer: 'मैं अच्छा हूँ',
        optionsAudio: [true, true, true, true]
      }
    ]
  },
  {
    id: '3',
    title: 'Numbers 1-10',
    level: 'beginner',
    description: 'Learn to count from 1 to 10 in Hindi',
    content: [
      {
        type: 'text',
        content: 'Let\'s learn the numbers 1-10 in Hindi:'
      },
      {
        type: 'text',
        content: '१ (ek) - One\n\n२ (do) - Two\n\n३ (teen) - Three\n\n४ (chaar) - Four\n\n५ (paanch) - Five\n\n६ (chhah) - Six\n\n७ (saat) - Seven\n\n८ (aath) - Eight\n\n९ (nau) - Nine\n\n१० (das) - Ten'
      },
      {
        type: 'audio',
        text: 'एक दो तीन चार पांच',
        englishText: 'One Two Three Four Five',
        examples: [
          { hindi: 'मेरे पास एक किताब है।', english: 'I have one book.' },
          { hindi: 'वहां दो कुर्सियां हैं।', english: 'There are two chairs there.' },
          { hindi: 'मुझे तीन सेब चाहिए।', english: 'I want three apples.' }
        ]
      },
      {
        type: 'audio',
        text: 'छह सात आठ नौ दस',
        englishText: 'Six Seven Eight Nine Ten',
        examples: [
          { hindi: 'घड़ी में छह बजे हैं।', english: 'It\'s six o\'clock on the watch.' },
          { hindi: 'सात दिन का एक सप्ताह होता है।', english: 'There are seven days in a week.' },
          { hindi: 'मेज़ पर दस पेन हैं।', english: 'There are ten pens on the table.' }
        ]
      },
      {
        type: 'exercise',
        question: 'What is the Hindi word for "seven"?',
        options: ['पांच', 'छह', 'सात', 'आठ'],
        correctAnswer: 'सात',
        optionsAudio: [true, true, true, true]
      },
      {
        type: 'exercise',
        audioPrompt: 'तीन',
        audioPromptEnglish: 'Which number is this?',
        question: 'Which number did you hear?',
        options: ['1', '2', '3', '4'],
        correctAnswer: '3'
      },
      {
        type: 'exercise',
        question: 'Match the Hindi numerals to the correct number:',
        audioPrompt: '६',
        audioPromptEnglish: 'What number is this?',
        options: ['Five (पांच)', 'Six (छह)', 'Seven (सात)', 'Eight (आठ)'],
        correctAnswer: 'Six (छह)',
        optionsAudio: [true, true, true, true]
      }
    ]
  },
  {
    id: '4',
    title: 'Common Phrases',
    level: 'beginner',
    description: 'Learn everyday useful phrases in Hindi',
    content: [
      {
        type: 'text',
        content: 'Here are some useful everyday phrases in Hindi:'
      },
      {
        type: 'text',
        content: 'धन्यवाद (Dhanyavaad) - Thank you\n\nकृपया (Kripaya) - Please\n\nमाफ़ कीजिए (Maaf kijiye) - I\'m sorry / Excuse me\n\nहां (Haan) - Yes\n\nनहीं (Nahin) - No'
      },
      {
        type: 'audio',
        text: 'धन्यवाद',
        englishText: 'Thank you',
        examples: [
          { hindi: 'आपकी मदद के लिए धन्यवाद।', english: 'Thank you for your help.' },
          { hindi: 'बहुत-बहुत धन्यवाद।', english: 'Thank you very much.' },
          { hindi: 'जानकारी के लिए धन्यवाद।', english: 'Thank you for the information.' }
        ]
      },
      {
        type: 'audio',
        text: 'कृपया और माफ़ कीजिए',
        englishText: 'Please and Excuse me',
        examples: [
          { hindi: 'कृपया, मुझे रास्ता बताइए।', english: 'Please, show me the way.' },
          { hindi: 'माफ़ कीजिए, क्या आप अंग्रेजी बोलते हैं?', english: 'Excuse me, do you speak English?' },
          { hindi: 'कृपया, दरवाज़ा बंद कीजिए।', english: 'Please, close the door.' }
        ]
      },
      {
        type: 'audio',
        text: 'हां और नहीं',
        englishText: 'Yes and No',
        examples: [
          { hindi: 'क्या आप भारत से हैं? हां।', english: 'Are you from India? Yes.' },
          { hindi: 'क्या यह आपका पहला दिन है? नहीं।', english: 'Is this your first day? No.' },
          { hindi: 'हां, मुझे हिंदी सीखना पसंद है।', english: 'Yes, I like learning Hindi.' }
        ]
      },
      {
        type: 'exercise',
        question: 'How do you say "Thank you" in Hindi?',
        options: ['कृपया', 'धन्यवाद', 'नमस्ते', 'माफ़ कीजिए'],
        correctAnswer: 'धन्यवाद',
        optionsAudio: [true, true, true, true]
      },
      {
        type: 'exercise',
        audioPrompt: 'कृपया',
        audioPromptEnglish: 'What does this phrase mean?',
        question: 'What does the phrase above mean?',
        options: ['Thank you', 'Please', 'Sorry', 'Yes'],
        correctAnswer: 'Please'
      },
      {
        type: 'exercise',
        question: 'Which is the correct way to say "I\'m sorry" in Hindi?',
        options: ['धन्यवाद', 'हां', 'माफ़ कीजिए', 'नहीं'],
        correctAnswer: 'माफ़ कीजिए',
        optionsAudio: [true, true, true, true]
      }
    ]
  },
  {
    id: '5',
    title: 'Family Members',
    level: 'intermediate',
    description: 'Learn vocabulary for family members in Hindi',
    content: [
      {
        type: 'text',
        content: 'Family relationships in Hindi are quite specific. Here are some basic family terms:'
      },
      {
        type: 'text',
        content: 'माता/मां (Mata/Maa) - Mother\n\nपिता/पापा (Pita/Papa) - Father\n\nभाई (Bhai) - Brother\n\nबहन (Bahan) - Sister\n\nदादा (Dada) - Paternal Grandfather\n\nदादी (Dadi) - Paternal Grandmother\n\nनाना (Nana) - Maternal Grandfather\n\nनानी (Nani) - Maternal Grandmother'
      },
      {
        type: 'audio',
        text: 'परिवार',
        englishText: 'Family',
        examples: [
          { hindi: 'मेरा परिवार बड़ा है।', english: 'My family is big.' },
          { hindi: 'वह मेरे परिवार का सदस्य है।', english: 'He is a member of my family.' },
          { hindi: 'हम एक छोटे परिवार में रहते हैं।', english: 'We live in a small family.' }
        ]
      },
      {
        type: 'audio',
        text: 'माता पिता भाई बहन',
        englishText: 'Mother Father Brother Sister',
        examples: [
          { hindi: 'मेरी माता शिक्षिका हैं।', english: 'My mother is a teacher.' },
          { hindi: 'मेरे पिता डॉक्टर हैं।', english: 'My father is a doctor.' },
          { hindi: 'मेरा भाई स्कूल जाता है।', english: 'My brother goes to school.' },
          { hindi: 'मेरी बहन छात्रा है।', english: 'My sister is a student.' }
        ]
      },
      {
        type: 'audio',
        text: 'दादा दादी नाना नानी',
        englishText: 'Paternal Grandparents and Maternal Grandparents',
        examples: [
          { hindi: 'मेरे दादा जी गांव में रहते हैं।', english: 'My paternal grandfather lives in the village.' },
          { hindi: 'मेरी दादी अच्छा खाना बनाती हैं।', english: 'My paternal grandmother cooks good food.' },
          { hindi: 'मेरे नाना जी सेवानिवृत्त हैं।', english: 'My maternal grandfather is retired.' },
          { hindi: 'मेरी नानी मंदिर जाती हैं।', english: 'My maternal grandmother goes to the temple.' }
        ]
      },
      {
        type: 'exercise',
        question: 'What is the Hindi word for "Sister"?',
        options: ['भाई', 'बहन', 'मां', 'पिता'],
        correctAnswer: 'बहन',
        optionsAudio: [true, true, true, true]
      },
      {
        type: 'exercise',
        audioPrompt: 'मेरी माता शिक्षिका हैं।',
        audioPromptEnglish: 'My mother is a teacher.',
        question: 'Translate the sentence you heard:',
        options: [
          'My father is a doctor.',
          'My sister is a student.',
          'My mother is a teacher.',
          'My brother goes to school.'
        ],
        correctAnswer: 'My mother is a teacher.'
      },
      {
        type: 'exercise',
        question: 'Which pair correctly matches family members in Hindi?',
        options: [
          'दादा/दादी - Maternal Grandparents',
          'नाना/नानी - Paternal Grandparents',
          'माता/पिता - Mother/Father',
          'भाई/बहन - Father/Mother'
        ],
        correctAnswer: 'माता/पिता - Mother/Father'
      }
    ]
  },
  {
    id: '6',
    title: 'Shopping and Markets',
    level: 'intermediate',
    description: 'Learn vocabulary and phrases for shopping in Hindi',
    content: [
      {
        type: 'text',
        content: 'In this lesson, we\'ll learn useful phrases for shopping in Hindi markets.'
      },
      {
        type: 'audio',
        text: 'यह कितने का है?',
        englishText: 'How much is this?',
        examples: [
          { hindi: 'यह शर्ट कितने की है?', english: 'How much is this shirt?' },
          { hindi: 'यह फल कितने का है?', english: 'How much is this fruit?' },
          { hindi: 'ये जूते कितने के हैं?', english: 'How much are these shoes?' }
        ]
      },
      {
        type: 'audio',
        text: 'बहुत महंगा है',
        englishText: 'It\'s very expensive',
        examples: [
          { hindi: 'यह बहुत महंगा है, कम कीजिए।', english: 'This is very expensive, please reduce the price.' },
          { hindi: 'क्या आप दाम कम कर सकते हैं?', english: 'Can you lower the price?' },
          { hindi: 'यह मेरे बजट से ज्यादा है।', english: 'This is over my budget.' }
        ]
      },
      {
        type: 'audio',
        text: 'मुझे यह चाहिए',
        englishText: 'I want this',
        examples: [
          { hindi: 'मुझे वह लाल कुर्ता चाहिए।', english: 'I want that red kurta.' },
          { hindi: 'मुझे एक किलो चावल चाहिए।', english: 'I want one kilogram of rice.' },
          { hindi: 'मुझे कुछ सब्जियां चाहिए।', english: 'I want some vegetables.' }
        ]
      },
      {
        type: 'exercise',
        question: 'How do you ask "How much is this?" in Hindi?',
        options: ['मुझे यह चाहिए', 'यह कितने का है?', 'बहुत महंगा है', 'धन्यवाद'],
        correctAnswer: 'यह कितने का है?',
        optionsAudio: [true, true, true, true]
      },
      {
        type: 'exercise',
        audioPrompt: 'यह बहुत महंगा है',
        audioPromptEnglish: 'It\'s very expensive',
        question: 'What\'s the meaning of the phrase you heard?',
        options: [
          'I want this',
          'How much is this?',
          'It\'s very expensive',
          'Can you reduce the price?'
        ],
        correctAnswer: 'It\'s very expensive'
      },
      {
        type: 'exercise',
        question: 'Which phrase would you use to say "I want one kilogram of rice" in Hindi?',
        options: [
          'क्या आप दाम कम कर सकते हैं?',
          'मुझे एक किलो चावल चाहिए।',
          'यह शर्ट कितने की है?',
          'यह मेरे बजट से ज्यादा है।'
        ],
        correctAnswer: 'मुझे एक किलो चावल चाहिए।',
        optionsAudio: [true, true, true, true]
      }
    ]
  },
  {
    id: '7',
    title: 'Directions and Places',
    level: 'intermediate',
    description: 'Learn how to ask for and give directions in Hindi',
    content: [
      {
        type: 'text',
        content: 'In this lesson, we\'ll learn how to ask for and give directions in Hindi.'
      },
      {
        type: 'audio',
        text: 'बाएँ मुड़िए',
        englishText: 'Turn left',
        examples: [
          { hindi: 'पहले चौराहे पर बाएँ मुड़िए।', english: 'Turn left at the first intersection.' },
          { hindi: 'बस स्टैंड के पास बाएँ मुड़िए।', english: 'Turn left near the bus stand.' }
        ]
      },
      {
        type: 'audio',
        text: 'दाएँ मुड़िए',
        englishText: 'Turn right',
        examples: [
          { hindi: 'बैंक के बाद दाएँ मुड़िए।', english: 'Turn right after the bank.' },
          { hindi: 'दूसरे चौराहे पर दाएँ मुड़िए।', english: 'Turn right at the second intersection.' }
        ]
      },
      {
        type: 'audio',
        text: 'सीधे जाइए',
        englishText: 'Go straight',
        examples: [
          { hindi: 'दो किलोमीटर सीधे जाइए।', english: 'Go straight for two kilometers.' },
          { hindi: 'मंदिर तक सीधे जाइए।', english: 'Go straight until you reach the temple.' }
        ]
      },
      {
        type: 'audio',
        text: 'यह कहाँ है?',
        englishText: 'Where is this?',
        examples: [
          { hindi: 'पोस्ट ऑफिस कहाँ है?', english: 'Where is the post office?' },
          { hindi: 'नज़दीकी रेलवे स्टेशन कहाँ है?', english: 'Where is the nearest railway station?' },
          { hindi: 'बाज़ार यहाँ से कितनी दूर है?', english: 'How far is the market from here?' }
        ]
      },
      {
        type: 'exercise',
        question: 'How do you say "Turn right" in Hindi?',
        options: ['बाएँ मुड़िए', 'दाएँ मुड़िए', 'सीधे जाइए', 'यह कहाँ है?'],
        correctAnswer: 'दाएँ मुड़िए',
        optionsAudio: [true, true, true, true]
      },
      {
        type: 'exercise',
        audioPrompt: 'सीधे जाइए',
        audioPromptEnglish: 'Go straight',
        question: 'What does the direction you heard mean?',
        options: ['Turn left', 'Turn right', 'Go straight', 'Stop here'],
        correctAnswer: 'Go straight'
      },
      {
        type: 'exercise',
        question: 'How would you ask "Where is the nearest railway station?" in Hindi?',
        options: [
          'पोस्ट ऑफिस कहाँ है?',
          'बाज़ार यहाँ से कितनी दूर है?',
          'नज़दीकी रेलवे स्टेशन कहाँ है?',
          'यह कहाँ है?'
        ],
        correctAnswer: 'नज़दीकी रेलवे स्टेशन कहाँ है?',
        optionsAudio: [true, true, true, true]
      }
    ]
  }
];

const LessonState = props => {
  const initialState = {
    lessons: [],
    currentLesson: null,
    loading: false,
    error: null
  };

  const [state, dispatch] = useReducer(lessonReducer, initialState);

  // Get all lessons
  const getLessons = async () => {
    setLoading();

    try {
      // For demo purposes, use the demo data instead of API call
      // const res = await axios.get('/api/lessons');
      
      setTimeout(() => {
        dispatch({
          type: GET_LESSONS,
          payload: demoLessons
        });
      }, 500); // Simulate network delay
    } catch (err) {
      dispatch({
        type: LESSON_ERROR,
        payload: 'Error loading lessons'
      });
    }
  };

  // Get a specific lesson
  const getLesson = async (id) => {
    setLoading();

    try {
      // For demo purposes, use the demo data instead of API call
      // const res = await axios.get(`/api/lessons/${id}`);
      
      // Find the lesson in demo data
      const lesson = demoLessons.find(lesson => lesson.id === id);
      
      setTimeout(() => {
        if (lesson) {
          dispatch({
            type: GET_LESSON,
            payload: lesson
          });
        } else {
          dispatch({
            type: LESSON_ERROR,
            payload: 'Lesson not found'
          });
        }
      }, 500); // Simulate network delay
    } catch (err) {
      dispatch({
        type: LESSON_ERROR,
        payload: 'Error loading lesson'
      });
    }
  };

  // Clear current lesson
  const clearLesson = () => {
    dispatch({ type: CLEAR_LESSON });
  };

  // Set loading
  const setLoading = () => {
    dispatch({ type: SET_LOADING });
  };

  return (
    <LessonContext.Provider
      value={{
        lessons: state.lessons,
        currentLesson: state.currentLesson,
        loading: state.loading,
        error: state.error,
        getLessons,
        getLesson,
        clearLesson
      }}
    >
      {props.children}
    </LessonContext.Provider>
  );
};

export default LessonState; 