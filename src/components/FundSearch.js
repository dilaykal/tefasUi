import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PencilSquareIcon } from '@heroicons/react/24/solid';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const FundSearch = () => {
  const [fundCode, setFundCode] = useState('');
  const [fundInfo, setFundInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Update işlemi için yeni state'ler
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFundReturns, setEditingFundReturns] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const navigate = useNavigate();
  const { fonKodu: urlFundCode } = useParams();
  const [searchParams] = useSearchParams();

  // API'den fon verilerini çeken ana fonksiyon
  const fetchFundInfo = useCallback(async (code, start, end) => {
    setLoading(true);
    setError('');
    setFundInfo(null);

    const baseURL = `${API_BASE_URL}/api/funds/${code}`;
    const params = new URLSearchParams();
    if (start) {
      params.append('startDate', start);
    }
    if (end) {
      params.append('endDate', end);
    }
    const apiURL = params.toString() ? `${baseURL}?${params.toString()}` : baseURL;

    try {
      const response = await fetch(apiURL);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Fon bulunamadı. Lütfen geçerli bir kod girin.');
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setFundInfo(data);
      } else {
        throw new Error('API yanıtı beklenenden farklı. Veri bulunamadı.');
      }
    } catch (err) {
      setError(`API isteği sırasında bir hata oluştu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update işlemi için API'ye istek atan fonksiyon
  const updateFundReturns = useCallback(async (code, date, returns) => {
    setIsUpdating(true);
    setUpdateError('');
    const updateURL = `${API_BASE_URL}/api/funds/${code}?date=${date}`;
    try {
      const response = await fetch(updateURL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(returns),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Güncelleme işlemi başarısız oldu.');
      }
      
      // Güncelleme başarılıysa, veriyi tekrar çek
      await fetchFundInfo(fundCode, startDate, endDate);
      setIsModalOpen(false); // Modal'ı kapat
    } catch (err) {
      setUpdateError(`Güncelleme sırasında bir hata oluştu: ${err.message}. Lütfen sunucu URL'sini kontrol edin: ${updateURL}`);
    } finally {
      setIsUpdating(false);
    }
  }, [fetchFundInfo, fundCode, startDate, endDate]);

  useEffect(() => {
    const currentFundCode = searchParams.get('fonKodu') || urlFundCode;
    const currentStartDate = searchParams.get('startDate') || '';
    const currentEndDate = searchParams.get('endDate') || '';

    if (currentFundCode) {
      if (currentFundCode !== fundCode) setFundCode(currentFundCode);
      if (currentStartDate !== startDate) setStartDate(currentStartDate);
      if (currentEndDate !== endDate) setEndDate(currentEndDate);

      fetchFundInfo(currentFundCode, currentStartDate, currentEndDate);
    } else {
      setFundCode('');
      setStartDate('');
      setEndDate('');
      setFundInfo(null);
      setError('');
    }
  }, [urlFundCode, searchParams, fetchFundInfo]);

  const handleSearch = () => {
    if (!fundCode) {
      setError('Lütfen bir fon kodu girin.');
      return;
    }
    const query = new URLSearchParams();
    if (startDate) {
      query.append('startDate', startDate);
    }
    if (endDate) {
      query.append('endDate', endDate);
    }
    navigate(`/search/${fundCode}${query.toString() ? `?${query.toString()}` : ''}`);
  };

  const handleEditClick = (dayData) => {
    setEditingFundReturns(dayData);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingFundReturns(null);
    setUpdateError('');
  };

  const handleReturnChange = (description, value) => {
    setEditingFundReturns(prevState => ({
      ...prevState,
      returns: prevState.returns.map(item =>
        item.description === description ? { ...item, value: parseFloat(value) } : item
      ),
    }));
  };

  const handleModalSave = () => {
    if (editingFundReturns) {
      // Sadece değeri değiştirilenleri al
      const returnsToUpdate = editingFundReturns.returns;
      updateFundReturns(editingFundReturns.fundCode, editingFundReturns.date, returnsToUpdate);
    }
  };

  const formatDateToTR = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md ">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">Fon Getirisi Arama</h1>
        
        <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
          <div className="flex-1 mb-4 md:mb-0">
            <label htmlFor="fundCode" className="block text-blue-800 font-bold mb-2">
              Fon Kodunu Girin:
            </label>
            <div className="flex">
              <input
                type="text"
                id="fundCode"
                className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-700"
                value={fundCode}
                onChange={(e) => setFundCode(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
                placeholder="Örnek: TTE"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-blue-800 text-white rounded-r-lg hover:bg-blue-700 "
                disabled={loading}
              >
                {loading ? 'Aranıyor...' : 'Ara'}
              </button>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-gray-700 font-bold mb-2">
                Başlangıç Tarihi:
              </label>
              <input
                type="date"
                id="startDate"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-700"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-gray-700 font-bold mb-2">
                Bitiş Tarihi:
              </label>
              <input
                type="date"
                id="endDate"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {loading && <div className="mt-4 text-center text-blue-600 font-medium">Veriler yükleniyor...</div>}
        
        {!loading && error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Hata! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {fundInfo && Array.isArray(fundInfo) && fundInfo.length > 0 && (
          <div className="bg-gray-50 p-6 rounded-lg shadow-inner mt-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-blue-800 mb-4">{fundInfo[0].longName} ({fundInfo[0].fundCode})</h2>
            <p className="text-gray-600 font-semibold">{fundInfo[0].fund_desc}</p>
            <div className="mt-6 space-y-6">
              {fundInfo.map((dayData, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <p className="font-bold text-xl text-blue-800">{formatDateToTR(dayData.date)}</p>
                    <button
                      onClick={() => handleEditClick(dayData)}
                      className="px-4 py-2 ml-4 bg-blue-800 text-white rounded-full hover:bg-blue-700"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 flex-initial gap-4">
                    {dayData.returns.map((returnData, idx) => {
                      const value = returnData.value;
                      let textColorClass = 'text-gray-600';
                      if (value > 0) textColorClass = 'text-green-600';
                      else if (value < 0) textColorClass = 'text-red-600';
                      const formattedValue = value !== null && value !== undefined ? `${value.toFixed(4)}%` : '-';
                      return (
                        <div key={idx} className="p-4 rounded-lg bg-gray-100">
                          <p className="text-gray-500 text-sm font-semibold">{returnData.description}</p>
                          <p className={`font-bold text-lg ${textColorClass}`}>{formattedValue}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Güncelleme Modalı */}
      {isModalOpen && editingFundReturns && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-blue-800 mb-4">
              {editingFundReturns.fundCode} - {formatDateToTR(editingFundReturns.date)} Getirilerini Güncelle
            </h3>
            {updateError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Hata: </strong>
                <span className="block sm:inline">{updateError}</span>
              </div>
            )}
            <div className="space-y-4 mb-4">
              {editingFundReturns.returns.map((returnData, index) => (
                <div key={index}>
                  <label htmlFor={`input-${index}`} className="block text-gray-700 font-semibold mb-1">
                    {returnData.description}
                  </label>
                  <input
                    id={`input-${index}`}
                    type="number"
                    step="0.0001"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={returnData.value !== null && returnData.value !== undefined ? returnData.value : ''}
                    onChange={(e) => handleReturnChange(returnData.description, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleModalClose}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 "
              >
                İptal
              </button>
              <button
                onClick={handleModalSave}
                className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 "
                disabled={isUpdating}
              >
                {isUpdating ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundSearch;
