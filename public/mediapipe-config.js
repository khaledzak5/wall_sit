// MediaPipe configuration and utilities for the fitness app
window.MediaPipeConfig = {
  // CDN URLs for MediaPipe
  POSE_MODEL_URL: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
  CAMERA_UTILS_URL: 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils',
  DRAWING_UTILS_URL: 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils',
  
  // Pose detection settings optimized for web
  POSE_CONFIG: {
    modelComplexity: 0, // 0 = fastest, 1 = balanced, 2 = most accurate
    smoothLandmarks: false, // Disable to reduce memory usage
    enableSegmentation: false,
    smoothSegmentation: false,
    minDetectionConfidence: 0.7, // Higher confidence for stability
    minTrackingConfidence: 0.5,
    staticImageMode: false, // Process video stream
    maxNumHands: 0 // Disable hand detection to save memory
  },
  
  // Push-up specific settings
  PUSHUP_CONFIG: {
    ELBOW_ANGLE_DOWN: 95,   // easier: degrees for down position
    ELBOW_ANGLE_UP: 155,    // easier: degrees for up position
    SHOULDER_HEIGHT_DOWN: 0.02, // shoulder should be close to ground (normalized)
    BACK_ALIGNMENT_MIN: 150, // minimum angle for good posture
    BACK_ALIGNMENT_MAX: 210, // maximum angle for good posture
    WARNING_COOLDOWN: 2000   // milliseconds between warnings
  },
  
  // Plank-specific settings
  PLANK_CONFIG: {
    BACK_ALIGNMENT_MIN: 120, // widened for robustness across angles
    BACK_ALIGNMENT_MAX: 260,
    WARNING_COOLDOWN: 2000,
    STRAIGHT_ABS_COS_MIN: 0.90, // accept |cos| >= this
    HORIZ_MAX_DEG: 35,          // line orientation tolerance to horizontal
    KNEE_MIN_DEG: 150           // optional knee straightness
  },
  
  // Squat-specific settings
  SQUAT_CONFIG: {
    // Knee angle thresholds (hip-knee-ankle)
    KNEE_ANGLE_DOWN: 120,    // easier: detects bottom earlier
    KNEE_ANGLE_UP: 200,     // easier: detects standing sooner
    // Minimum depth: hip should be below knee by this normalized fraction of frame height
    HIP_BELOW_KNEE_MIN: 0.001, // easier: allow slight depth
    // Hip angle thresholds to detect back rounding (shoulder-hip-knee)
    HIP_ANGLE_MIN: 135,     // easier: allow some rounding
    // Torso tilt tolerance relative to vertical (optional)
    TORSO_TILT_MIN: 0,
    TORSO_TILT_MAX: 65,     // easier: allow more forward lean
    WARNING_COOLDOWN: 2000
  },
  
  // Lunges-specific settings
  LUNGES_CONFIG: {
    // Front knee angle thresholds (hip-knee-ankle)
    FRONT_KNEE_ANGLE_DOWN: 100,  // easier: front knee bent for lunge
    FRONT_KNEE_ANGLE_UP: 170,    // easier: front knee straight for standing
    // Back knee angle thresholds (hip-knee-ankle) 
    BACK_KNEE_ANGLE_DOWN: 110,   // easier: back knee close to ground
    BACK_KNEE_ANGLE_UP: 160,     // easier: back knee straight for standing
    // Hip position relative to front knee
    HIP_BELOW_FRONT_KNEE_MIN: 0.001, // easier: hip should be below front knee
    // Torso alignment tolerance
    TORSO_TILT_MAX: 60,          // easier: allow more forward lean
    WARNING_COOLDOWN: 2000
  },
  
  // Jumping Jacks-specific settings
  JUMPINGJACKS_CONFIG: {
    // Shoulder abduction angles (shoulder-elbow-wrist) - arms overhead
    SHOULDER_ABDUCTION_DOWN: 60,    // degrees: arms down (more lenient)
    SHOULDER_ABDUCTION_UP: 120,     // degrees: arms overhead (more lenient)
    
    // Hip abduction angles (hip-knee-ankle) - legs apart
    HIP_ABDUCTION_DOWN: 25,          // degrees: legs together (more lenient)
    HIP_ABDUCTION_UP: 30,            // degrees: legs apart (more lenient)
    
    // Timing and debouncing
    MIN_REP_MS: 1000,               // minimum milliseconds between reps (increased for stability)
    WARNING_COOLDOWN: 2000           // milliseconds between warnings
  },
  
  // Side Plank-specific settings
  SIDEPLANK_CONFIG: {
    // Shoulder support angle (shoulder-elbow-wrist) - should be ~90°
    SHOULDER_ANGLE_MIN: 80,         // degrees: minimum elbow angle
    SHOULDER_ANGLE_MAX: 100,        // degrees: maximum elbow angle
    
    // Torso-hip line (shoulder-hip-ankle) - should be ~180° (straight line)
    TORSO_ANGLE_MIN: 160,           // degrees: minimum straight line angle
    TORSO_ANGLE_MAX: 200,           // degrees: maximum straight line angle
    
    // Hip position thresholds (normalized units)
    HIP_SAG_THRESHOLD: 0.05,        // hip sagging tolerance
    HIP_HIKE_THRESHOLD: 0.05,       // hip hiking tolerance
    
    // Elbow alignment (elbow should be under shoulder)
    ELBOW_ALIGNMENT_THRESHOLD: 0.08, // normalized units
    
    // Feet stacking (ankles should be close together)
    FEET_STACKING_THRESHOLD: 0.1,   // normalized units
    
    // Head-neck alignment (ear-shoulder-hip should be ~180°)
    HEAD_NECK_ANGLE_MIN: 160,       // degrees: minimum head-neck alignment
    HEAD_NECK_ANGLE_MAX: 200,       // degrees: maximum head-neck alignment
    
    // Posture smoothing
    POSTURE_GOOD_FRAMES: 3,         // consecutive good frames to confirm correct posture
    POSTURE_BAD_FRAMES: 4,          // consecutive bad frames to confirm incorrect posture
    
    // Warning cooldown
    WARNING_COOLDOWN: 2000          // milliseconds between warnings
  },
  
  // Pose landmark indices (MediaPipe standard)
  POSE_LANDMARKS: {
    NOSE: 0,
    LEFT_EYE_INNER: 1,
    LEFT_EYE: 2,
    LEFT_EYE_OUTER: 3,
    RIGHT_EYE_INNER: 4,
    RIGHT_EYE: 5,
    RIGHT_EYE_OUTER: 6,
    LEFT_EAR: 7,
    RIGHT_EAR: 8,
    MOUTH_LEFT: 9,
    MOUTH_RIGHT: 10,
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
    LEFT_ELBOW: 13,
    RIGHT_ELBOW: 14,
    LEFT_WRIST: 15,
    RIGHT_WRIST: 16,
    LEFT_PINKY: 17,
    RIGHT_PINKY: 18,
    LEFT_INDEX: 19,
    RIGHT_INDEX: 20,
    LEFT_THUMB: 21,
    RIGHT_THUMB: 22,
    LEFT_HIP: 23,
    RIGHT_HIP: 24,
    LEFT_KNEE: 25,
    RIGHT_KNEE: 26,
    LEFT_ANKLE: 27,
    RIGHT_ANKLE: 28,
    LEFT_HEEL: 29,
    RIGHT_HEEL: 30,
    LEFT_FOOT_INDEX: 31,
    RIGHT_FOOT_INDEX: 32
  }
};
