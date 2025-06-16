import { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';
import Vapi from '@vapi-ai/web';

const VoiceCallTab = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [vapi, setVapi] = useState(null);

  // ⚙️ Replace these with your real credentials!
  const VAPI_PUBLIC_KEY = '3153ed5b-12fe-47d5-a21c-13a7508f940e';
  const VAPI_ASSISTANT_ID = '8821a21b-a1d8-4726-adba-d3c40d090cd8';

  useEffect(() => {
    const client = new Vapi(VAPI_PUBLIC_KEY);
    setVapi(client);

    // 🔔 Event listeners
    client.on('call-start', () => {
      console.log('✅ Call started');
    });

    client.on('call-end', () => {
      console.log('❌ Call ended');
      setIsCallActive(false);
      setIsMuted(false);
      toast.success('Call ended');
    });

    client.on('message', (message) => {
      if (message.type === 'transcript') {
        console.log(`${message.role}: ${message.transcript}`);
      }
    });

    return () => {
      client.stop();
    };
  }, []);

  useEffect(() => {
    let timer;
    if (isCallActive) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isCallActive]);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = async () => {
    try {
      if (!vapi) return toast.error('Vapi not initialized yet');

      await vapi.start(VAPI_ASSISTANT_ID);

      setIsCallActive(true);
      toast.success('Voice call started!');
    } catch (error) {
      console.error('Error starting call:', error);
      toast.error('Failed to start voice call.');
    }
  };

  const endCall = async () => {
    try {
      await vapi.stop();
    } catch (error) {
      console.error('Error ending call:', error);
      toast.error('Failed to end call.');
    }
  };

  const toggleMute = () => {
    if (!vapi) return;
    if (isMuted) {
      vapi.unmute();
      toast.success('Microphone unmuted');
    } else {
      vapi.mute();
      toast.success('Microphone muted');
    }
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    // Vapi handles audio routing automatically, but you can toggle speaker here if needed
    setIsSpeakerOn(!isSpeakerOn);
    toast.success(isSpeakerOn ? 'Speaker off' : 'Speaker on');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">AI Voice Call</h1>
        <p className="text-gray-600">Have a conversation with your AI tutor</p>
      </div>

      {/* Call UI */}
      <div className="max-w-md mx-auto">
        <div className="card p-8 text-center">
          <div className="mb-6">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center ${
              isCallActive ? 'bg-green-100 animate-pulse' : 'bg-primary-100'
            }`}>
              <Phone className={`h-16 w-16 ${
                isCallActive ? 'text-green-600' : 'text-primary-600'
              }`} />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Study Tutor</h2>
            <p className={`text-sm ${isCallActive ? 'text-green-600' : 'text-gray-500'}`}>
              {isCallActive ? `Connected • ${formatDuration(callDuration)}` : 'Ready to help with your studies'}
            </p>
          </div>

          <div className="space-y-4">
            {!isCallActive ? (
              <button
                onClick={startCall}
                className="w-full btn-primary flex items-center justify-center py-4 text-lg"
              >
                <Phone className="h-6 w-6 mr-3" />
                Start Voice Call
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={toggleMute}
                    className={`p-4 rounded-full ${
                      isMuted 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </button>

                  <button
                    onClick={toggleSpeaker}
                    className={`p-4 rounded-full ${
                      isSpeakerOn 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
                  >
                    {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
                  </button>
                </div>

                <button
                  onClick={endCall}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
                >
                  <PhoneOff className="h-6 w-6 mr-3" />
                  End Call
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
        {/* Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mic className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Natural Conversation</h3>
          <p className="text-sm text-gray-600">
            Speak naturally with the AI tutor just like talking to a human teacher
          </p>
        </div>

        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="h-6 w-6 text-secondary-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Real-time Responses</h3>
          <p className="text-sm text-gray-600">
            Get instant answers and explanations for any educational question
          </p>
        </div>

        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Volume2 className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Clear Audio</h3>
          <p className="text-sm text-gray-600">
            High-quality voice interaction for the best learning experience
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">How to use AI Voice Call</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start">
            <span className="bg-primary-100 text-primary-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">1</span>
            <p>Click "Start Voice Call" to begin your session with the AI tutor</p>
          </div>
          <div className="flex items-start">
            <span className="bg-primary-100 text-primary-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">2</span>
            <p>Wait for the connection to establish (usually takes 2-3 seconds)</p>
          </div>
          <div className="flex items-start">
            <span className="bg-primary-100 text-primary-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">3</span>
            <p>Start speaking naturally about any topic you need help with</p>
          </div>
          <div className="flex items-start">
            <span className="bg-primary-100 text-primary-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">4</span>
            <p>Use the mute and speaker controls as needed during your conversation</p>
          </div>
          <div className="flex items-start">
            <span className="bg-primary-100 text-primary-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5">5</span>
            <p>Click "End Call" when you're finished with your study session</p>
          </div>
        </div>
      </div>

      {/* Note about Vapi Integration */}
      <div className="card p-4 bg-blue-50 border border-blue-200">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> This feature requires Vapi API integration. In a production environment, 
          you would need to configure your Vapi API keys and assistant settings to enable real voice calls.
        </p>
      </div>
    </div>
  );
};

export default VoiceCallTab;
