// Pose detection utilities using MediaPipe
class PoseDetectionUtils {
  constructor() {
    this.pose = null;
    this.isInitialized = false;
  // Per-exercise state to avoid cross-contamination between different exercises
  // Structure: { <mode>: { state: 'up'|'down'|'neutral'|..., count: number, extra... } }
  this.perModeState = {};
  const initMode = (mode) => ({ state: 'up', count: 0 });
  this.perModeState['pushups'] = initMode('pushups');
  this.perModeState['squats'] = initMode('squats');
  this.perModeState['lunges'] = initMode('lunges');
  this.perModeState['burpees'] = initMode('burpees');
  this.perModeState['mountainclimbers'] = { state: 'neutral', count: 0, _lastLeftKneeY: null, _lastRightKneeY: null, _climberState: 'neutral', _lastClimberTime: 0 };
  this.perModeState['highknees'] = { state: 'down', count: 0 };
  this.perModeState['jumpingjacks'] = { state: 'down', count: 0 };
  this.perModeState['sideplank'] = { state: 'neutral', count: 0, _stableCount: 0, _lastHipY: null, _lastShoulderY: null, _lastAnkleY: null, _lastTimestamp: 0 };
  this.perModeState['plank'] = { state: 'neutral', count: 0, _stableCount: 0, _lastHipY: null, _lastShoulderY: null, _lastAnkleY: null, _lastTimestamp: 0 };
  // Wallsit: timer based on stable seated posture with back against wall
  this.perModeState['wallsit'] = { state: 'neutral', count: 0, _stableCount: 0, _lastHipY: null, _lastShoulderY: null, _lastKneeY: null, _lastAnkleY: null, _lastHipX: null, _lastShoulderX: null, _lastKneeX: null, _lastAnkleX: null, _lastTimestamp: 0 };
    this.postureStatus = 'unknown'; // correct, incorrect, unknown
    this.lastWarningTime = 0;
    this.videoDimensionsLogged = false;
  // Count of consecutive frames with no landmarks to tolerate transient misses
  this._noLandmarksCount = 0;
    // Exercise mode and timing
    this.exerciseMode = 'pushups'; // 'pushups' | 'plank' | 'squats' | 'lunges'
    this.accumulatedCorrectMs = 0;
    this.timerRunning = false;
    this.startCorrectTimestampMs = 0;
    this.onPushupCount = null;
    this.onPostureChange = null;
    this.onFormFeedback = null;
    this.onTimeUpdate = null; // for plank seconds updates
  }

  setExerciseMode(mode) {
    // ensure perModeState exists for the selected mode
    if (!this.perModeState[this.exerciseMode]) {
      this.perModeState[this.exerciseMode] = { state: 'up', count: 0 };
    }
    const normalized = String(mode || '').toLowerCase();
    if (normalized === 'plank') this.exerciseMode = 'plank';
    else if (normalized === 'squats' || normalized === 'squat') this.exerciseMode = 'squats';
    else if (normalized === 'lunges' || normalized === 'lunge') this.exerciseMode = 'lunges';
    else if (normalized === 'burpees' || normalized === 'burpee') this.exerciseMode = 'burpees';
    else if (normalized.includes('mountain') || normalized.includes('climber')) this.exerciseMode = 'mountainclimbers';
    else if (normalized.includes('high') && normalized.includes('knees')) this.exerciseMode = 'highknees';
    else if (normalized.includes('jumping') && normalized.includes('jack')) this.exerciseMode = 'jumpingjacks';
    else if (normalized.includes('side') && normalized.includes('plank')) this.exerciseMode = 'sideplank';
    else if (normalized.includes('wall') || normalized.includes('wallsit') || normalized.includes('wall-sit') || normalized.includes('wallsit')) this.exerciseMode = 'wallsit';
    else this.exerciseMode = 'pushups';
  }

  // Initialize MediaPipe Pose
  async initialize() {
    try {
      console.log('🚀 Initializing MediaPipe Pose...');
      
      // Wait for MediaPipe to load if not ready
      if (!window.Pose) {
        console.warn('MediaPipe Pose not loaded yet, waiting...');
        // Wait up to 10 seconds for MediaPipe to load
        let attempts = 0;
        while (!window.Pose && attempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 200));
          attempts++;
          if (attempts % 10 === 0) {
            console.log(`Still waiting for MediaPipe... (${attempts * 200}ms)`);
          }
        }
        
        if (!window.Pose) {
          console.error('MediaPipe Pose failed to load after waiting');
          return false;
        }
      }
      
      console.log('✅ MediaPipe Pose found in window object');

      this.pose = new window.Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      const config = window.MediaPipeConfig?.POSE_CONFIG || {
        modelComplexity: 0,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      };

      this.pose.setOptions(config);
      this.pose.onResults(this.onResults.bind(this));
      
      this.isInitialized = true;
      console.log('MediaPipe Pose initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize MediaPipe Pose:', error);
      return false;
    }
  }

  // Process video frame
  async processFrame(videoElement, options) {
    if (!this.isInitialized || !this.pose) {
      console.log('❌ Pose not initialized or missing');
      return null;
    }

    try {
      // Only log occasionally to avoid spam
      if (Math.random() < 0.05) {
        console.log('📹 Processing frame...');
      }
      
      // Check if video dimensions are reasonable
      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        if (Math.random() < 0.1) {
          console.log('⏳ Video dimensions not ready yet');
        }
        return;
      }
      
      // Log video dimensions only once per session
      if (!this.videoDimensionsLogged) {
        console.log(`📏 Video dimensions: ${videoElement.videoWidth}x${videoElement.videoHeight}`);
        this.videoDimensionsLogged = true;
      }
      
      // Allow larger videos but with a reasonable limit
      const maxWidth = 1920;
      const maxHeight = 1080;
      if (videoElement.videoWidth > maxWidth || videoElement.videoHeight > maxHeight) {
        console.log('⚠️ Video too large (>1920x1080), skipping frame');
        return;
      }
      
  // remember whether this frame came from a live camera or an uploaded video
  this._lastFrameIsLive = options && options.isLive ? true : false;
  await this.pose.send({ image: videoElement });
    } catch (error) {
      if (error.message?.includes('memory access out of bounds')) {
        console.warn('🔄 Memory error, skipping frame');
        return;
      }
      console.error('Error processing frame:', error);
    }
  }

  // Handle pose detection results
  onResults(results) {
    console.log('🎯 onResults called!', results.poseLandmarks ? `Found ${results.poseLandmarks.length} landmarks` : 'No landmarks');

    // Store results for drawing
    this.lastResults = results;

    const NO_LANDMARKS_TOLERANCE = window.MediaPipeConfig?.NO_LANDMARKS_TOLERANCE ?? 3;
    if (!results.poseLandmarks) {
      // increment counter and only treat as lost after N consecutive empty frames
      this._noLandmarksCount = (this._noLandmarksCount || 0) + 1;
      if (this._noLandmarksCount < NO_LANDMARKS_TOLERANCE) {
        // tolerate transient miss
        return;
      }

      // persistent no-landmarks: reset
      this._noLandmarksCount = 0;
      this.postureStatus = 'unknown';
      if (this.onPostureChange) {
        this.onPostureChange('unknown', null);
      }
      // Stop plank timer if running
      if (this.timerRunning) {
        this.accumulatedCorrectMs += Date.now() - this.startCorrectTimestampMs;
        this.timerRunning = false;
        this.startCorrectTimestampMs = 0;
        if (this.onTimeUpdate) {
          this.onTimeUpdate(Math.floor(this.accumulatedCorrectMs / 1000));
        }
      }
      return;
    }
    // we have landmarks -> reset noLandmarks counter
    this._noLandmarksCount = 0;

    const landmarks = results.poseLandmarks;

    // Extra debug: log key info when in wallsit mode to diagnose live non-start
    try {
      if (this.exerciseMode === 'wallsit') {
        const poseCfg = window.MediaPipeConfig?.POSE_LANDMARKS || {};
        const NOSE = poseCfg.NOSE || 0;
        const LEFT_HIP = poseCfg.LEFT_HIP || 23;
        const RIGHT_HIP = poseCfg.RIGHT_HIP || 24;
        const head = landmarks[NOSE];
        const leftHip = landmarks[LEFT_HIP];
        const rightHip = landmarks[RIGHT_HIP];
        if (head && leftHip && rightHip) {
          const hipCenterY = (leftHip.y + rightHip.y) / 2;
          const HEAD_BELOW_HIP_THRESHOLD = window.MediaPipeConfig?.GLOBAL_CONFIG?.HEAD_BELOW_HIP_THRESHOLD ?? 0.0;
          console.debug && console.debug('WallSit frame debug', { isLive: !!this._lastFrameIsLive, headY: head.y, hipCenterY, headBelow: head.y > hipCenterY + HEAD_BELOW_HIP_THRESHOLD });
        }
      }
    } catch (e) {}

    // Global guard: if head (nose) is below the hip center (person horizontal / pushup/plank)
    // then do not count anything for any exercise. This is the user's requested rule: "لو الرأس تحت ميعدش"
    try {
      const poseCfg = window.MediaPipeConfig?.POSE_LANDMARKS || {};
      const NOSE = poseCfg.NOSE || 0;
      const LEFT_HIP = poseCfg.LEFT_HIP || 23;
      const RIGHT_HIP = poseCfg.RIGHT_HIP || 24;
      const head = landmarks[NOSE];
      const leftHip = landmarks[LEFT_HIP];
      const rightHip = landmarks[RIGHT_HIP];
      if (head && leftHip && rightHip) {
        const hipCenterY = (leftHip.y + rightHip.y) / 2;
        const HEAD_BELOW_HIP_THRESHOLD = window.MediaPipeConfig?.GLOBAL_CONFIG?.HEAD_BELOW_HIP_THRESHOLD ?? 0.0;
        if (head.y > hipCenterY + HEAD_BELOW_HIP_THRESHOLD) {
          // Head is below hip line — stop any running timer and do not count reps
          this.postureStatus = 'unknown';
          if (this.timerRunning) {
            this.accumulatedCorrectMs += Date.now() - this.startCorrectTimestampMs;
            this.timerRunning = false;
            this.startCorrectTimestampMs = 0;
            if (this.onTimeUpdate) this.onTimeUpdate(Math.floor(this.accumulatedCorrectMs / 1000));
          }
          return;
        }
      }
    } catch (e) {
      // ignore guard failures and continue
    }
    // Quick-path: if the frame looks like a wall-sit (single-frame check), run the wall-sit timer
    // This ensures uploaded videos or naming mismatches still get counted when user is in wall-sit.
    try {
      const singleWall = isWallSitPosition(landmarks);
      if (singleWall && singleWall.ok) {
        const now = Date.now();

        // Configurable immediate-start behavior: when true, start counting as soon as
        // a single-frame wall-sit position is detected. Default: true to match user request
        // for immediate counting on uploaded videos.
  const wallCfg = window.MediaPipeConfig?.WALLSIT_CONFIG || {};
  // Allow different immediate-start behavior for live camera vs uploaded video
  const immediateStartForLive = (wallCfg.IMMEDIATE_START_FOR_LIVE == null) ? true : !!wallCfg.IMMEDIATE_START_FOR_LIVE;
  const immediateStartForUpload = (wallCfg.IMMEDIATE_START == null) ? true : !!wallCfg.IMMEDIATE_START;
        // Allow manual override for testing
        const immediateStart = (this._lastFrameIsLive && this._forceImmediateStartForLive != null)
          ? !!this._forceImmediateStartForLive
          : (this._lastFrameIsLive ? immediateStartForLive : immediateStartForUpload);

        if (immediateStart) {
          // But first ensure this single-frame isn't actually a plank-like pose
          try {
            const cfgW = wallCfg || {};
            const LEFT_WRIST = cfgW.LEFT_WRIST || 15;
            const RIGHT_WRIST = cfgW.RIGHT_WRIST || 16;
            const LEFT_ANKLE = cfgW.LEFT_ANKLE || 27;
            const RIGHT_ANKLE = cfgW.RIGHT_ANKLE || 28;
            const NOSE = cfgW.NOSE || 0;
            const HANDS_ON_GROUND_THRESHOLD = cfgW.HANDS_ON_GROUND_THRESHOLD ?? 0.07;
            const HANDS_HIP_HORIZONTAL_THRESHOLD = cfgW.HANDS_HIP_HORIZONTAL_THRESHOLD ?? 0.08;
            const HORIZ_TORSO_THRESHOLD = cfgW.HORIZ_TORSO_THRESHOLD ?? 0.09;
            const HEAD_HIP_HORIZONTAL_THRESHOLD = cfgW.HEAD_HIP_HORIZONTAL_THRESHOLD ?? 0.11;

            const leftWrist = landmarks[LEFT_WRIST];
            const rightWrist = landmarks[RIGHT_WRIST];
            const leftAnkle = landmarks[LEFT_ANKLE];
            const rightAnkle = landmarks[RIGHT_ANKLE];
            const head = landmarks[NOSE];

            const shoulderCenterY = (landmarks[11].y + landmarks[12].y) / 2;
            const hipCenterY = (landmarks[23].y + landmarks[24].y) / 2;
            const torsoDy = Math.abs(shoulderCenterY - hipCenterY);
            const headHipDy = Math.abs((head?.y ?? 0) - hipCenterY);

            let handsOnAnkleLevel = false;
            if (leftWrist && rightWrist && leftAnkle && rightAnkle) {
              const leftNearAnkle = Math.abs(leftWrist.y - leftAnkle.y) <= HANDS_ON_GROUND_THRESHOLD || leftWrist.y >= (leftAnkle.y - HANDS_ON_GROUND_THRESHOLD);
              const rightNearAnkle = Math.abs(rightWrist.y - rightAnkle.y) <= HANDS_ON_GROUND_THRESHOLD || rightWrist.y >= (rightAnkle.y - HANDS_ON_GROUND_THRESHOLD);
              handsOnAnkleLevel = leftNearAnkle && rightNearAnkle;
            }

            let handsNearHipLine = false;
            if (leftWrist && rightWrist) {
              const leftNearHip = Math.abs(leftWrist.y - hipCenterY) <= HANDS_HIP_HORIZONTAL_THRESHOLD;
              const rightNearHip = Math.abs(rightWrist.y - hipCenterY) <= HANDS_HIP_HORIZONTAL_THRESHOLD;
              handsNearHipLine = leftNearHip && rightNearHip;
            }

            const headNearHip = headHipDy <= HEAD_HIP_HORIZONTAL_THRESHOLD;

            // Require multiple plank indicators before treating frame as plank-like.
            const indicators = [];
            indicators.push(!!handsOnAnkleLevel);
            indicators.push(!!handsNearHipLine);
            indicators.push(!!(torsoDy <= HORIZ_TORSO_THRESHOLD && headNearHip));
            const indicatorCount = indicators.reduce((s, v) => s + (v ? 1 : 0), 0);

            // Debug: expose why a single-frame wallsit did/didn't immediate-start
            try {
              console.debug && console.debug('WallSit immediate-check', {
                isLive: !!this._lastFrameIsLive,
                immediateStartForLive,
                immediateStartForUpload,
                immediateStartChosen: immediateStart,
                handsOnAnkleLevel,
                handsNearHipLine,
                torsoDy,
                headNearHip,
                indicatorCount
              });
            } catch (e) {}

            if (indicatorCount < 2) {
              // Start timer immediately (don't wait for consecutive stable frames)
              if (!this.timerRunning) {
                this.startCorrectTimestampMs = now;
                this.timerRunning = true;
              }
              const totalMs = this.accumulatedCorrectMs + (now - (this.startCorrectTimestampMs || now));
              const seconds = Math.floor(totalMs / 1000);
              if (this.onTimeUpdate) this.onTimeUpdate(seconds);

              // Skip other counters when wall-sit detected in frame
              try { console.debug && console.debug('WallSit immediate-started', { seconds }); } catch (e) {}
              return;
            }
          } catch (e) {
            // fall back to immediate start if heuristic fails
            if (!this.timerRunning) {
              this.startCorrectTimestampMs = now;
              this.timerRunning = true;
            }
            const totalMs = this.accumulatedCorrectMs + (now - (this.startCorrectTimestampMs || now));
            const seconds = Math.floor(totalMs / 1000);
            if (this.onTimeUpdate) this.onTimeUpdate(seconds);
            return;
          }
        }

        // Fallback: require strict+stable gating (legacy behavior)
        const wallOk = this.isWallSitStrictAndStable(landmarks, now);

        if (wallOk) {
          if (!this.timerRunning) {
            this.startCorrectTimestampMs = now;
            this.timerRunning = true;
          }
          const totalMs = this.accumulatedCorrectMs + (now - (this.startCorrectTimestampMs || now));
          const seconds = Math.floor(totalMs / 1000);
          if (this.onTimeUpdate) this.onTimeUpdate(seconds);
        } else {
          if (this.timerRunning) {
            this.accumulatedCorrectMs += now - this.startCorrectTimestampMs;
            this.timerRunning = false;
            this.startCorrectTimestampMs = 0;
            if (this.onTimeUpdate) this.onTimeUpdate(Math.floor(this.accumulatedCorrectMs / 1000));
          }
        }

        // Don't continue with other counters when wall-sit detected in frame
        return;
      }
    } catch (e) {
      // ignore and continue
    }
    
    // Evaluate posture for the current exercise using the unified checker.
    // Use a short consecutive-frame smoothing window to avoid brief spikes flipping posture state
    const isPostureCorrectInstant = this.checkBackAlignment(landmarks);

    // Initialize counters if missing
    if (this._postureGoodCount == null) this._postureGoodCount = 0;
    if (this._postureBadCount == null) this._postureBadCount = 0;

    if (isPostureCorrectInstant) {
      this._postureGoodCount += 1;
      this._postureBadCount = 0;
    } else {
      this._postureBadCount += 1;
      this._postureGoodCount = 0;
    }

  const POSTURE_GOOD_FRAMES = window.MediaPipeConfig?.SQUAT_CONFIG?.POSTURE_GOOD_FRAMES ?? 3;
  // For squats we require more consecutive bad frames before flipping to 'incorrect' to avoid
  // false positives during normal descent. Default to 6 for squats, 4 otherwise.
  const POSTURE_BAD_FRAMES = (this.exerciseMode === 'squats') ? (window.MediaPipeConfig?.SQUAT_CONFIG?.POSTURE_BAD_FRAMES ?? 6) : (window.MediaPipeConfig?.SQUAT_CONFIG?.POSTURE_BAD_FRAMES ?? 4);

    let smoothedStatus = this.postureStatus;
    if (this._postureGoodCount >= POSTURE_GOOD_FRAMES) {
      smoothedStatus = 'correct';
    } else if (this._postureBadCount >= POSTURE_BAD_FRAMES) {
      smoothedStatus = 'incorrect';
    }

    // For squats we don't want to show poor/incorrect posture feedback — treat as correct.
    if (this.exerciseMode === 'squats') {
      smoothedStatus = 'correct';
    }

    if (smoothedStatus !== this.postureStatus) {
      this.postureStatus = smoothedStatus;
      if (this.onPostureChange) this.onPostureChange(this.postureStatus, landmarks);
    }

    // If posture is incorrect for strength/technique exercises, warn and normally skip counting.
    // However, allow deep squat descents (hip below knee) to proceed to the squat counter so
    // counting can occur if legs are stable. The squat counter itself still enforces stability
    // and collapse checks.
    const cardioExercises = ['mountainclimbers', 'highknees'];

    // Compute hip/knee centers to detect a deep squat descent (hip below knee)
    const cfg = window.MediaPipeConfig?.POSE_LANDMARKS || {};
    const leftHip = landmarks[cfg.LEFT_HIP || 23];
    const rightHip = landmarks[cfg.RIGHT_HIP || 24];
    const leftKnee = landmarks[cfg.LEFT_KNEE || 25];
    const rightKnee = landmarks[cfg.RIGHT_KNEE || 26];
    const hipCenter = leftHip && rightHip ? { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 } : null;
    const kneeCenter = leftKnee && rightKnee ? { x: (leftKnee.x + rightKnee.x) / 2, y: (leftKnee.y + rightKnee.y) / 2 } : null;
    const hipBelowKnee = hipCenter && kneeCenter ? (hipCenter.y > kneeCenter.y) : false;

  // Do not emit posture warnings or block counting for squats; allow squat-specific logic to handle counting.
  if (this.postureStatus !== 'correct' && !cardioExercises.includes(this.exerciseMode) && this.exerciseMode !== 'squats') {
      const currentTime = Date.now();
      const cooldown = window.MediaPipeConfig?.PLANK_CONFIG?.WARNING_COOLDOWN || 2000;

      if (currentTime - this.lastWarningTime > cooldown) {
        this.playWarningSound();
        this.lastWarningTime = currentTime;

        if (this.onFormFeedback) {
          this.onFormFeedback({
            message: "Dangerous posture - straighten your back!",
            type: "warning",
            timestamp: currentTime
          });
        }
      }

      // Stop plank timer while incorrect
      if ((this.exerciseMode === 'plank' || this.exerciseMode === 'sideplank') && this.timerRunning) {
        this.accumulatedCorrectMs += currentTime - this.startCorrectTimestampMs;
        this.timerRunning = false;
        this.startCorrectTimestampMs = 0;
        if (this.onTimeUpdate) {
          this.onTimeUpdate(Math.floor(this.accumulatedCorrectMs / 1000));
        }
      }

      // Do not proceed to rep counting when posture is incorrect for non-cardio exercises
      return;
    }

    // Posture is correct
    if (this.exerciseMode === 'plank' || this.exerciseMode === 'sideplank') {
      // For plank we require a stricter horizontal+stability check before counting time.
      const now = Date.now();
      const plankOk = this.isPlankStrictAndStable(landmarks, now);

      if (plankOk) {
        if (!this.timerRunning) {
          this.startCorrectTimestampMs = now;
          this.timerRunning = true;
        }
        const totalMs = this.accumulatedCorrectMs + (now - (this.startCorrectTimestampMs || now));
        const seconds = Math.floor(totalMs / 1000);
        if (this.onTimeUpdate) this.onTimeUpdate(seconds);
      } else {
        // Stop timer if it was running
        if (this.timerRunning) {
          this.accumulatedCorrectMs += now - this.startCorrectTimestampMs;
          this.timerRunning = false;
          this.startCorrectTimestampMs = 0;
          if (this.onTimeUpdate) {
            this.onTimeUpdate(Math.floor(this.accumulatedCorrectMs / 1000));
          }
        }
      }

      return;
    }

    // Wall sit: require back-against-wall posture and knee at approx waist level + stability
    if (this.exerciseMode === 'wallsit') {
      const now = Date.now();
      const wallOk = this.isWallSitStrictAndStable(landmarks, now);

      if (wallOk) {
        if (!this.timerRunning) {
          this.startCorrectTimestampMs = now;
          this.timerRunning = true;
        }
        const totalMs = this.accumulatedCorrectMs + (now - (this.startCorrectTimestampMs || now));
        const seconds = Math.floor(totalMs / 1000);
        if (this.onTimeUpdate) this.onTimeUpdate(seconds);
      } else {
        // Stop timer if it was running
        if (this.timerRunning) {
          this.accumulatedCorrectMs += now - this.startCorrectTimestampMs;
          this.timerRunning = false;
          this.startCorrectTimestampMs = 0;
          if (this.onTimeUpdate) {
            this.onTimeUpdate(Math.floor(this.accumulatedCorrectMs / 1000));
          }
        }
      }

      return;
    }

    // Count reps depending on mode
      if (this.exerciseMode === 'squats') {
        this.updateSquatCounter(landmarks);
      } else if (this.exerciseMode === 'lunges') {
        this.updateLungesCounter(landmarks);
      } else if (this.exerciseMode === 'burpees') {
        this.updateBurpeesCounter(landmarks);
      } else if (this.exerciseMode === 'mountainclimbers') {
        this.updateMountainClimbersCounter(landmarks);
      } else if (this.exerciseMode === 'highknees') {
        this.updateHighKneesCounter(landmarks);
      } else if (this.exerciseMode === 'jumpingjacks') {
        this.updateJumpingJacksCounter(landmarks);
      } else if (this.exerciseMode === 'sideplank') {
        this.updateSidePlankCounter(landmarks);
      } else {
        // Do not count push-up reps while user explicitly selected 'wallsit' mode.
        // This prevents push-up videos from incrementing push-up counts when user
        // is working on wallsit. Push-up counting will continue to work in its
        // own exercise mode.
        if (this.exerciseMode !== 'wallsit') {
          this.updatePushupCounter(landmarks);
        }
      }
  }

  // Calculate angle between three points
  calculateAngle(point1, point2, point3) {
    const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) - 
                   Math.atan2(point1.y - point2.y, point1.x - point2.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    
    return angle;
  }

  // Strict plank check: require near-horizontal torso and low movement across consecutive frames
  isPlankStrictAndStable(landmarks, nowMs) {
    try {
      const cfg = window.MediaPipeConfig?.PLANK_CONFIG || {};
      const LEFT_SHOULDER = cfg.LEFT_SHOULDER || 11;
      const RIGHT_SHOULDER = cfg.RIGHT_SHOULDER || 12;
      const LEFT_HIP = cfg.LEFT_HIP || 23;
      const RIGHT_HIP = cfg.RIGHT_HIP || 24;
      const LEFT_ANKLE = cfg.LEFT_ANKLE || 27;
      const RIGHT_ANKLE = cfg.RIGHT_ANKLE || 28;

      const leftShoulder = landmarks[LEFT_SHOULDER];
      const rightShoulder = landmarks[RIGHT_SHOULDER];
      const leftHip = landmarks[LEFT_HIP];
      const rightHip = landmarks[RIGHT_HIP];
      const leftAnkle = landmarks[LEFT_ANKLE];
      const rightAnkle = landmarks[RIGHT_ANKLE];

      const vis = (p) => p && (p.visibility == null || p.visibility > 0.5);
      // Require at least shoulders and hips on one side or both for reliable horizontal check
      const leftSideOk = vis(leftShoulder) && vis(leftHip);
      const rightSideOk = vis(rightShoulder) && vis(rightHip);
      if (!leftSideOk && !rightSideOk) return false;

      // Compute torso horizontal orientation (prefer side-view angle when available)
      let horizontalOk = false;
  const MIN_SIDE_ANGLE = cfg.MIN_SIDE_ANGLE ?? 155; // degrees
      if (vis(leftShoulder) && vis(leftHip) && vis(leftAnkle)) {
        const sideAngle = this.calculateAngle(leftShoulder, leftHip, leftAnkle);
        horizontalOk = sideAngle >= MIN_SIDE_ANGLE;
      } else if (vis(rightShoulder) && vis(rightHip) && vis(rightAnkle)) {
        const sideAngle = this.calculateAngle(rightShoulder, rightHip, rightAnkle);
        horizontalOk = sideAngle >= MIN_SIDE_ANGLE;
      } else {
        // front-facing fallback: shoulder-hip axis near horizontal
  const shoulderCenter = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
  const hipCenter = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
  const dx = shoulderCenter.x - hipCenter.x;
  const dy = shoulderCenter.y - hipCenter.y;
  const orientDeg = Math.abs(Math.atan2(dy, dx) * 180 / Math.PI);
  // Allow slightly more tolerance for imperfect camera angles / small movements
  const HORIZ_MAX = cfg.HORIZ_MAX_DEG ?? 30;
  horizontalOk = (orientDeg <= HORIZ_MAX) || (orientDeg >= (180 - HORIZ_MAX));
      }

      if (!horizontalOk) return false;

      // Stability: ensure minimal movement in key points across consecutive frames
  // Use per-mode state so sideplank and plank maintain independent stability counters
  const state = this.perModeState[this.exerciseMode] || this.perModeState['plank'];
      const hipY = (leftHip.y + rightHip.y) / 2;
      const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const ankleY = (leftAnkle && rightAnkle) ? ((leftAnkle.y + rightAnkle.y) / 2) : null;

  // Allow more movement per second (user may sway slightly) — increase default tolerance
  const maxDeltaPerSec = cfg.MAX_DELTA_PER_SEC ?? 0.25; // normalized units per second
      const now = nowMs || Date.now();
      const dt = Math.max(1, now - (state._lastTimestamp || now));

      let hipDelta = state._lastHipY == null ? 0 : Math.abs(hipY - state._lastHipY);
      let shoulderDelta = state._lastShoulderY == null ? 0 : Math.abs(shoulderY - state._lastShoulderY);
      let ankleDelta = (ankleY == null || state._lastAnkleY == null) ? 0 : Math.abs(ankleY - state._lastAnkleY);

      // Normalize deltas to per-second rates
      const hipRate = hipDelta * (1000 / dt);
      const shoulderRate = shoulderDelta * (1000 / dt);
      const ankleRate = ankleDelta * (1000 / dt);

      const motionTooHigh = (hipRate > maxDeltaPerSec) || (shoulderRate > maxDeltaPerSec) || (ankleY != null && ankleRate > maxDeltaPerSec);

      if (!motionTooHigh) {
        state._stableCount = (state._stableCount || 0) + 1;
      } else {
        state._stableCount = 0;
      }

      // Update last positions and timestamp for next frame
      state._lastHipY = hipY;
      state._lastShoulderY = shoulderY;
      if (ankleY != null) state._lastAnkleY = ankleY;
      state._lastTimestamp = now;

  // Require a minimal number of consecutive 'stable' frames so uploaded videos count quickly
  const REQUIRED_STABLE_FRAMES = cfg.REQUIRED_STABLE_FRAMES ?? 1;
      const stableEnough = state._stableCount >= REQUIRED_STABLE_FRAMES;

      // Additionally enforce that user is not upright (filter out standing or knee-supported poses)
      // Use hip vs ankle vertical gap when ankles visible
      if (ankleY != null) {
        const hipAnkleDy = Math.abs(hipY - ankleY);
        // Reduce required hip-ankle gap so cameras that crop feet or users on soft surfaces still count
        const MIN_HIP_ANKLE_DY = cfg.MIN_HIP_ANKLE_DY ?? 0.06;
        if (hipAnkleDy < MIN_HIP_ANKLE_DY) return false;
      }

      return stableEnough;
    } catch (e) {
      console.error('isPlankStrictAndStable error', e);
      return false;
    }
  }

  // Wall sit strict+stable check: user seated with back against wall, hips roughly at same vertical level as knees (or slightly above), minimal movement
  isWallSitStrictAndStable(landmarks, nowMs) {
    try {
      // Use exported single-frame check to validate strict wall-sit posture first
      // (the exported function `isWallSitPosition` enforces the exact pose criteria)
      const cfg = window.MediaPipeConfig?.WALLSIT_CONFIG || {};
      const LEFT_SHOULDER = cfg.LEFT_SHOULDER || 11;
      const RIGHT_SHOULDER = cfg.RIGHT_SHOULDER || 12;
      const LEFT_HIP = cfg.LEFT_HIP || 23;
      const RIGHT_HIP = cfg.RIGHT_HIP || 24;
      const LEFT_KNEE = cfg.LEFT_KNEE || 25;
      const RIGHT_KNEE = cfg.RIGHT_KNEE || 26;
      const LEFT_ANKLE = cfg.LEFT_ANKLE || 27;
      const RIGHT_ANKLE = cfg.RIGHT_ANKLE || 28;

      const leftShoulder = landmarks[LEFT_SHOULDER];
      const rightShoulder = landmarks[RIGHT_SHOULDER];
      const leftHip = landmarks[LEFT_HIP];
      const rightHip = landmarks[RIGHT_HIP];
      const leftKnee = landmarks[LEFT_KNEE];
      const rightKnee = landmarks[RIGHT_KNEE];
      const leftAnkle = landmarks[LEFT_ANKLE];
      const rightAnkle = landmarks[RIGHT_ANKLE];

      const vis = (p) => p && (p.visibility == null || p.visibility > 0.4);
      // Require core joints and at least one ankle to be confident about a supported wall-sit posture
      if (!vis(leftShoulder) || !vis(rightShoulder) || !vis(leftHip) || !vis(rightHip) || !vis(leftKnee) || !vis(rightKnee)) return false;
      if (!vis(leftAnkle) && !vis(rightAnkle)) return false;

      const shoulderCenter = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
      const hipCenter = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
      const kneeCenter = { x: (leftKnee.x + rightKnee.x) / 2, y: (leftKnee.y + rightKnee.y) / 2 };
      const ankleCenter = vis(leftAnkle) && vis(rightAnkle)
        ? { x: (leftAnkle.x + rightAnkle.x) / 2, y: (leftAnkle.y + rightAnkle.y) / 2 }
        : (vis(leftAnkle) ? { x: leftAnkle.x, y: leftAnkle.y } : { x: rightAnkle.x, y: rightAnkle.y });

  // Relaxed defaults: allow more tolerance for consumer webcams and varied camera angles
  const kneesLevel = Math.abs(leftKnee.y - rightKnee.y) <= (cfg.MAX_KNEE_LEVEL_DIFF ?? 0.08);
  const hipAlignedWithKnees = Math.abs(hipCenter.y - kneeCenter.y) <= (cfg.HIP_KNEE_LEVEL_TOLERANCE ?? 0.09);
  const MIN_SHOULDER_HIP_GAP = cfg.MIN_SHOULDER_HIP_GAP ?? 0.06;
  const shoulderAboveHip = (hipCenter.y - shoulderCenter.y) >= MIN_SHOULDER_HIP_GAP;
  const MAX_BACK_OFFSET = cfg.MAX_BACK_OFFSET ?? 0.07;

      const leftSideVisible = vis(leftShoulder) && vis(leftHip) && vis(leftAnkle) && vis(leftKnee);
      const rightSideVisible = vis(rightShoulder) && vis(rightHip) && vis(rightAnkle) && vis(rightKnee);

      let referenceShoulder = shoulderCenter;
      let referenceHip = hipCenter;
      let referenceKnee = kneeCenter;
      let referenceAnkle = ankleCenter;
      let poseOk = false;

      if (leftSideVisible || rightSideVisible) {
        const sideShoulder = leftSideVisible ? leftShoulder : rightShoulder;
        const sideHip = leftSideVisible ? leftHip : rightHip;
        const sideKnee = leftSideVisible ? leftKnee : rightKnee;
        const sideAnkle = leftSideVisible ? leftAnkle : rightAnkle;

        referenceShoulder = sideShoulder;
        referenceHip = sideHip;
        referenceKnee = sideKnee;
        referenceAnkle = sideAnkle;

        const torsoDx = sideShoulder.x - sideHip.x;
        const torsoDy = sideShoulder.y - sideHip.y;
        const torsoOrientDeg = Math.abs(Math.atan2(torsoDy, torsoDx) * 180 / Math.PI);
        const VERT_MIN = cfg.VERT_MIN_DEG ?? 70;
        const VERT_MAX = cfg.VERT_MAX_DEG ?? 110;
        const torsoVertical = (torsoOrientDeg >= VERT_MIN && torsoOrientDeg <= VERT_MAX);

        const thighDx = sideKnee.x - sideHip.x;
        const thighDy = sideKnee.y - sideHip.y;
        const thighOrientDeg = Math.abs(Math.atan2(thighDy, thighDx) * 180 / Math.PI);
        const THIGH_MIN = cfg.THIGH_MIN_DEG ?? 330;
        const THIGH_MAX = cfg.THIGH_MAX_DEG ?? 30;
        const thighHorizontal = (thighOrientDeg <= THIGH_MAX) || (thighOrientDeg >= THIGH_MIN);

        const kneeHipGap = Math.abs(sideHip.y - sideKnee.y);
        const MIN_HIP_KNEE_GAP = cfg.MIN_HIP_KNEE_GAP ?? 0.015;
        const MAX_HIP_KNEE_GAP = cfg.MAX_HIP_KNEE_GAP ?? 0.12;
  const kneeDepthOk = kneeHipGap >= MIN_HIP_KNEE_GAP && kneeHipGap <= MAX_HIP_KNEE_GAP;

  const MIN_ANKLE_HIP_GAP = cfg.MIN_ANKLE_HIP_GAP ?? 0.01;
        const anklesBelowHip = (sideAnkle.y - sideHip.y) >= MIN_ANKLE_HIP_GAP;

        const backAligned = Math.abs(sideShoulder.x - sideHip.x) <= MAX_BACK_OFFSET;

  poseOk = torsoVertical && thighHorizontal && kneeDepthOk && anklesBelowHip && backAligned && kneesLevel && hipAlignedWithKnees && shoulderAboveHip;
      } else {
        const dx = shoulderCenter.x - hipCenter.x;
        const dy = shoulderCenter.y - hipCenter.y;
        const orientDeg = Math.abs(Math.atan2(dy, dx) * 180 / Math.PI);
        const VERT_MIN = cfg.VERT_MIN_DEG ?? 65;
        const VERT_MAX = cfg.VERT_MAX_DEG ?? 115;
        const verticalOk = (orientDeg >= VERT_MIN && orientDeg <= VERT_MAX);

        let backAligned = true;
        if (vis(leftShoulder) && vis(leftHip)) backAligned = backAligned && (Math.abs(leftShoulder.x - leftHip.x) <= MAX_BACK_OFFSET);
        if (vis(rightShoulder) && vis(rightHip)) backAligned = backAligned && (Math.abs(rightShoulder.x - rightHip.x) <= MAX_BACK_OFFSET);

        const kneeHipGap = Math.abs(hipCenter.y - kneeCenter.y);
        const MIN_HIP_KNEE_GAP = cfg.MIN_HIP_KNEE_GAP ?? 0.015;
        const MAX_HIP_KNEE_GAP = cfg.MAX_HIP_KNEE_GAP ?? 0.12;
        const kneeDepthOk = kneeHipGap >= MIN_HIP_KNEE_GAP && kneeHipGap <= MAX_HIP_KNEE_GAP;

        const MIN_ANKLE_HIP_GAP = cfg.MIN_ANKLE_HIP_GAP ?? 0.015;
        const anklesBelowHip = ankleCenter ? ((ankleCenter.y - hipCenter.y) >= MIN_ANKLE_HIP_GAP) : true;

        poseOk = verticalOk && backAligned && kneeDepthOk && anklesBelowHip && kneesLevel && hipAlignedWithKnees && shoulderAboveHip;
      }

      // Special-case: if the body looks horizontal (plank-like), reject as wallsit.
      // This prevents counting plank seconds or push-up reps when exerciseMode is 'wallsit'.
      try {
        // simple horizontal heuristic: shoulder-hip dy small AND head near hip y
        const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;
        const hipCenterY = (leftHip.y + rightHip.y) / 2;
        const torsoDy = Math.abs(shoulderCenterY - hipCenterY);
        const head = landmarks[cfg.NOSE || 0];
        const headHipDy = Math.abs((head?.y ?? 0) - hipCenterY);
        const HORIZ_TORSO_THRESHOLD = cfg.HORIZ_TORSO_THRESHOLD ?? 0.09; // slightly relaxed
        const HEAD_HIP_HORIZONTAL_THRESHOLD = cfg.HEAD_HIP_HORIZONTAL_THRESHOLD ?? 0.11; // slightly relaxed

        // Hands-on-ground heuristic: multiple ways to classify horizontal/plank-like pose
        const leftWrist = landmarks[cfg.LEFT_WRIST || 15];
        const rightWrist = landmarks[cfg.RIGHT_WRIST || 16];
        const leftAnkle = landmarks[cfg.LEFT_ANKLE || 27];
        const rightAnkle = landmarks[cfg.RIGHT_ANKLE || 28];

        const HANDS_ON_GROUND_THRESHOLD = cfg.HANDS_ON_GROUND_THRESHOLD ?? 0.07; // near ankles
        const HANDS_HIP_HORIZONTAL_THRESHOLD = cfg.HANDS_HIP_HORIZONTAL_THRESHOLD ?? 0.08; // near hip line

        let handsOnAnkleLevel = false;
        if (leftWrist && rightWrist && leftAnkle && rightAnkle) {
          const leftNearAnkle = Math.abs(leftWrist.y - leftAnkle.y) <= HANDS_ON_GROUND_THRESHOLD || leftWrist.y >= (leftAnkle.y - HANDS_ON_GROUND_THRESHOLD);
          const rightNearAnkle = Math.abs(rightWrist.y - rightAnkle.y) <= HANDS_ON_GROUND_THRESHOLD || rightWrist.y >= (rightAnkle.y - HANDS_ON_GROUND_THRESHOLD);
          handsOnAnkleLevel = leftNearAnkle && rightNearAnkle;
        }

        // Hands near hip line (common in plank) — check against hipCenterY
        let handsNearHipLine = false;
        if (leftWrist && rightWrist) {
          const hipCenterY = (leftHip.y + rightHip.y) / 2;
          const leftNearHip = Math.abs(leftWrist.y - hipCenterY) <= HANDS_HIP_HORIZONTAL_THRESHOLD;
          const rightNearHip = Math.abs(rightWrist.y - hipCenterY) <= HANDS_HIP_HORIZONTAL_THRESHOLD;
          handsNearHipLine = leftNearHip && rightNearHip;
        }

        // Head near hip (horizontal body) — reuse headHipDy
        const headNearHip = headHipDy <= HEAD_HIP_HORIZONTAL_THRESHOLD;

        if (this.exerciseMode === 'wallsit') {
          // Combine multiple weak indicators before classifying as plank-like to avoid
          // overblocking valid wallsit poses. Require at least two of the indicators.
          const indicators = [];
          indicators.push(!!handsOnAnkleLevel);
          indicators.push(!!handsNearHipLine);
          indicators.push(!!(torsoDy <= HORIZ_TORSO_THRESHOLD && headNearHip));
          const indicatorCount = indicators.reduce((s, v) => s + (v ? 1 : 0), 0);
          if (indicatorCount >= 2) {
            // detected plank-like posture (multiple indicators) — not a wallsit
            return false;
          }
        }
      } catch (e) {
        // ignore heuristic errors and continue to strict check
      }

      // Require the exported single-frame strict pose check (back flat, knees at hip level, feet visible)
      try {
        const single = isWallSitPosition(landmarks);
        if (!single || !single.ok) return false;
      } catch (e) {
        return false;
      }

      if (!poseOk) return false;

      const state = this.perModeState['wallsit'] || (this.perModeState['wallsit'] = { state: 'neutral', count: 0 });
      const now = nowMs || Date.now();
      const dt = Math.max(1, now - (state._lastTimestamp || now));
      const perSec = 1000 / dt;

      const currHipY = referenceHip ? referenceHip.y : hipCenter.y;
      const currHipX = referenceHip ? referenceHip.x : hipCenter.x;
      const currShoulderY = referenceShoulder ? referenceShoulder.y : shoulderCenter.y;
      const currShoulderX = referenceShoulder ? referenceShoulder.x : shoulderCenter.x;
      const currKneeY = referenceKnee ? referenceKnee.y : kneeCenter.y;
      const currKneeX = referenceKnee ? referenceKnee.x : kneeCenter.x;
      const currAnkleY = referenceAnkle ? referenceAnkle.y : (ankleCenter ? ankleCenter.y : null);
      const currAnkleX = referenceAnkle ? referenceAnkle.x : (ankleCenter ? ankleCenter.x : null);

      const hipRate = Math.max(
        state._lastHipX == null ? 0 : Math.abs(currHipX - state._lastHipX),
        state._lastHipY == null ? 0 : Math.abs(currHipY - state._lastHipY)
      ) * perSec;
      const shoulderRate = Math.max(
        state._lastShoulderX == null ? 0 : Math.abs(currShoulderX - state._lastShoulderX),
        state._lastShoulderY == null ? 0 : Math.abs(currShoulderY - state._lastShoulderY)
      ) * perSec;
      const kneeRate = Math.max(
        state._lastKneeX == null ? 0 : Math.abs(currKneeX - state._lastKneeX),
        state._lastKneeY == null ? 0 : Math.abs(currKneeY - state._lastKneeY)
      ) * perSec;
      let ankleRate = 0;
      if (currAnkleX != null && currAnkleY != null && state._lastAnkleX != null && state._lastAnkleY != null) {
        ankleRate = Math.max(
          Math.abs(currAnkleX - state._lastAnkleX),
          Math.abs(currAnkleY - state._lastAnkleY)
        ) * perSec;
      }

  // Very permissive stillness defaults for uploaded videos
  const STILL_MAX_DELTA_PER_SEC = cfg.STILL_MAX_DELTA_PER_SEC ?? 1.0;
    const motionTooHigh = [hipRate, shoulderRate, kneeRate, ankleRate].some((rate) => rate > STILL_MAX_DELTA_PER_SEC);

      if (!motionTooHigh) {
        state._stableCount = (state._stableCount || 0) + 1;
      } else {
        state._stableCount = 0;
      }

      state._lastHipY = currHipY;
      state._lastHipX = currHipX;
      state._lastShoulderY = currShoulderY;
      state._lastShoulderX = currShoulderX;
      state._lastKneeY = currKneeY;
      state._lastKneeX = currKneeX;
      state._lastAnkleY = currAnkleY;
      state._lastAnkleX = currAnkleX;
      state._lastTimestamp = now;

  // require minimal consecutive stable frames for permissive uploaded-video detection
  const REQUIRED_STABLE_FRAMES = cfg.REQUIRED_STABLE_FRAMES ?? 1;
      // Sparse debug logging to help diagnose why wallsit stability may not be reached
      try {
        state._lastWallLogTime = state._lastWallLogTime || 0;
        if (Date.now() - state._lastWallLogTime > 1000) {
          console.debug && console.debug('isWallSitStrictAndStable debug', {
            hipRate, shoulderRate, kneeRate, ankleRate, motionTooHigh, stableCount: state._stableCount, REQUIRED_STABLE_FRAMES
          });
          state._lastWallLogTime = Date.now();
        }
      } catch (e) {
        // ignore logging errors
      }

      return state._stableCount >= REQUIRED_STABLE_FRAMES;
    } catch (e) {
      console.error('isWallSitStrictAndStable error', e);
      return false;
    }
  }

  // Detect stable push-up start pose: torso roughly horizontal and ankles visible (proxy for being on toes)
  isPushupStartPose(landmarks) {
    try {
      const cfg = window.MediaPipeConfig?.POSE_LANDMARKS || {};
      const leftShoulder = landmarks[cfg.LEFT_SHOULDER || 11];
      const rightShoulder = landmarks[cfg.RIGHT_SHOULDER || 12];
      const leftHip = landmarks[cfg.LEFT_HIP || 23];
      const rightHip = landmarks[cfg.RIGHT_HIP || 24];
      const leftAnkle = landmarks[cfg.LEFT_ANKLE || 27];
      const rightAnkle = landmarks[cfg.RIGHT_ANKLE || 28];

      const vis = (p) => p && (p.visibility == null || p.visibility > 0.5);
      if (!vis(leftShoulder) || !vis(rightShoulder) || !vis(leftHip) || !vis(rightHip) || !vis(leftAnkle) || !vis(rightAnkle)) {
        return false;
      }

      const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;
      const hipCenterY = (leftHip.y + rightHip.y) / 2;

      // torso vertical difference small -> near horizontal
      const torsoDy = Math.abs(shoulderCenterY - hipCenterY);
      const THRESH = window.MediaPipeConfig?.PUSHUP_CONFIG?.START_TORSO_DY ?? 0.08;
      if (torsoDy > THRESH) return false;

      // ankles visible and reasonably below hips (on toes) as an extra proxy
      const ankleBelowHip = ((leftAnkle.y + rightAnkle.y) / 2) > hipCenterY;
      if (!ankleBelowHip) return false;

      return true;
    } catch (e) {
      return false;
    }
  }

  // Detect stable squat start pose: standing upright with hips above knees and torso approximately vertical
  isSquatStartPose(landmarks) {
    try {
      const cfg = window.MediaPipeConfig?.POSE_LANDMARKS || {};
      const leftShoulder = landmarks[cfg.LEFT_SHOULDER || 11];
      const rightShoulder = landmarks[cfg.RIGHT_SHOULDER || 12];
      const leftHip = landmarks[cfg.LEFT_HIP || 23];
      const rightHip = landmarks[cfg.RIGHT_HIP || 24];
      const leftKnee = landmarks[cfg.LEFT_KNEE || 25];
      const rightKnee = landmarks[cfg.RIGHT_KNEE || 26];
      const leftAnkle = landmarks[cfg.LEFT_ANKLE || 27];
      const rightAnkle = landmarks[cfg.RIGHT_ANKLE || 28];

      const vis = (p) => p && (p.visibility == null || p.visibility > 0.5);
      // Require shoulders, hips and knees for a reliable standing start pose.
      // Ankles are optional because many webcams/cameras crop the feet.
      if (!vis(leftShoulder) || !vis(rightShoulder) || !vis(leftHip) || !vis(rightHip) || !vis(leftKnee) || !vis(rightKnee)) {
        return false;
      }

      const hipY = (leftHip.y + rightHip.y) / 2;
      const kneeY = (leftKnee.y + rightKnee.y) / 2;
      // In normalized coordinates hip above knee when standing
      const gap = kneeY - hipY; // positive when hip above knee
  const GAP_MIN = window.MediaPipeConfig?.SQUAT_CONFIG?.START_HIP_KNEE_GAP ?? 0.01;
      if (gap < GAP_MIN) return false;

      // Torso should be roughly vertical when standing
      const shoulderCenter = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
      const hipCenter = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
      const dx = shoulderCenter.x - hipCenter.x;
      const dy = shoulderCenter.y - hipCenter.y;
      const angDeg = Math.abs(Math.atan2(dx, -dy) * 180 / Math.PI); // similar to torso tilt in squat logic
  const MIN_VERT = window.MediaPipeConfig?.SQUAT_CONFIG?.STANDING_TORSO_MIN_DEG ?? 60;
  const MAX_VERT = window.MediaPipeConfig?.SQUAT_CONFIG?.STANDING_TORSO_MAX_DEG ?? 120;
      if (angDeg < MIN_VERT || angDeg > MAX_VERT) return false;

      return true;
    } catch (e) {
      return false;
    }
  }

  // Check back alignment for posture
  checkBackAlignment(landmarks) {
    try {
      const config = window.MediaPipeConfig?.POSE_LANDMARKS || {};
      
      const leftShoulder = landmarks[config.LEFT_SHOULDER || 11];
      const rightShoulder = landmarks[config.RIGHT_SHOULDER || 12];
      const leftHip = landmarks[config.LEFT_HIP || 23];
      const rightHip = landmarks[config.RIGHT_HIP || 24];
      const leftKnee = landmarks[config.LEFT_KNEE || 25];
      const rightKnee = landmarks[config.RIGHT_KNEE || 26];
      const leftAnkle = landmarks[config.LEFT_ANKLE || 27];
      const rightAnkle = landmarks[config.RIGHT_ANKLE || 28];

      // Require visibility. For plank allow side-view (one side) visibility; for other exercises require both sides for stability.
      const vis = (p) => p && (p.visibility == null || p.visibility > 0.5);
      if (this.exerciseMode === 'plank') {
        const leftSideOk = vis(leftShoulder) && vis(leftHip);
        const rightSideOk = vis(rightShoulder) && vis(rightHip);
        if (!leftSideOk && !rightSideOk) {
          // Not enough landmarks to evaluate plank reliably
          return false;
        }
      } else if (this.exerciseMode === 'pushups') {
        // For push-ups we only require both shoulders and hips to be visible.
        if (!vis(leftShoulder) || !vis(rightShoulder) || !vis(leftHip) || !vis(rightHip)) {
          return false;
        }
      } else {
        // For other exercises require knees visible for stability
        if (!vis(leftShoulder) || !vis(rightShoulder) || !vis(leftHip) || !vis(rightHip) || !vis(leftKnee) || !vis(rightKnee)) {
          return false;
        }
      }

      // Calculate center points
      const shoulderCenter = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2
      };
      
      const hipCenter = {
        x: (leftHip.x + rightHip.x) / 2,
        y: (leftHip.y + rightHip.y) / 2
      };
      
      const kneeCenter = {
        x: (leftKnee.x + rightKnee.x) / 2,
        y: (leftKnee.y + rightKnee.y) / 2
      };
      const ankleCenter = (vis(leftAnkle) && vis(rightAnkle)) ? {
        x: (leftAnkle.x + rightAnkle.x) / 2,
        y: (leftAnkle.y + rightAnkle.y) / 2
      } : null;

      // Vectors for straightness
      const targetPoint = ankleCenter || kneeCenter;
      const v1 = { x: shoulderCenter.x - hipCenter.x, y: shoulderCenter.y - hipCenter.y };
      const v2 = targetPoint ? { x: targetPoint.x - hipCenter.x, y: targetPoint.y - hipCenter.y } : null;

      let isGoodPosture = false;
      if (this.exerciseMode === 'plank') {
        // Plank: support both front-facing and side-view evaluation.
        const cfg = window.MediaPipeConfig?.PLANK_CONFIG || {};

        // Prefer side-view detection when one full side is visible (shoulder, hip, ankle)
        const leftSideVisible = vis(leftShoulder) && vis(leftHip) && vis(leftAnkle);
        const rightSideVisible = vis(rightShoulder) && vis(rightHip) && vis(rightAnkle);

        if (leftSideVisible || rightSideVisible) {
          const shoulder = leftSideVisible ? leftShoulder : rightShoulder;
          const hip = leftSideVisible ? leftHip : rightHip;
          const ankle = leftSideVisible ? leftAnkle : rightAnkle;

          // Angle at hip between shoulder-hip-ankle: near 180° for a straight plank
          const sideAngle = this.calculateAngle(shoulder, hip, ankle);
          const minSideAngle = cfg.MIN_SIDE_ANGLE ?? 155; // degrees

          isGoodPosture = sideAngle >= minSideAngle;

          // optional knee check when both ankles visible
          if (isGoodPosture && ankleCenter) {
            const leftKneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
            const rightKneeAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle);
            const kneeMin = cfg.KNEE_MIN_DEG ?? 150;
            const kneeOk = (leftKneeAngle >= kneeMin) && (rightKneeAngle >= kneeMin);
            isGoodPosture = isGoodPosture && kneeOk;
          }

        } else {
          // Fallback: use center-based straightness + orientation as before (front-facing)
          let cosSim = -1;
          if (v2) {
            const mag1 = Math.hypot(v1.x, v1.y) || 1;
            const mag2 = Math.hypot(v2.x, v2.y) || 1;
            cosSim = (v1.x * v2.x + v1.y * v2.y) / (mag1 * mag2);
          }
          const absCos = Math.abs(Math.max(-1, Math.min(1, cosSim)));
          const straightEnough = v2 ? (absCos >= (cfg.STRAIGHT_ABS_COS_MIN ?? 0.90)) : false;
          const dx = shoulderCenter.x - hipCenter.x;
          const dy = shoulderCenter.y - hipCenter.y;
          const orientDeg = Math.abs(Math.atan2(dy, dx) * 180 / Math.PI);
          const horizMax = cfg.HORIZ_MAX_DEG ?? 35;
          const nearHorizontal = (orientDeg <= horizMax) || (orientDeg >= (180 - horizMax));
          let kneeOk = true;
          if (ankleCenter) {
            const leftKneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
            const rightKneeAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle);
            const kneeMin = cfg.KNEE_MIN_DEG ?? 150;
            kneeOk = (leftKneeAngle >= kneeMin) && (rightKneeAngle >= kneeMin);
          }
          isGoodPosture = straightEnough && nearHorizontal && kneeOk;
        }

      } else if (this.exerciseMode === 'squats') {
        // Squats: accept normal descent (hip moving below knee) as a valid posture.
        // Only flag 'BAD' when there's severe hip/back collapse (rounded back).
        const scfg = window.MediaPipeConfig?.SQUAT_CONFIG || {};
        const hipAngleLeft = this.calculateAngle(leftShoulder, leftHip, leftKnee);
        const hipAngleRight = this.calculateAngle(rightShoulder, rightHip, rightKnee);
        const hipAngle = (hipAngleLeft + hipAngleRight) / 2;
        // Configurable thresholds
        const hipAngleMin = scfg.HIP_ANGLE_MIN ?? 120; // generous minimum for 'upright' expectation
        const collapseThreshold = scfg.HIP_ANGLE_COLLAPSE ?? 60; // below this -> collapsed (bad)
        const dx = shoulderCenter.x - hipCenter.x;
        const dy = shoulderCenter.y - hipCenter.y;
        const torsoTiltDeg = Math.abs(Math.atan2(dx, -dy) * 180 / Math.PI);
        const tiltMax = scfg.TORSO_TILT_MAX ?? 60;

        // Determine hip vs knee vertical relationship (allow descent)
        const hipBelowKnee = kneeCenter && (hipCenter.y > kneeCenter.y);

        const collapseTiltMin = scfg.COLLAPSE_TILT_MIN ?? 70; // require significant forward rounding
        if (hipAngle < collapseThreshold && torsoTiltDeg > collapseTiltMin) {
          // Severe collapse (rounded back + low hip angle) — definitely bad
          isGoodPosture = false;
        } else if (hipBelowKnee) {
          // Normal squat descent — accept as good (as long as collapse not detected)
          isGoodPosture = true;
        } else {
          // Standing/upright checks: require reasonable hip angle and torso tilt
          isGoodPosture = (hipAngle >= hipAngleMin) && (torsoTiltDeg <= tiltMax);
        }
      } else if (this.exerciseMode === 'wallsit') {
        const wcfg = window.MediaPipeConfig?.WALLSIT_CONFIG || {};
        const kneesLevel = Math.abs(leftKnee.y - rightKnee.y) <= (wcfg.MAX_KNEE_LEVEL_DIFF ?? 0.05);
        const hipKneeGap = Math.abs(hipCenter.y - kneeCenter.y);
        const hipLevelWithKnees = hipKneeGap <= (wcfg.HIP_KNEE_LEVEL_TOLERANCE ?? 0.06);
        const MIN_HIP_KNEE_GAP = wcfg.MIN_HIP_KNEE_GAP ?? 0.015;
        const MAX_HIP_KNEE_GAP = wcfg.MAX_HIP_KNEE_GAP ?? 0.12;
        const kneeDepthOk = hipKneeGap >= MIN_HIP_KNEE_GAP && hipKneeGap <= MAX_HIP_KNEE_GAP;
        const MIN_SHOULDER_HIP_GAP = wcfg.MIN_SHOULDER_HIP_GAP ?? 0.07;
        const shoulderAboveHip = (hipCenter.y - shoulderCenter.y) >= MIN_SHOULDER_HIP_GAP;
        const MAX_BACK_OFFSET = wcfg.MAX_BACK_OFFSET ?? 0.07;
        let backAligned = true;
        if (vis(leftShoulder) && vis(leftHip)) backAligned = backAligned && (Math.abs(leftShoulder.x - leftHip.x) <= MAX_BACK_OFFSET);
        if (vis(rightShoulder) && vis(rightHip)) backAligned = backAligned && (Math.abs(rightShoulder.x - rightHip.x) <= MAX_BACK_OFFSET);
        const MIN_ANKLE_HIP_GAP = wcfg.MIN_ANKLE_HIP_GAP ?? 0.015;
        const ankleVisible = vis(leftAnkle) || vis(rightAnkle);
        let anklesBelowHip = ankleVisible;
        if (vis(leftAnkle)) anklesBelowHip = anklesBelowHip && ((leftAnkle.y - hipCenter.y) >= MIN_ANKLE_HIP_GAP);
        if (vis(rightAnkle)) anklesBelowHip = anklesBelowHip && ((rightAnkle.y - hipCenter.y) >= MIN_ANKLE_HIP_GAP);
        let thighHorizontal = true;
        const thighCheckLeft = vis(leftHip) && vis(leftKnee) && vis(leftAnkle);
        if (thighCheckLeft) {
          const thighAngleLeft = Math.abs(Math.atan2(leftKnee.y - leftHip.y, leftKnee.x - leftHip.x) * 180 / Math.PI);
          const thighOkLeft = (thighAngleLeft <= (wcfg.THIGH_MAX_DEG ?? 35)) || (thighAngleLeft >= (wcfg.THIGH_MIN_DEG ?? 325));
          thighHorizontal = thighHorizontal && thighOkLeft;
        }
        const thighCheckRight = vis(rightHip) && vis(rightKnee) && vis(rightAnkle);
        if (thighCheckRight) {
          const thighAngleRight = Math.abs(Math.atan2(rightKnee.y - rightHip.y, rightKnee.x - rightHip.x) * 180 / Math.PI);
          const thighOkRight = (thighAngleRight <= (wcfg.THIGH_MAX_DEG ?? 35)) || (thighAngleRight >= (wcfg.THIGH_MIN_DEG ?? 325));
          thighHorizontal = thighHorizontal && thighOkRight;
        }

        isGoodPosture = backAligned && kneesLevel && hipLevelWithKnees && kneeDepthOk && shoulderAboveHip && anklesBelowHip && thighHorizontal;
      } else {
        // Push-ups: prefer a dedicated horizontal-body check.
        // Two modes: side view (ankles visible) -> use straight-line similarity as before.
        // Front/angled view (no ankle visibility) -> check shoulder-hip orientation close to horizontal
        const cfg = window.MediaPipeConfig?.PUSHUP_CONFIG || {};
        const SIDE_ABS_COS_MIN = cfg.SIDE_ABS_COS_MIN ?? 0.82; // slightly more lenient
        const HORIZ_TORSO_MAX_DEG = cfg.HORIZ_TORSO_MAX_DEG ?? 35; // allow more tilt

        // If ankle center available assume side/diagonal view and use cos similarity
        if (ankleCenter && v2) {
          let cosSim = -1;
          const mag1 = Math.hypot(v1.x, v1.y) || 1;
          const mag2 = Math.hypot(v2.x, v2.y) || 1;
          cosSim = (v1.x * v2.x + v1.y * v2.y) / (mag1 * mag2);
          const absCos = Math.abs(Math.max(-1, Math.min(1, cosSim)));
          isGoodPosture = absCos >= SIDE_ABS_COS_MIN;
        } else {
          // Fallback: check that shoulder-hip axis is near horizontal (small dy)
          const dx = shoulderCenter.x - hipCenter.x;
          const dy = shoulderCenter.y - hipCenter.y;
          const angDeg = Math.abs(Math.atan2(dy, dx) * 180 / Math.PI);
          // angle near 0 or near 180 -> horizontal
          const nearHorizontal = (angDeg <= HORIZ_TORSO_MAX_DEG) || (angDeg >= (180 - HORIZ_TORSO_MAX_DEG));
          // Also ensure it's not standing (i.e., torso nearly vertical)
          const nearVertical = (angDeg >= 90 - 20 && angDeg <= 90 + 20);
          isGoodPosture = nearHorizontal && !nearVertical;
        }
      }

      console.log(`🏃 Posture(${this.exerciseMode}): ${isGoodPosture ? 'GOOD' : 'BAD'}`);
      
      return isGoodPosture;
    } catch (error) {
      console.error('Error checking back alignment:', error);
      return false;
    }
  }

  // Update push-up counter
  updatePushupCounter(landmarks) {
    try {
      const config = window.MediaPipeConfig?.POSE_LANDMARKS || {};
      const pushupConfig = window.MediaPipeConfig?.PUSHUP_CONFIG || {};
      
      const leftShoulder = landmarks[config.LEFT_SHOULDER || 11];
      const leftElbow = landmarks[config.LEFT_ELBOW || 13];
      const leftWrist = landmarks[config.LEFT_WRIST || 15];
      const rightShoulder = landmarks[config.RIGHT_SHOULDER || 12];
      const rightElbow = landmarks[config.RIGHT_ELBOW || 14];
      const rightWrist = landmarks[config.RIGHT_WRIST || 16];
      const leftHip = landmarks[config.LEFT_HIP || 23];
      const rightHip = landmarks[config.RIGHT_HIP || 24];

      if (!leftShoulder || !leftElbow || !leftWrist || !rightShoulder || !rightElbow || !rightWrist || !leftHip || !rightHip) {
        return;
      }

      // Calculate elbow angles
      const leftElbowAngle = this.calculateAngle(leftShoulder, leftElbow, leftWrist);
      const rightElbowAngle = this.calculateAngle(rightShoulder, rightElbow, rightWrist);
      const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;

      // Average shoulder position (for height detection)
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;

      const downThreshold = pushupConfig.ELBOW_ANGLE_DOWN || 95;
      const upThreshold = pushupConfig.ELBOW_ANGLE_UP || 155;
      const shoulderHeightThreshold = pushupConfig.SHOULDER_HEIGHT_DOWN || 0.02;

      // Push-up position: elbows bent OR shoulders close to ground
      // Determine if user is likely standing: if shoulders are well above hips and torso vertical
      const shoulderHipDy = Math.abs(((leftShoulder.y + rightShoulder.y) / 2) - ((leftHip.y + rightHip.y) / 2));
      const torsoVerticalThreshold = pushupConfig.TORSO_VERTICAL_DY ?? 0.15; // if shoulders far above hips (normalized units)
      const isLikelyStanding = shoulderHipDy < (pushupConfig.STANDING_DY_MIN ?? 0.05) ? false : ((leftShoulder.y + rightShoulder.y) / 2) < ((leftHip.y + rightHip.y) / 2) - (pushupConfig.STANDING_DY_MIN ?? 0.02);

      // Baseline shoulder level (approx when 'up' state) — store per-mode baseline
      const pstate = this.perModeState['pushups'];
      if (!pstate._baselineShoulderY) {
        // initialize baseline to current shoulder Y when pose roughly horizontal
        pstate._baselineShoulderY = avgShoulderY;
      }

      // If posture is not horizontal, don't update baseline; else slowly adapt baseline
      if (Math.abs(((leftShoulder.y + rightShoulder.y) / 2) - ((leftHip.y + rightHip.y) / 2)) < 0.12) {
        // adapt baseline slowly
        pstate._baselineShoulderY = (pstate._baselineShoulderY * 0.95) + (avgShoulderY * 0.05);
      }

      // Push-up position: significant drop from baseline OR elbow angle threshold
      const shoulderDrop = avgShoulderY - (pstate._baselineShoulderY || avgShoulderY);
      const shoulderDropThreshold = pushupConfig.SHOULDER_DROP_THRESHOLD ?? 0.06; // normalized units
      const pushupPosition = (avgElbowAngle <= downThreshold) || (shoulderDrop >= shoulderDropThreshold) || (avgShoulderY >= (1 - shoulderHeightThreshold));
      
      // Standing position: elbows straight and shoulders high (not horizontal)
      const standingPosition = (avgElbowAngle >= upThreshold) && isLikelyStanding;

      // In-position gating: require user to assume a stable push-up start pose before starting counting
      if (!pstate._inPositionCount) pstate._inPositionCount = 0;
      const inStart = this.isPushupStartPose(landmarks);
      if (inStart) {
        pstate._inPositionCount += 1;
      } else {
        pstate._inPositionCount = 0;
      }

      const REQUIRED_STABLE_FRAMES = window.MediaPipeConfig?.PUSHUP_CONFIG?.START_STABLE_FRAMES ?? 6; // ~6 frames
      pstate._isInStartPose = pstate._inPositionCount >= REQUIRED_STABLE_FRAMES;

      // Debounce reps: minimum ms between consecutive counts
      const MIN_REP_MS = window.MediaPipeConfig?.PUSHUP_CONFIG?.MIN_REP_MS ?? 400;
      if (!pstate._lastRepAt) pstate._lastRepAt = 0;
      const now = Date.now();

      // Only count if posture is correct and user is in start pose
      if (this.postureStatus !== 'correct' || !pstate._isInStartPose) {
        return; // do not count
      }

      if (pstate.state === 'up') {
        if (pushupPosition && (now - pstate._lastRepAt) > MIN_REP_MS) {
          pstate.state = 'down';
          pstate.count += 1; // Count on descent
          pstate._lastRepAt = now;
          this.playSuccessSound(); // Play success sound
          if (this.onPushupCount) this.onPushupCount(pstate.count);
          if (this.onFormFeedback) {
            this.onFormFeedback({ message: `Push-up ${pstate.count}`, type: 'success', timestamp: now });
          }
        }
      } else if (pstate.state === 'down') {
        // return to up when standingPosition or full extension detected
        if (standingPosition || (!pushupPosition && avgElbowAngle >= upThreshold)) {
          pstate.state = 'up'; // Reset state for next rep
        }
      }
    } catch (error) {
      console.error('Error updating push-up counter:', error);
    }
  }

  // Update squat counter
  updateSquatCounter(landmarks) {
    try {
      const cfg = window.MediaPipeConfig?.POSE_LANDMARKS || {};
      const scfg = window.MediaPipeConfig?.SQUAT_CONFIG || {};

      const leftHip = landmarks[cfg.LEFT_HIP || 23];
      const rightHip = landmarks[cfg.RIGHT_HIP || 24];
      const leftKnee = landmarks[cfg.LEFT_KNEE || 25];
      const rightKnee = landmarks[cfg.RIGHT_KNEE || 26];
      const leftAnkle = landmarks[cfg.LEFT_ANKLE || 27];
      const rightAnkle = landmarks[cfg.RIGHT_ANKLE || 28];
      const leftShoulder = landmarks[cfg.LEFT_SHOULDER || 11];
      const rightShoulder = landmarks[cfg.RIGHT_SHOULDER || 12];

      if (!leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle || !leftShoulder || !rightShoulder) return;

      // Check if user is in horizontal position (like pushup) - show warning but DO NOT count if so
      const shoulderCenterY = (leftShoulder.y + rightShoulder.y) / 2;
      const hipCenterY = (leftHip.y + rightHip.y) / 2;
      const head = landmarks[cfg.NOSE || 0];
      const torsoDy = Math.abs(shoulderCenterY - hipCenterY);
      const HORIZONTAL_THRESHOLD = 0.08; // Same threshold as pushup detection
      // Check if head is at same y level as hips (head down, body horizontal)
      const headHipDy = Math.abs((head?.y ?? 0) - hipCenterY);
      const HEAD_HIP_HORIZONTAL_THRESHOLD = 0.10; // If head and hip are close in y, likely horizontal
      let isHorizontalLikePushup = false;
      if (torsoDy <= HORIZONTAL_THRESHOLD && headHipDy <= HEAD_HIP_HORIZONTAL_THRESHOLD) {
        isHorizontalLikePushup = true;
        // Optional: show warning
        if (this.onFormFeedback) {
          this.onFormFeedback({ 
            message: 'وضع الجسم أفقي، لن يتم العد إلا في وضع الاسكوات الصحيح', 
            type: 'warning', 
            timestamp: Date.now() 
          });
        }
      }

      // Check if hands are on the ground (like pushup)
      const leftWrist = landmarks[cfg.LEFT_WRIST || 15];
      const rightWrist = landmarks[cfg.RIGHT_WRIST || 16];
      const leftFoot = landmarks[cfg.LEFT_ANKLE || 27];
      const rightFoot = landmarks[cfg.RIGHT_ANKLE || 28];
      // Consider hands on ground if both wrists are at or below the level of the ankles (with small margin)
      const HANDS_ON_GROUND_THRESHOLD = 0.07; // allow small margin
      let handsOnGround = false;
      if (leftWrist && rightWrist && leftFoot && rightFoot) {
        const avgWristY = (leftWrist.y + rightWrist.y) / 2;
        const avgFootY = (leftFoot.y + rightFoot.y) / 2;
        if (avgWristY >= avgFootY - HANDS_ON_GROUND_THRESHOLD) {
          handsOnGround = true;
          if (this.onFormFeedback) {
            this.onFormFeedback({
              message: 'اليدين على الأرض، لن يتم العد إلا في وضع الاسكوات الصحيح',
              type: 'warning',
              timestamp: Date.now()
            });
          }
        }
      }

      // Average sides for stability
      const hip = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
      const knee = { x: (leftKnee.x + rightKnee.x) / 2, y: (leftKnee.y + rightKnee.y) / 2 };
      const ankle = { x: (leftAnkle.x + rightAnkle.x) / 2, y: (leftAnkle.y + rightAnkle.y) / 2 };
      const shoulder = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };

      // Knee angle using hip-knee-ankle
      const kneeAngleLeft = this.calculateAngle(leftHip, leftKnee, leftAnkle);
      const kneeAngleRight = this.calculateAngle(rightHip, rightKnee, rightAnkle);
      const avgKneeAngle = (kneeAngleLeft + kneeAngleRight) / 2;

      // Check leg stability - both legs should be moving together (not one leg down)
      const leftKneeY = leftKnee.y;
      const rightKneeY = rightKnee.y;
      const kneeHeightDiff = Math.abs(leftKneeY - rightKneeY);
      const LEG_STABILITY_THRESHOLD = 0.05; // Maximum difference between left and right knee heights
      
      const legsStable = kneeHeightDiff <= LEG_STABILITY_THRESHOLD;
      
      // Check if knees are bending (squatting down)
      const kneesBending = avgKneeAngle < 120; // Knees bent when angle is less than 120 degrees

      // Count based on hip position (lower back points)
      const hipY = hip.y; // Y position of hips (lower = deeper)
      const kneeY = knee.y; // Y position of knees
      
      // Hip goes below knee level = deep squat
      const hipBelowKnee = hipY > kneeY;
      // Hip goes back up above knee level = standing
      const hipAboveKnee = hipY < kneeY;
      
      // State machine: count when hip goes down below knee level (use per-mode state)
      const stateObj = this.perModeState['squats'];

      // Debug logging
      console.log('🔍 Squat Debug:', {
        legsStable,
        kneesBending,
        avgKneeAngle,
        kneeHeightDiff,
        hipBelowKnee,
        hipAboveKnee,
        state: stateObj.state,
        count: stateObj.count
      });

      // Simplified squat counting: count when hips go below knees with stable legs
      const MIN_REP_MS = window.MediaPipeConfig?.SQUAT_CONFIG?.MIN_REP_MS ?? 500;
      if (!stateObj._lastRepAt) stateObj._lastRepAt = 0;
      const now = Date.now();

      if (stateObj.state === 'up') {
        // Count if hips go below knees and legs are stable, and NOT in horizontal position or hands on ground
        if (hipBelowKnee && legsStable && !isHorizontalLikePushup && !handsOnGround && (now - stateObj._lastRepAt) > MIN_REP_MS) {
          stateObj.state = 'down';
          stateObj.count += 1;
          stateObj._lastRepAt = now;
          console.log('🎯 Squat counted! Count:', stateObj.count);
          this.playSuccessSound(); // Play success sound
          if (this.onPushupCount) this.onPushupCount(stateObj.count);
        } else {
          // Debug why counting didn't happen
          if (!hipBelowKnee) {
            console.log('❌ Not counting: Hips not below knees');
          } else if (!legsStable) {
            console.log('❌ Not counting: Legs not stable (one leg down)');
          } else if (isHorizontalLikePushup) {
            console.log('❌ Not counting: Body is horizontal like pushup');
          } else if (handsOnGround) {
            console.log('❌ Not counting: Hands are on the ground');
          } else if ((now - stateObj._lastRepAt) <= MIN_REP_MS) {
            console.log('❌ Not counting: Too soon since last rep');
          }
        }
      } else if (stateObj.state === 'down') {
        if (hipAboveKnee) {
          stateObj.state = 'up';
          console.log('⬆️ Squat state changed to UP');
        }
      }
    } catch (error) {
      console.error('Error updating squat counter:', error);
    }
  }

  // Update lunges counter
  updateLungesCounter(landmarks) {
    try {
      const cfg = window.MediaPipeConfig?.POSE_LANDMARKS || {};
      const lcfg = window.MediaPipeConfig?.LUNGES_CONFIG || {};
      const leftHip = landmarks[cfg.LEFT_HIP || 23];
      const rightHip = landmarks[cfg.RIGHT_HIP || 24];
      const leftKnee = landmarks[cfg.LEFT_KNEE || 25];
      const rightKnee = landmarks[cfg.RIGHT_KNEE || 26];
      const leftAnkle = landmarks[cfg.LEFT_ANKLE || 27];
      const rightAnkle = landmarks[cfg.RIGHT_ANKLE || 28];
      if (!leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) return;
      
      // Check if hands are on the ground (like pushup) - don't count lunges if hands on ground
      const leftWrist = landmarks[cfg.LEFT_WRIST || 15];
      const rightWrist = landmarks[cfg.RIGHT_WRIST || 16];
      const leftFoot = landmarks[cfg.LEFT_ANKLE || 27];
      const rightFoot = landmarks[cfg.RIGHT_ANKLE || 28];
      const HANDS_ON_GROUND_THRESHOLD = 0.07;
      let handsOnGround = false;
      if (leftWrist && rightWrist && leftFoot && rightFoot) {
        const avgWristY = (leftWrist.y + rightWrist.y) / 2;
        const avgFootY = (leftFoot.y + rightFoot.y) / 2;
        if (avgWristY >= avgFootY - HANDS_ON_GROUND_THRESHOLD) {
          handsOnGround = true;
        }
      }
      
      // Average hip position
      const hip = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
      // Calculate knee angles
      const leftKneeAngle = this.calculateAngle(leftHip, leftKnee, leftAnkle);
      const rightKneeAngle = this.calculateAngle(rightHip, rightKnee, rightAnkle);
      // Determine which leg is front (more bent knee) - allow both legs to be counted
      const leftKneeBent = leftKneeAngle < rightKneeAngle;
      const frontKnee = leftKneeBent ? leftKnee : rightKnee;
      const backKnee = leftKneeBent ? rightKnee : leftKnee;
      const frontKneeAngle = leftKneeBent ? leftKneeAngle : rightKneeAngle;
      const backKneeAngle = leftKneeBent ? rightKneeAngle : leftKneeAngle;
      
      // Also check the opposite leg position (for alternating lunges)
      const rightKneeBent = rightKneeAngle < leftKneeAngle;
      const altFrontKnee = rightKneeBent ? rightKnee : leftKnee;
      const altBackKnee = rightKneeBent ? leftKnee : rightKnee;
      const altFrontKneeAngle = rightKneeBent ? rightKneeAngle : leftKneeAngle;
      const altBackKneeAngle = rightKneeBent ? leftKneeAngle : rightKneeAngle;
      // Hip position relative to front knee
      const hipBelowFrontKnee = hip.y > frontKnee.y;
      // Lunge position based on the image: one leg forward, body leaning forward, back knee close to ground
      const KNEE_Y_DIFF_THRESHOLD = 0.06; // فرق واضح بين الركبتين (رجل للأمام) - توسيع
      const BACK_KNEE_ANGLE_THRESHOLD = 120; // back knee bent (close to ground) - توسيع
      const FRONT_KNEE_ANGLE_THRESHOLD = 100; // front knee bent (stable support) - توسيع
      const HIP_FORWARD_THRESHOLD = 0.08; // hip leaning forward over front leg - توسيع
      
      const kneeYDiff = Math.abs(leftKnee.y - rightKnee.y);
      const oneLegForward = kneeYDiff > KNEE_Y_DIFF_THRESHOLD;
      
      // Check first leg position (left leg forward)
      const backKneeBent = backKneeAngle < BACK_KNEE_ANGLE_THRESHOLD;
      const frontKneeBent = frontKneeAngle < FRONT_KNEE_ANGLE_THRESHOLD;
      const frontHip = leftKneeBent ? leftHip : rightHip;
      const frontAnkle = leftKneeBent ? leftAnkle : rightAnkle;
      const hipForwardLean = Math.abs(frontHip.x - frontAnkle.x) < HIP_FORWARD_THRESHOLD;
      const lungePosition1 = oneLegForward && backKneeBent && frontKneeBent && hipForwardLean;
      
      // Check second leg position (right leg forward)
      const altBackKneeBent = altBackKneeAngle < BACK_KNEE_ANGLE_THRESHOLD;
      const altFrontKneeBent = altFrontKneeAngle < FRONT_KNEE_ANGLE_THRESHOLD;
      const altFrontHip = rightKneeBent ? rightHip : leftHip;
      const altFrontAnkle = rightKneeBent ? rightAnkle : leftAnkle;
      const altHipForwardLean = Math.abs(altFrontHip.x - altFrontAnkle.x) < HIP_FORWARD_THRESHOLD;
      const lungePosition2 = oneLegForward && altBackKneeBent && altFrontKneeBent && altHipForwardLean;
      
      // Either leg position counts as a lunge
      const lungePosition = lungePosition1 || lungePosition2;
      // Standing position: both knees straight
      const standingPosition = (frontKneeAngle >= 160) && (backKneeAngle >= 150);
      // Simple counting: count immediately when going down (like squats)
      const lstate = this.perModeState['lunges'];
      if (lstate.state === 'up') {
        if (!handsOnGround && lungePosition) {
          lstate.state = 'down';
          lstate.count += 1; // Count immediately on descent
          this.playSuccessSound(); // Play success sound
          if (this.onPushupCount) this.onPushupCount(lstate.count);
          if (this.onFormFeedback) {
            this.onFormFeedback({ message: `Lunge ${lstate.count}`, type: 'success', timestamp: Date.now() });
          }
        }
      } else if (lstate.state === 'down') {
        if (standingPosition) {
          lstate.state = 'up'; // Reset state for next rep
        }
      }
    } catch (error) {
      console.error('Error updating lunges counter:', error);
    }
  }

  // Add Burpees counter
  // Update mountain climbers counter
  updateMountainClimbersCounter(landmarks) {
    try {
      const config = window.MediaPipeConfig?.POSE_LANDMARKS || {};
      
      // Get key body points
      const leftHip = landmarks[config.LEFT_HIP || 23];
      const rightHip = landmarks[config.RIGHT_HIP || 24];
      const leftKnee = landmarks[config.LEFT_KNEE || 25];
      const rightKnee = landmarks[config.RIGHT_KNEE || 26];
      const leftAnkle = landmarks[config.LEFT_ANKLE || 27];
      const rightAnkle = landmarks[config.RIGHT_ANKLE || 28];

      if (!leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) return;

      // Calculate vertical distances between knees and hips
      const leftKneeToHipY = Math.abs(leftKnee.y - leftHip.y);
      const rightKneeToHipY = Math.abs(rightKnee.y - rightHip.y);

      // Initialize states if needed
      if (!this._lastLeftKneeY) this._lastLeftKneeY = leftKnee.y;
      if (!this._lastRightKneeY) this._lastRightKneeY = rightKnee.y;
      if (!this._climberState) this._climberState = 'neutral';
      if (!this._lastClimberTime) this._lastClimberTime = Date.now();
      
      const KNEE_THRESHOLD = 0.05; // How far the knee needs to move
      const MIN_REP_TIME = 250; // Minimum time between reps (ms)
      const currentTime = Date.now();

      // Calculate knee movements
      const leftKneeMove = leftKnee.y - this._lastLeftKneeY;
      const rightKneeMove = rightKnee.y - this._lastRightKneeY;

      // Check for significant knee movements in opposite directions
      const isAlternating = (leftKneeMove > KNEE_THRESHOLD && rightKneeMove < -KNEE_THRESHOLD) ||
                           (leftKneeMove < -KNEE_THRESHOLD && rightKneeMove > KNEE_THRESHOLD);

      // State machine for counting alternating leg movements
      const cmode = this.perModeState['mountainclimbers'];
      if (cmode._climberState === 'neutral') {
        if (isAlternating && (currentTime - cmode._lastClimberTime > MIN_REP_TIME)) {
          cmode._climberState = 'moving';
          cmode._lastClimberTime = currentTime;
          // Count the rep
          cmode.count += 1;
          this.playSuccessSound(); // Play success sound
          if (this.onPushupCount) this.onPushupCount(cmode.count);
          if (this.onFormFeedback) {
            const leg = leftKneeMove > rightKneeMove ? 'Left' : 'Right';
            this.onFormFeedback({
              message: `${leg} knee drive - Rep ${cmode.count}`,
              type: 'success',
              timestamp: currentTime
            });
          }
        }
      } else if (cmode._climberState === 'moving') {
        if (!isAlternating) {
          cmode._climberState = 'neutral';
        }
      }

      // Update last positions
      cmode._lastLeftKneeY = leftKnee.y;
      cmode._lastRightKneeY = rightKnee.y;

      // Form feedback for incorrect movement
      if (Math.abs(leftHip.y - rightHip.y) > 0.1) { // Hips not level
        if (this.onFormFeedback && Math.random() < 0.1) {
          this.onFormFeedback({
            message: "Keep hips level!",
            type: "warning",
            timestamp: currentTime
          });
        }
      }

    } catch (error) {
      console.error('Error updating mountain climbers counter:', error);
    }
  }

  updateBurpeesCounter(landmarks) {
    try {
      const config = window.MediaPipeConfig?.POSE_LANDMARKS || {};
      // نقاط الرأس واليدين
      const nose = landmarks[config.NOSE || 0];
      const leftWrist = landmarks[config.LEFT_WRIST || 15];
      const rightWrist = landmarks[config.RIGHT_WRIST || 16];
      const leftIndex = landmarks[config.LEFT_INDEX || 19];
      const rightIndex = landmarks[config.RIGHT_INDEX || 20];
      if (!nose || !leftWrist || !rightWrist) return;
      // أعلى نقطة للرأس
      const headY = nose.y;
      // أعلى نقطة لليد أو الأصابع
      const leftHandY = leftIndex ? leftIndex.y : leftWrist.y;
      const rightHandY = rightIndex ? rightIndex.y : rightWrist.y;
      // إذا كانت اليدين أو الأصابع أعلى من الرأس (أقل في قيمة y)
      const handsAboveHead = (leftHandY < headY && rightHandY < headY);
      // منطق العد
      if (!this._burpeeState) this._burpeeState = 'ready';
      if (!this.perModeState['burpees']._burpeeState) this.perModeState['burpees']._burpeeState = 'ready';
      const bstate = this.perModeState['burpees'];
      if (bstate._burpeeState === 'ready') {
        if (handsAboveHead) {
          bstate._burpeeState = 'jumping';
          bstate.count += 1;
          this.playSuccessSound(); // Play success sound
          if (this.onPushupCount) this.onPushupCount(bstate.count);
          if (this.onFormFeedback) {
            this.onFormFeedback({
              message: `Burpee ${bstate.count} - Hands above head!`,
              type: 'success',
              timestamp: Date.now()
            });
          }
        }
      } else if (bstate._burpeeState === 'jumping') {
        if (!handsAboveHead) {
          bstate._burpeeState = 'ready';
        }
      }
    } catch (error) {
      console.error('Error updating burpees counter:', error);
    }
  }

  updateHighKneesCounter(landmarks) {
    try {
      const config = window.MediaPipeConfig?.POSE_LANDMARKS || {};

      const leftHip = landmarks[config.LEFT_HIP || 23];
      const rightHip = landmarks[config.RIGHT_HIP || 24];
      const leftKnee = landmarks[config.LEFT_KNEE || 25];
      const rightKnee = landmarks[config.RIGHT_KNEE || 26];
      const leftAnkle = landmarks[config.LEFT_ANKLE || 27];
      const rightAnkle = landmarks[config.RIGHT_ANKLE || 28];

      if (!leftHip || !rightHip || !leftKnee || !rightKnee || !leftAnkle || !rightAnkle) return;

      // Check if knee is at waist level or above (easier threshold)
      const KNEE_HIP_THRESHOLD = 0.03; // Knee should be at waist level or above (easier)
      const isLeftKneeHigh = (leftHip.y - leftKnee.y) > KNEE_HIP_THRESHOLD;
      const isRightKneeHigh = (rightHip.y - rightKnee.y) > KNEE_HIP_THRESHOLD;

      // Check if user is doing high knees movement (either leg up)
      const isDoingHighKnees = isLeftKneeHigh || isRightKneeHigh;

      // State machine for timing high knees (per-mode)
      const hk = this.perModeState['highknees'];
      if (!hk._highKneesState) hk._highKneesState = 'stopped';
      if (!hk._startTime) hk._startTime = 0;
      if (!hk._lastUpdateTime) hk._lastUpdateTime = 0;

      const now = Date.now();
      const MIN_MOVEMENT_INTERVAL = 100; // Minimum time between movements (ms)

      if (hk._highKneesState === 'stopped') {
        // Start timing when user begins high knees movement
        if (isDoingHighKnees) {
          hk._highKneesState = 'active';
          hk._startTime = now;
          hk._lastUpdateTime = now;
          hk.count = 0; // Reset count
          console.log('🏃 High Knees started!');
        }
      } else if (hk._highKneesState === 'active') {
        if (isDoingHighKnees) {
          // Continue timing while user is doing high knees
          hk._lastUpdateTime = now;
          const elapsedSeconds = Math.floor((now - hk._startTime) / 1000);
          
          // Update count (in seconds) every second
          if (elapsedSeconds > hk.count) {
            hk.count = elapsedSeconds;
            if (this.onPushupCount) this.onPushupCount(hk.count);
            console.log(`⏱️ High Knees: ${elapsedSeconds} seconds`);
          }
        } else {
          // Check if user stopped for too long
          const timeSinceLastMovement = now - hk._lastUpdateTime;
          if (timeSinceLastMovement > 1500) { // Stop if no movement for 1.5 seconds
            hk._highKneesState = 'stopped';
            console.log('⏹️ High Knees stopped!');
          }
        }
      }

    } catch (error) {
      console.error('Error updating high knees counter:', error);
    }
  }

  // Update jumping jacks counter
  updateJumpingJacksCounter(landmarks) {
    try {
      const config = window.MediaPipeConfig?.POSE_LANDMARKS || {};
      const jjConfig = window.MediaPipeConfig?.JUMPINGJACKS_CONFIG || {};

      // Get key landmarks for jumping jacks
      const leftShoulder = landmarks[config.LEFT_SHOULDER || 11];
      const rightShoulder = landmarks[config.RIGHT_SHOULDER || 12];
      const leftHip = landmarks[config.LEFT_HIP || 23];
      const rightHip = landmarks[config.RIGHT_HIP || 24];
      const leftKnee = landmarks[config.LEFT_KNEE || 25];
      const rightKnee = landmarks[config.RIGHT_KNEE || 26];
      const leftElbow = landmarks[config.LEFT_ELBOW || 13];
      const rightElbow = landmarks[config.RIGHT_ELBOW || 14];
      const leftWrist = landmarks[config.LEFT_WRIST || 15];
      const rightWrist = landmarks[config.RIGHT_WRIST || 16];
      const leftAnkle = landmarks[config.LEFT_ANKLE || 27];
      const rightAnkle = landmarks[config.RIGHT_ANKLE || 28];

      if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || !leftKnee || !rightKnee || !leftElbow || !rightElbow || !leftWrist || !rightWrist || !leftAnkle || !rightAnkle) {
        return;
      }

      // Calculate shoulder abduction angles (shoulder-elbow-wrist) - arms overhead
      const leftShoulderAbduction = this.calculateAngle(leftElbow, leftShoulder, leftWrist);
      const rightShoulderAbduction = this.calculateAngle(rightElbow, rightShoulder, rightWrist);

      // Calculate hip abduction angles (hip-knee-ankle) - legs apart
      const leftHipAbduction = this.calculateAngle(leftKnee, leftHip, leftAnkle);
      const rightHipAbduction = this.calculateAngle(rightKnee, rightHip, rightAnkle);

      // Calculate knee flexion angles (hip-knee-ankle)
      const leftKneeFlexion = this.calculateAngle(leftHip, leftKnee, leftAnkle);
      const rightKneeFlexion = this.calculateAngle(rightHip, rightKnee, rightAnkle);

      // Simplified thresholds - make them more lenient for better detection
      const SHOULDER_ABDUCTION_DOWN = jjConfig.SHOULDER_ABDUCTION_DOWN || 60;    // More lenient for arms down
      const SHOULDER_ABDUCTION_UP = jjConfig.SHOULDER_ABDUCTION_UP || 120;      // More lenient for arms overhead
      const HIP_ABDUCTION_DOWN = jjConfig.HIP_ABDUCTION_DOWN || 25;             // More lenient for legs together
      const HIP_ABDUCTION_UP = jjConfig.HIP_ABDUCTION_UP || 30;                 // More lenient for legs apart

      // Simplified state detection - focus on the main movements
      const avgShoulderAbduction = (leftShoulderAbduction + rightShoulderAbduction) / 2;
      const avgHipAbduction = (leftHipAbduction + rightHipAbduction) / 2;

      // Alternative: Use position-based detection (more reliable)
      const avgWristY = (leftWrist.y + rightWrist.y) / 2;
      const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const avgAnkleY = (leftAnkle.y + rightAnkle.y) / 2;
      const avgHipY = (leftHip.y + rightHip.y) / 2;
      
      // Arms overhead: wrists above shoulders
      const armsOverhead = avgWristY < avgShoulderY;
      // Legs apart: ankles spread wider than hips
      const legsApart = Math.abs(leftAnkle.x - rightAnkle.x) > Math.abs(leftHip.x - rightHip.x) * 1.2;

      // UP state: arms overhead AND legs apart (using position OR angles)
      const isUpState = (armsOverhead && legsApart) || (avgShoulderAbduction > SHOULDER_ABDUCTION_UP && avgHipAbduction > HIP_ABDUCTION_UP);

      // DOWN state: arms down AND legs together (using position OR angles)
      const isDownState = (!armsOverhead && !legsApart) || (avgShoulderAbduction < SHOULDER_ABDUCTION_DOWN && avgHipAbduction < HIP_ABDUCTION_DOWN);

      // State machine for counting jumping jacks
      const jjState = this.perModeState['jumpingjacks'];
      
      // Debounce reps: minimum ms between consecutive counts
      const MIN_REP_MS = jjConfig.MIN_REP_MS || 800;
      if (!jjState._lastRepAt) jjState._lastRepAt = 0;
      const now = Date.now();

      // Debug logging
      console.log('🔍 Jumping Jacks Debug:', {
        // Angle-based detection
        avgShoulderAbduction: Math.round(avgShoulderAbduction),
        avgHipAbduction: Math.round(avgHipAbduction),
        shoulderThresholdUp: SHOULDER_ABDUCTION_UP,
        shoulderThresholdDown: SHOULDER_ABDUCTION_DOWN,
        hipThresholdUp: HIP_ABDUCTION_UP,
        hipThresholdDown: HIP_ABDUCTION_DOWN,
        // Position-based detection
        avgWristY: Math.round(avgWristY * 1000) / 1000,
        avgShoulderY: Math.round(avgShoulderY * 1000) / 1000,
        armsOverhead,
        legsApart,
        ankleDistance: Math.round(Math.abs(leftAnkle.x - rightAnkle.x) * 1000) / 1000,
        hipDistance: Math.round(Math.abs(leftHip.x - rightHip.x) * 1000) / 1000,
        // Final states
        isUpState,
        isDownState,
        state: jjState.state,
        count: jjState.count
      });

      // State machine: DOWN -> UP -> DOWN (count) -> repeat
      if (jjState.state === 'down') {
        // Transition to UP state when both arms and legs are in UP position (Peak Position)
        // Add debouncing to prevent rapid state changes
        if (isUpState && (now - (jjState._lastStateChange || 0)) > 300) {
          jjState.state = 'up';
          jjState._lastStateChange = now;
          console.log('⬆️ Jumping Jack state changed to UP (Peak Position)');
        }
      } else if (jjState.state === 'up') {
        // Complete the rep and count when transitioning back to DOWN state (Return to Starting Position)
        // Ensure we've been in UP state for a minimum time and debounce the count
        if (isDownState && (now - jjState._lastRepAt) > MIN_REP_MS && (now - (jjState._lastStateChange || 0)) > 300) {
          jjState.state = 'down';
          jjState.count += 1;
          jjState._lastRepAt = now;
          jjState._lastStateChange = now;
          console.log('🎯 Jumping Jack counted! Count:', jjState.count);
          this.playSuccessSound();
          if (this.onPushupCount) this.onPushupCount(jjState.count);
          if (this.onFormFeedback) {
            this.onFormFeedback({
              message: `Jumping Jack ${jjState.count}`,
              type: 'success',
              timestamp: now
            });
          }
        }
      }

    } catch (error) {
      console.error('Error updating jumping jacks counter:', error);
    }
  }

  // Update side plank counter (time-based like regular plank)
  updateSidePlankCounter(landmarks) {
    try {
      const config = window.MediaPipeConfig?.POSE_LANDMARKS || {};
      const spConfig = window.MediaPipeConfig?.SIDEPLANK_CONFIG || {};

      // Get key landmarks for side plank
      const leftShoulder = landmarks[config.LEFT_SHOULDER || 11];
      const rightShoulder = landmarks[config.RIGHT_SHOULDER || 12];
      const leftElbow = landmarks[config.LEFT_ELBOW || 13];
      const rightElbow = landmarks[config.RIGHT_ELBOW || 14];
      const leftWrist = landmarks[config.LEFT_WRIST || 15];
      const rightWrist = landmarks[config.RIGHT_WRIST || 16];
      const leftHip = landmarks[config.LEFT_HIP || 23];
      const rightHip = landmarks[config.RIGHT_HIP || 24];
      const leftKnee = landmarks[config.LEFT_KNEE || 25];
      const rightKnee = landmarks[config.RIGHT_KNEE || 26];
      const leftAnkle = landmarks[config.LEFT_ANKLE || 27];
      const rightAnkle = landmarks[config.RIGHT_ANKLE || 28];
      const nose = landmarks[config.NOSE || 0];
      const leftEar = landmarks[config.LEFT_EAR || 7];
      const rightEar = landmarks[config.RIGHT_EAR || 8];

      // Check visibility of key landmarks
      const vis = (p) => p && (p.visibility == null || p.visibility > 0.5);
      
      // Determine which side is the support side (left or right)
      // We'll check both sides and use the one with better visibility
      const leftSideVisible = vis(leftShoulder) && vis(leftElbow) && vis(leftHip) && vis(leftKnee) && vis(leftAnkle);
      const rightSideVisible = vis(rightShoulder) && vis(rightElbow) && vis(rightHip) && vis(rightKnee) && vis(rightAnkle);
      
      if (!leftSideVisible && !rightSideVisible) {
        return; // Not enough landmarks visible
      }

      // Use the side with better visibility
      const isLeftSide = leftSideVisible && (!rightSideVisible || leftSideVisible);
      const supportShoulder = isLeftSide ? leftShoulder : rightShoulder;
      const supportElbow = isLeftSide ? leftElbow : rightElbow;
      const supportWrist = isLeftSide ? leftWrist : rightWrist;
      const supportHip = isLeftSide ? leftHip : rightHip;
      const supportKnee = isLeftSide ? leftKnee : rightKnee;
      const supportAnkle = isLeftSide ? leftAnkle : rightAnkle;
      const supportEar = isLeftSide ? leftEar : rightEar;

      // Calculate key angles for side plank validation
      
      // 1. Shoulder Support Angle (shoulder-elbow-wrist) - should be ~90°
      const shoulderSupportAngle = this.calculateAngle(supportShoulder, supportElbow, supportWrist);
      const SHOULDER_ANGLE_MIN = spConfig.SHOULDER_ANGLE_MIN || 80;
      const SHOULDER_ANGLE_MAX = spConfig.SHOULDER_ANGLE_MAX || 100;
      const shoulderAngleGood = shoulderSupportAngle >= SHOULDER_ANGLE_MIN && shoulderSupportAngle <= SHOULDER_ANGLE_MAX;

      // 2. Torso-Hip Line (shoulder-hip-ankle) - should be ~180° (straight line)
      const torsoHipAngle = this.calculateAngle(supportShoulder, supportHip, supportAnkle);
      const TORSO_ANGLE_MIN = spConfig.TORSO_ANGLE_MIN || 160;
      const TORSO_ANGLE_MAX = spConfig.TORSO_ANGLE_MAX || 200;
      const torsoAngleGood = torsoHipAngle >= TORSO_ANGLE_MIN && torsoHipAngle <= TORSO_ANGLE_MAX;

      // 3. Check for hip sag (hip drops below shoulder-ankle line)
      const shoulderAnkleMidY = (supportShoulder.y + supportAnkle.y) / 2;
      const hipSagThreshold = spConfig.HIP_SAG_THRESHOLD || 0.05; // normalized units
      const hipSag = supportHip.y > (shoulderAnkleMidY + hipSagThreshold);
      
      // 4. Check for hip hike (hip rises above shoulder-ankle line)
      const hipHikeThreshold = spConfig.HIP_HIKE_THRESHOLD || 0.05; // normalized units
      const hipHike = supportHip.y < (shoulderAnkleMidY - hipHikeThreshold);

      // 5. Check elbow alignment (elbow should be under shoulder)
      const elbowAlignmentThreshold = spConfig.ELBOW_ALIGNMENT_THRESHOLD || 0.08; // normalized units
      const elbowAligned = Math.abs(supportElbow.x - supportShoulder.x) < elbowAlignmentThreshold;

      // 6. Check feet stacking (ankles should be close together)
      const feetStackingThreshold = spConfig.FEET_STACKING_THRESHOLD || 0.1; // normalized units
      const feetStacked = Math.abs(leftAnkle.x - rightAnkle.x) < feetStackingThreshold;

      // 7. Head-neck alignment (ear-shoulder-hip should be ~180°)
      let headNeckGood = true;
      if (supportEar && vis(supportEar)) {
        const headNeckAngle = this.calculateAngle(supportEar, supportShoulder, supportHip);
        const HEAD_NECK_ANGLE_MIN = spConfig.HEAD_NECK_ANGLE_MIN || 160;
        const HEAD_NECK_ANGLE_MAX = spConfig.HEAD_NECK_ANGLE_MAX || 200;
        headNeckGood = headNeckAngle >= HEAD_NECK_ANGLE_MIN && headNeckAngle <= HEAD_NECK_ANGLE_MAX;
      }

      // Overall posture assessment
      const isGoodPosture = shoulderAngleGood && 
                           torsoAngleGood && 
                           !hipSag && 
                           !hipHike && 
                           elbowAligned && 
                           feetStacked && 
                           headNeckGood;

      // Debug logging
      console.log('🔍 Side Plank Debug:', {
        side: isLeftSide ? 'Left' : 'Right',
        shoulderAngle: Math.round(shoulderSupportAngle),
        torsoAngle: Math.round(torsoHipAngle),
        hipSag,
        hipHike,
        elbowAligned,
        feetStacked,
        headNeckGood,
        isGoodPosture,
        postureStatus: this.postureStatus
      });

      // Update posture status with smoothing
      if (isGoodPosture) {
        this._postureGoodCount = (this._postureGoodCount || 0) + 1;
        this._postureBadCount = 0;
      } else {
        this._postureBadCount = (this._postureBadCount || 0) + 1;
        this._postureGoodCount = 0;
      }

      const POSTURE_GOOD_FRAMES = spConfig.POSTURE_GOOD_FRAMES || 3;
      const POSTURE_BAD_FRAMES = spConfig.POSTURE_BAD_FRAMES || 4;

      let smoothedStatus = this.postureStatus;
      if (this._postureGoodCount >= POSTURE_GOOD_FRAMES) {
        smoothedStatus = 'correct';
      } else if (this._postureBadCount >= POSTURE_BAD_FRAMES) {
        smoothedStatus = 'incorrect';
      }

      if (smoothedStatus !== this.postureStatus) {
        this.postureStatus = smoothedStatus;
        if (this.onPostureChange) this.onPostureChange(this.postureStatus, landmarks);
      }

      // Handle timing for side plank (similar to regular plank)
      if (this.postureStatus === 'correct') {
        const now = Date.now();
        if (!this.timerRunning) {
          this.startCorrectTimestampMs = now;
          this.timerRunning = true;
        }
        const totalMs = this.accumulatedCorrectMs + (now - (this.startCorrectTimestampMs || now));
        const seconds = Math.floor(totalMs / 1000);
        if (this.onTimeUpdate) this.onTimeUpdate(seconds);
      } else {
        // Stop timer when posture is incorrect
        if (this.timerRunning) {
          this.accumulatedCorrectMs += Date.now() - this.startCorrectTimestampMs;
          this.timerRunning = false;
          this.startCorrectTimestampMs = 0;
          if (this.onTimeUpdate) {
            this.onTimeUpdate(Math.floor(this.accumulatedCorrectMs / 1000));
          }
        }
      }

      // Provide form feedback for common mistakes
      if (!isGoodPosture && this.onFormFeedback) {
        const currentTime = Date.now();
        const cooldown = spConfig.WARNING_COOLDOWN || 2000;
        
        if (currentTime - this.lastWarningTime > cooldown) {
          let feedbackMessage = '';
          if (hipSag) {
            feedbackMessage = 'Hip sagging - lift your hips up!';
          } else if (hipHike) {
            feedbackMessage = 'Hip too high - lower your hips!';
          } else if (!elbowAligned) {
            feedbackMessage = 'Keep elbow under shoulder!';
          } else if (!feetStacked) {
            feedbackMessage = 'Stack your feet together!';
          } else if (!shoulderAngleGood) {
            feedbackMessage = 'Adjust your arm position!';
          } else if (!torsoAngleGood) {
            feedbackMessage = 'Keep your body straight!';
          }

          if (feedbackMessage) {
            this.onFormFeedback({
              message: feedbackMessage,
              type: 'warning',
              timestamp: currentTime
            });
            this.lastWarningTime = currentTime;
          }
        }
      }

    } catch (error) {
      console.error('Error updating side plank counter:', error);
    }
  }

  // Play warning sound
  playWarningSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing warning sound:', error);
    }
  }

  // Play success sound (pop.wav)
  playSuccessSound() {
    try {
      const audio = new Audio('/assets/sounds/pop.wav');
      audio.volume = 0.5; // Set volume to 50%
      audio.play().catch(error => {
        console.error('Error playing success sound:', error);
      });
    } catch (error) {
      console.error('Error creating success sound:', error);
    }
  }

  // Draw pose landmarks on canvas
  drawPoseOverlay(canvasCtx, results, canvasWidth, canvasHeight) {
    // Only log occasionally to avoid spam
    if (Math.random() < 0.05) {
      console.log('🎨 Drawing pose overlay with', results.poseLandmarks?.length || 0, 'landmarks');
    }

    if (!results.poseLandmarks || !canvasCtx) {
      return;
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw landmarks
    const landmarks = results.poseLandmarks;
    let drawnLandmarks = 0;
    
    landmarks.forEach((landmark, index) => {
      if (landmark.visibility && landmark.visibility > 0.5) {
        const x = landmark.x * canvasWidth;
        const y = landmark.y * canvasHeight;
        
        canvasCtx.beginPath();
        canvasCtx.arc(x, y, 6, 0, 2 * Math.PI); // Bigger circles
        canvasCtx.fillStyle = landmark.visibility > 0.7 ? '#10B981' : '#F59E0B';
        canvasCtx.fill();
        canvasCtx.strokeStyle = '#FFFFFF';
        canvasCtx.lineWidth = 2;
        canvasCtx.stroke();
        drawnLandmarks++;
      }
    });

    // Only log occasionally
    if (Math.random() < 0.1) {
      console.log('✨ Drew', drawnLandmarks, 'landmarks');
    }

    // Always use basic connections (more reliable)
    this.drawBasicConnections(canvasCtx, landmarks, canvasWidth, canvasHeight);

    canvasCtx.restore();
  }

  // Draw basic pose connections
  drawBasicConnections(canvasCtx, landmarks, canvasWidth, canvasHeight) {
    const connections = [
      [11, 12], // shoulders
      [11, 13], // left shoulder to elbow
      [13, 15], // left elbow to wrist
      [12, 14], // right shoulder to elbow
      [14, 16], // right elbow to wrist
      [11, 23], // left shoulder to hip
      [12, 24], // right shoulder to hip
      [23, 24], // hips
      [23, 25], // left hip to knee
      [25, 27], // left knee to ankle
      [24, 26], // right hip to knee
      [26, 28]  // right knee to ankle
    ];

    let drawnConnections = 0;
    connections.forEach(([startIdx, endIdx]) => {
      const startPoint = landmarks[startIdx];
      const endPoint = landmarks[endIdx];

      const startVisible = startPoint && (startPoint.visibility == null || startPoint.visibility > 0.3);
      const endVisible = endPoint && (endPoint.visibility == null || endPoint.visibility > 0.3);
      if (startVisible && endVisible) {
        canvasCtx.beginPath();
        canvasCtx.moveTo(startPoint.x * canvasWidth, startPoint.y * canvasHeight);
        canvasCtx.lineTo(endPoint.x * canvasWidth, endPoint.y * canvasHeight);
        canvasCtx.strokeStyle = '#3B82F6';
        canvasCtx.lineWidth = 3; // Thicker lines
        canvasCtx.stroke();
        drawnConnections++;
      }
    });
    
    // Only log occasionally
    if (Math.random() < 0.02) {
      console.log('✅ Drawing completed!', drawnConnections, 'connections');
    }
  }

  // Reset counter
  resetCounter() {
    // Reset only the counters/state for the currently selected exercise
    const mode = this.exerciseMode;
    if (this.perModeState && this.perModeState[mode]) {
      this.perModeState[mode].count = 0;
      this.perModeState[mode].state = 'up';
      // reset mode-specific extras
      if (mode === 'mountainclimbers') {
        this.perModeState[mode]._lastLeftKneeY = null;
        this.perModeState[mode]._lastRightKneeY = null;
        this.perModeState[mode]._climberState = 'neutral';
        this.perModeState[mode]._lastClimberTime = 0;
      }
      if (mode === 'burpees') {
        this.perModeState[mode]._burpeeState = 'ready';
      }
      if (mode === 'jumpingjacks') {
        this.perModeState[mode]._lastRepAt = 0;
      }
      if (mode === 'sideplank') {
        // Reset side plank state
        this.perModeState[mode].state = 'neutral';
        this.perModeState[mode].count = 0;
      }
      if (mode === 'plank') {
        // Reset plank stability/timing helpers
        this.perModeState[mode]._stableCount = 0;
        this.perModeState[mode]._lastHipY = null;
        this.perModeState[mode]._lastShoulderY = null;
        this.perModeState[mode]._lastAnkleY = null;
        this.perModeState[mode]._lastTimestamp = 0;
      }
      if (mode === 'wallsit') {
        this.perModeState[mode]._stableCount = 0;
        this.perModeState[mode]._lastHipY = null;
        this.perModeState[mode]._lastHipX = null;
        this.perModeState[mode]._lastShoulderY = null;
        this.perModeState[mode]._lastShoulderX = null;
        this.perModeState[mode]._lastKneeY = null;
        this.perModeState[mode]._lastKneeX = null;
        this.perModeState[mode]._lastAnkleY = null;
        this.perModeState[mode]._lastAnkleX = null;
        this.perModeState[mode]._lastTimestamp = 0;
      }
    }
    this.postureStatus = 'unknown';
    // Reset plank timing
    this.accumulatedCorrectMs = 0;
    this.timerRunning = false;
    this.startCorrectTimestampMs = 0;
  }

  // Get current stats
  getStats() {
    const mode = this.exerciseMode;
    const stateObj = this.perModeState && this.perModeState[mode] ? this.perModeState[mode] : { count: 0, state: 'up' };
    return {
      count: stateObj.count || 0,
      state: stateObj.state || 'up',
      posture: this.postureStatus,
      timeSec: Math.floor((this.accumulatedCorrectMs + (this.timerRunning ? (Date.now() - this.startCorrectTimestampMs) : 0)) / 1000)
    };
  }

  // Get latest pose results for drawing
  getLastResults() {
    return this.lastResults;
  }

  // Set callback functions
  setCallbacks({ onPushupCount, onPostureChange, onFormFeedback, onTimeUpdate }) {
    this.onPushupCount = onPushupCount;
    this.onPostureChange = onPostureChange;
    this.onFormFeedback = onFormFeedback;
    this.onTimeUpdate = onTimeUpdate;
  }

  // Cleanup
  cleanup() {
    if (this.pose) {
      this.pose.close();
      this.pose = null;
    }
    this.isInitialized = false;
  }
}

export default PoseDetectionUtils;

// Export a lightweight helper that reuses the WALLSIT_CONFIG thresholds to evaluate a single frame.
// This is useful for server-side or upload-time checks where the full PoseDetectionUtils instance
// is not available. It expects MediaPipe-style landmarks array.
export function isWallSitPosition(landmarks) {
  try {
    // Reuse the same logic as inside isWallSitStrictAndStable but in a standalone form
    const cfg = window.MediaPipeConfig?.WALLSIT_CONFIG || {};
    const LEFT_SHOULDER = cfg.LEFT_SHOULDER || 11;
    const RIGHT_SHOULDER = cfg.RIGHT_SHOULDER || 12;
    const LEFT_HIP = cfg.LEFT_HIP || 23;
    const RIGHT_HIP = cfg.RIGHT_HIP || 24;
    const LEFT_KNEE = cfg.LEFT_KNEE || 25;
    const RIGHT_KNEE = cfg.RIGHT_KNEE || 26;
    const LEFT_ANKLE = cfg.LEFT_ANKLE || 27;
    const RIGHT_ANKLE = cfg.RIGHT_ANKLE || 28;

    const leftShoulder = landmarks[LEFT_SHOULDER];
    const rightShoulder = landmarks[RIGHT_SHOULDER];
    const leftHip = landmarks[LEFT_HIP];
    const rightHip = landmarks[RIGHT_HIP];
    const leftKnee = landmarks[LEFT_KNEE];
    const rightKnee = landmarks[RIGHT_KNEE];
    const leftAnkle = landmarks[LEFT_ANKLE];
    const rightAnkle = landmarks[RIGHT_ANKLE];

  // Very permissive visibility check for uploaded videos / cropped frames
  const vis = (p) => p && (p.visibility == null || p.visibility > 0.2);
  // Require core joints (shoulders/hips/knees) but allow ankles to be missing (many uploads crop feet)
  if (!vis(leftShoulder) || !vis(rightShoulder) || !vis(leftHip) || !vis(rightHip) || !vis(leftKnee) || !vis(rightKnee)) return { ok: false, reason: 'missing_joints' };

    const shoulderCenter = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
    const hipCenter = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
    const kneeCenter = { x: (leftKnee.x + rightKnee.x) / 2, y: (leftKnee.y + rightKnee.y) / 2 };
    const ankleCenter = vis(leftAnkle) && vis(rightAnkle)
      ? { x: (leftAnkle.x + rightAnkle.x) / 2, y: (leftAnkle.y + rightAnkle.y) / 2 }
      : (vis(leftAnkle) ? { x: leftAnkle.x, y: leftAnkle.y } : { x: rightAnkle.x, y: rightAnkle.y });

  // More permissive tolerances for uploaded videos / varied camera angles
  const kneesLevel = Math.abs(leftKnee.y - rightKnee.y) <= (cfg.MAX_KNEE_LEVEL_DIFF ?? 0.25);
  const hipAlignedWithKnees = Math.abs(hipCenter.y - kneeCenter.y) <= (cfg.HIP_KNEE_LEVEL_TOLERANCE ?? 0.25);
  const shoulderAboveHip = (hipCenter.y - shoulderCenter.y) >= (cfg.MIN_SHOULDER_HIP_GAP ?? 0.02);
  // If ankle center exists ensure it's below hip; otherwise accept (ankles may be cropped)
  const anklesBelowHip = ankleCenter ? ((ankleCenter.y - hipCenter.y) >= (cfg.MIN_ANKLE_HIP_GAP ?? 0.0)) : true;
  const MAX_BACK_OFFSET = cfg.MAX_BACK_OFFSET ?? 0.35;
    let backAligned = true;
    if (vis(leftShoulder) && vis(leftHip)) backAligned = backAligned && (Math.abs(leftShoulder.x - leftHip.x) <= MAX_BACK_OFFSET);
    if (vis(rightShoulder) && vis(rightHip)) backAligned = backAligned && (Math.abs(rightShoulder.x - rightHip.x) <= MAX_BACK_OFFSET);

    let thighHorizontal = true;
    const thighCheckLeft = vis(leftHip) && vis(leftKnee) && vis(leftAnkle);
    if (thighCheckLeft) {
      const thighAngleLeft = Math.abs(Math.atan2(leftKnee.y - leftHip.y, leftKnee.x - leftHip.x) * 180 / Math.PI);
      thighHorizontal = thighHorizontal && ((thighAngleLeft <= (cfg.THIGH_MAX_DEG ?? 35)) || (thighAngleLeft >= (cfg.THIGH_MIN_DEG ?? 325)));
    }
    const thighCheckRight = vis(rightHip) && vis(rightKnee) && vis(rightAnkle);
    if (thighCheckRight) {
      const thighAngleRight = Math.abs(Math.atan2(rightKnee.y - rightHip.y, rightKnee.x - rightHip.x) * 180 / Math.PI);
      thighHorizontal = thighHorizontal && ((thighAngleRight <= (cfg.THIGH_MAX_DEG ?? 35)) || (thighAngleRight >= (cfg.THIGH_MIN_DEG ?? 325)));
    }

    const ok = kneesLevel && hipAlignedWithKnees && shoulderAboveHip && anklesBelowHip && backAligned && thighHorizontal;
    const details = { kneesLevel, hipAlignedWithKnees, shoulderAboveHip, anklesBelowHip, backAligned, thighHorizontal };
    return { ok, details };
  } catch (e) {
    return { ok: false, reason: 'exception', error: String(e) };
  }
}
