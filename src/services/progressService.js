const UserProgress = require("../models/UserProgress");
const Question = require("../models/Question");

/**
 * Recalculate and persist UserProgress after a completed attempt.
 *
 * @param {ObjectId} userId
 * @param {Object} attempt - Completed TestAttempt document
 */
exports.updateProgressFromAttempt = async (userId, attempt) => {
  let progress = await UserProgress.findOne({ user: userId });

  if (!progress) {
    progress = new UserProgress({ user: userId });
  }

  const isPassed = attempt.isPassed;
  progress.totalTestsTaken += 1;
  if (isPassed) progress.totalTestsPassed += 1;
  progress.totalQuestionsAnswered += attempt.totalQuestions;
  progress.totalCorrectAnswers =
    (progress.totalCorrectAnswers || 0) + attempt.correctCount;

  progress.overallAccuracy =
    progress.totalQuestionsAnswered > 0
      ? Math.round(
          (progress.totalCorrectAnswers / progress.totalQuestionsAnswered) * 100
        )
      : 0;

  // Category breakdown
  const questionIds = attempt.questionIds;
  const questions = await Question.find({ _id: { $in: questionIds } }).select(
    "category"
  );
  const categoryMap = {};
  questions.forEach((q) => {
    categoryMap[q._id.toString()] = q.category;
  });

  attempt.answers.forEach((ans) => {
    const cat = categoryMap[ans.questionId.toString()];
    if (!cat) return;

    let stat = progress.categoryStats.find((s) => s.category === cat);
    if (!stat) {
      progress.categoryStats.push({ category: cat, totalAnswered: 0, totalCorrect: 0, accuracy: 0 });
      stat = progress.categoryStats[progress.categoryStats.length - 1];
    }
    stat.totalAnswered += 1;
    if (ans.isCorrect) stat.totalCorrect += 1;
    stat.accuracy = Math.round((stat.totalCorrect / stat.totalAnswered) * 100);
  });

  // Streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDate = progress.streak.lastStudyDate
    ? new Date(progress.streak.lastStudyDate)
    : null;
  if (lastDate) lastDate.setHours(0, 0, 0, 0);

  if (!lastDate || lastDate.getTime() < today.getTime() - 86400000) {
    // Gap of more than 1 day — reset streak
    progress.streak.current = 1;
  } else if (lastDate.getTime() === today.getTime() - 86400000) {
    // Consecutive day
    progress.streak.current += 1;
  }

  if (progress.streak.current > progress.streak.longest) {
    progress.streak.longest = progress.streak.current;
  }
  progress.streak.lastStudyDate = today;
  progress.lastActivityAt = new Date();

  await progress.save();
  return progress;
};
