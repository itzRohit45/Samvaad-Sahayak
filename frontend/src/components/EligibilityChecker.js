import React, { useState } from "react";
import "./EligibilityChecker.css";
import { useLanguage } from "../contexts/LanguageContext";

// Simple rule-based eligibility for demo
const SCHEMES = [
  {
    id: "pmay",
    name: {
      hi: "प्रधानमंत्री आवास योजना",
      en: "Pradhan Mantri Awas Yojana",
      ta: "பிரதான் மந்திரி அவாஸ் யோஜனா",
      te: "ప్రధాన్ మంత్రి అవాస్ యోజనా",
    },
    minAge: 18,
    maxIncome: 300000,
    eligibleGenders: ["male", "female", "other"],
    description: {
      hi: "गरीब परिवारों को घर उपलब्ध कराने की योजना",
      en: "Housing scheme for poor families",
      ta: "ஏழை குடும்பங்களுக்கு வீடு வழங்கும் திட்டம்",
      te: "పేద కుటుంబాలకు గృహ పథకం",
    },
  },
  {
    id: "ujjwala",
    name: {
      hi: "प्रधानमंत्री उज्ज्वला योजना",
      en: "Pradhan Mantri Ujjwala Yojana",
      ta: "பிரதான் மந்திரி உஜ்ஜ்வலா யோஜனா",
      te: "ప్రధాన్ మంత్రి ఉజ్జ్వలా యోజనా",
    },
    minAge: 18,
    maxIncome: 200000,
    eligibleGenders: ["female"],
    description: {
      hi: "महिलाओं को मुफ्त गैस कनेक्शन",
      en: "Free gas connection for women",
      ta: "பெண்களுக்கு இலவச கேス் இணைப்பு",
      te: "మహిళలకు ఉచిత గ్యాస్ కనెక్షన్",
    },
  },
  {
    id: "ayushman",
    name: {
      hi: "आयुष्मान भारत योजना",
      en: "Ayushman Bharat Scheme",
      ta: "ஆயுஷ்மான் பாரத் திட்டம்",
      te: "ఆయుష్మాన్ భారత్ పథకం",
    },
    minAge: 0,
    maxIncome: 250000,
    eligibleGenders: ["male", "female", "other"],
    description: {
      hi: "मुफ्त स्वास्थ्य बीमा योजना",
      en: "Free health insurance scheme",
      ta: "இலவச ஆரோக்கிய பীமை திட்டம்",
      te: "ఉచిత ఆరోగ్య బీమా పథకం",
    },
  },
];

const GENDERS = [
  {
    value: "male",
    label: { hi: "पुरुष", en: "Male", ta: "ஆண்", te: "పురుషుడు" },
  },
  {
    value: "female",
    label: { hi: "महिला", en: "Female", ta: "பெண்", te: "స్త్రీ" },
  },
  {
    value: "other",
    label: { hi: "अन्य", en: "Other", ta: "மற்றவை", te: "ఇతర" },
  },
];

function EligibilityChecker() {
  const { language } = useLanguage();
  const [age, setAge] = useState(25);
  const [income, setIncome] = useState(150000);
  const [gender, setGender] = useState("male");
  const [result, setResult] = useState(null);
  const [showChecker, setShowChecker] = useState(false);

  const checkEligibility = (e) => {
    e.preventDefault();
    const eligibleSchemes = SCHEMES.filter((scheme) => {
      return (
        age >= scheme.minAge &&
        income <= scheme.maxIncome &&
        scheme.eligibleGenders.includes(gender)
      );
    });
    setResult(eligibleSchemes);
  };

  const getTranslation = (key) => {
    const translations = {
      hi: {
        title: "त्वरित पात्रता जांचें",
        description:
          "अपनी जानकारी दें और पता करें कि आप किन योजनाओं के लिए पात्र हैं",
        age: "आयु (वर्ष)",
        income: "वार्षिक आय (₹)",
        gender: "लिंग",
        check: "जांचें",
        eligible: "आप इन योजनाओं के लिए पात्र हैं:",
        notEligible:
          "क्षमा करें, दी गई जानकारी के आधार पर आप किसी भी योजना के लिए पात्र नहीं हैं।",
        tryDifferent: "अलग जानकारी के साथ पुनः प्रयास करें।",
        showChecker: "पात्रता जांचें",
        hideChecker: "छुपाएं",
      },
      en: {
        title: "Quick Eligibility Check",
        description:
          "Enter your details to find out which schemes you are eligible for",
        age: "Age (years)",
        income: "Annual Income (₹)",
        gender: "Gender",
        check: "Check",
        eligible: "You are eligible for these schemes:",
        notEligible:
          "Sorry, based on the information provided, you are not eligible for any schemes.",
        tryDifferent: "Try again with different information.",
        showChecker: "Check Eligibility",
        hideChecker: "Hide",
      },
      ta: {
        title: "விரைவு தகுதி சரிபார்ப்பு",
        description:
          "உங்கள் விவரங்களை உள்ளிடவும், நீங்கள் எந்த திட்டங்களுக்கு தகுதியுடையவர் என்பதைக் கண்டறியவும்",
        age: "வயது (ஆண்டுகள்)",
        income: "வருடாந்திர வருமானம் (₹)",
        gender: "பாலினம்",
        check: "சரிபார்க்கவும்",
        eligible: "நீங்கள் இந்த திட்டங்களுக்கு தகுதியுடையவர்:",
        notEligible:
          "மன்னிக்கவும், வழங்கப்பட்ட தகவலின் அடிப்படையில், நீங்கள் எந்த திட்டத்திற்கும் தகுதியுடையவர் அல்ல.",
        tryDifferent: "வேறு தகவலுடன் மீண்டும் முயற்சிக்கவும்.",
        showChecker: "தகுதி சரிபார்க்கவும்",
        hideChecker: "மறை",
      },
      te: {
        title: "త్వరిత అర్హత తనిఖీ",
        description:
          "మీ వివరాలను నమోదు చేయండి మరియు మీరు ఏ పథకాలకు అర్హులు అని తెలుసుకోండి",
        age: "వయస్సు (సంవత్సరాలు)",
        income: "వార్షిక ఆదాయం (₹)",
        gender: "లింగం",
        check: "తనిఖీ చేయండి",
        eligible: "మీరు ఈ పథకాల కోసం అర్హులు:",
        notEligible:
          "క్షమించండి, అందించిన సమాచారం ఆధారంగా, మీరు ఏ పథకానికి అర్హులు కారు.",
        tryDifferent: "వేరే సమాచారంతో మళ్లీ ప్రయత్నించండి.",
        showChecker: "అర్హత తనిఖీ చేయండి",
        hideChecker: "దాచు",
      },
    };
    return translations[language]?.[key] || translations["hi"][key] || key;
  };

  return (
    <div className="eligibility-checker-wrapper">
      <button
        className="eligibility-toggle-btn"
        onClick={() => setShowChecker(!showChecker)}
      >
        🎯 {getTranslation(showChecker ? "hideChecker" : "showChecker")}
      </button>

      {showChecker && (
        <div className="eligibility-checker">
          <h3>{getTranslation("title")}</h3>
          <p className="eligibility-description">
            {getTranslation("description")}
          </p>

          <form onSubmit={checkEligibility}>
            <div className="form-row">
              <label>
                {getTranslation("age")}
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  required
                />
              </label>
              <label>
                {getTranslation("income")}
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  required
                />
              </label>
            </div>

            <label>
              {getTranslation("gender")}
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                {GENDERS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label[language] || g.label.hi}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className="check-btn">
              🔍 {getTranslation("check")}
            </button>
          </form>

          {result && (
            <div className="eligibility-result">
              {result.length > 0 ? (
                <>
                  <h4>✅ {getTranslation("eligible")}</h4>
                  <div className="schemes-list">
                    {result.map((scheme) => (
                      <div key={scheme.id} className="scheme-card">
                        <h5>{scheme.name[language] || scheme.name.hi}</h5>
                        <p>
                          {scheme.description[language] ||
                            scheme.description.hi}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="no-schemes">
                  <h4>❌ {getTranslation("notEligible")}</h4>
                  <p>{getTranslation("tryDifferent")}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EligibilityChecker;
