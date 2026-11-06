// In-memory mock store for Mock Tests Section
// Powers zero-setup Postman testing and Flutter frontend integration
const mockPractice = require("./mockPracticeStore");

const mockQuestions = [
  {
    id: "q_mock_01",
    _id: "q_mock_01",
    questionText: "What does a triangular road sign with a red border indicate?",
    options: [
      { key: "A", text: "An order you must obey" },
      { key: "B", text: "A hazard or warning ahead" },
      { key: "C", text: "Information or directions" },
      { key: "D", text: "A motorway regulation" },
    ],
    correctAnswer: "B",
    explanation: "Triangular signs with red borders give warnings of hazards ahead.",
    imageUrl: null,
    category: "road-signs",
  },
  {
    id: "q_mock_02",
    _id: "q_mock_02",
    questionText: "What does a circular sign with a red border mean?",
    options: [
      { key: "A", text: "Give information" },
      { key: "B", text: "Give an order (prohibiting something)" },
      { key: "C", text: "Warn of danger" },
      { key: "D", text: "Indicate a tourist route" },
    ],
    correctAnswer: "B",
    explanation: "Circular signs with red borders tell you what you must NOT do.",
    imageUrl: null,
    category: "road-signs",
  },
  {
    id: "q_mock_03",
    _id: "q_mock_03",
    questionText: "What is the national speed limit on a single carriageway for cars in Great Britain?",
    options: [
      { key: "A", text: "50 mph" },
      { key: "B", text: "60 mph" },
      { key: "C", text: "70 mph" },
      { key: "D", text: "80 mph" },
    ],
    correctAnswer: "B",
    explanation: "The national speed limit for cars on single carriageways is 60 mph.",
    imageUrl: null,
    category: "speed-limits",
  },
  {
    id: "q_mock_04",
    _id: "q_mock_04",
    questionText: "At a crossroads where no road is marked as priority, who has the right of way?",
    options: [
      { key: "A", text: "Traffic coming from the right" },
      { key: "B", text: "Traffic on the wider road" },
      { key: "C", text: "No one has priority" },
      { key: "D", text: "The faster vehicle" },
    ],
    correctAnswer: "C",
    explanation: "Where crossroads are unmarked, no one has priority — proceed with caution.",
    imageUrl: null,
    category: "right-of-way",
  },
  {
    id: "q_mock_05",
    _id: "q_mock_05",
    questionText: "You are driving behind a large goods vehicle. Why should you keep well back?",
    options: [
      { key: "A", text: "To help the driver see you in their mirrors" },
      { key: "B", text: "To give yourself a better view of the road ahead" },
      { key: "C", text: "To stay out of their wind shadow" },
      { key: "D", text: "Both A and B" },
    ],
    correctAnswer: "D",
    explanation: "Staying well back improves your forward vision and keeps you in the driver's mirrors.",
    imageUrl: null,
    category: "hazards",
  },
];

const mockAttempts = new Map();

function createAttempt({ userId, testType = "full", topicKey }) {
  const attemptId = "att_" + Math.random().toString(36).substring(2, 10);

  const countMap = { full: 50, quick: 15, topic: 20, simulator: 50 };
  const timeMap = { full: 57, quick: 15, topic: 20, simulator: 57 };
  const passMap = { full: 43, quick: 13, topic: 17, simulator: 43 };

  const questionCount = countMap[testType] || 50;
  const timeLimitMinutes = timeMap[testType] || 57;
  const passingScore = passMap[testType] || 43;

  const timeLimitEndsAt = new Date(Date.now() + timeLimitMinutes * 60 * 1000);

  const allAvailable = [
    ...(mockPractice.mockQuestions || []),
    ...mockQuestions,
  ];
  let pool = allAvailable;
  if (topicKey) {
    const keyLower = topicKey.toLowerCase().replace(/[-_]/g, " ");
    const filtered = allAvailable.filter((q) => (q.category || "").toLowerCase().replace(/[-_]/g, " ").includes(keyLower));
    if (filtered.length > 0) pool = filtered;
  }

  // Generate question list based on templates
  const questions = [];
  for (let i = 0; i < Math.min(questionCount, Math.max(15, pool.length)); i++) {
    const template = pool[i % pool.length];
    questions.push({
      index: i + 1,
      id: `${template.id || template._id}_${i + 1}`,
      questionText: `Q${i + 1}: ${template.questionText}`,
      options: template.options,
      imageUrl: template.imageUrl,
      videoUrl: template.videoUrl || null,
      videoThumbnailUrl: template.videoThumbnailUrl || null,
      hasVideo: Boolean(template.videoUrl),
      category: template.category,
      correctAnswer: template.correctAnswer,
      explanation: template.explanation,
    });
  }

  const attempt = {
    _id: attemptId,
    id: attemptId,
    user: userId,
    testType,
    testTitle:
      testType === "full"
        ? "Full Mock Test — Great Britain (Car)"
        : testType === "quick"
        ? "Quick Mock Test (15 Questions)"
        : testType === "simulator"
        ? "Official Exam Simulator — DVSA Conditions"
        : "Topic Test — Focused Practice",
    totalQuestions: questions.length,
    passingScore: Math.min(passingScore, questions.length),
    timeLimitMinutes,
    timeLimitEndsAt,
    questions,
    flaggedQuestionIds: [],
    answers: [],
    status: "in-progress",
    createdAt: new Date(),
  };

  mockAttempts.set(attemptId, attempt);
  return attempt;
}

function getAttempt(id) {
  return mockAttempts.get(id);
}

function toggleFlag(attemptId, questionId) {
  const attempt = mockAttempts.get(attemptId);
  if (!attempt) return null;

  const qIdStr = String(questionId);
  const idx = attempt.flaggedQuestionIds.indexOf(qIdStr);
  let isFlagged = false;

  if (idx > -1) {
    attempt.flaggedQuestionIds.splice(idx, 1);
    isFlagged = false;
  } else {
    attempt.flaggedQuestionIds.push(qIdStr);
    isFlagged = true;
  }

  return { isFlagged, flaggedQuestionIds: attempt.flaggedQuestionIds };
}

function saveAnswers(attemptId, answers) {
  const attempt = mockAttempts.get(attemptId);
  if (!attempt) return null;

  attempt.answers = answers || [];
  return attempt;
}

function submitAttempt(attemptId, userAnswers = []) {
  const attempt = mockAttempts.get(attemptId);
  if (!attempt) return null;

  const answersToScore = userAnswers.length > 0 ? userAnswers : attempt.answers;
  const answerMap = new Map();
  answersToScore.forEach((a) => answerMap.set(String(a.questionId), a.selectedAnswer));

  let correctCount = 0;
  let skippedCount = 0;

  attempt.questions.forEach((q) => {
    const selected = answerMap.get(String(q.id));
    if (!selected) {
      skippedCount++;
    } else if (selected === q.correctAnswer) {
      correctCount++;
    }
  });

  const total = attempt.questions.length;
  const incorrectCount = total - correctCount - skippedCount;
  const score = Math.round((correctCount / total) * 100);
  const isPassed = correctCount >= attempt.passingScore;

  attempt.status = "completed";
  attempt.score = score;
  attempt.scoreText = `${correctCount}/${total}`;
  attempt.correctCount = correctCount;
  attempt.incorrectCount = incorrectCount;
  attempt.skippedCount = skippedCount;
  attempt.isPassed = isPassed;
  attempt.submittedAt = new Date();

  return {
    attemptId: attempt.id,
    testTitle: attempt.testTitle,
    scoreText: attempt.scoreText,
    scorePercentage: score,
    correctCount,
    incorrectCount,
    skippedCount,
    totalQuestions: total,
    passingScore: attempt.passingScore,
    isPassed,
    badgeText: isPassed ? "Pass" : "Not yet",
    badgeColor: isPassed ? "green" : "red",
    status: attempt.status,
    submittedAt: attempt.submittedAt,
  };
}

module.exports = {
  createAttempt,
  getAttempt,
  toggleFlag,
  saveAnswers,
  submitAttempt,
  mockQuestions,
};
