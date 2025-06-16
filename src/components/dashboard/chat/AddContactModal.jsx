import { useState } from 'react';
import { X, Search, UserPlus } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const AddContactModal = ({ onClose, onContactAdded }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const searchUser = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    setLoading(true);
    try {
      const response = await api.get(`/users/search/${phoneNumber}`);
      setSearchResult(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('User not found with this phone number');
      } else {
        toast.error('Error searching for user');
      }
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const addContact = async () => {
    if (!searchResult?.user) return;

    setAdding(true);
    try {
      await api.post('/users/add-contact', { contactId: searchResult.user._id });
      toast.success('Contact added successfully!');
      onContactAdded();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding contact');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add Contact</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={searchUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="flex space-x-2">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className="flex-1 input-field"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center"
              >
                {loading ? (
                  <div className="loading-spinner w-4 h-4" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Search Result */}
        {searchResult && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{searchResult.user.name}</h4>
                <p className="text-sm text-gray-600">{searchResult.user.email}</p>
                <p className="text-sm text-gray-600">{searchResult.user.phone}</p>
              </div>
              
              {searchResult.isContact ? (
                <span className="text-sm text-green-600 font-medium">Already in contacts</span>
              ) : (
                <button
                  onClick={addContact}
                  disabled={adding}
                  className="btn-primary flex items-center text-sm"
                >
                  {adding ? (
                    <div className="loading-spinner w-4 h-4 mr-1" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-1" />
                  )}
                  Add Contact
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Enter a phone number to find and add students to your contact list
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddContactModal;