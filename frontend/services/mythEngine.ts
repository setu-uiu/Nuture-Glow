
export type Verdict = "True" | "False" | "Mixed" | "Depends";

export interface MythResult {
  id: string;
  claim: string;
  verdict: Verdict;
  explanation: string;
  safeAdvice: string[];
  whenToCallDoctor: string[];
  sourcesLabel: string;
}

const MYTH_DATA: { patterns: string[]; data: MythResult }[] = [
  {
    patterns: ["coffee", "caffeine", "tea", "কফি", "ক্যাফেইন", "চা"],
    data: {
      id: "m1",
      claim: "Is caffeine safe during pregnancy?",
      verdict: "Depends",
      explanation: "Moderate amounts of caffeine (less than 200mg per day) are generally considered safe. This is roughly one 12oz cup of coffee.",
      safeAdvice: ["Stick to one small cup a day", "Try decaf alternatives", "Check caffeine in sodas and chocolate"],
      whenToCallDoctor: ["Experience heart palpitations", "Have trouble sleeping despite low intake"],
      sourcesLabel: "ACOG Guidelines"
    }
  },
  {
    patterns: ["spicy food", "ঝাল খাবার", "spicy", "chili"],
    data: {
      id: "m2",
      claim: "Spicy food can cause miscarriage or induce labor.",
      verdict: "False",
      explanation: "Spicy food is perfectly safe for the baby, though it might cause you significant heartburn or indigestion.",
      safeAdvice: ["Eat small portions", "Avoid lying down immediately after eating spicy food"],
      whenToCallDoctor: ["Indigestion is accompanied by severe abdominal pain"],
      sourcesLabel: "NHS UK"
    }
  },
  {
    patterns: ["sleeping on back", "চিত হয়ে ঘুমানো", "sleep position", "ঘুমানোর পজিশন"],
    data: {
      id: "m3",
      claim: "You should never sleep on your back after the first trimester.",
      verdict: "True",
      explanation: "Sleeping on your back can compress the vena cava, reducing blood flow to the placenta. Left side is generally best.",
      safeAdvice: ["Use a pregnancy pillow for support", "Don't panic if you wake up on your back, just roll over"],
      whenToCallDoctor: ["Feeling dizzy or breathless when lying flat"],
      sourcesLabel: "Mayo Clinic"
    }
  },
  {
    patterns: ["hair dye", "coloring hair", "চুলে রঙ", "হেয়ার ডাই"],
    data: {
      id: "m4",
      claim: "Dyeing your hair is dangerous for the baby.",
      verdict: "False",
      explanation: "Most research shows the chemicals in hair dye are not absorbed in large enough amounts to cause harm.",
      safeAdvice: ["Wait until the second trimester for extra peace of mind", "Ensure the room is well-ventilated"],
      whenToCallDoctor: ["Experience an allergic reaction to the dye"],
      sourcesLabel: "WebMD Health"
    }
  },
  {
    patterns: ["exercise", "gym", "lifting", "ব্যায়াম", "জিম"],
    data: {
      id: "m5",
      claim: "Exercise is dangerous during pregnancy.",
      verdict: "False",
      explanation: "Regular, moderate exercise is actually highly recommended and can make labor easier and recovery faster.",
      safeAdvice: ["Keep intensity moderate (should be able to talk)", "Avoid contact sports", "Stay hydrated"],
      whenToCallDoctor: ["Dizziness", "Vaginal bleeding", "Chest pain during activity"],
      sourcesLabel: "CDC Guidelines"
    }
  },
  {
    patterns: ["flying", "airplane", "travel", "বিমানে ভ্রমণ", "ভ্রমণ"],
    data: {
      id: "m6",
      claim: "Flying is unsafe for pregnant women.",
      verdict: "False",
      explanation: "Flying is generally safe up to 36 weeks if you have a low-risk pregnancy. Cabin pressure is not a risk.",
      safeAdvice: ["Walk every hour to prevent blood clots", "Wear compression socks", "Keep your medical records handy"],
      whenToCallDoctor: ["You have a history of blood clots", "Experiencing cramping while traveling"],
      sourcesLabel: "IATA Medical Manual"
    }
  },
  {
    patterns: ["morning sickness", "বমি বমি ভাব", "vomiting", "nausea"],
    data: {
      id: "m7",
      claim: "Morning sickness only happens in the morning.",
      verdict: "False",
      explanation: "Nausea and vomiting can happen at any time of the day or night due to hormonal changes.",
      safeAdvice: ["Eat small, frequent meals", "Ginger tea or lozenges can help", "Keep crackers by your bedside"],
      whenToCallDoctor: ["Cannot keep any fluids down for 24 hours", "Significant weight loss"],
      sourcesLabel: "Healthline"
    }
  },
  {
    patterns: ["ultrasound", "scan", "আল্ট্রাসাউন্ড", "স্ক্যান"],
    data: {
      id: "m8",
      claim: "Too many ultrasounds can harm the baby.",
      verdict: "False",
      explanation: "Ultrasounds use sound waves, not radiation. There is no evidence that diagnostic scans cause harm.",
      safeAdvice: ["Follow your doctor's recommended scan schedule", "Avoid 'keepsake' 3D/4D scans in non-medical facilities"],
      whenToCallDoctor: ["You have concerns about a specific scan result"],
      sourcesLabel: "FDA"
    }
  },
  {
    patterns: ["papaya", "পেঁপে", "fruit"],
    data: {
      id: "m9",
      claim: "Eating papaya causes miscarriage.",
      verdict: "Depends",
      explanation: "Ripe papaya is safe. However, unripe or semi-ripe papaya contains latex which can trigger uterine contractions.",
      safeAdvice: ["Only eat fully yellow/orange, soft papaya", "Avoid green papaya salads during pregnancy"],
      whenToCallDoctor: ["Experience cramping after consuming unripe fruit"],
      sourcesLabel: "Nutrition Reviews"
    }
  },
  {
    patterns: ["heartburn", "hairy baby", "বুক জ্বালাপোড়া", "চুল"],
    data: {
      id: "m10",
      claim: "Severe heartburn means the baby will have lots of hair.",
      verdict: "Mixed",
      explanation: "While often dismissed as a myth, some studies suggest a link because the same hormones that cause heartburn also influence fetal hair growth.",
      safeAdvice: ["Eat smaller meals", "Avoid spicy/fatty foods before bed", "Sleep with your head elevated"],
      whenToCallDoctor: ["Heartburn prevents eating or sleeping"],
      sourcesLabel: "Johns Hopkins Study"
    }
  },
  {
    patterns: ["eating for two", "double food", "বেশি খাওয়া"],
    data: {
      id: "m11",
      claim: "You need to eat twice as much food when pregnant.",
      verdict: "False",
      explanation: "You only need about 300 extra calories per day in the 2nd trimester and 450 in the 3rd. Quality matters more than quantity.",
      safeAdvice: ["Focus on nutrient-dense foods", "Include plenty of leafy greens and proteins"],
      whenToCallDoctor: ["Rapid or no weight gain over several weeks"],
      sourcesLabel: "Dietary Guidelines for Americans"
    }
  },
  {
    patterns: ["cats", "litter", "toxoplasmosis", "বিড়াল", "মল"],
    data: {
      id: "m12",
      claim: "You must get rid of your cat when you get pregnant.",
      verdict: "False",
      explanation: "You don't need to lose your pet, but you must avoid the litter box. Cat feces can carry toxoplasmosis, which is dangerous.",
      safeAdvice: ["Have someone else change the litter", "If you must do it, wear gloves and a mask", "Wash hands thoroughly after petting"],
      whenToCallDoctor: ["Flu-like symptoms after contact with cat waste"],
      sourcesLabel: "CDC"
    }
  },
  {
    patterns: ["hot tub", "sauna", "bath", "গরম পানি", "গোসল"],
    data: {
      id: "m13",
      claim: "Hot tubs and saunas are safe during pregnancy.",
      verdict: "False",
      explanation: "Raising your core body temperature above 101°F (38.3°C) for too long can cause birth defects, especially in the first trimester.",
      safeAdvice: ["Stick to warm (not hot) baths", "Limit time in warm water to 10-15 minutes"],
      whenToCallDoctor: ["Feeling faint or overheated after a bath"],
      sourcesLabel: "ACOG"
    }
  },
  {
    patterns: ["sex", "intercourse", "মিলন"],
    data: {
      id: "m14",
      claim: "Sex can hurt the baby.",
      verdict: "False",
      explanation: "The baby is well-protected by the amniotic sac and the strong muscles of the uterus. Sex is safe unless your doctor says otherwise.",
      safeAdvice: ["Experiment with comfortable positions", "Talk to your partner about changes in libido"],
      whenToCallDoctor: ["Bleeding or fluid leakage after intercourse", "History of preterm labor"],
      sourcesLabel: "Planned Parenthood"
    }
  },
  {
    patterns: ["pineapple", "আনারস", "bromelain"],
    data: {
      id: "m15",
      claim: "Pineapple can cause labor or miscarriage.",
      verdict: "False",
      explanation: "You would have to eat massive, unrealistic quantities of pineapple for the bromelain (enzyme) to have any effect on the cervix.",
      safeAdvice: ["Enjoy fresh pineapple in normal food amounts", "Great source of Vitamin C"],
      whenToCallDoctor: ["Allergic reaction or severe digestive upset"],
      sourcesLabel: "Medical News Today"
    }
  }
];

const GENERAL_RESULT: MythResult = {
  id: "general",
  claim: "Unknown Statement",
  verdict: "Depends",
  explanation: "We couldn't find a specific match for this statement. Pregnancy health is complex and varies for everyone.",
  safeAdvice: [
    "Consult your primary healthcare provider",
    "Focus on a balanced diet and moderate activity",
    "Listen to your body's signals"
  ],
  whenToCallDoctor: [
    "You have sharp pain or unusual bleeding",
    "You have a fever over 100.4°F",
    "You feel something is 'just not right'"
  ],
  sourcesLabel: "Nurture Glow General Guidance"
};

export const checkMythOffline = (input: string): MythResult => {
  const normalized = input.toLowerCase().trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ");
  
  if (!normalized) return GENERAL_RESULT;

  let bestMatch: MythResult | null = null;
  let maxScore = 0;

  MYTH_DATA.forEach(item => {
    let score = 0;
    item.patterns.forEach(pattern => {
      if (normalized.includes(pattern.toLowerCase())) {
        score += pattern.length; // Longer matches score higher
      }
    });

    if (score > maxScore) {
      maxScore = score;
      bestMatch = item.data;
    }
  });

  // Threshold check to avoid random matches
  return (maxScore > 2) ? bestMatch! : GENERAL_RESULT;
};
