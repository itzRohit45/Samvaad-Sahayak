import React, { useState, useEffect } from "react";
import "./YojanaBuddy.css";
import { useLanguage } from "../contexts/LanguageContext";

// Rules-based scheme recommendation logic
const SCHEME_RULES = {
  "pm-kisan": {
    occupation: ["farmer", "agriculture"],
    income: ["low", "medium-low"],
    rural: true,
  },
  pmay: {
    income: ["low", "medium-low"],
    housing: ["rented", "homeless", "damaged"],
  },
  pmjay: {
    income: ["low", "medium-low", "medium"],
    categories: ["general", "medical"],
  },
  ujjwala: {
    income: ["low"],
    gender: ["female"],
    rural: true,
  },
  pmjjby: {
    age: ["18-30", "30-40", "40-60"],
    categories: ["insurance", "life"],
  },
  pmsby: {
    age: ["18-30", "30-40", "40-60", "60+"],
    categories: ["insurance", "accident"],
  },
  pmkvy: {
    age: ["18-30", "30-40"],
    employment: ["unemployed", "self-employed"],
    categories: ["skill", "education"],
  },
  pmjdy: {
    categories: ["financial", "banking"],
  },
  ssy: {
    gender: ["female"],
    age: ["0-10", "10-18"],
    categories: ["savings", "education"],
  },
  apy: {
    age: ["18-30", "30-40", "40-60"],
    employment: ["self-employed", "informal"],
    categories: ["pension", "retirement"],
  },
};

// Scheme details
const SCHEMES_DATA = {
  "pm-kisan": {
    name: "प्रधानमंत्री किसान सम्मान निधि",
    description:
      "किसानों को प्रति वर्ष ₹6,000 की वित्तीय सहायता (तीन किस्तों में ₹2,000) प्रदान की जाती है।",
    icon: "🌾",
  },
  pmay: {
    name: "प्रधानमंत्री आवास योजना",
    description:
      "कम आय वर्ग के लोगों को अपना घर खरीदने के लिए आर्थिक सहायता प्रदान करता है।",
    icon: "🏠",
  },
  pmjay: {
    name: "आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना",
    description:
      "गरीब और कमजोर परिवारों को प्रति परिवार प्रति वर्ष ₹5 लाख तक का स्वास्थ्य बीमा कवर।",
    icon: "🏥",
  },
  ujjwala: {
    name: "प्रधानमंत्री उज्ज्वला योजना",
    description: "गरीब परिवारों को मुफ्त LPG कनेक्शन प्रदान करना।",
    icon: "🔥",
  },
  pmjjby: {
    name: "प्रधानमंत्री जीवन ज्योति बीमा योजना",
    description: "कम प्रीमियम पर ₹2 लाख का जीवन बीमा कवर।",
    icon: "📝",
  },
  pmsby: {
    name: "प्रधानमंत्री सुरक्षा बीमा योजना",
    description: "वार्षिक ₹20 प्रीमियम पर ₹2 लाख का दुर्घटना बीमा कवर।",
    icon: "🛡️",
  },
  pmkvy: {
    name: "प्रधानमंत्री कौशल विकास योजना",
    description: "युवाओं को निःशुल्क कौशल प्रशिक्षण प्रदान करता है।",
    icon: "📚",
  },
  pmjdy: {
    name: "प्रधानमंत्री जन धन योजना",
    description:
      "वित्तीय समावेशन के लिए बैंक खाता, रुपे डेबिट कार्ड और ₹1 लाख का दुर्घटना बीमा।",
    icon: "🏦",
  },
  ssy: {
    name: "सुकन्या समृद्धि योजना",
    description:
      "बेटियों के भविष्य के लिए बचत योजना, अच्छी ब्याज दर और कर लाभ के साथ।",
    icon: "👧",
  },
  apy: {
    name: "अटल पेंशन योजना",
    description:
      "60 वर्ष की आयु के बाद ₹1,000 से ₹5,000 तक की गारंटीकृत मासिक पेंशन।",
    icon: "👵",
  },
};

function YojanaBuddy({ onSchemeSelect }) {
  const { language, translateText } = useLanguage();
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    occupation: "",
    income: "",
    location: "",
    categories: [],
  });
  const [step, setStep] = useState(1);
  const [recommendations, setRecommendations] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (category) => {
    setFormData((prev) => {
      const updatedCategories = prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories: updatedCategories };
    });
  };

  // Add auto-scroll to top of form when changing steps
  useEffect(() => {
    const yojanaBuddyElement = document.querySelector(".yojana-buddy");
    if (yojanaBuddyElement) {
      yojanaBuddyElement.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [step]);

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const findRecommendedSchemes = () => {
    // Simple rules-based matching algorithm
    const matches = Object.entries(SCHEME_RULES).filter(([schemeId, rules]) => {
      let score = 0;
      let maxScore = 0;

      // Age match
      if (rules.age && formData.age) {
        maxScore++;
        if (rules.age.includes(formData.age)) score++;
      }

      // Gender match
      if (rules.gender && formData.gender) {
        maxScore++;
        if (rules.gender.includes(formData.gender)) score++;
      }

      // Occupation match
      if (rules.occupation && formData.occupation) {
        maxScore++;
        if (rules.occupation.includes(formData.occupation)) score++;
      }

      // Income match
      if (rules.income && formData.income) {
        maxScore++;
        if (rules.income.includes(formData.income)) score++;
      }

      // Location match
      if (formData.location === "rural" && rules.rural) {
        maxScore++;
        score++;
      } else if (formData.location === "urban" && rules.urban) {
        maxScore++;
        score++;
      }

      // Categories match
      if (rules.categories && formData.categories.length > 0) {
        maxScore++;
        if (formData.categories.some((cat) => rules.categories.includes(cat))) {
          score++;
        }
      }

      // Return true if match score is at least half of max possible score
      return maxScore > 0 && score > 0 && score / maxScore >= 0.25;
    });

    // Convert matches to scheme objects with details
    const recommendedSchemes = matches.map(([id]) => ({
      id,
      ...SCHEMES_DATA[id],
    }));

    setRecommendations(recommendedSchemes);
    setShowResults(true);
  };

  const resetForm = () => {
    setFormData({
      age: "",
      gender: "",
      occupation: "",
      income: "",
      location: "",
      categories: [],
    });
    setStep(1);
    setShowResults(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    findRecommendedSchemes();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-step">
            <h3>{translateText("personalInfo", language)}</h3>

            <div className="form-group">
              <label>{translateText("age", language)}</label>
              <select
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
              >
                <option value="">{translateText("select", language)}</option>
                <option value="0-10">
                  0-10 {translateText("years", language)}
                </option>
                <option value="10-18">
                  10-18 {translateText("years", language)}
                </option>
                <option value="18-30">
                  18-30 {translateText("years", language)}
                </option>
                <option value="30-40">
                  30-40 {translateText("years", language)}
                </option>
                <option value="40-60">
                  40-60 {translateText("years", language)}
                </option>
                <option value="60+">
                  {translateText("above", language)} 60{" "}
                  {translateText("years", language)}
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>{translateText("gender", language)}</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === "male"}
                    onChange={handleChange}
                  />
                  {translateText("male", language)}
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === "female"}
                    onChange={handleChange}
                  />
                  {translateText("female", language)}
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={formData.gender === "other"}
                    onChange={handleChange}
                  />
                  {translateText("other", language)}
                </label>
              </div>
            </div>

            <div className="form-buttons">
              <button type="button" onClick={nextStep} className="btn-primary">
                {translateText("next", language)} &rarr;
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-step">
            <h3>{translateText("occupationIncome", language)}</h3>

            <div className="form-group">
              <label>{translateText("occupation", language)}</label>
              <select
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
              >
                <option value="">{translateText("select", language)}</option>
                <option value="farmer">
                  {translateText("farmer", language)}
                </option>
                <option value="self-employed">
                  {translateText("selfEmployed", language)}
                </option>
                <option value="salaried">
                  {translateText("salaried", language)}
                </option>
                <option value="unemployed">
                  {translateText("unemployed", language)}
                </option>
                <option value="student">
                  {translateText("student", language)}
                </option>
                <option value="retired">
                  {translateText("retired", language)}
                </option>
                <option value="informal">
                  {translateText("informalWorker", language)}
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>{translateText("monthlyIncome", language)}</label>
              <select
                name="income"
                value={formData.income}
                onChange={handleChange}
              >
                <option value="">{translateText("select", language)}</option>
                <option value="low">
                  {translateText("belowTenK", language)}
                </option>
                <option value="medium-low">₹10,000 - ₹25,000</option>
                <option value="medium">₹25,000 - ₹50,000</option>
                <option value="high">
                  {translateText("aboveFiftyK", language)}
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>{translateText("location", language)}</label>
              <div className="radio-group">
                <label>
                  <input
                    type="radio"
                    name="location"
                    value="rural"
                    checked={formData.location === "rural"}
                    onChange={handleChange}
                  />
                  {translateText("rural", language)}
                </label>
                <label>
                  <input
                    type="radio"
                    name="location"
                    value="urban"
                    checked={formData.location === "urban"}
                    onChange={handleChange}
                  />
                  {translateText("urban", language)}
                </label>
              </div>
            </div>

            <div className="form-buttons">
              <button
                type="button"
                onClick={prevStep}
                className="btn-secondary"
              >
                &larr; {translateText("back", language)}
              </button>
              <button type="button" onClick={nextStep} className="btn-primary">
                {translateText("next", language)} &rarr;
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-step">
            <h3>{translateText("interests", language)}</h3>

            <div className="form-group">
              <label>{translateText("selectInterests", language)}</label>
              <div className="checkbox-group">
                {[
                  { id: "housing", label: translateText("housing", language) },
                  {
                    id: "education",
                    label: translateText("education", language),
                  },
                  {
                    id: "medical",
                    label: translateText("healthcare", language),
                  },
                  {
                    id: "insurance",
                    label: translateText("insurance", language),
                  },
                  { id: "pension", label: translateText("pension", language) },
                  { id: "skill", label: translateText("skillDev", language) },
                  {
                    id: "financial",
                    label: translateText("financial", language),
                  },
                  {
                    id: "agriculture",
                    label: translateText("agriculture", language),
                  },
                ].map((category) => (
                  <label key={category.id}>
                    <input
                      type="checkbox"
                      name="categories"
                      value={category.id}
                      checked={formData.categories.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                    />
                    {category.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-buttons">
              <button
                type="button"
                onClick={prevStep}
                className="btn-secondary"
              >
                &larr; {translateText("back", language)}
              </button>
              <button type="submit" className="btn-primary">
                {translateText("findSchemes", language)}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderResults = () => {
    return (
      <div className="results-container">
        <h2>{translateText("recommendedSchemes", language)}</h2>

        {recommendations.length === 0 ? (
          <div className="no-results">
            <p>{translateText("noSchemesFound", language)}</p>
            <button onClick={resetForm} className="btn-primary">
              {translateText("tryAgain", language)}
            </button>
          </div>
        ) : (
          <>
            <div className="schemes-list">
              {recommendations.map((scheme) => (
                <div key={scheme.id} className="scheme-card">
                  <div className="scheme-icon">{scheme.icon}</div>
                  <div className="scheme-info">
                    <h3>{scheme.name}</h3>
                    <p>{scheme.description}</p>
                    <button
                      onClick={() =>
                        onSchemeSelect(`${scheme.name} के बारे में जानकारी दें`)
                      }
                      className="btn-secondary"
                    >
                      {translateText("learnMore", language)}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={resetForm} className="btn-outline">
              {translateText("startOver", language)}
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="yojana-buddy" id="yojana-buddy">
      <div className="yojana-buddy-container">
        <header className="yojana-buddy-header">
          <h2>{translateText("yojanaBuddy", language)}</h2>
          <p>{translateText("yojanaBuddyDesc", language)}</p>
        </header>

        {showResults ? (
          renderResults()
        ) : (
          <form onSubmit={handleSubmit} className="yojana-buddy-form">
            {renderStep()}
          </form>
        )}
      </div>
    </div>
  );
}

export default YojanaBuddy;
