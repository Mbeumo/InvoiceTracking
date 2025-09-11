import React, { useState, useEffect } from 'react';
import { Tags, Zap, Target, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { CategorizationService, CategorySuggestion } from '../services/aiService';
import Card from './Card';

interface AICategorizationEngineProps {
  invoiceData?: any;
  onCategoryAssigned?: (category: string, confidence: number) => void;
}

const AICategorizationEngine: React.FC<AICategorizationEngineProps> = ({ 
  invoiceData, 
  onCategoryAssigned 
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [activeTab, setActiveTab] = useState<'auto' | 'manual' | 'rules'>('auto');

  useEffect(() => {
    if (invoiceData) {
      generateSuggestions();
    }
  }, [invoiceData]);

  const generateSuggestions = async () => {
    try {
      setLoading(true);
      const result = await CategorizationService.categorizeExpense(invoiceData);
      setSuggestions(result.suggestions || []);
    } catch (error) {
      console.error('Failed to generate category suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: string, confidence: number) => {
    setSelectedCategory(category);
    onCategoryAssigned?.(category, confidence);
  };

  const addCustomCategory = () => {
    if (newCategory.trim() && !customCategories.includes(newCategory.trim())) {
      setCustomCategories([...customCategories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-500';
    if (confidence >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const predefinedCategories = [
    'Office Supplies', 'Travel & Transportation', 'Marketing & Advertising',
    'Professional Services', 'Software & Technology', 'Utilities',
    'Equipment & Hardware', 'Training & Education', 'Insurance',
    'Legal & Compliance', 'Maintenance & Repairs', 'Telecommunications'
  ];

  return (
    <Card title="AI Categorization Engine">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { id: 'auto', label: 'Auto Categorize', icon: Zap },
            { id: 'manual', label: 'Manual Selection', icon: Target },
            { id: 'rules', label: 'Smart Rules', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Auto Categorization Tab */}
        {activeTab === 'auto' && (
          <div className="space-y-4">
            {loading && (
              <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <div>
                    <h4 className="font-medium text-purple-900 dark:text-purple-100">
                      AI Analyzing Invoice
                    </h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Analyzing vendor, description, and amount to suggest categories...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  AI Category Suggestions
                </h4>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedCategory === suggestion.category
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                    }`}
                    onClick={() => handleCategorySelect(suggestion.category, suggestion.confidence)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Tags className="w-5 h-5 text-purple-600" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {suggestion.category}
                          </span>
                        </div>
                        {selectedCategory === suggestion.category && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getConfidenceColor(suggestion.confidence)}`}
                              style={{ width: `${suggestion.confidence}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {suggestion.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {suggestion.reasoning && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        {suggestion.reasoning}
                      </p>
                    )}

                    {suggestion.tags && suggestion.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {suggestion.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            {selectedCategory && (
              <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-900 dark:text-green-100">
                        Category Selected: {selectedCategory}
                      </h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        This categorization will be applied to the invoice
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Apply Category
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Selection Tab */}
        {activeTab === 'manual' && (
          <div className="space-y-4">
            {/* Predefined Categories */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Predefined Categories
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {predefinedCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category, 100)}
                    className={`p-3 text-left rounded-lg border transition-colors ${
                      selectedCategory === category
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-200'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Tags className="w-4 h-4" />
                      <span className="text-sm font-medium">{category}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Categories */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                Custom Categories
              </h4>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter custom category name"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomCategory()}
                />
                <button
                  onClick={addCustomCategory}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add
                </button>
              </div>
              
              {customCategories.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {customCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category, 100)}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        selectedCategory === category
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-200'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Tags className="w-4 h-4" />
                        <span className="text-sm font-medium">{category}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Smart Rules Tab */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Smart Categorization Rules
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Create intelligent rules based on vendor, amount, or description patterns
              </p>
            </div>

            {/* Example Rules */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Active Rules</h4>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-gray-100">
                      Amazon purchases → Office Supplies
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      When vendor contains "Amazon" and amount &lt; $500
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded">
                    Active
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-gray-100">
                      Uber/Lyft → Travel & Transportation
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      When vendor contains "Uber" or "Lyft"
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded">
                    Active
                  </span>
                </div>
              </div>
            </div>

            <button className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-purple-400 hover:text-purple-600 transition-colors">
              + Create New Rule
            </button>
          </div>
        )}

        {/* No Data State */}
        {!invoiceData && !loading && (
          <div className="text-center py-8">
            <Tags className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              No Invoice Data
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Upload or select an invoice to get AI categorization suggestions
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AICategorizationEngine;
