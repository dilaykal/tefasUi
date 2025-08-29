import React,{useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";


const FundSearch = () =>{
    //state tanımları
    const[fundCode, setFundCode] = useState('');
    const[fundInfo, setFundInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const[error, setError] = useState('');
    const[startDate, setStartDate] = useState('');
    const[endDate, setEndDate] = useState('');

    // sayfalar arası navigasyon ve url parametreleri
    const navigate = useNavigate();
    const {fonKodu: urlFundCode} = useParams(); //url den fon kodunu alınır
    const [searchParams] = useSearchParams(); //url query parametreleri alınır

    // useCallback kullanarak api isteğinin gereksiz yere atılması engellenir
    const fetchFundInfo = useCallback(async(code,start,end)=> {
        setLoading(true); // Yükleme durumunu başlat
        setError('');     // Önceki hataları temizle
        setFundInfo(null); // Önceki fon bilgilerini temizle

        const baseURL = `http://localhost:8080/api/funds/list/${code}`;
        //url ye eklenecek sorgu parametreleri
        const params = new URLSearchParams();

        if(start){
            params.append('startDate', start);
        }
        if(end){
            params.append('endDate', end);
        }

        const apiURL = params.toString() ? `${baseURL}?${params.toString()}` : baseURL;
        try {
            const response = await fetch(apiURL);
            // response başarılı değilse hata dön
            if(!response.ok){
                const errorText= await response.text();
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
        }finally {
            setLoading(false); 
        }
    },[]); 
    
    // arama terimlerine veya query'e göre belirlenen fon için api isteği atılır 
    useEffect(() => {
      //url den fon kodu ve tarihler alınır
      const currentFundCode = searchParams.get('fonKodu') || urlFundCode; 
      const currentStartDate = searchParams.get('startDate')||'';
      const currentEndDate = searchParams.get('endDate')||'';
  
      //URL de fon kodu varsa state'ler güncellenir ve veri çekilir
      if(currentFundCode){
        //URL değerleri mevcut state değerlerinden farklıysa state'i güncelliyoruz
        if(currentFundCode !== fundCode) setFundCode(currentFundCode);
        if(currentStartDate !== startDate) setStartDate(currentStartDate);
        if(currentEndDate !== endDate) setEndDate(currentEndDate);
        
        fetchFundInfo(currentFundCode, currentStartDate, currentEndDate);
      } else {
        // URL'de fon kodu yoksa state'ler sıfırlanır
        if(fundCode) setFundCode('');
        if(startDate) setStartDate('');
        if(endDate) setEndDate('');
        if(fundInfo) setFundInfo(null);
        if(error) setError('');
      }
    },[urlFundCode, searchParams, fetchFundInfo, setFundCode, setStartDate, setEndDate, setFundInfo, setError]);
    
    const handleSearch = () =>{
        if(!fundCode){
            setError('Lütfen bir fon kodu girin.');
            return;
        }
        const query = new URLSearchParams();
        if(startDate){
            query.append('startDate', startDate);
        }
        if(endDate){
            query.append('endDate',endDate);
        }

        // URL'yi güncelle
        navigate(`/search/${fundCode}${query.toString() ? `?${query.toString()}` : ''}`);
    };

    const formatDateToTR = (dateString) => {
      const [year, month, day] = dateString.split('-');
      return `${day}.${month}.${year}`;
    };

    return(
        <div className="p-2">
            <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
                <div className="flex-1 mb-4 ">
                    <label htmlFor="fundCode" className="block text-blue-800 font-bold mb-2">
                        Fon Kodunu Girin:
                    </label>
                    <div className="flex">
                        <input
                            type="text"
                            id="fundCode"
                            className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={fundCode}
                            onChange={(e) => setFundCode(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                            placeholder="Örnek: TTE"
                        />
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-blue-800 text-white rounded-r-lg hover:bg-blue-700"
                            disabled={loading} // Yüklenirken ve yüklendikten sonra butonu devre dışı bırakır
                        >
                            {loading ? 'Aranıyor...' : 'Ara'}
                        </button>
                    </div>
                </div>
                {/* Tarih aralığı girişleri*/}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 ">
                    <div className="mr-2">
                        <label htmlFor="startDate" className="block text-gray-700 font-bold mb-2">
                            Başlangıç Tarihi:
                        </label>
                        <input
                            type="date"
                            id="startDate"
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            {/* Yüklenme Durumu Mesajı */}
            {loading && (
                <div className="mt-4 text-center text-blue-600 font-medium">
                    Veriler yükleniyor...
                </div>
            )}

            {/* Hata Mesajı */}
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
                <div className="mt-6">
                    {fundInfo.map((dayData, index) => (
                    <div key={index} className="bg-white p-4 mb-6 rounded-lg shadow-sm border border-gray-200">
                        <p className="font-bold text-left text-md text-blue-800 mb-2"> {formatDateToTR(dayData.date)}</p>
                    
                        <div className="flex flex-wrap justify-center gap-4">
                            {dayData && Array.isArray(dayData.returns) && dayData.returns.map((returnData, idx) => {
                                const value = returnData.value;
                                let textColorClass = 'text-gray-600';
                                if (value > 0) {
                                    textColorClass = 'text-green-600';
                                } else if (value < 0) {
                                    textColorClass = 'text-red-600';
                                }
                                let formattedValue = value !== null && value !== undefined ? `${value.toFixed(2)}%` : '-';
                                return(
                                <div key={idx} className="p-2 rounded-lg bg-gray-100 flex-1 ">
                                    <p className="text-gray-500 whitespace-nowrap px-6 text-sm">{returnData.description}</p>
                                    <p className={`font-bold text-lg ${textColorClass}`}> {formattedValue}</p>
                                </div>
                                )       
                            })}
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            )}
        </div> 
    );
    
};

export default FundSearch;
