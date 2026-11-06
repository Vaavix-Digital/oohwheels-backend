const fs = require('fs');
const path = require('path');

const rawQuestionsData = [
  // Topic 1: Road Signs (Questions 1-10)
  {
    num: 1,
    topic: "Road Signs",
    category: "Road Signs",
    difficulty: "easy",
    questionText: "Which shape is used exclusively for the Stop sign?",
    options: [
      { key: "A", text: "Circular" },
      { key: "B", text: "Triangular" },
      { key: "C", text: "Octagonal (eight sides)" }
    ],
    correctAnswer: "C",
    explanation: "The octagon is reserved for Stop, so you can recognise it by shape alone. You must come to a complete halt at the line."
  },
  {
    num: 2,
    topic: "Road Signs",
    category: "Road Signs",
    difficulty: "easy",
    questionText: "What do circular signs with a red border generally tell you?",
    options: [
      { key: "A", text: "Facilities are available nearby" },
      { key: "B", text: "Something is prohibited or restricted" },
      { key: "C", text: "A hazard lies ahead" }
    ],
    correctAnswer: "B",
    explanation: "Red-bordered circles are prohibitory signs, such as No Entry, No Overtaking or speed limits."
  },
  {
    num: 3,
    topic: "Road Signs",
    category: "Road Signs",
    difficulty: "easy",
    questionText: "A triangular sign with a red border is normally used to:",
    options: [
      { key: "A", text: "Show parking facilities" },
      { key: "B", text: "Give a mandatory instruction" },
      { key: "C", text: "Warn you of a hazard ahead" }
    ],
    correctAnswer: "C",
    explanation: "Triangular signs are cautionary. They give advance notice so you can slow down and prepare."
  },
  {
    num: 4,
    topic: "Road Signs",
    category: "Road Signs",
    difficulty: "medium",
    questionText: "What does a blue circular sign usually mean?",
    options: [
      { key: "A", text: "An action you must follow" },
      { key: "B", text: "An action that is forbidden" },
      { key: "C", text: "A petrol station is ahead" }
    ],
    correctAnswer: "A",
    explanation: "Blue circles are mandatory signs, for example 'keep left' or 'compulsory minimum speed'."
  },
  {
    num: 5,
    topic: "Road Signs",
    category: "Road Signs",
    difficulty: "easy",
    questionText: "You see an inverted triangle with a red border. What should you do?",
    options: [
      { key: "A", text: "Slow down and give way to traffic on the road you are joining, stopping if needed" },
      { key: "B", text: "Speed up so you can merge first" },
      { key: "C", text: "Sound your horn and continue without slowing" }
    ],
    correctAnswer: "A",
    explanation: "This is the Give Way sign. Traffic on the main road has priority."
  },
  {
    num: 6,
    topic: "Road Signs",
    category: "Road Signs",
    difficulty: "easy",
    questionText: "What is the main purpose of rectangular informatory signs?",
    options: [
      { key: "A", text: "To forbid certain vehicles" },
      { key: "B", text: "To warn of sharp bends" },
      { key: "C", text: "To give details such as direction, distance or facilities" }
    ],
    correctAnswer: "C",
    explanation: "Informatory and guide signs help with navigation and services. They do not impose restrictions."
  },
  {
    num: 7,
    topic: "Road Signs",
    category: "Road Signs",
    difficulty: "medium",
    questionText: "A red circle with a white horizontal bar means:",
    options: [
      { key: "A", text: "Parking is allowed here" },
      { key: "B", text: "No entry for vehicles from your direction" },
      { key: "C", text: "The road ahead is one-way in your favour" }
    ],
    correctAnswer: "B",
    explanation: "Entering against this sign puts you head-on with oncoming traffic."
  },
  {
    num: 8,
    topic: "Road Signs",
    category: "Road Signs",
    difficulty: "easy",
    questionText: "What does a No Overtaking sign tell you?",
    options: [
      { key: "A", text: "Overtaking is allowed after dark" },
      { key: "B", text: "Only trucks may overtake" },
      { key: "C", text: "You must not overtake on this stretch of road" }
    ],
    correctAnswer: "C",
    explanation: "The restriction applies to all vehicles until the sign cancelling it appears."
  },
  {
    num: 9,
    topic: "Road Signs",
    category: "Road Signs",
    difficulty: "easy",
    questionText: "A sign showing a sharp bend arrow warns you to:",
    options: [
      { key: "A", text: "Switch off your headlights" },
      { key: "B", text: "Accelerate to clear the bend quickly" },
      { key: "C", text: "Reduce speed before reaching the bend" }
    ],
    correctAnswer: "C",
    explanation: "Brake in a straight line before the bend, not in the middle of it."
  },
  {
    num: 10,
    topic: "Road Signs",
    category: "Road Signs",
    difficulty: "easy",
    questionText: "A school-zone warning sign means you should:",
    options: [
      { key: "A", text: "Increase speed to leave the area sooner" },
      { key: "B", text: "Use your horn continuously" },
      { key: "C", text: "Drive slowly and be ready to stop for children" }
    ],
    correctAnswer: "C",
    explanation: "Children may step onto the road suddenly. Lower speed gives you time to react."
  },

  // Topic 2: Road Markings and Signals (Questions 11-20)
  {
    num: 11,
    topic: "Road Markings and Signals",
    category: "Road Signs",
    difficulty: "easy",
    questionText: "A continuous white line along the centre of the road means:",
    options: [
      { key: "A", text: "You must not cross or straddle it" },
      { key: "B", text: "You may cross it freely" },
      { key: "C", text: "Parking is allowed on it" }
    ],
    correctAnswer: "A",
    explanation: "A continuous centre line marks a stretch where crossing is unsafe or prohibited."
  },
  {
    num: 12,
    topic: "Road Markings and Signals",
    category: "Road Signs",
    difficulty: "easy",
    questionText: "A broken white line in the centre of the road means:",
    options: [
      { key: "A", text: "Only emergency vehicles may cross" },
      { key: "B", text: "You must never cross it" },
      { key: "C", text: "You may cross it to overtake when it is safe" }
    ],
    correctAnswer: "C",
    explanation: "Broken lines are permissive, but you must still check the road is clear."
  },
  {
    num: 13,
    topic: "Road Markings and Signals",
    category: "Vehicle Safety",
    difficulty: "easy",
    questionText: "What are zebra crossing stripes for?",
    options: [
      { key: "A", text: "Marking a place where pedestrians have priority to cross" },
      { key: "B", text: "Showing where vehicles must park" },
      { key: "C", text: "Marking a bus-only lane" }
    ],
    correctAnswer: "A",
    explanation: "Slow down on approach and stop for people waiting or crossing."
  },
  {
    num: 14,
    topic: "Road Markings and Signals",
    category: "Rules of the Region",
    difficulty: "easy",
    questionText: "What does a steady red traffic light require you to do?",
    options: [
      { key: "A", text: "Stop behind the stop line" },
      { key: "B", text: "Stop only if other vehicles are present" },
      { key: "C", text: "Slow down and pass if clear" }
    ],
    correctAnswer: "A",
    explanation: "A red light means stop, whether or not other traffic is visible."
  },
  {
    num: 15,
    topic: "Road Markings and Signals",
    category: "Rules of the Region",
    difficulty: "easy",
    questionText: "A steady amber (yellow) light is showing as you approach. You should:",
    options: [
      { key: "A", text: "Speed up to cross" },
      { key: "B", text: "Prepare to stop, and stop unless you are too close to stop safely" },
      { key: "C", text: "Treat it as green" }
    ],
    correctAnswer: "B",
    explanation: "Amber warns that red is coming. Stop if you can do so safely."
  },
  {
    num: 16,
    topic: "Road Markings and Signals",
    category: "Rules of the Region",
    difficulty: "medium",
    questionText: "What should you do at a flashing red signal?",
    options: [
      { key: "A", text: "Stop, check, and proceed only when safe" },
      { key: "B", text: "Slow down and drive through" },
      { key: "C", text: "Wait for it to turn steady" }
    ],
    correctAnswer: "A",
    explanation: "A flashing red is treated like a Stop sign."
  },
  {
    num: 17,
    topic: "Road Markings and Signals",
    category: "Right of Way",
    difficulty: "medium",
    questionText: "The signal shows red but there is a green arrow for the right turn. You may:",
    options: [
      { key: "A", text: "Ignore the arrow and wait for full green" },
      { key: "B", text: "Go straight ahead" },
      { key: "C", text: "Move only in the direction of the arrow, giving way to others in the junction" }
    ],
    correctAnswer: "C",
    explanation: "The arrow permits only that movement, and you still must not endanger anyone."
  },
  {
    num: 18,
    topic: "Road Markings and Signals",
    category: "Rules of the Region",
    difficulty: "easy",
    questionText: "Where must you stop at a red light?",
    options: [
      { key: "A", text: "Behind the stop line, before the crossing" },
      { key: "B", text: "Just past the line, to see better" },
      { key: "C", text: "On the zebra crossing" }
    ],
    correctAnswer: "A",
    explanation: "Stopping on the crossing blocks pedestrians and forces them into traffic."
  },
  {
    num: 19,
    topic: "Road Markings and Signals",
    category: "Road Signs",
    difficulty: "medium",
    questionText: "What are reflective road studs ('cat's eyes') for?",
    options: [
      { key: "A", text: "Marking parking spots" },
      { key: "B", text: "Telling drivers to stop" },
      { key: "C", text: "Helping drivers see the lane edges and centre at night" }
    ],
    correctAnswer: "C",
    explanation: "They reflect headlights, making the road layout clear in darkness and rain."
  },
  {
    num: 20,
    topic: "Road Markings and Signals",
    category: "Rules of the Region",
    difficulty: "easy",
    questionText: "A traffic officer's hand signal conflicts with the traffic light. You should:",
    options: [
      { key: "A", text: "Follow the vehicle in front" },
      { key: "B", text: "Follow the light" },
      { key: "C", text: "Follow the officer's instruction" }
    ],
    correctAnswer: "C",
    explanation: "Police instructions override fixed signals and signs."
  },

  // Topic 3: Right of Way and Junctions (Questions 21-30)
  {
    num: 21,
    topic: "Right of Way and Junctions",
    category: "Right of Way",
    difficulty: "easy",
    questionText: "At a roundabout, who normally has priority?",
    options: [
      { key: "A", text: "Traffic already on the roundabout" },
      { key: "B", text: "The largest vehicle" },
      { key: "C", text: "Traffic waiting to enter" }
    ],
    correctAnswer: "A",
    explanation: "Wait for a safe gap and enter without forcing other drivers to brake hard."
  },
  {
    num: 22,
    topic: "Right of Way and Junctions",
    category: "Right of Way",
    difficulty: "easy",
    questionText: "You are entering a main road from a minor road with no signals. You should:",
    options: [
      { key: "A", text: "Enter quickly without looking" },
      { key: "B", text: "Give way to traffic on the main road" },
      { key: "C", text: "Expect main-road traffic to stop for you" }
    ],
    correctAnswer: "B",
    explanation: "The main road has priority, so enter only when you have a safe gap."
  },
  {
    num: 23,
    topic: "Right of Way and Junctions",
    category: "Right of Way",
    difficulty: "easy",
    questionText: "An ambulance with siren and flashing lights is approaching from behind. You should:",
    options: [
      { key: "A", text: "Move aside safely and let it pass, stopping if necessary" },
      { key: "B", text: "Keep your lane and ignore it" },
      { key: "C", text: "Speed up to stay ahead of it" }
    ],
    correctAnswer: "A",
    explanation: "Emergency vehicles save lives. Make space without causing a collision."
  },
  {
    num: 24,
    topic: "Right of Way and Junctions",
    category: "Right of Way",
    difficulty: "easy",
    questionText: "You are turning right and there is oncoming traffic. You must:",
    options: [
      { key: "A", text: "Flash your lights and turn" },
      { key: "B", text: "Turn immediately because you have indicated" },
      { key: "C", text: "Give way to oncoming vehicles before crossing their path" }
    ],
    correctAnswer: "C",
    explanation: "Your turn crosses their lane, so you wait for a safe gap."
  },
  {
    num: 25,
    topic: "Right of Way and Junctions",
    category: "Vehicle Safety",
    difficulty: "easy",
    questionText: "A pedestrian is waiting at a zebra crossing. You should:",
    options: [
      { key: "A", text: "Slow down and stop to let them cross" },
      { key: "B", text: "Sound the horn and continue" },
      { key: "C", text: "Speed up to pass first" }
    ],
    correctAnswer: "A",
    explanation: "Pedestrians on a crossing have priority."
  },
  {
    num: 26,
    topic: "Right of Way and Junctions",
    category: "Right of Way",
    difficulty: "medium",
    questionText: "On a narrow hill road, an uphill and a downhill vehicle meet. Who should generally give way?",
    options: [
      { key: "A", text: "The vehicle going downhill" },
      { key: "B", text: "Whoever is faster" },
      { key: "C", text: "The vehicle going uphill" }
    ],
    correctAnswer: "A",
    explanation: "It is easier for the descending vehicle to stop and hold position than for the climbing one to restart on a slope."
  },
  {
    num: 27,
    topic: "Right of Way and Junctions",
    category: "Hazards",
    difficulty: "easy",
    questionText: "What must you do at an unmanned railway level crossing?",
    options: [
      { key: "A", text: "Stop, look and listen in both directions, and cross only when clear" },
      { key: "B", text: "Follow the car ahead without checking" },
      { key: "C", text: "Cross quickly if no train is visible" }
    ],
    correctAnswer: "A",
    explanation: "Trains cannot stop quickly, so crossing needs full attention."
  },
  {
    num: 28,
    topic: "Right of Way and Junctions",
    category: "Motorways",
    difficulty: "easy",
    questionText: "You are merging from a slip road onto an expressway. You should:",
    options: [
      { key: "A", text: "Stop at the end of the slip road" },
      { key: "B", text: "Match the traffic speed and merge into a safe gap" },
      { key: "C", text: "Force your way into the nearest lane" }
    ],
    correctAnswer: "B",
    explanation: "Joining at the right speed avoids sudden braking by other drivers."
  },
  {
    num: 29,
    topic: "Right of Way and Junctions",
    category: "Right of Way",
    difficulty: "easy",
    questionText: "When turning left at a junction, you should:",
    options: [
      { key: "A", text: "Swing wide to the right first" },
      { key: "B", text: "Signal early and watch for two-wheelers and pedestrians on your left" },
      { key: "C", text: "Turn without signalling" }
    ],
    correctAnswer: "B",
    explanation: "Riders and walkers can be hidden alongside your vehicle."
  },
  {
    num: 30,
    topic: "Right of Way and Junctions",
    category: "Right of Way",
    difficulty: "medium",
    questionText: "The traffic signals at a junction are not working and no officer is present. You should:",
    options: [
      { key: "A", text: "Pass at full speed" },
      { key: "B", text: "Assume your direction has green" },
      { key: "C", text: "Treat it as uncontrolled, slow down and proceed with great care" }
    ],
    correctAnswer: "C",
    explanation: "Dead signals do not give anyone priority, so negotiate the junction slowly."
  },

  // Topic 4: Overtaking and Lane Discipline (Questions 31-40)
  {
    num: 31,
    topic: "Overtaking and Lane Discipline",
    category: "Rules of the Region",
    difficulty: "easy",
    questionText: "In left-hand traffic, you should normally overtake on:",
    options: [
      { key: "A", text: "The left side" },
      { key: "B", text: "The right side of the vehicle ahead" },
      { key: "C", text: "Whichever side is wider" }
    ],
    correctAnswer: "B",
    explanation: "Overtaking on the side of oncoming traffic is standard, so check that it is clear."
  },
  {
    num: 32,
    topic: "Overtaking and Lane Discipline",
    category: "Rules of the Region",
    difficulty: "easy",
    questionText: "Before overtaking, you must first:",
    options: [
      { key: "A", text: "Check the road ahead and behind, signal, and be sure there is enough clear distance" },
      { key: "B", text: "Sound the horn and go" },
      { key: "C", text: "Accelerate close behind the other vehicle" }
    ],
    correctAnswer: "A",
    explanation: "Make sure you can complete the move before any oncoming traffic arrives."
  },
  {
    num: 33,
    topic: "Overtaking and Lane Discipline",
    category: "Hazards",
    difficulty: "easy",
    questionText: "In which situation should you NOT overtake?",
    options: [
      { key: "A", text: "When the road is wide and empty" },
      { key: "B", text: "Near a bend, hill crest, junction or bridge" },
      { key: "C", text: "On a long clear straight with good visibility" }
    ],
    correctAnswer: "B",
    explanation: "You cannot see oncoming traffic at those places."
  },
  {
    num: 34,
    topic: "Overtaking and Lane Discipline",
    category: "Hazards",
    difficulty: "medium",
    questionText: "The driver ahead is signalling to overtake. You should:",
    options: [
      { key: "A", text: "Move onto the shoulder" },
      { key: "B", text: "Stay behind and not overtake at the same time" },
      { key: "C", text: "Overtake them both at once" }
    ],
    correctAnswer: "B",
    explanation: "Two drivers overtaking one another's path is a classic cause of head-on crashes."
  },
  {
    num: 35,
    topic: "Overtaking and Lane Discipline",
    category: "Rules of the Region",
    difficulty: "easy",
    questionText: "A vehicle is trying to overtake you. You should:",
    options: [
      { key: "A", text: "Move towards the centre" },
      { key: "B", text: "Speed up to stop it passing" },
      { key: "C", text: "Keep left and avoid speeding up" }
    ],
    correctAnswer: "C",
    explanation: "Making room and keeping steady speed lets the pass finish quickly."
  },
  {
    num: 36,
    topic: "Overtaking and Lane Discipline",
    category: "Rules of the Region",
    difficulty: "easy",
    questionText: "After overtaking, when should you move back to your lane?",
    options: [
      { key: "A", text: "When you can see the overtaken vehicle in your mirror and the gap is safe" },
      { key: "B", text: "Immediately, even if you cut it off" },
      { key: "C", text: "Only after driving another kilometre" }
    ],
    correctAnswer: "A",
    explanation: "Pulling in too soon can force the other driver to brake."
  },
  {
    num: 37,
    topic: "Overtaking and Lane Discipline",
    category: "Rules of the Region",
    difficulty: "easy",
    questionText: "What is the correct way to change lanes?",
    options: [
      { key: "A", text: "Check mirrors and blind spot, signal, then move smoothly" },
      { key: "B", text: "Signal and move at the same moment without looking" },
      { key: "C", text: "Move first and signal afterward" }
    ],
    correctAnswer: "A",
    explanation: "A signal only announces your intention. You still need to confirm the space is free."
  },
  {
    num: 38,
    topic: "Overtaking and Lane Discipline",
    category: "Motorways",
    difficulty: "easy",
    questionText: "Which lane should slower vehicles generally use?",
    options: [
      { key: "A", text: "The left lane" },
      { key: "B", text: "The right lane" },
      { key: "C", text: "The centre of the road" }
    ],
    correctAnswer: "A",
    explanation: "Keeping the right lane free for passing helps traffic flow safely."
  },
  {
    num: 39,
    topic: "Overtaking and Lane Discipline",
    category: "Rules of the Region",
    difficulty: "easy",
    questionText: "Is it acceptable to drive straddling two lanes?",
    options: [
      { key: "A", text: "No, stay within one lane" },
      { key: "B", text: "Yes, if the road is empty" },
      { key: "C", text: "Yes, to avoid potholes at any time" }
    ],
    correctAnswer: "A",
    explanation: "Straddling confuses other drivers and reduces the safety margin."
  },
  {
    num: 40,
    topic: "Overtaking and Lane Discipline",
    category: "Rules of the Region",
    difficulty: "easy",
    questionText: "You are stuck in a slow line of traffic. The best action is:",
    options: [
      { key: "A", text: "Stay in your lane and keep a safe gap" },
      { key: "B", text: "Weave between lanes constantly" },
      { key: "C", text: "Use the shoulder to get ahead" }
    ],
    correctAnswer: "A",
    explanation: "Repeated lane changes add risk and rarely save meaningful time."
  },

  // Topic 5: Speed and Safe Distance (Questions 41-50)
  {
    num: 41,
    topic: "Speed and Safe Distance",
    category: "Speed Limits",
    difficulty: "easy",
    questionText: "A good guide to a safe following distance in dry weather is:",
    options: [
      { key: "A", text: "At least a three-second gap" },
      { key: "B", text: "Bumper to bumper at low speed" },
      { key: "C", text: "One car length at any speed" }
    ],
    correctAnswer: "A",
    explanation: "Pick a fixed roadside object and count the seconds after the vehicle ahead passes it."
  },
  {
    num: 42,
    topic: "Speed and Safe Distance",
    category: "Speed Limits",
    difficulty: "easy",
    questionText: "A posted speed limit means:",
    options: [
      { key: "A", text: "You may exceed it for short stretches" },
      { key: "B", text: "You must always drive exactly at that speed" },
      { key: "C", text: "It is the maximum for good conditions, and you may need to go lower" }
    ],
    correctAnswer: "C",
    explanation: "Rain, traffic, or poor visibility can make the limit too fast."
  },
  {
    num: 43,
    topic: "Speed and Safe Distance",
    category: "Speed Limits",
    difficulty: "medium",
    questionText: "Total stopping distance is made up of:",
    options: [
      { key: "A", text: "Reaction distance only" },
      { key: "B", text: "Reaction distance plus braking distance" },
      { key: "C", text: "Baking distance only" }
    ],
    correctAnswer: "B",
    explanation: "Your vehicle keeps moving during your reaction time, before the brakes even begin to work."
  },
  {
    num: 44,
    topic: "Speed and Safe Distance",
    category: "Speed Limits",
    difficulty: "medium",
    questionText: "If you double your speed, the braking distance becomes roughly:",
    options: [
      { key: "A", text: "Twice as long" },
      { key: "B", text: "Unchanged" },
      { key: "C", text: "Four times longer" }
    ],
    correctAnswer: "C",
    explanation: "Braking distance rises with the square of speed."
  },
  {
    num: 45,
    topic: "Speed and Safe Distance",
    category: "Hazards",
    difficulty: "easy",
    questionText: "On a wet road, you should:",
    options: [
      { key: "A", text: "Increase the gap behind the vehicle ahead" },
      { key: "B", text: "Reduce the gap to stay visible" },
      { key: "C", text: "Keep the same gap as in dry weather" }
    ],
    correctAnswer: "A",
    explanation: "Wet surfaces reduce tyre grip, so the vehicle takes longer to stop."
  },
  {
    num: 46,
    topic: "Speed and Safe Distance",
    category: "Speed Limits",
    difficulty: "easy",
    questionText: "Near schools and hospitals, you should:",
    options: [
      { key: "A", text: "Reduce speed and be prepared to stop" },
      { key: "B", text: "Maintain your cruising speed" },
      { key: "C", text: "Use the horn constantly" }
    ],
    correctAnswer: "A",
    explanation: "These areas have unpredictable pedestrians and need quiet, careful driving."
  },
  {
    num: 47,
    topic: "Speed and Safe Distance",
    category: "Hazards",
    difficulty: "easy",
    questionText: "Why is tailgating dangerous?",
    options: [
      { key: "A", text: "It improves your view of the road" },
      { key: "B", text: "It leaves you no time to react if the vehicle ahead brakes" },
      { key: "C", text: "It saves fuel" }
    ],
    correctAnswer: "B",
    explanation: "A small gap turns a sudden stop into a rear-end collision."
  },
  {
    num: 48,
    topic: "Speed and Safe Distance",
    category: "Motorways",
    difficulty: "easy",
    questionText: "Driving much slower than the traffic flow in a fast lane:",
    options: [
      { key: "A", text: "Can create a hazard and should be avoided" },
      { key: "B", text: "Is required by law" },
      { key: "C", text: "Is the safest option" }
    ],
    correctAnswer: "A",
    explanation: "Large speed differences force others to brake or overtake risky."
  },
  {
    num: 49,
    topic: "Speed and Safe Distance",
    category: "Vehicle Safety",
    difficulty: "medium",
    questionText: "On a long downhill road, the safest practice is to:",
    options: [
      { key: "A", text: "Use a lower gear to control speed" },
      { key: "B", text: "Ride the brake pedal continuously" },
      { key: "C", text: "Coast in neutral" }
    ],
    correctAnswer: "A",
    explanation: "Engine braking prevents overheated brakes and keeps control."
  },
  {
    num: 50,
    topic: "Speed and Safe Distance",
    category: "Hazards",
    difficulty: "easy",
    questionText: "When approaching a bend, you should:",
    options: [
      { key: "A", text: "Speed up to take it smoothly" },
      { key: "B", text: "Slow down before the bend and accelerate gently as you exit" },
      { key: "C", text: "Brake hard in the middle of the bend" }
    ],
    correctAnswer: "B",
    explanation: "Braking mid-bend can unsettle the vehicle."
  },

  // Topic 6: Safe Driving Habits (Questions 51-60)
  {
    num: 51,
    topic: "Safe Driving Habits",
    category: "Alertness & Observation",
    difficulty: "easy",
    questionText: "Using a hand-held mobile phone while driving is:",
    options: [
      { key: "A", text: "Dangerous and should be avoided. Stop in a safe place if you need to use it" },
      { key: "B", text: "Fine if the call is short" },
      { key: "C", text: "Safe at low speed" }
    ],
    correctAnswer: "A",
    explanation: "It takes your eyes, hands and attention away from the road."
  },
  {
    num: 52,
    topic: "Safe Driving Habits",
    category: "Alertness & Observation",
    difficulty: "easy",
    questionText: "Which statement about alcohol and driving is correct?",
    options: [
      { key: "A", text: "Alcohol only matters at high speeds" },
      { key: "B", text: "Even a small amount can slow reactions and impair judgement" },
      { key: "C", text: "Coffee quickly makes you sober" }
    ],
    correctAnswer: "B",
    explanation: "The safest choice is not to drive at all after drinking."
  },
  {
    num: 53,
    topic: "Safe Driving Habits",
    category: "Alertness & Observation",
    difficulty: "easy",
    questionText: "When you feel very sleepy at the wheel, you should:",
    options: [
      { key: "A", text: "Stop in a safe place and rest" },
      { key: "B", text: "Turn up the music" },
      { key: "C", text: "Open the window and continue" }
    ],
    correctAnswer: "A",
    explanation: "Tiredness cannot be beaten by tricks. Rest is the only cure."
  },
  {
    num: 54,
    topic: "Safe Driving Habits",
    category: "Vehicle Safety",
    difficulty: "easy",
    questionText: "Who must wear a seat belt in a car?",
    options: [
      { key: "A", text: "Only front passengers" },
      { key: "B", text: "All occupants, including rear passengers" },
      { key: "C", text: "Only the driver" }
    ],
    correctAnswer: "B",
    explanation: "Belts reduce the risk of serious injury for everyone on board."
  },
  {
    num: 55,
    topic: "Safe Driving Habits",
    category: "Vehicle Safety",
    difficulty: "easy",
    questionText: "Two-wheeler riders and pillion passengers should:",
    options: [
      { key: "A", text: "Wear properly fastened helmets" },
      { key: "B", text: "Wear helmets only at night" },
      { key: "C", text: "Wear helmets only on highways" }
    ],
    correctAnswer: "A",
    explanation: "A fastened helmet greatly reduces head injury in a fall or crash."
  },
  {
    num: 56,
    topic: "Safe Driving Habits",
    category: "Vehicle Safety",
    difficulty: "easy",
    questionText: "Before you start driving, you should:",
    options: [
      { key: "A", text: "Adjust only the radio" },
      { key: "B", text: "Wait until you are on the move" },
      { key: "C", text: "Adjust the seat, mirrors and steering position" }
    ],
    correctAnswer: "C",
    explanation: "Correct setup improves control and visibility."
  },
  {
    num: 57,
    topic: "Safe Driving Habits",
    category: "Alertness & Observation",
    difficulty: "easy",
    questionText: "Another driver behaves aggressively toward you. The best response is:",
    options: [
      { key: "A", text: "Stay calm, keep your distance and avoid retaliating" },
      { key: "B", text: "Brake sharply to teach a lesson" },
      { key: "C", text: "Chase and confront them" }
    ],
    correctAnswer: "A",
    explanation: "Retaliation escalates danger for everyone."
  },
  {
    num: 58,
    topic: "Safe Driving Habits",
    category: "Alertness & Observation",
    difficulty: "easy",
    questionText: "You have taken medicine that can cause drowsiness. You should:",
    options: [
      { key: "A", text: "Drive as usual" },
      { key: "B", text: "Drive only on quiet roads" },
      { key: "C", text: "Avoid driving and check with a doctor or pharmacist" }
    ],
    correctAnswer: "C",
    explanation: "Some common medicines slow reaction times without you noticing."
  },
  {
    num: 59,
    topic: "Safe Driving Habits",
    category: "Rules of the Region",
    difficulty: "easy",
    questionText: "What is the correct use of the horn?",
    options: [
      { key: "A", text: "To warn others when necessary, and not unnecessarily in quiet zones" },
      { key: "B", text: "To express annoyance" },
      { key: "C", text: "To hurry pedestrians" }
    ],
    correctAnswer: "A",
    explanation: "Needless honking adds noise and stress, and is banned in silence zones."
  },
  {
    num: 60,
    topic: "Safe Driving Habits",
    category: "Alertness & Observation",
    difficulty: "easy",
    questionText: "Eating or adjusting infotainment while moving:",
    options: [
      { key: "A", text: "Is fine for experienced drivers" },
      { key: "B", text: "Is fine in light traffic" },
      { key: "C", text: "Takes attention off the road and should be avoided" }
    ],
    correctAnswer: "C",
    explanation: "Any distraction, even a few seconds, can cover a long distance at speed."
  },

  // Topic 7: Weather and Night Driving (Questions 61-70)
  {
    num: 61,
    topic: "Weather and Night Driving",
    category: "Hazards",
    difficulty: "easy",
    questionText: "In heavy rain, you should:",
    options: [
      { key: "A", text: "Keep your speed to avoid being hit" },
      { key: "B", text: "Use high beam for better view" },
      { key: "C", text: "Reduce speed, use dipped headlights and increase your gap" }
    ],
    correctAnswer: "C",
    explanation: "Rain reduces both visibility and grip."
  },
  {
    num: 62,
    topic: "Weather and Night Driving",
    category: "Hazards",
    difficulty: "medium",
    questionText: "Your car starts to aquaplane. You should:",
    options: [
      { key: "A", text: "Steer sharply left and right" },
      { key: "B", text: "Brake as hard as possible" },
      { key: "C", text: "Ease off the accelerator and steer straight, avoiding hard braking" }
    ],
    correctAnswer: "C",
    explanation: "Sudden inputs can spin the car. Let speed fall until the tyres grip again."
  },
  {
    num: 63,
    topic: "Weather and Night Driving",
    category: "Hazards",
    difficulty: "easy",
    questionText: "In fog, which lights should you use?",
    options: [
      { key: "A", text: "High beam" },
      { key: "B", text: "Dipped (low-beam) headlights and fog lamps if fitted" },
      { key: "C", text: "Parking lights only" }
    ],
    correctAnswer: "B",
    explanation: "High beam reflects off fog droplets and makes visibility worse."
  },
  {
    num: 64,
    topic: "Weather and Night Driving",
    category: "Hazards",
    difficulty: "easy",
    questionText: "When an oncoming vehicle approaches at night, you should:",
    options: [
      { key: "A", text: "Keep high beam on" },
      { key: "B", text: "Dip your headlights" },
      { key: "C", text: "Switch lights off" }
    ],
    correctAnswer: "B",
    explanation: "Dipping prevents dazzling the other driver."
  },
  {
    num: 65,
    topic: "Weather and Night Driving",
    category: "Hazards",
    difficulty: "easy",
    questionText: "You are dazzled by oncoming headlights. The best action is to:",
    options: [
      { key: "A", text: "Stare at the lights" },
      { key: "B", text: "Close your eyes briefly" },
      { key: "C", text: "Slow down and look toward the left edge of the road" }
    ],
    correctAnswer: "C",
    explanation: "Using the road edge as a guide keeps the car positioned without looking into glare."
  },
  {
    num: 66,
    topic: "Weather and Night Driving",
    category: "Hazards",
    difficulty: "easy",
    questionText: "You come to a flooded road and cannot tell how deep it is. You should:",
    options: [
      { key: "A", text: "Drive through quickly" },
      { key: "B", text: "Not drive through it" },
      { key: "C", text: "Follow the first vehicle you see" }
    ],
    correctAnswer: "B",
    explanation: "Water can stall an engine or sweep a vehicle away."
  },
  {
    num: 67,
    topic: "Weather and Night Driving",
    category: "Vehicle Safety",
    difficulty: "easy",
    questionText: "After driving through deep water, you should:",
    options: [
      { key: "A", text: "Test your brakes gently" },
      { key: "B", text: "Accelerate immediately" },
      { key: "C", text: "Ignore it" }
    ],
    correctAnswer: "A",
    explanation: "Wet brakes can lose effect until dried by light application."
  },
  {
    num: 68,
    topic: "Weather and Night Driving",
    category: "Hazards",
    difficulty: "medium",
    questionText: "The first rain after a long dry spell makes the road:",
    options: [
      { key: "A", text: "More slippery, due to oil and dust mixing with water" },
      { key: "B", text: "Less slippery" },
      { key: "C", text: "Unchanged" }
    ],
    correctAnswer: "A",
    explanation: "That film lowers grip, so drive more carefully."
  },
  {
    num: 69,
    topic: "Weather and Night Driving",
    category: "Hazards",
    difficulty: "easy",
    questionText: "In strong crosswinds, you should:",
    options: [
      { key: "A", text: "Drive faster to stabilise" },
      { key: "B", text: "Let go of the wheel slightly" },
      { key: "C", text: "Hold the steering firmly and take care when passing large vehicles" }
    ],
    correctAnswer: "C",
    explanation: "Gusts can push the car sideways, especially in gaps or when passing trucks."
  },
  {
    num: 70,
    topic: "Weather and Night Driving",
    category: "Vehicle Safety",
    difficulty: "easy",
    questionText: "The inside of your windscreen is fogging up. You should:",
    options: [
      { key: "A", text: "Use the demister or air conditioning to clear it" },
      { key: "B", text: "Ignore it and drive slowly" },
      { key: "C", text: "Wipe with your hand while driving" }
    ],
    correctAnswer: "A",
    explanation: "A clear windscreen is essential. Use the controls designed for it."
  },

  // Topic 8: Pedestrians and Vulnerable Road Users (Questions 71-80)
  {
    num: 71,
    topic: "Pedestrians and Vulnerable Road Users",
    category: "Vehicle Safety",
    difficulty: "easy",
    questionText: "Pedestrians are waiting to cross at a zebra crossing. You should:",
    options: [
      { key: "A", text: "Honk to warn them" },
      { key: "B", text: "Stop and let them cross" },
      { key: "C", text: "Pass quickly behind them" }
    ],
    correctAnswer: "B",
    explanation: "They have priority on a crossing."
  },
  {
    num: 72,
    topic: "Pedestrians and Vulnerable Road Users",
    category: "Hazards",
    difficulty: "easy",
    questionText: "When driving near children playing by the roadside:",
    options: [
      { key: "A", text: "Keep speed constant" },
      { key: "B", text: "Slow down, as they may run out unexpectedly" },
      { key: "C", text: "Use your horn loudly" }
    ],
    correctAnswer: "B",
    explanation: "Children often fail to judge traffic."
  },
  {
    num: 73,
    topic: "Pedestrians and Vulnerable Road Users",
    category: "Hazards",
    difficulty: "easy",
    questionText: "When overtaking a cyclist, you should:",
    options: [
      { key: "A", text: "Honk and pass without moving over" },
      { key: "B", text: "Leave plenty of side space and pass only when safe" },
      { key: "C", text: "Pass as close as possible" }
    ],
    correctAnswer: "B",
    explanation: "Wobbles or road hazards can push a cyclist sideways."
  },
  {
    num: 74,
    topic: "Pedestrians and Vulnerable Road Users",
    category: "Alertness & Observation",
    difficulty: "easy",
    questionText: "Why should you check mirrors and blind spots before turning?",
    options: [
      { key: "A", text: "Two-wheelers can be hidden beside your vehicle" },
      { key: "B", text: "To adjust your seat" },
      { key: "C", text: "To look at passengers" }
    ],
    correctAnswer: "A",
    explanation: "Riders can appear in blind spots very suddenly."
  },
  {
    num: 75,
    topic: "Pedestrians and Vulnerable Road Users",
    category: "Hazards",
    difficulty: "easy",
    questionText: "A person with a white cane is crossing. You should:",
    options: [
      { key: "A", text: "Drive around them quickly" },
      { key: "B", text: "Honk to hurry them" },
      { key: "C", text: "Stop and give them time to cross safely" }
    ],
    correctAnswer: "C",
    explanation: "A white cane shows visual impairment, so patience is essential."
  },
  {
    num: 76,
    topic: "Pedestrians and Vulnerable Road Users",
    category: "Hazards",
    difficulty: "easy",
    questionText: "A bus has stopped and passengers are getting off. You should:",
    options: [
      { key: "A", text: "Pass at normal speed" },
      { key: "B", text: "Slow down and watch for people crossing in front of it" },
      { key: "C", text: "Honk to clear the way" }
    ],
    correctAnswer: "B",
    explanation: "Pedestrians often cross without seeing your vehicle."
  },
  {
    num: 77,
    topic: "Pedestrians and Vulnerable Road Users",
    category: "Hazards",
    difficulty: "easy",
    questionText: "An animal is on the road ahead. You should:",
    options: [
      { key: "A", text: "Swerve without checking traffic" },
      { key: "B", text: "Honk aggressively and speed up" },
      { key: "C", text: "Slow down and wait for it to move away" }
    ],
    correctAnswer: "C",
    explanation: "Sudden noise can scare animals into unpredictable movement."
  },
  {
    num: 78,
    topic: "Pedestrians and Vulnerable Road Users",
    category: "Vehicle Safety",
    difficulty: "easy",
    questionText: "Before opening a car door on the traffic side, you should:",
    options: [
      { key: "A", text: "Check mirrors and look back for approaching traffic" },
      { key: "B", text: "Open it quickly" },
      { key: "C", text: "Ask a passenger to open it for you" }
    ],
    correctAnswer: "A",
    explanation: "An opened door can hit a passing cyclist or rider."
  },
  {
    num: 79,
    topic: "Pedestrians and Vulnerable Road Users",
    category: "Hazards",
    difficulty: "easy",
    questionText: "A pedestrian might step out from between parked vehicles. This means:",
    options: [
      { key: "A", text: "Pedestrians never do that" },
      { key: "B", text: "You should stay alert and keep your speed down in such areas" },
      { key: "C", text: "You can ignore parked vehicles" }
    ],
    correctAnswer: "B",
    explanation: "Hidden pedestrians are a common cause of crashes."
  },
  {
    num: 80,
    topic: "Pedestrians and Vulnerable Road Users",
    category: "Right of Way",
    difficulty: "easy",
    questionText: "When your light turns green but people are still crossing, you should:",
    options: [
      { key: "A", text: "Drive on and let them hurry" },
      { key: "B", text: "Wait until the crossing is clear" },
      { key: "C", text: "Honk and go" }
    ],
    correctAnswer: "B",
    explanation: "Green does not remove the duty to avoid pedestrians already on the road."
  },

  // Topic 9: Vehicle Condition and Documents (Questions 81-90)
  {
    num: 81,
    topic: "Vehicle Condition and Documents",
    category: "Vehicle Safety",
    difficulty: "easy",
    questionText: "Which documents should you normally carry while driving a car?",
    options: [
      { key: "A", text: "Only your phone" },
      { key: "B", text: "Driving licence, registration certificate, insurance and pollution certificate" },
      { key: "C", text: "Only a library card" }
    ],
    correctAnswer: "B",
    explanation: "These are routinely checked and prove the driver and vehicle are legal."
  },
  {
    num: 82,
    topic: "Vehicle Condition and Documents",
    category: "Vehicle Safety",
    difficulty: "easy",
    questionText: "Tyre pressure should be:",
    options: [
      { key: "A", text: "Kept as high as possible" },
      { key: "B", text: "Checked once a year" },
      { key: "C", text: "Checked regularly and kept at the recommended level" }
    ],
    correctAnswer: "C",
    explanation: "Wrong pressure affects grip, wear and fuel economy."
  },
  {
    num: 83,
    topic: "Vehicle Condition and Documents",
    category: "Vehicle Safety",
    difficulty: "easy",
    questionText: "Worn-out tyre treads:",
    options: [
      { key: "A", text: "Improve handling" },
      { key: "B", text: "Have no effect" },
      { key: "C", text: "Reduce grip, especially on wet roads" }
    ],
    correctAnswer: "C",
    explanation: "Tread channels water away. Without it, stopping distance rises."
  },
  {
    num: 84,
    topic: "Vehicle Condition and Documents",
    category: "Vehicle Safety",
    difficulty: "easy",
    questionText: "If the brake pedal feels soft or spongy, you should:",
    options: [
      { key: "A", text: "Have the brakes inspected immediately" },
      { key: "B", text: "Drive harder to warm them" },
      { key: "C", text: "Wait to see if it improves" }
    ],
    correctAnswer: "A",
    explanation: "A soft pedal can mean air or fluid problems, and failure may follow."
  },
  {
    num: 85,
    topic: "Vehicle Condition and Documents",
    category: "Vehicle Safety",
    difficulty: "easy",
    questionText: "Which checks should be done before a long trip?",
    options: [
      { key: "A", text: "Only the radio" },
      { key: "B", text: "Only the seat covers" },
      { key: "C", text: "Lights, indicators, tyres, brakes, fluids" }
    ],
    correctAnswer: "C",
    explanation: "Pre-trip checks prevent many roadside failures."
  },
  {
    num: 86,
    topic: "Vehicle Condition and Documents",
    category: "Vehicle Safety",
    difficulty: "easy",
    questionText: "A valid Pollution Under Control (PUC) certificate shows that:",
    options: [
      { key: "A", text: "Your vehicle's emissions are within permitted limits" },
      { key: "B", text: "Your vehicle is insured" },
      { key: "C", text: "Your driving licence is valid" }
    ],
    correctAnswer: "A",
    explanation: "It confirms that exhaust emission has been tested and found acceptable."
  },
  {
    num: 87,
    topic: "Vehicle Condition and Documents",
    category: "Vehicle Safety",
    difficulty: "easy",
    questionText: "Carrying a load beyond the permitted limit is:",
    options: [
      { key: "A", text: "Unsafe and illegal" },
      { key: "B", text: "Fine if tied tightly" },
      { key: "C", text: "Fine on short trips" }
    ],
    correctAnswer: "A",
    explanation: "Overloading affects braking, stability and steering."
  },
  {
    num: 88,
    topic: "Vehicle Condition and Documents",
    category: "Vehicle Safety",
    difficulty: "easy",
    questionText: "Small children in a car should travel:",
    options: [
      { key: "A", text: "In an appropriate child restraint, not held on a lap" },
      { key: "B", text: "Unrestrained in the back" },
      { key: "C", text: "Held on an adult's lap in front" }
    ],
    correctAnswer: "A",
    explanation: "In a crash, a held child cannot be protected by arms alone."
  },
  {
    num: 89,
    topic: "Vehicle Condition and Documents",
    category: "Road Signs",
    difficulty: "easy",
    questionText: "What is the purpose of a reflective warning triangle?",
    options: [
      { key: "A", text: "Showing the speed limit" },
      { key: "B", text: "Marking parking places" },
      { key: "C", text: "Warning other drivers of a stopped vehicle" }
    ],
    correctAnswer: "C",
    explanation: "Place it at a suitable distance behind the vehicle so approaching drivers can slow down."
  },
  {
    num: 90,
    topic: "Vehicle Condition and Documents",
    category: "Vehicle Safety",
    difficulty: "easy",
    questionText: "An engine warning light comes on while driving. You should:",
    options: [
      { key: "A", text: "Drive faster to cool it" },
      { key: "B", text: "Not ignore it, and have it checked soon" },
      { key: "C", text: "Cover it with tape" }
    ],
    correctAnswer: "B",
    explanation: "Warning lights signal faults that may become serious."
  },

  // Topic 10: Emergencies and Accidents (Questions 91-100)
  {
    num: 91,
    topic: "Emergencies and Accidents",
    category: "Hazards",
    difficulty: "easy",
    questionText: "Your car breaks down on a highway. You should:",
    options: [
      { key: "A", text: "Stop in the middle lane" },
      { key: "B", text: "Stand in front of the vehicle" },
      { key: "C", text: "Pull to the left, switch on hazard lights and warn traffic behind" }
    ],
    correctAnswer: "C",
    explanation: "Getting clear of moving traffic is the priority."
  },
  {
    num: 92,
    topic: "Emergencies and Accidents",
    category: "Hazards",
    difficulty: "easy",
    questionText: "At the scene of a road accident with injured people, you should first:",
    options: [
      { key: "A", text: "Make the area safe and call the emergency number (112 in India)" },
      { key: "B", text: "Move all injured people immediately" },
      { key: "C", text: "Leave quickly" }
    ],
    correctAnswer: "A",
    explanation: "Professional help is vital. Moving victims wrongly can worsen injuries."
  },
  {
    num: 93,
    topic: "Emergencies and Accidents",
    category: "Hazards",
    difficulty: "medium",
    questionText: "A tyre bursts at speed. You should:",
    options: [
      { key: "A", text: "Swerve sharply" },
      { key: "B", text: "Grip the wheel firmly, ease off the accelerator and brake gently" },
      { key: "C", text: "Brake hard immediately" }
    ],
    correctAnswer: "B",
    explanation: "Smooth actions help keep the car straight as it slows."
  },
  {
    num: 94,
    topic: "Emergencies and Accidents",
    category: "Hazards",
    difficulty: "medium",
    questionText: "If your brakes fail, you should:",
    options: [
      { key: "A", text: "Switch off the ignition at once" },
      { key: "B", text: "Pump the pedal, shift to a lower gear and use the handbrake gradually" },
      { key: "C", text: "Jump out of the car" }
    ],
    correctAnswer: "B",
    explanation: "Engine braking and gradual handbrake use can slow the vehicle while you steer."
  },
  {
    num: 95,
    topic: "Emergencies and Accidents",
    category: "Hazards",
    difficulty: "easy",
    questionText: "Your vehicle catches fire. You should:",
    options: [
      { key: "A", text: "Stop, switch off the engine, get everyone out and keep away" },
      { key: "B", text: "Open the bonnet fully to inspect" },
      { key: "C", text: "Stay inside and drive on" }
    ],
    correctAnswer: "A",
    explanation: "Fuel and electrical fires can spread quickly."
  },
  {
    num: 96,
    topic: "Emergencies and Accidents",
    category: "Rules of the Region",
    difficulty: "easy",
    questionText: "Under India's Good Samaritan provisions, a bystander who helps an accident victim:",
    options: [
      { key: "A", text: "Must pay for treatment" },
      { key: "B", text: "Must wait at the hospital for hours" },
      { key: "C", text: "Is protected from harassment for having helped" }
    ],
    correctAnswer: "C",
    explanation: "These provisions exist to encourage prompt help for victims."
  },
  {
    num: 97,
    topic: "Emergencies and Accidents",
    category: "Rules of the Region",
    difficulty: "easy",
    questionText: "After a minor collision, you should:",
    options: [
      { key: "A", text: "Leave without stopping" },
      { key: "B", text: "Stop, ensure safety and exchange details with the other party" },
      { key: "C", text: "Argue at the roadside" }
    ],
    correctAnswer: "B",
    explanation: "Leaving the scene is an offence and can make things worse."
  },
  {
    num: 98,
    topic: "Emergencies and Accidents",
    category: "Hazards",
    difficulty: "medium",
    questionText: "Your vehicle starts to skid. You should:",
    options: [
      { key: "A", text: "Brake hard" },
      { key: "B", text: "Accelerate sharply" },
      { key: "C", text: "Ease off the accelerator and steer gently in the direction you want to go" }
    ],
    correctAnswer: "C",
    explanation: "Smooth steering restores traction. Abrupt actions deepen the skid."
  },
  {
    num: 99,
    topic: "Emergencies and Accidents",
    category: "Vehicle Safety",
    difficulty: "medium",
    questionText: "In an emergency stop in a car with ABS, you should:",
    options: [
      { key: "A", text: "Release the pedal at once" },
      { key: "B", text: "Press the brake pedal firmly and hold it while steering" },
      { key: "C", text: "Pump the pedal quickly" }
    ],
    correctAnswer: "B",
    explanation: "ABS prevents wheel lock and lets you steer. Pumping defeats its work."
  },
  {
    num: 100,
    topic: "Emergencies and Accidents",
    category: "Hazards",
    difficulty: "easy",
    questionText: "Your vehicle stalls on a railway crossing. You should:",
    options: [
      { key: "A", text: "Wait inside for help" },
      { key: "B", text: "Get everyone out and move away from the track immediately" },
      { key: "C", text: "Try restarting repeatedly" }
    ],
    correctAnswer: "B",
    explanation: "A train cannot stop in time, so saving lives comes before saving the vehicle."
  }
];

// Add unique ids
const formatted = rawQuestionsData.map((q) => ({
  _id: `q_pdf_${String(q.num).padStart(3, '0')}`,
  id: `q_pdf_${String(q.num).padStart(3, '0')}`,
  questionNumber: q.num,
  topic: q.topic,
  category: q.category,
  difficulty: q.difficulty,
  questionText: q.questionText,
  options: q.options,
  correctAnswer: q.correctAnswer,
  explanation: q.explanation,
  imageUrl: null,
  createdAt: new Date().toISOString()
}));

const dataDir = path.join(__dirname, '..', 'src', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const outputPath = path.join(dataDir, 'driving_theory_100.json');
fs.writeFileSync(outputPath, JSON.stringify(formatted, null, 2), 'utf-8');

console.log(`✅ Successfully generated ${formatted.length} questions from PDF at: ${outputPath}`);
