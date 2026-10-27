const Question = require("../models/Question");

/**
 * Score an array of submitted answers against the database answer keys.
 *
 * @param {ObjectId[]} questionIds - Array of question IDs for this attempt
 * @param {Array<{questionId, selectedAnswer}>} submittedAnswers
 * @returns {Array} scored answers with isCorrect, correctAnswer, questionSnapshot
 */
exports.scoreAnswers = async (questionIds, submittedAnswers = []) => {
  // Fetch correct answers for all questions in this attempt
  const questions = await Question.find({
    _id: { $in: questionIds },
  }).select("+correctAnswer questionText");

  const answerMap = {};
  questions.forEach((q) => {
    answerMap[q._id.toString()] = {
      correctAnswer: q.correctAnswer,
      questionText: q.questionText,
    };
  });

  // Build a map of submitted answers for quick lookup
  const submittedMap = {};
  (submittedAnswers || []).forEach((a) => {
    if (a.questionId) submittedMap[a.questionId.toString()] = a.selectedAnswer;
  });

  return questionIds.map((qId) => {
    const qIdStr = qId.toString();
    const meta = answerMap[qIdStr] || {};
    const selectedAnswer = submittedMap[qIdStr] || null;
    const isCorrect =
      selectedAnswer !== null && selectedAnswer === meta.correctAnswer;

    return {
      questionId: qId,
      questionSnapshot: meta.questionText || "",
      selectedAnswer,
      correctAnswer: meta.correctAnswer || "",
      isCorrect,
    };
  });
};
