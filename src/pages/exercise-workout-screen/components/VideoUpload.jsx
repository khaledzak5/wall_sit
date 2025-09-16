import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const VideoUpload = ({ onVideoAnalysis, isAnalyzing = false, selectedExercise }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [pushupCount, setPushupCount] = useState(0);
  const [plankSeconds, setPlankSeconds] = useState(0);
  const [wallSitSeconds, setWallSitSeconds] = useState(0);
  const [postureStatus, setPostureStatus] = useState('unknown');
  const [poseResults, setPoseResults] = useState(null);
  const [showPoseOverlay, setShowPoseOverlay] = useState(true);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseDetectionRef = useRef(null);
  // removed wallSitHint UI diagnostic per user request
  const processingIntervalRef = useRef(null);

  // Helper function to get exercise name based on mode and selected exercise
  const getExerciseName = () => {
    if (selectedExercise?.name) {
      return selectedExercise.name;
    }
    
    // Fallback based on exercise mode
    const mode = poseDetectionRef.current?.exerciseMode;
    switch (mode) {
      case 'squats': return 'Squats';
      case 'lunges': return 'Lunges';
      case 'plank': return 'Plank';
      case 'burpees': return 'Burpees';
      case 'mountainclimbers': return 'Mountain Climbers';
      case 'jumpingjacks': return 'Jumping Jacks';
      case 'sideplank': return 'Side Plank';
      default: return 'Push-ups';
    }
  };

  // Helper function to get exercise name in lowercase for messages
  const getExerciseNameLower = () => {
    const name = getExerciseName();
    return name.toLowerCase().replace(/[^a-z]/g, '');
  };

  // Initialize pose detection for video
  const initializePoseDetection = async () => {
    try {
      console.log('🎬 Initializing pose detection for video...');
      
      // Wait for MediaPipe to be available
      let attempts = 0;
      while (!window.Pose && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!window.Pose) {
        console.error('MediaPipe Pose not available for video');
        return false;
      }
      
      // Dynamically import the PoseDetectionUtils
      const module = await import('../../../utils/poseDetection');
      const PoseDetectionUtils = module.PoseDetectionUtils || module.default;
      
      if (!PoseDetectionUtils) {
        console.error('PoseDetectionUtils not found in module');
        return false;
      }
      
      poseDetectionRef.current = new PoseDetectionUtils();
      
      // Set exercise mode
      const normalized = (selectedExercise?.name || '').toLowerCase().replace(/[^a-z]/g, '');
      let mode = 'pushups';
      if (normalized.includes('plank')) mode = 'plank';
      else if (normalized.includes('squat')) mode = 'squats';
      else if (normalized.includes('lunge')) mode = 'lunges';
      else if (normalized.includes('burpee')) mode = 'burpees';
      else if (normalized.includes('mountain') || normalized.includes('climber')) mode = 'mountainclimbers';
      else if (normalized.includes('jumping') && normalized.includes('jack')) mode = 'jumpingjacks';
      else if (normalized.includes('side') && normalized.includes('plank')) mode = 'sideplank';
      poseDetectionRef.current.setExerciseMode(mode);

      // Set up callbacks
      poseDetectionRef.current.setCallbacks({
        onPushupCount: (count) => {
          console.log('🔢 Video rep count:', count);
          setPushupCount(count);
        },
        onPostureChange: (status) => {
          console.log('🧍 Video Posture status:', status);
          setPostureStatus(status);
        },
        onFormFeedback: (feedback) => {
          console.log('📝 Video Form feedback:', feedback);
        },
        onTimeUpdate: (seconds) => {
          // PoseDetectionUtils currently uses onTimeUpdate for plank and wallsit
          console.debug && console.debug('onTimeUpdate:', seconds);
          setPlankSeconds(seconds);
          setWallSitSeconds(seconds);
        }
      });
      
      const initialized = await poseDetectionRef.current.initialize();
      if (initialized) {
        console.log('✅ Video pose detection initialized successfully!');
        return true;
      } else {
        console.error('❌ Video pose detection initialization failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Video pose detection initialization failed:', error);
      return false;
    }
  };

  // Start processing video frames using requestAnimationFrame
  const rafIdRef = useRef(null);
  const startVideoProcessing = () => {
    if (!videoRef.current || !poseDetectionRef.current) return;
    console.log('▶️ Starting video pose processing (RAF)...');
    const processAndDraw = async () => {
      if (videoRef.current && poseDetectionRef.current && !videoRef.current.paused) {
  await poseDetectionRef.current.processFrame(videoRef.current, { isLive: false });
        const results = poseDetectionRef.current.getLastResults();
        if (results) setPoseResults(results);
        // Draw overlay immediately after processing
        if (canvasRef.current && results && showPoseOverlay) {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          canvas.width = video.videoWidth || video.clientWidth;
          canvas.height = video.videoHeight || video.clientHeight;
          const ctx = canvas.getContext('2d');
          poseDetectionRef.current.drawPoseOverlay(ctx, results, canvas.width, canvas.height);
          // Wall-sit diagnostics: compute single-frame check (diagnostics removed from UI)
          try {
            if (results && results.poseLandmarks) {
              const single = await import('../../../utils/poseDetection').then(m => m.isWallSitPosition || m.default?.isWallSitPosition);
              // keep a silent single-frame check to allow future programmatic use (no UI message)
              const check = single ? single(results.poseLandmarks) : null;
            }
          } catch (e) {
            // ignore diagnostic errors
          }
        }
        rafIdRef.current = requestAnimationFrame(processAndDraw);
      }
    };
    rafIdRef.current = requestAnimationFrame(processAndDraw);
  };

  // Stop processing video frames
  const stopVideoProcessing = () => {
    if (rafIdRef.current) {
      console.log('⏸️ Stopping video pose processing (RAF)...');
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  // Handle video play/pause
  const handleVideoPlay = () => {
    console.log('▶️ Video play started');
    setIsVideoPlaying(true);
    if (poseDetectionRef.current && poseDetectionRef.current.isInitialized) {
      startVideoProcessing();
    } else {
      console.log('⏳ Pose detection not ready yet, will start when initialized');
    }
  };

  const handleVideoPause = () => {
    setIsVideoPlaying(false);
    stopVideoProcessing();
  };

  // drawPoseOverlay is now handled in RAF loop

  // Initialize pose detection when video is uploaded (only once per video)
  useEffect(() => {
    if (uploadedVideo && !poseDetectionRef.current) {
      console.log('🎬 Initializing pose detection for new video...');
      initializePoseDetection().then((success) => {
        if (success && isVideoPlaying && videoRef.current && !videoRef.current.paused) {
          console.log('🎬 Starting video processing after initialization');
          startVideoProcessing();
        }
      });
    }
    
    return () => {
      stopVideoProcessing();
      if (poseDetectionRef.current) {
        poseDetectionRef.current.cleanup();
        poseDetectionRef.current = null;
      }
    };
  }, [uploadedVideo]);

  // Remove drawPoseOverlay interval, handled in RAF loop

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === "dragenter" || e?.type === "dragover") {
      setDragActive(true);
    } else if (e?.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFile(e?.dataTransfer?.files?.[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFile(e?.target?.files?.[0]);
    }
  };

  const handleFile = (file) => {
    if (!file?.type?.startsWith('video/')) {
      alert('Please upload a video file');
      return;
    }

    if (file?.size > 100 * 1024 * 1024) { // 100MB limit
      alert('File size too large. Please upload a video under 100MB');
      return;
    }

    const videoUrl = URL.createObjectURL(file);
    setUploadedVideo({
      file,
      url: videoUrl,
      name: file?.name,
      size: file?.size
    });

    // Reset counters for new video
    setPushupCount(0);
    setPostureStatus('unknown');
    setPoseResults(null);
    
    // No need for separate analysis - will be live during playback
    console.log('📹 Video uploaded, ready for live analysis during playback');
  };

  const analyzeVideo = async (file) => {
    try {
      // For now, use enhanced mock results with some real video info
      const mockResults = {
        exerciseDetected: "Push-ups",
        totalReps: Math.floor(Math.random() * 10) + 8, // Random between 8-17
        formScore: Math.floor(Math.random() * 30) + 70, // Random between 70-99
        feedback: [
          { timestamp: "0:05", message: "Good starting position", type: "success" },
          { timestamp: "0:12", message: "Keep elbows closer to body", type: "warning" },
          { timestamp: "0:18", message: "Excellent form!", type: "success" },
          { timestamp: "0:25", message: "Maintain straight back", type: "warning" },
          { timestamp: "0:32", message: "Perfect push-up technique", type: "success" },
          { timestamp: "0:38", message: "AI Analysis: Push-up detected", type: "success" }
        ],
        improvements: [
          "Keep elbows at 45-degree angle",
          "Maintain plank position throughout", 
          "Control the descent speed",
          "Engage core muscles throughout movement"
        ],
        strengths: [
          "Consistent rep timing",
          "Good range of motion",
          "Proper hand placement",
          "Video quality suitable for AI analysis"
        ],
        videoInfo: {
          fileName: file.name,
          fileSize: formatFileSize(file.size),
          duration: "~45 seconds (estimated)"
        }
      };

      setAnalysisResults(mockResults);
      if (onVideoAnalysis) {
        onVideoAnalysis(mockResults);
      }
      
      console.log('Video analysis completed for:', file.name);
      
    } catch (error) {
      console.error('Video analysis error:', error);
      
      // Fallback results
      const fallbackResults = {
        exerciseDetected: "Push-ups", 
        totalReps: 10,
        formScore: 75,
        feedback: [
          { timestamp: "0:00", message: "Analysis completed with basic detection", type: "success" }
        ],
        improvements: ["Upload a clearer video for better analysis"],
        strengths: ["Video uploaded successfully"]
      };

      setAnalysisResults(fallbackResults);
      if (onVideoAnalysis) {
        onVideoAnalysis(fallbackResults);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const resetUpload = () => {
    // Stop video processing
    stopVideoProcessing();
    
    // Clean up pose detection
    if (poseDetectionRef.current) {
      poseDetectionRef.current.cleanup();
      poseDetectionRef.current = null;
    }
    
    // Reset states
    setUploadedVideo(null);
    setAnalysisResults(null);
    setIsVideoPlaying(false);
    setPushupCount(0);
    setPostureStatus('unknown');
    setPoseResults(null);
    
    if (fileInputRef?.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-card-foreground">Video Analysis</h2>
        {uploadedVideo && (
          <Button variant="ghost" size="sm" onClick={resetUpload}>
            <Icon name="X" size={16} className="mr-2" />
            Clear
          </Button>
        )}
      </div>
      {!uploadedVideo ? (
        /* Upload Area */
        (<div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Icon name="Upload" size={32} className="text-primary" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Upload Exercise Video
              </h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop your workout video here, or click to browse
              </p>
              <p className="text-sm text-muted-foreground">
                Supports MP4, MOV, AVI • Max size: 100MB
              </p>
            </div>
            
            <Button variant="outline" onClick={() => fileInputRef?.current?.click()}>
              <Icon name="FolderOpen" size={18} className="mr-2" />
              Choose File
            </Button>
          </div>
        </div>)
      ) : (
        /* Video Preview and Analysis */
        (<div className="space-y-6">
          {/* Video Preview with Pose Detection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-card-foreground">Video Preview</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPoseOverlay(!showPoseOverlay)}
                className="text-sm"
              >
                <Icon name={showPoseOverlay ? "Eye" : "EyeOff"} size={16} className="mr-2" />
                {showPoseOverlay ? 'Hide' : 'Show'} Pose
              </Button>
            </div>
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={uploadedVideo?.url}
                controls
                className="w-full h-64 object-contain"
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onEnded={handleVideoPause}
              />
              
              {/* Pose Overlay Canvas */}
              {showPoseOverlay && (
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ zIndex: 10 }}
                />
              )}
              
              {/* Live Stats Overlay */}
              {isVideoPlaying && (
                 <div className="absolute top-4 left-4 bg-black/70 rounded-lg p-3 text-white">
                  <div className="text-center mb-2">
                                         <div className="text-2xl font-bold text-green-400">{(poseDetectionRef.current?.exerciseMode === 'plank' || poseDetectionRef.current?.exerciseMode === 'sideplank') ? plankSeconds : ((poseDetectionRef.current?.exerciseMode === 'wallsit' || wallSitSeconds > 0) ? wallSitSeconds : pushupCount)}</div>
                        <div className="text-xs text-gray-300">{selectedExercise?.name || 'Exercise'}</div>
                  </div>
                      {/* wallSitHint removed per user request */}
                  <div className={`text-xs px-2 py-1 rounded text-center ${
                    postureStatus === 'correct' ? 'bg-green-500/20 text-green-300' :
                    postureStatus === 'incorrect' ? 'bg-red-500/20 text-red-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {postureStatus === 'correct' ? '✓ Good Posture' :
                     postureStatus === 'incorrect' ? '⚠ Fix Posture' :
                     'Detecting...'}
                  </div>
                </div>
              )}
              
              {/* Posture Warning - Only for Plank and Side Plank */}
              {postureStatus === 'incorrect' && isVideoPlaying && (poseDetectionRef.current?.exerciseMode === 'plank' || poseDetectionRef.current?.exerciseMode === 'sideplank') && (
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-red-600/90 text-white px-6 py-3 rounded-lg text-center animate-pulse">
                  <div className="font-bold text-lg">⚠️ DANGEROUS POSTURE!</div>
                  <div className="text-sm">
                    {poseDetectionRef.current?.exerciseMode === 'plank' ? 'Straighten your back' : 
                     poseDetectionRef.current?.exerciseMode === 'sideplank' ? 'Fix your side plank form' : 
                     'Fix your posture'}
                  </div>
                </div>
              )}
              
              {/* Video Status */}
              <div className="absolute bottom-4 right-4">
                <div className="flex items-center space-x-2 bg-black/50 rounded-full px-3 py-1">
                  <div className={`w-2 h-2 rounded-full ${isVideoPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  <span className="text-white text-sm font-medium">
                    {isVideoPlaying ? 'Analyzing' : 'Paused'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center space-x-2">
                <Icon name="File" size={16} />
                <span>{uploadedVideo?.name}</span>
              </span>
              <span>{formatFileSize(uploadedVideo?.size)}</span>
            </div>
            
            {/* Live Analysis Summary */}
            {pushupCount > 0 && (
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-semibold text-card-foreground">Live Analysis Results</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const exerciseName = getExerciseName();
                      const exerciseNameLower = getExerciseNameLower();
                      const liveResults = {
                        exerciseDetected: exerciseName,
                        totalReps: pushupCount,
                        formScore: postureStatus === 'correct' ? 85 : postureStatus === 'incorrect' ? 60 : 75,
                        feedback: [
                          { timestamp: "Live", message: `${pushupCount} ${exerciseNameLower} detected`, type: "success" },
                          { timestamp: "Live", message: `Posture: ${postureStatus}`, type: postureStatus === 'correct' ? 'success' : 'warning' }
                        ],
                        improvements: postureStatus === 'incorrect' ? ["Maintain straight back alignment"] : ["Great form!"],
                        strengths: ["Live AI pose detection", "Real-time analysis"]
                      };
                      setAnalysisResults(liveResults);
                      if (onVideoAnalysis) {
                        onVideoAnalysis(liveResults);
                      }
                    }}
                  >
                    <Icon name="FileText" size={16} className="mr-2" />
                    Generate Report
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-xl font-bold text-success">{pushupCount}</p>
                    <p className="text-sm text-muted-foreground">Reps Detected</p>
                  </div>
                  <div>
                    <p className={`text-xl font-bold ${
                      postureStatus === 'correct' ? 'text-success' :
                      postureStatus === 'incorrect' ? 'text-error' :
                      'text-muted-foreground'
                    }`}>
                      {postureStatus === 'correct' ? '✓ Good' :
                       postureStatus === 'incorrect' ? '⚠ Poor' :
                       'Detecting'}
                    </p>
                    <p className="text-sm text-muted-foreground">Posture</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Analysis Loading */}
          {isAnalyzing && (
            <div className="bg-muted rounded-lg p-6 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Analyzing Video</h3>
              <p className="text-muted-foreground">AI is analyzing your exercise form...</p>
            </div>
          )}
          {/* Analysis Results */}
          {analysisResults && !isAnalyzing && (
            <div className="space-y-6">
              {/* Overall Score */}
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-card-foreground">Analysis Results</h3>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getScoreColor(analysisResults?.formScore)}`}>
                      {analysisResults?.formScore}%
                    </p>
                    <p className="text-sm text-muted-foreground">Form Score</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-xl font-bold text-primary">{analysisResults?.exerciseDetected}</p>
                    <p className="text-sm text-muted-foreground">Exercise Detected</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-success">{analysisResults?.totalReps}</p>
                    <p className="text-sm text-muted-foreground">Reps Counted</p>
                  </div>
                </div>
              </div>

              {/* Feedback Timeline */}
              <div className="space-y-3">
                <h4 className="text-md font-semibold text-card-foreground">Feedback Timeline</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {analysisResults?.feedback?.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        item?.type === 'success' ? 'bg-success' :
                        item?.type === 'warning' ? 'bg-warning' : 'bg-primary'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-card-foreground">{item?.message}</span>
                          <span className="text-xs text-muted-foreground">{item?.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvements and Strengths */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-md font-semibold text-card-foreground flex items-center">
                    <Icon name="AlertCircle" size={16} className="mr-2 text-warning" />
                    Areas to Improve
                  </h4>
                  <ul className="space-y-2">
                    {analysisResults?.improvements?.map((item, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start">
                        <Icon name="ArrowRight" size={14} className="mr-2 mt-0.5 text-warning" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-md font-semibold text-card-foreground flex items-center">
                    <Icon name="CheckCircle" size={16} className="mr-2 text-success" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {analysisResults?.strengths?.map((item, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start">
                        <Icon name="Check" size={14} className="mr-2 mt-0.5 text-success" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button variant="default" className="flex-1">
                  <Icon name="Download" size={16} className="mr-2" />
                  Save Report
                </Button>
                <Button variant="outline" className="flex-1">
                  <Icon name="Share" size={16} className="mr-2" />
                  Share Results
                </Button>
              </div>
            </div>
          )}
        </div>)
      )}
    </div>
  );
};

export default VideoUpload;