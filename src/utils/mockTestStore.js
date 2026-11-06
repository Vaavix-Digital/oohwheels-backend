// In-memory mock store for Mock Tests Section
// Powers zero-setup Postman testing and Flutter frontend integration
const mockPractice = require("./mockPracticeStore");

const mockQuestions = [];

const mockAttempts = new Map();

function createAttempt({ userId, testType = "full", topicKey, customQuestions }) {
  const attemptId = "att_" + Math.random().toString(36).substring(2, 10);

  const countMap = { full: 50, quick: 15, topic: 20, simulator: 50 };
  const timeMap = { full: 57, quick: 15, topic: 20, simulator: 57 };
  const passMap = { full: 43, quick: 13, topic: 17, simulator: 43 };

  const questionCount = countMap[testType] || 50;
  const timeLimitMinutes = timeMap[testType] || 57;
  const passingScore = passMap[testType] || 43;

  const timeLimitEndsAt = new Date(Date.now() + timeLimitMinutes * 60 * 1000);

  const allAvailable = (customQuestions && customQuestions.length > 0)
    ? customQuestions
    : (mockPractice.mockQuestions || []);
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
