import React, { useState, useEffect } from 'react';
import { Link, CheckCircle, AlertTriangle, Search, Filter, ArrowRight } from 'lucide-react';
import { CategorizationService, MatchResult } from '../services/aiService';
import Card from './Card';

interface AIInvoiceMatcherProps {
  invoiceData?: any;
  onMatchFound?: (matches: MatchResult[]) => void;
}

const AIInvoiceMatcher: React.FC<AIInvoiceMatcherProps> = ({ 
  invoiceData, 
  onMatchFound 
}) => {
  const [matching, setMatching] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [matchType, setMatchType] = useState<'vendor' | 'po' | 'contract' | 'all'>('all');
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);

  useEffect(() => {
    if (invoiceData) {
      findMatches();
    }
  }, [invoiceData, matchType, confidenceThreshold]);

  const findMatches = async () => {
    try {
      setMatching(true);
      const matchResults = await CategorizationService.matchVendor(invoiceData);
      setMatches(matchResults.matches || []);
      onMatchFound?.(matchResults.matches || []);
    } catch (error) {
      console.error('Failed to find matches:', error);
    } finally {
      setMatching(false);
    }
  };

  const getMatchTypeColor = (type: string) => {
    switch (type) {
      case 'vendor': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200';
      case 'purchase_order': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200';
      case 'contract': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200';
      case 'historical': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredMatches = matches.filter(match => {
    if (matchType !== 'all' && match.type !== matchType) return false;
    return match.confidence >= confidenceThreshold;
  });

  return (
    <Card title="AI Invoice Matcher">
      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Match Type:</span>
            <select
              value={matchType}
              onChange={(e) => setMatchType(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="all">All Types</option>
              <option value="vendor">Vendor</option>
              <option value="po">Purchase Orders</option>
              <option value="contract">Contracts</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Min Confidence:</span>
            <input
              type="range"
              min="50"
              max="100"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-8">
              {confidenceThreshold}%
            </span>
          </div>

          <button
            onClick={findMatches}
            disabled={matching}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {matching ? 'Matching...' : 'Refresh Matches'}
          </button>
        </div>

        {/* Matching Status */}
        {matching && (
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  AI Matching in Progress
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Searching for vendor records, purchase orders, and contracts...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Match Results */}
        {filteredMatches.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Found {filteredMatches.length} Match{filteredMatches.length !== 1 ? 'es' : ''}
              </h4>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing matches ≥ {confidenceThreshold}% confidence
              </div>
            </div>

            {filteredMatches.map((match, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => setSelectedMatch(selectedMatch?.id === match.id ? null : match)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Link className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100">
                          {match.entity}
                        </h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchTypeColor(match.type)}`}>
                          {match.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {match.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`font-medium ${getConfidenceColor(match.confidence)}`}>
                      {match.confidence}%
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedMatch?.id === match.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Match Details */}
                      <div className="space-y-3">
                        <h6 className="font-medium text-gray-900 dark:text-gray-100">Match Details</h6>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Entity ID:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{match.entityId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Type:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{match.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Status:</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{match.status || 'Active'}</span>
                          </div>
                          {match.lastTransaction && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Last Transaction:</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{match.lastTransaction}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Matching Criteria */}
                      <div className="space-y-3">
                        <h6 className="font-medium text-gray-900 dark:text-gray-100">Matching Criteria</h6>
                        <div className="space-y-2">
                          {match.matchingFields?.map((field, fieldIndex) => (
                            <div key={fieldIndex} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">{field.field}:</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${field.similarity}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-12 text-right">
                                  {field.similarity}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    {match.additionalInfo && (
                      <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <h6 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Additional Information</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {Object.entries(match.additionalInfo).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex space-x-3">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                        Link Invoice
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        View Details
                      </button>
                      <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                        Not a Match
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : matches.length === 0 && !matching ? (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              No Matches Found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              No matching vendors, purchase orders, or contracts found for this invoice
            </p>
            <button
              onClick={findMatches}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search Again
            </button>
          </div>
        ) : filteredMatches.length === 0 && matches.length > 0 ? (
          <div className="text-center py-8">
            <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              No Matches Above Threshold
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Found {matches.length} potential matches, but none meet the {confidenceThreshold}% confidence threshold
            </p>
            <button
              onClick={() => setConfidenceThreshold(50)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Lower Threshold to 50%
            </button>
          </div>
        ) : !invoiceData && !matching ? (
          <div className="text-center py-8">
            <Link className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Ready to Match
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Upload or select an invoice to find matching vendors and purchase orders
            </p>
          </div>
        ) : null}

        {/* Match Statistics */}
        {matches.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Match Statistics</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{matches.filter(m => m.type === 'vendor').length}</div>
                <div className="text-gray-600 dark:text-gray-400">Vendors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{matches.filter(m => m.type === 'purchase_order').length}</div>
                <div className="text-gray-600 dark:text-gray-400">Purchase Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{matches.filter(m => m.type === 'contract').length}</div>
                <div className="text-gray-600 dark:text-gray-400">Contracts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{matches.filter(m => m.confidence >= 90).length}</div>
                <div className="text-gray-600 dark:text-gray-400">High Confidence</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AIInvoiceMatcher;
