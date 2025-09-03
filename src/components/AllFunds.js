import React, { useState, useEffect, useMemo } from "react";
import axios from 'axios';
import { useSearchParams,Link } from 'react-router-dom';
import { TableCellsIcon } from '@heroicons/react/24/solid';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
function AllFunds() {
    const [funds, setFunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    // fon bilgilerini alımı ve düzenlenmesi
    useEffect(() => {
        const fetchFunds = async () => {
            try {
                // Fon bilgileri ve getiri değerleri api üzerinden alınıyor
                const response = await axios.get(`${API_BASE_URL}/api/funds`);
                
                // Getiri değerlerinin tablo gösterimine çevirimi
                const processedFunds = response.data.map(fund => {
                  const returnsMap = fund.returns.reduce((acc,curr)=>{
                    acc[curr.description] = curr.value;
                    return acc;
                  },{});

                  return{
                    ...fund,
                    returnsData: returnsMap
                  };
                });
                setFunds(processedFunds);
                
            } catch (err) {
                setError('Tüm fonlar çekilirken bir hata oluştu: ' + err.message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFunds();
    }, []);

     const sortConfig = useMemo(() => {
        const key = searchParams.get('key');
        const direction = searchParams.get('direction');
        return { key, direction };
    }, [searchParams]);

    // Verileri sıralama işlemini sortConfig'e göre yap
    const sortedFunds = useMemo(() => {
        let sortableItems = [...funds];
        const key = sortConfig.key;
        const direction = sortConfig.direction;

        if (key) {
            sortableItems.sort((a, b) => {
                // getiri veya bilgi değerlerini alma
                const valA = a.returnsData[key] !== undefined ? a.returnsData[key] : (a[key] !== undefined ? a[key] : null);
                const valB = b.returnsData[key] !== undefined ? b.returnsData[key] : (b[key] !== undefined ? b[key] : null);
                
                // karşılartırma ve sıralama
                if (typeof valA === 'string' && typeof valB === 'string') {
                    const comparison = valA.localeCompare(valB, 'tr', { sensitivity: 'base' });
                    return direction === 'ascending' ? comparison : -comparison;
                }
                
                if (valA < valB) {
                    return direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [funds, sortConfig]);

    const handleSort = (key) => {
        const currentKey = sortConfig.key;
        const currentDirection = sortConfig.direction;
        let direction = 'ascending';

        if (currentKey === key && currentDirection === 'ascending') {
            direction = 'descending';
        } else if (currentKey === key && currentDirection === 'descending') {
            setSearchParams({});
            return;
        }
        setSearchParams({ key, direction });
    };

    //excele aktarma fonksiyonu 
    const handleExport = () => {
        const headers = ["Fon Kodu", "Fon Ünvanı", ...returnHeaders];
        
        // CSV formatında başlık satırını oluştur
        const headerString = headers.join(';');
        
        // Her bir fon için bir satır oluştur
        const rows = sortedFunds.map(fund => {
            const rowData = [
                `"${fund.fundCode}"`,
                `"${fund.longName}"`,
                ...returnHeaders.map(header => {
                    const value = fund.returnsData[header];
                    // Sayısal değerleri virgül yerine nokta ile formatla
                    return value !== null && value !== undefined ? `${value.toFixed(2)}`.replace('.', ',') : '';
                })
            ];
            return rowData.join(';');
        });
        
        // Başlık ve veri satırlarını birleştir
        const csvString = [headerString, ...rows].join('\n');

        // Unicode desteği için UTF-8 BOM'u ekle
        const BOM = '\uFEFF';
        const csvData = BOM + csvString;

        // Blob nesnesini oluştur ve indirme linkini hazırla
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `fon_getirileri_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
    };

    // fon bilgilerinin gelmediği durumların gösterimi
    if (loading) return <div className="text-center text-blue-600 text-lg p-8">Yükleniyor...</div>;
    if (error) return <div className="text-center text-red-600 text-lg p-8">{error}</div>;
    if (funds.length === 0) return <div className="text-center text-gray-600 text-lg p-8">Hiç fon bilgisi bulunamadı.</div>;

    // günlük getirinin ilk sıraya alınması
    let returnHeaders = funds.length > 0 ? Object.keys(funds[0].returnsData) : [];
    const dailyReturnHeader = 'Günlük Getiri';
    if(returnHeaders.includes(dailyReturnHeader)){
      const index = returnHeaders.indexOf(dailyReturnHeader);

      if(index>-1){
        returnHeaders.splice(index,1);
      }

      //eleman dizinin en başına eklenir 
      returnHeaders.unshift(dailyReturnHeader);
    }
    
      
    return (
        <div className="">
            <div className="flex justify-between items-center mb-6 pb-2">
                <h2 className="text-3xl font-bold text-blue-800">Tüm Fonların Güncel Getirileri</h2>
                <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2"
                >
                    {/* Excel simgesi */}
                    <TableCellsIcon className="h-6 w-5" />
                    <span>Excel'e Aktar</span>
                </button>
            </div>
            
            <div className="overflow-x-auto rounded-lg">
                <table className="divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-center text-sm font-semibold text-red-600 uppercase cursor-pointer" onClick={() => handleSort('fundCode')}>
                                Fon Kodu {sortConfig.key === 'fundCode' && (<span>{sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'}</span>)}
                            </th>
                            <th className="text-center text-sm font-semibold text-red-600 uppercase cursor-pointer" onClick={() => handleSort('longName')}>
                                Fon Ünvanı {sortConfig.key === 'longName' && (<span>{sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'}</span>)}
                            </th>
                            {returnHeaders.map(header => (
                                <th
                                    key={header}
                                    className={`px-6 py-3 text-center text-sm font-semibold text-gray-600 uppercase cursor-pointer ${(sortConfig.direction != null && sortConfig.key === header) ? "text-black" : ""}`}
                                    onClick={() => handleSort(header)}
                                >
                                    {header} {sortConfig.key === header && (<span>{sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'} </span>)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedFunds.map((fund) => (
                            <tr key={fund.fundId} className="hover:bg-gray-50 ">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                    <Link to={`/search/${fund.fundCode}`} className="hover:text-blue-800 hover:underline">
                                        {fund.fundCode}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  <Link to={`/search/${fund.fundCode}`} className="hover:text-blue-800 hover:underline">
                                    {fund.longName}
                                  </Link>
                                </td>
                                
                                {returnHeaders.map(header => {
                                    const value = fund.returnsData[header];
                                    
                                    let textColorClass = 'text-gray-600';
                                    if (value > 0) {
                                        textColorClass = 'text-green-600';
                                    } else if (value < 0) {
                                        textColorClass = 'text-red-600';
                                    }
                                    
                                    let formattedValue = value !== null && value !== undefined ? `${value.toFixed(2)}%` : '-';
                                    if (header === 'Fon Kodu' || header === 'Fon Ünvanı') {
                                        formattedValue = value;
                                    }
                                    
                                    return (
                                        <td key={header} className={`px-6 py-4 whitespace-nowrap text-md ${textColorClass}`}>
                                            {formattedValue}    
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AllFunds;