import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase-config';
import { collection, query, where, getDocs, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { FaLock, FaUnlock, FaPlus, FaMinus, FaSave } from 'react-icons/fa';
import StationOwnerLayout from './StationOwnerLayout';

const StationSlots = () => {
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tempSlots, setTempSlots] = useState({ fourWheeler: 0, twoWheeler: 0 });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchStationData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setError('No user logged in');
          setLoading(false);
          return;
        }

        const stationsRef = collection(db, 'stations');
        const q = query(stationsRef, where('ownerId', '==', currentUser.uid));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const stationData = snapshot.docs[0].data();
            const newStation = {
              id: snapshot.docs[0].id,
              ...stationData
            };
            setStation(newStation);
            // Initialize temp slots with current values
            setTempSlots({
              fourWheeler: stationData.fourWheelerSlots || 0,
              twoWheeler: stationData.twoWheelerSlots || 0
            });
            setHasChanges(false);
          } else {
            setError('No station found for this user');
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching station data:', error);
        setError('Error loading station data');
        setLoading(false);
      }
    };

    fetchStationData();
  }, []);

  const updateStationStatus = async (stationId, isActive) => {
    try {
      const stationRef = doc(db, 'stations', stationId);
      await updateDoc(stationRef, {
        status: isActive ? 'active' : 'inactive',
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating station status:', error);
      setError('Failed to update station status');
    }
  };

  const handleSlotChange = (slotType, increment) => {
    setTempSlots(prev => {
      const newValue = increment 
        ? (prev[slotType] + 1)
        : Math.max(0, prev[slotType] - 1);
      return {
        ...prev,
        [slotType]: newValue
      };
    });
    
    // Check if the new value is different from the current station value
    if (station) {
      const currentValue = station[`${slotType}Slots`] || 0;
      const newValue = increment ? currentValue + 1 : Math.max(0, currentValue - 1);
      setHasChanges(newValue !== currentValue);
    }
  };

  const handleUpdateSlots = async () => {
    try {
      if (!station) return;

      const stationRef = doc(db, 'stations', station.id);
      await updateDoc(stationRef, {
        fourWheelerSlots: tempSlots.fourWheeler,
        twoWheelerSlots: tempSlots.twoWheeler,
        updatedAt: new Date().toISOString()
      });
      
      setHasChanges(false);
    } catch (error) {
      console.error('Error updating slots:', error);
      setError('Failed to update slots');
    }
  };

  if (loading) {
    return (
      <StationOwnerLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </StationOwnerLayout>
    );
  }

  if (error) {
    return (
      <StationOwnerLayout>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </StationOwnerLayout>
    );
  }

  if (!station) {
    return (
      <StationOwnerLayout>
        <div className="p-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-600">No station found. Please contact support.</p>
          </div>
        </div>
      </StationOwnerLayout>
    );
  }

  return (
    <StationOwnerLayout>
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Manage Station Slots</h2>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold">{station?.name}</h3>
                <p className="text-gray-600">{station?.location}</p>
              </div>
              <button
                onClick={() => updateStationStatus(station.id, station.status !== 'active')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  station?.status === 'active'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {station?.status === 'active' ? (
                  <>
                    <FaLock className="text-lg" />
                    <span>Close Station</span>
                  </>
                ) : (
                  <>
                    <FaUnlock className="text-lg" />
                    <span>Open Station</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 4-Wheeler Slots */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-medium mb-4">4-Wheeler Slots</h4>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{tempSlots.fourWheeler}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSlotChange('fourWheeler', false)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      <FaMinus />
                    </button>
                    <button
                      onClick={() => handleSlotChange('fourWheeler', true)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
              </div>

              {/* 2-Wheeler Slots */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-medium mb-4">2-Wheeler Slots</h4>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{tempSlots.twoWheeler}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSlotChange('twoWheeler', false)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      <FaMinus />
                    </button>
                    <button
                      onClick={() => handleSlotChange('twoWheeler', true)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Update Button */}
            {hasChanges && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleUpdateSlots}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <FaSave className="text-lg" />
                  <span>Update Slots</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </StationOwnerLayout>
  );
};

export default StationSlots; 