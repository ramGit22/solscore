import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { api } from '../utils/api';

/**
 * Type for HHI calculation results
 */
interface HHIResult {
  hhi: number;
  totalSupply: string;
  holderCount: number;
  topHolders: Array<{
    account: string;
    amount: string;
    percentage: number;
  }>;
  concentrationLevel: string;
}

/**
 * Main component for HHI calculation and display
 */
const HhiCalculator: React.FC = () => {
  const [mintAddress, setMintAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HHIResult | null>(null);

  // Color scheme for pie chart
  const COLORS = ['#00D4FF', '#8B5CF6', '#4F46E5', '#3B82F6', '#0EA5E9', '#06B6D4', '#14B8A6', '#059669', '#10B981', '#34D399'];

  /**
   * Validate a Solana address format
   */
  const isValidSolanaAddress = (address: string): boolean => {
    // Solana addresses are base58 encoded and usually around 32-44 characters
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mintAddress.trim()) {
      setError('Please enter a valid token mint address');
      return;
    }

    // Client-side validation
    if (!isValidSolanaAddress(mintAddress.trim())) {
      setError('Invalid Solana token mint address format');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await api.getHHI(mintAddress.trim());
      
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.message || 'Failed to calculate HHI');
      }
    } catch (err: any) {
      // Enhanced error handling
      let errorMessage = 'Error connecting to server. Please try again.';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = err.response.data?.message || 
                      `Server error: ${err.response.status}`;
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = err.message || 'An unknown error occurred';
      }
      
      setError(errorMessage);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format large numbers with commas
   */
  const formatNumber = (num: string): string => {
    return new Intl.NumberFormat().format(parseInt(num, 10));
  };

  /**
   * Truncate wallet address for display
   */
  const truncateAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  /**
   * Custom formatter for tooltips
   */
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-charcoal p-2 border border-neon-cyan rounded shadow-lg">
          <p className="text-neon-cyan font-bold">{`${payload[0].name}`}</p>
          <p className="text-white">{`${payload[0].value.toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };

  /**
   * Prepare data for pie chart
   */
  const getPieChartData = () => {
    if (!result?.topHolders) return [];
    
    // Get top 9 holders
    const topData = result.topHolders.slice(0, 9).map(holder => ({
      name: truncateAddress(holder.account),
      value: holder.percentage,
      fullAddress: holder.account
    }));
    
    // If there are more holders beyond top 9, combine them as "Others"
    if (result.holderCount > 9) {
      const othersPercentage = 100 - topData.reduce((sum, item) => sum + item.value, 0);
      
      if (othersPercentage > 0) {
        topData.push({
          name: 'Others',
          value: othersPercentage,
          fullAddress: 'Multiple accounts'
        });
      }
    }
    
    return topData;
  };

  /**
   * Get appropriate CSS class based on HHI value
   */
  const getHhiColorClass = (hhi: number): string => {
    if (hhi < 1500) return 'text-green-400';
    if (hhi < 2500) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="container mx-auto px-4 py-6 mt-20">
      <div className="max-w-2xl mx-auto bg-gray-900 rounded-lg shadow-lg p-6 mb-10">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">
          Calculate Token Concentration (HHI)
        </h2>
        
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label htmlFor="mintAddress" className="block text-gray-300 mb-2">
              Token Mint Address
            </label>
            <input
              id="mintAddress"
              type="text"
              value={mintAddress}
              onChange={(e) => setMintAddress(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white focus:outline-none focus:ring-2 focus:ring-neon-cyan"
              placeholder="Enter Solana token mint address"
            />
            <p className="mt-1 text-sm text-gray-400">
              Example: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v (USDC)
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full neon-button bg-neon-cyan text-charcoal font-bold py-3 rounded transition duration-300 hover:bg-opacity-90 focus:outline-none"
          >
            {loading ? 'Calculating...' : 'Calculate HHI'}
          </button>
        </form>
        
        {error && (
          <div className="bg-red-900 bg-opacity-50 border border-red-700 text-white p-4 rounded mb-6">
            {error}
          </div>
        )}
        
        {loading && (
          <div className="text-center py-10">
            <div className="animate-pulse text-neon-cyan text-xl">
              Fetching token data and calculating HHI...
            </div>
            <p className="text-gray-400 mt-2">
              This may take a moment depending on the token's holder count
            </p>
          </div>
        )}
        
        {result && (
          <div className="animate-fade-in">
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 text-center">Results</h3>
              
              <div className="text-center mb-6">
                <p className="text-gray-400 mb-2">HHI Score</p>
                <p className={`text-4xl font-bold mb-2 ${getHhiColorClass(result.hhi)}`}>
                  {result.hhi}
                </p>
                <p className="text-lg text-neon-purple">{result.concentrationLevel}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700 rounded p-3 text-center">
                  <p className="text-gray-400 text-sm">Total Supply</p>
                  <p className="text-white font-bold">{formatNumber(result.totalSupply)}</p>
                </div>
                <div className="bg-gray-700 rounded p-3 text-center">
                  <p className="text-gray-400 text-sm">Holder Count</p>
                  <p className="text-white font-bold">{result.holderCount}</p>
                </div>
              </div>
              
              {result.topHolders.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-4 text-center">
                    Top Holders Distribution
                  </h4>
                  
                  <div className="h-64 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getPieChartData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => 
                            `${name}: ${(percent * 100).toFixed(1)}%`
                          }
                        >
                          {getPieChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={customTooltip} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-700 rounded">
                      <thead>
                        <tr>
                          <th className="py-2 px-4 text-left text-gray-400">Address</th>
                          <th className="py-2 px-4 text-right text-gray-400">Amount</th>
                          <th className="py-2 px-4 text-right text-gray-400">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.topHolders.map((holder, index) => (
                          <tr key={index} className="border-t border-gray-600">
                            <td className="py-2 px-4 text-white font-mono text-sm">
                              {truncateAddress(holder.account)}
                            </td>
                            <td className="py-2 px-4 text-right text-white">
                              {formatNumber(holder.amount)}
                            </td>
                            <td className="py-2 px-4 text-right text-white">
                              {holder.percentage.toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-lg font-semibold mb-3">HHI Interpretation</h4>
                <ul className="list-disc pl-5 text-gray-300 space-y-2">
                  <li>Below 1,500: <span className="text-green-400">Low concentration</span> (competitive market)</li>
                  <li>1,500 to 2,500: <span className="text-yellow-400">Moderate concentration</span></li>
                  <li>Above 2,500: <span className="text-red-400">High concentration</span> (potentially concerning)</li>
                  <li>10,000: Maximum concentration (monopoly)</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HhiCalculator;