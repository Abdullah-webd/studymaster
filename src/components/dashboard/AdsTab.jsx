import { useState, useEffect } from 'react';
import { Play, Coins, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdsTab = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchingAd, setWatchingAd] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const { user, updateUser } = useAuth();

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const response = await api.get('/ads');
      setAds(response.data);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const watchAd = async (ad) => {
    setWatchingAd(ad);
    setVideoProgress(0);
  };

  const handleVideoEnd = async (adId) => {
    try {
      const response = await api.post(`/ads/watch/${adId}`);
      toast.success(`Earned ${response.data.creditsEarned} credits!`);
      
      // Update user credits
      updateUser({ credits: response.data.totalCredits });
      
      // Remove watched ad from list
      setAds(prev => prev.filter(ad => ad._id !== adId));
      setWatchingAd(null);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error processing ad view');
    }
  };

  const handleVideoProgress = (progress) => {
    setVideoProgress(progress);
  };

  const closeVideoModal = () => {
    setWatchingAd(null);
    setVideoProgress(0);
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Loading ads...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Watch Ads</h1>
          <p className="text-gray-600">Earn credits by watching video advertisements</p>
        </div>
        <div className="flex items-center bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
          <Coins className="h-5 w-5 text-yellow-600 mr-2" />
          <span className="font-semibold text-yellow-800">{user?.credits || 0} Credits</span>
        </div>
      </div>

      {/* Available Ads */}
      {ads.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad._id} className="card p-6">
              <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                <Play className="h-12 w-12 text-gray-400" />
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{ad.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{ad.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDuration(ad.duration)}
                </div>
                <div className="flex items-center text-sm font-medium text-green-600">
                  <Coins className="h-4 w-4 mr-1" />
                  +{ad.credits} credits
                </div>
              </div>
              
              <button
                onClick={() => watchAd(ad)}
                className="w-full btn-primary flex items-center justify-center"
              >
                <Play className="h-4 w-4 mr-2" />
                Watch Ad
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center">
          <Play className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ads available right now</h3>
          <p className="text-gray-600">
            Check back later for new video advertisements to earn credits
          </p>
        </div>
      )}

      {/* How it Works */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">How to Earn Credits</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Play className="h-6 w-6 text-primary-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Watch Videos</h4>
            <p className="text-sm text-gray-600">
              Click on any available ad to start watching the video
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-secondary-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Complete Viewing</h4>
            <p className="text-sm text-gray-600">
              Watch the entire video to earn the advertised credits
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Coins className="h-6 w-6 text-yellow-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Earn Credits</h4>
            <p className="text-sm text-gray-600">
              Credits are automatically added to your account
            </p>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {watchingAd && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{watchingAd.title}</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-green-600">
                  <Coins className="h-4 w-4 mr-1" />
                  <span className="font-medium">+{watchingAd.credits} credits</span>
                </div>
                <button
                  onClick={closeVideoModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Video Player Placeholder */}
            <div className="aspect-video bg-gray-900 rounded-lg mb-4 flex items-center justify-center">
              <div className="text-center text-white">
                <Play className="h-16 w-16 mx-auto mb-4" />
                <p className="text-lg font-medium">Video Player</p>
                <p className="text-sm opacity-75">
                  In production, this would show the actual video from: {watchingAd.videoUrl}
                </p>
                
                {/* Simulate video progress */}
                <div className="mt-4 max-w-md mx-auto">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${videoProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs mt-2">{Math.round(videoProgress)}% complete</p>
                </div>
                
                {/* Simulate video completion */}
                <button
                  onClick={() => {
                    if (videoProgress < 100) {
                      setVideoProgress(prev => Math.min(prev + 20, 100));
                    } else {
                      handleVideoEnd(watchingAd._id);
                    }
                  }}
                  className="mt-4 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium"
                >
                  {videoProgress < 100 ? 'Simulate Progress' : 'Complete & Earn Credits'}
                </button>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Watch the complete video to earn {watchingAd.credits} credits
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsTab;