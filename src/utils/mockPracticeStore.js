// In-memory mock data store for Practice section
// Enables zero-database instant testing for Flutter devs and Postman
let pdfQuestions = [];
try {
  pdfQuestions = require("../data/driving_theory_100.json");
} catch (e) {
  pdfQuestions = [];
}

const mockQuestions = [
  ...(Array.isArray(pdfQuestions) && pdfQuestions.length > 0 ? pdfQuestions : []),
  {
    _id: "q_road_signs_01",
    id: "q_road_signs_01",
    questionText: "What does a triangular road sign with a red border indicate?",
    options: [
      { key: "A", text: "An order you must obey" },
      { key: "B", text: "A hazard or warning ahead" },
      { key: "C", text: "Information or directions" },
      { key: "D", text: "A motorway regulation" },
    ],
    correctAnswer: "B",
    explanation: "Triangular signs with red borders give warnings of hazards ahead (e.g. bends, steep hills, crossings).",
    imageUrl: "https://assets.oohwheels.app/signs/warning-triangle.png",
    category: "Road Signs",
    difficulty: "easy",
  },
  {
    _id: "q_road_signs_02",
    id: "q_road_signs_02",
    questionText: "What does a circular sign with a red border mean?",
    options: [
      { key: "A", text: "Give information" },
      { key: "B", text: "Give an order (usually prohibiting something)" },
      { key: "C", text: "Warn of danger" },
      { key: "D", text: "Indicate a tourist route" },
    ],
    correctAnswer: "B",
    explanation: "Circular signs with red rings tell you what you MUST NOT do (e.g. speed limits, no entry, no overtaking).",
    imageUrl: "https://assets.oohwheels.app/signs/red-circle.png",
    category: "Road Signs",
    difficulty: "easy",
  },
  {
    _id: "q_road_signs_03",
    id: "q_road_signs_03",
    questionText: "What does a blue circular sign indicate?",
    options: [
      { key: "A", text: "A positive instruction or order" },
      { key: "B", text: "A warning of a school crossing" },
      { key: "C", text: "A national speed limit applies" },
      { key: "D", text: "An upcoming services area" },
    ],
    correctAnswer: "A",
    explanation: "Blue circular signs give positive instructions, such as 'turn left ahead' or 'mini-roundabout'.",
    imageUrl: "https://assets.oohwheels.app/signs/blue-circle.png",
    category: "Road Signs",
    difficulty: "medium",
  },
  {
    _id: "q_road_signs_04",
    id: "q_road_signs_04",
    questionText: "What does a sign showing a white circle with a black diagonal stripe mean?",
    options: [
      { key: "A", text: "No parking allowed" },
      { key: "B", text: "National speed limit applies" },
      { key: "C", text: "End of motorway" },
      { key: "D", text: "Single track road ahead" },
    ],
    correctAnswer: "B",
    explanation: "The white circular sign with a single black diagonal stripe signifies that the National Speed Limit applies.",
    imageUrl: "https://assets.oohwheels.app/signs/national-speed-limit.png",
    category: "Road Signs",
    difficulty: "easy",
  },
  {
    _id: "q_safety_01",
    id: "q_safety_01",
    questionText: "What should you do when approaching a zebra crossing?",
    options: [
      { key: "A", text: "Sound your horn to alert pedestrians waiting to cross" },
      { key: "B", text: "Be prepared to slow down and stop for pedestrians" },
      { key: "C", text: "Accelerate quickly to clear the crossing" },
      { key: "D", text: "Only stop if pedestrians are already in your lane" },
    ],
    correctAnswer: "B",
    explanation: "As you approach a zebra crossing, look out for pedestrians waiting to cross and be ready to slow down and stop.",
    imageUrl: "https://assets.oohwheels.app/signs/zebra-crossing.png",
    category: "Vehicle Safety",
    difficulty: "easy",
  },
  {
    _id: "q_safety_02",
    id: "q_safety_02",
    questionText: "What is the minimum legal tyre tread depth for cars in the UK?",
    options: [
      { key: "A", text: "1.0 mm across the entire tyre" },
      { key: "B", text: "1.6 mm across the central three-quarters" },
      { key: "C", text: "2.5 mm across the outer edge" },
      { key: "D", text: "3.0 mm across the central groove" },
    ],
    correctAnswer: "B",
    explanation: "The legal minimum tread depth for cars in the UK is 1.6 mm across the central three-quarters of the breadth of the tyre and around the entire outer circumference.",
    imageUrl: "https://assets.oohwheels.app/signs/tyre-tread.png",
    category: "Vehicle Safety",
    difficulty: "easy",
  },
  {
    _id: "q_alert_01",
    id: "q_alert_01",
    questionText: "You are driving behind a large goods vehicle. Why should you keep well back?",
    options: [
      { key: "A", text: "To help the driver see you in their mirrors and give you a better view ahead" },
      { key: "B", text: "To save fuel by reducing wind drag" },
      { key: "C", text: "To allow cars behind you to overtake quickly" },
      { key: "D", text: "To avoid gravel chips during dry weather" },
    ],
    correctAnswer: "A",
    explanation: "Keeping well back improves your forward vision and ensures you remain visible in the driver's exterior mirrors.",
    imageUrl: null,
    category: "Alertness & Observation",
    difficulty: "medium",
  },
  {
    _id: "q_speed_01",
    id: "q_speed_01",
    questionText: "What is the national speed limit on a single carriageway for cars in Great Britain?",
    options: [
      { key: "A", text: "50 mph" },
      { key: "B", text: "60 mph" },
      { key: "C", text: "70 mph" },
      { key: "D", text: "80 mph" },
    ],
    correctAnswer: "B",
    explanation: "The national speed limit for cars and motorcycles on a single carriageway is 60 mph unless signs indicate otherwise.",
    imageUrl: null,
    category: "Speed Limits",
    difficulty: "easy",
  },
  {
    _id: "q_priority_01",
    id: "q_priority_01",
    questionText: "At a crossroads where no road is marked as priority, who has the right of way?",
    options: [
      { key: "A", text: "Traffic coming from the right" },
      { key: "B", text: "Traffic on the wider road" },
      { key: "C", text: "No one has automatic priority" },
      { key: "D", text: "The faster-moving vehicle" },
    ],
    correctAnswer: "C",
    explanation: "At an unmarked crossroads, no one has automatic priority. All drivers must approach with caution and prepare to stop.",
    imageUrl: null,
    category: "Right of Way",
    difficulty: "medium",
  },
];

const mockFlashSigns = [
  { id: "sign_01", title: "Stop and Give Way", meaning: "You MUST stop before the solid white line and give way to traffic on the main road.", category: "Prohibition", shape: "octagon", imageUrl: "https://assets.oohwheels.app/signs/stop.png" },
  { id: "sign_02", title: "No Entry for Vehicular Traffic", meaning: "No vehicles allowed to enter this road or slipway under any circumstances.", category: "Prohibition", shape: "circle", imageUrl: "https://assets.oohwheels.app/signs/no-entry.png" },
  { id: "sign_03", title: "Maximum Speed Limit (30 mph)", meaning: "Maximum permitted speed is 30 mph unless subsequent signs indicate otherwise.", category: "Prohibition", shape: "circle", imageUrl: "https://assets.oohwheels.app/signs/speed-30.png" },
  { id: "sign_04", title: "Hump Bridge Ahead", meaning: "Approaching a hump bridge, reduce speed and beware of oncoming traffic in the middle of the road.", category: "Warning", shape: "triangle", imageUrl: "https://assets.oohwheels.app/signs/hump-bridge.png" },
  { id: "sign_05", title: "Give Way to Traffic on Major Road", meaning: "Give way to traffic on the major road before proceeding.", category: "Prohibition", shape: "inverted-triangle", imageUrl: "https://assets.oohwheels.app/signs/give-way.png" },
  { id: "sign_06", title: "Turn Left Ahead (Mandatory)", meaning: "Vehicles must turn left ahead at the junction.", category: "Mandatory", shape: "circle", imageUrl: "https://assets.oohwheels.app/signs/turn-left.png" },
  { id: "sign_07", title: "Mini-Roundabout Ahead", meaning: "Approaching a mini-roundabout, give way to traffic approaching from your right.", category: "Mandatory", shape: "circle", imageUrl: "https://assets.oohwheels.app/signs/mini-roundabout.png" },
  { id: "sign_08", title: "Hospital with Accident and Emergency Ahead", meaning: "Directs drivers to hospital with 24-hour urgent care and emergency facilities.", category: "Information", shape: "rectangle", imageUrl: "https://assets.oohwheels.app/signs/hospital.png" },
];

const mockVideos = [
  {
    id: "vid_01",
    title: "Approaching a Roundabout",
    description: "Learn how to yield to traffic on your right and choose the correct lane.",
    durationSeconds: 45,
    videoUrl: "https://assets.oohwheels.app/videos/roundabout-drill.mp4",
    thumbnailUrl: "https://assets.oohwheels.app/thumbnails/roundabout.jpg",
    topicKey: "road-signs",
  },
  {
    id: "vid_02",
    title: "Hazard Perception: Pedestrian Crossing",
    description: "Spot developing hazards near a zebra crossing in wet weather.",
    durationSeconds: 52,
    videoUrl: "https://assets.oohwheels.app/videos/zebra-crossing.mp4",
    thumbnailUrl: "https://assets.oohwheels.app/thumbnails/zebra.jpg",
    topicKey: "hazards",
  },
];

const activeSessions = new Map();

let mockTopicsList = [
  { key: "road-signs", name: "Road Signs", tag: "RULE OF THE ROAD", text: "Warning signs are triangular with a red border. They warn you about hazards ahead — like a bend, junction, or crossing.", audioUrl: "https://assets.oohwheels.app/audio/warning-signs-rule.mp3", xpReward: 30, totalQuestions: 64 },
  { key: "right-of-way", name: "Right of Way", tag: "PRIORITY RULE", text: "At an unmarked crossroads, no one has automatic priority. You must slow down and prepare to stop.", audioUrl: "https://assets.oohwheels.app/audio/priority-rule.mp3", xpReward: 30, totalQuestions: 48 },
  { key: "speed-limits", name: "Speed Limits", tag: "NATIONAL LIMITS", text: "Single carriageway for cars is 60 mph; dual carriageways and motorways are 70 mph unless signposted otherwise.", audioUrl: "https://assets.oohwheels.app/audio/speed-limits.mp3", xpReward: 30, totalQuestions: 32 },
  { key: "hazards", name: "Hazards", tag: "AWARENESS RULE", text: "Always scan at least 12 seconds ahead in urban areas and keep a 2-second gap from the vehicle in front.", audioUrl: "https://assets.oohwheels.app/audio/hazards.mp3", xpReward: 30, totalQuestions: 56 },
  { key: "parking", name: "Parking", tag: "RESTRICTIONS", text: "Never park within 10 metres of a junction or on double yellow lines at any time.", audioUrl: "https://assets.oohwheels.app/audio/parking.mp3", xpReward: 30, totalQuestions: 24 },
  { key: "motorways", name: "Motorways", tag: "LANE DISCIPLINE", text: "Always stay in the left-hand lane unless you are overtaking slower-moving vehicles.", audioUrl: "https://assets.oohwheels.app/audio/motorways.mp3", xpReward: 30, totalQuestions: 36 },
  { key: "vehicle-safety", name: "Vehicle Safety", tag: "MAINTENANCE", text: "Tyre tread depth must be at least 1.6 mm across the central three-quarters of the tyre.", audioUrl: "https://assets.oohwheels.app/audio/safety.mp3", xpReward: 30, totalQuestions: 28 },
  { key: "rules-of-region", name: "Rules of the Region", tag: "UK SPECIFIC", text: "Drive on the left side of the road, give way to traffic from your right on roundabouts.", audioUrl: "https://assets.oohwheels.app/audio/rules.mp3", xpReward: 30, totalQuestions: 12 },
];

module.exports = {
  mockQuestions,
  mockFlashSigns,
  mockVideos,
  mockTopics: mockTopicsList,
  addQuestion(data) {
    const id = "q_" + Date.now().toString(36);
    const videoUrl = data.videoUrl || data.animationUrl || null;
    const newQ = {
      _id: id,
      id,
      questionText: data.questionText || data.text,
      options: data.options || [
        { key: "A", text: data.optionA || "Option A" },
        { key: "B", text: data.optionB || "Option B" },
        { key: "C", text: data.optionC || "Option C" },
        { key: "D", text: data.optionD || "Option D" },
      ],
      correctAnswer: (data.correctAnswer || "A").toUpperCase(),
      explanation: data.explanation || "",
      imageUrl: data.imageUrl || null,
      videoUrl: videoUrl,
      videoThumbnailUrl: data.videoThumbnailUrl || data.thumbnailUrl || null,
      hasVideo: Boolean(videoUrl),
      category: data.category || "Road Signs",
      difficulty: data.difficulty || "medium",
      createdAt: new Date(),
    };
    mockQuestions.unshift(newQ);
    return newQ;
  },
  updateQuestion(id, data) {
    const idx = mockQuestions.findIndex((q) => q._id === id || q.id === id);
    if (idx === -1) return null;
    const existing = mockQuestions[idx];
    const videoUrl = data.videoUrl !== undefined ? data.videoUrl : existing.videoUrl;
    const updated = {
      ...existing,
      ...data,
      videoUrl: videoUrl || null,
      hasVideo: Boolean(videoUrl),
      id: existing.id,
      _id: existing._id,
      updatedAt: new Date(),
    };
    mockQuestions[idx] = updated;
    return updated;
  },
  deleteQuestion(id) {
    const idx = mockQuestions.findIndex((q) => q._id === id || q.id === id);
    if (idx === -1) return false;
    mockQuestions.splice(idx, 1);
    return true;
  },
  addFlashSign(data) {
    const id = "fs_" + Date.now().toString(36);
    const newSign = {
      _id: id,
      id,
      name: data.name,
      category: data.category || "warning",
      imageUrl: data.imageUrl || "https://assets.oohwheels.app/signs/default.png",
      meaning: data.meaning || "",
      createdAt: new Date(),
    };
    mockFlashSigns.unshift(newSign);
    return newSign;
  },
  updateFlashSign(id, data) {
    const idx = mockFlashSigns.findIndex((s) => s._id === id || s.id === id);
    if (idx === -1) return null;
    mockFlashSigns[idx] = { ...mockFlashSigns[idx], ...data, id: mockFlashSigns[idx].id };
    return mockFlashSigns[idx];
  },
  deleteFlashSign(id) {
    const idx = mockFlashSigns.findIndex((s) => s._id === id || s.id === id);
    if (idx === -1) return false;
    mockFlashSigns.splice(idx, 1);
    return true;
  },
  addVideo(data) {
    const id = "vid_" + Date.now().toString(36);
    const newVid = {
      _id: id,
      id,
      title: data.title,
      description: data.description || "",
      durationSeconds: Number(data.durationSeconds) || 45,
      videoUrl: data.videoUrl || "",
      thumbnailUrl: data.thumbnailUrl || "",
      topicKey: data.topicKey || "road-signs",
      createdAt: new Date(),
    };
    mockVideos.unshift(newVid);
    return newVid;
  },
  updateVideo(id, data) {
    const idx = mockVideos.findIndex((v) => v._id === id || v.id === id);
    if (idx === -1) return null;
    mockVideos[idx] = { ...mockVideos[idx], ...data, id: mockVideos[idx].id };
    return mockVideos[idx];
  },
  deleteVideo(id) {
    const idx = mockVideos.findIndex((v) => v._id === id || v.id === id);
    if (idx === -1) return false;
    mockVideos.splice(idx, 1);
    return true;
  },
  updateTopic(key, data) {
    const topic = mockTopicsList.find((t) => t.key === key);
    if (!topic) return null;
    Object.assign(topic, data);
    return topic;
  },
  getQuestionsForTopic(topicKey, count = 10) {
    let list = mockQuestions;
    if (topicKey) {
      const normalizedKey = topicKey.toLowerCase().replace(/[-_]/g, " ");
      const filtered = mockQuestions.filter((q) => {
        const cat = (q.category || "").toLowerCase().replace(/[-_]/g, " ");
        return cat.includes(normalizedKey) || normalizedKey.includes(cat);
      });
      if (filtered.length > 0) list = filtered;
    }
    const sliced = list.slice(0, Number(count) || 10);
    // Strip correct answers for test-taking
    return sliced.map(({ correctAnswer, ...q }) => q);
  },
  createPracticeSession({ userId, topicKey, questionCount, instantFeedback, includeVideos }) {
    const sessionId = "prac_sess_" + Math.random().toString(16).substring(2, 10);
    let matched = mockQuestions;
    if (topicKey) {
      const normalizedKey = topicKey.toLowerCase().replace(/[-_]/g, " ");
      const filtered = mockQuestions.filter((q) => {
        const cat = (q.category || "").toLowerCase().replace(/[-_]/g, " ");
        return cat.includes(normalizedKey) || normalizedKey.includes(cat);
      });
      if (filtered.length > 0) matched = filtered;
    }
    const questions = matched.slice(0, Number(questionCount) || 4);

    const topic = mockTopicsList.find((t) => t.key === topicKey) || mockTopicsList[0];

    const session = {
      _id: sessionId,
      id: sessionId,
      user: userId,
      topicKey,
      topicName: topicKey.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      sessionSetup: {
        questionCount: questions.length,
        instantFeedback: Boolean(instantFeedback),
        includeVideos: Boolean(includeVideos),
      },
      currentStep: 1, // Step 1: Rule, Step 2: Questions, Step 3: Video
      totalSteps: includeVideos ? 3 : 2,
      step1Rule: {
        tag: "RULE OF THE ROAD",
        text: "Warning signs are triangular with a red border. They warn you about hazards ahead — like a bend, junction, or crossing.",
        audioUrl: "https://assets.oohwheels.app/audio/warning-signs-rule.mp3",
        nextHint: "Animated scene up next",
      },
      step2Questions: {
        total: questions.length,
        currentQuestionIndex: 0,
        questions: questions.map(({ correctAnswer, ...q }) => q),
        answers: [],
      },
      step3Video: includeVideos ? mockVideos[0] : null,
      status: "in-progress",
      score: 0,
      xpEarned: 0,
      createdAt: new Date(),
    };

    activeSessions.set(sessionId, session);
    return session;
  },
  getSession(id) {
    return activeSessions.get(id) || null;
  },
  submitSessionAnswer(sessionId, { questionId, selectedKey }) {
    const session = activeSessions.get(sessionId);
    if (!session) return null;

    const originalQuestion = mockQuestions.find((q) => q._id === questionId || q.id === questionId) || mockQuestions[0];
    const isCorrect = originalQuestion.correctAnswer === selectedKey;

    session.step2Questions.answers.push({
      questionId,
      selectedKey,
      isCorrect,
    });

    if (isCorrect) session.score += 1;

    return {
      isCorrect,
      correctAnswer: originalQuestion.correctAnswer,
      explanation: originalQuestion.explanation,
      nextQuestionIndex: session.step2Questions.answers.length,
      isLastQuestion: session.step2Questions.answers.length >= session.step2Questions.total,
    };
  },
  completeSession(sessionId) {
    const session = activeSessions.get(sessionId);
    if (!session) return null;

    session.status = "completed";
    session.xpEarned = session.score * 10 + 10; // 10 XP per correct + 10 completion bonus
    session.accuracyPercentage = Math.round((session.score / Math.max(1, session.step2Questions.total)) * 100);

    return {
      sessionId: session.id,
      score: session.score,
      totalQuestions: session.step2Questions.total,
      accuracyPercentage: session.accuracyPercentage,
      xpEarned: session.xpEarned,
      gemsEarned: 5,
      passed: session.accuracyPercentage >= 75,
    };
  },
};
